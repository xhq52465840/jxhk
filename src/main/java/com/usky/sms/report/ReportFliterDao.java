package com.usky.sms.report;

import java.sql.Timestamp;
import java.text.DecimalFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.time.DateUtils;
import org.hibernate.SQLQuery;
import org.hibernate.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate3.support.HibernateDaoSupport;

import com.usky.sms.common.DateHelper;
import com.usky.sms.tem.TemDO;
import com.usky.sms.tem.consequence.ConsequenceDO;

public class ReportFliterDao extends HibernateDaoSupport {

	@Autowired
	private ReportDao reportDao;
	
	private static final DecimalFormat df = new DecimalFormat("0.000");
	
	private static final Integer wp = 10000;
	
	private static final SimpleDateFormat sdfyyMM = new SimpleDateFormat("yyyy-MM");

	public Map<String, Double> groupFlytimeByDate(String begin, String end) throws ParseException {
		return reportDao.getFlyTimePerMonth(DateHelper.parseIsoDate(begin), DateHelper.parseIsoDate(end));
	}
	
	@SuppressWarnings("unchecked")
	private Map<String, Double> getFlyTimeMapDD() {
		String sql = "select t.flight_date,sum(t.fly_time) from qar_flight_crew_event_dd t group by t.flight_date ";
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
		SQLQuery query = session.createSQLQuery(sql.toString());
		List<Object[]> list = query.list();
		Map<String, Double> map = new HashMap<String, Double>();
		for (Object[] obj : list) {
			if (obj[0] != null && obj[1] != null) {
				map.put(obj[0].toString(), Double.parseDouble(obj[1].toString()));
			}
		}
		return map;
	}
	
	
//	public Double getFlyTimeCount(List<Date> datelist){
//		Map<String,Double> flyTimeMap = reportDao.getRiskManFlyTime();
//		Double flyTime = 1.0;
//		for(Date d : datelist){
//			Double temp = flyTimeMap.get(((SimpleDateFormat)sdfyyMM.clone()).format(d));
//			if(temp != null){
//				flyTime += temp;
//			}
//		}
//		if(flyTime > 1){
//			return flyTime - 1;
//		}
//		return flyTime;
//	}
	
	public Double getFlyTimeCount(String begin, String end){
		Double flyTime = 1.0;
		try {
			Map<String,Double> flyTimeMap = this.groupFlytimeByDate(begin, end);
			List<Date> datelist = reportDao.getTimeLineByFliter(begin, end);
			for(Date d : datelist){
				Double temp = flyTimeMap.get(((SimpleDateFormat)sdfyyMM.clone()).format(d));
				if(temp != null){
					flyTime += temp;
				}
			}
			if(flyTime > 1){
				return flyTime - 1;
			}
		} catch (ParseException e) {
			e.printStackTrace();
		}
		return flyTime;
	}
	
	
	
	/**
	 * 求得 当前重大风险前12个月的实际值
	 * 
	 * @param unit
	 * @param system
	 * @param consequenceid
	 * @param firstDay
	 *            当前传入时间
	 * @return
	 * @throws ParseException
	 */
	public List<Object[]> getRadarRiskValue(Date firstDay) throws ParseException {
		Date beginDay = DateHelper.getFirstDayOfMonth(DateUtils.addMonths(firstDay, -11));
		Date endDay = DateHelper.getLastDayOfMonth(DateUtils.addMonths(firstDay, -0));
		StringBuffer sql = new StringBuffer(
				"select trunc(a.occurredDate,'mm'),sum(p.score),t.consequence.id from TemDO t left join t.provision p ,AccessInformationDO a where "
						+ " t.deleted = false and t.activity.id = a.activity.id ");
		List<Object> param = new ArrayList<Object>();
		sql.append(" and a.occurredDate >= ?");
		param.add(beginDay);
		sql.append("  and a.occurredDate <= ?");
		param.add(endDay);
		sql.append(" group by trunc(a.occurredDate,'mm'),t.consequence.id");
		@SuppressWarnings("unchecked")
		List<Object[]> temlist = this.getHibernateTemplate().find(sql.toString(), param.toArray());
		return temlist;
	}

	/**
	 * 
	 * @param unit
	 * @param system
	 * @param consequenceid
	 * @param value
	 *            当前重大风险，当前月的风险值
	 * @param firstDay
	 * @param flyTime
	 *            飞行小时数
	 * @return
	 * @throws ParseException
	 */
	public Map<String, Double> getRadarWaringValue(Integer consequenceid, Date firstDay, Double flyTime, List<Object[]> temlist, Double riskparam)
			throws ParseException {
		List<Double> riskList = new ArrayList<Double>();
		for (int i = 11; i >= 0; i--) {
			Date FDate = DateHelper.getFirstDayOfMonth(DateUtils.addMonths(firstDay, -i));
			Date Sdate = DateHelper.getLastDayOfMonth(DateUtils.addMonths(firstDay, -i));
			Double score = 0.0;
			for (Object[] o : temlist) {
				if (o[0] != null && o[1] != null && o[2] != null) {
					if(((Timestamp) o[0]).compareTo(FDate) == 0 && Integer.parseInt(o[2].toString()) == consequenceid){
						score += Double.parseDouble(o[1].toString());
					}
					if (((Timestamp) o[0]).after(FDate) && ((Timestamp) o[0]).before(Sdate) && Integer.parseInt(o[2].toString()) == consequenceid) {
						score += Double.parseDouble(o[1].toString());
					}
				}
			}
			riskList.add(Double.parseDouble(df.format(score)));
		}
		Double sum = 0.0;
		for (Double dou : riskList) {
			sum += (dou / flyTime);// 每个重大风险前12个月的总分
		}
		Double sumPow = 0.0;
		for (Double dou : riskList) {
			sumPow += Math.pow(dou / flyTime - sum / 12, 2);// 方差
		}
		Map<String, Double> map = new HashMap<String, Double>();
		map.put("average", Double.parseDouble(df.format((sum / 12))) * wp);
		map.put("warning", Double.parseDouble(df.format(Double.parseDouble(df.format((sum / 12))) + (Double.parseDouble(df.format(Math.sqrt(sumPow / 12) * riskparam))))) * wp);
//		map.put("warning", Double.parseDouble(df.format(Double.parseDouble(df.format((sum / 12))) + 2 * (Double.parseDouble(df.format(Math.sqrt(sumPow / 12) * riskparam))))) * wp);
		return map;
	}
	
	public List<TemDO> getTem(List<Integer> activitys) {
		String activity = null;
		if (activitys.size() > 0 && activitys.size() <= 500) {
			activity = StringUtils.join(activitys.toArray(), ",");
		}
		String sql = "from TemDO t where t.deleted = false";
		StringBuffer hql = new StringBuffer(sql);
		if(activitys.size() > 500){
			hql.append("  and (t.activity.id in (" + StringUtils.join(activitys.subList(0, 500), ",") + ")");
			hql.append(this.getHql(activitys.subList(500, activitys.size())));
		}else{
			hql.append("  and t.activity.id in (" + activity + ")");
		}
		@SuppressWarnings("unchecked")
		List<TemDO> list = this.getHibernateTemplate().find(hql.toString());
		return list;
	}
	
	protected List<Object[]> getConsequenceTem(List<Integer> activitys){
		String activity = null;
		if (activitys.size() > 0 && activitys.size() <= 500) {
			activity = StringUtils.join(activitys.toArray(), ",");
		}
		StringBuffer sql = new StringBuffer("select con.id,pro.score"
				  + " from t_tem tem"
				  + " join t_provision pro"
				  + "  on tem.provision_id = pro.id"
				  + " join t_activity act"
				  + "  on act.id = tem.activity_id"
				  + " join t_consequence con"
				  + "  on tem.consequence_id = con.id"
				  + " where tem.deleted = '0'");
		if(activitys.size() > 500){
			sql.append("  and (act.id in (" + StringUtils.join(activitys.subList(0, 500), ",") + ")");
			sql.append(reportDao.getHql(activitys.subList(500, activitys.size())));
		}else{
			sql.append("  and act.id in (" + activity + ")");
		}
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
		SQLQuery query = session.createSQLQuery(sql.toString());
		@SuppressWarnings("unchecked")
		List<Object[]> list = query.list();
		return list;
	}
	
	protected List<Object[]> getInsecurityTem(List<Integer> activitys){
		String activity = null;
		if (activitys.size() > 0 && activitys.size() <= 500) {
			activity = StringUtils.join(activitys.toArray(), ",");
		}
		StringBuffer sql = new StringBuffer("select ins.id,pro.score,ins.\"name\""
				  + " from t_tem tem"
				  + " join t_provision pro"
				  + "  on tem.provision_id = pro.id"
				  + " join t_activity act"
				   + " on tem.activity_id = act.id"
				  + " join t_insecurity ins"
				  + "  on tem.insecurity_id = ins.id"
				  + " where tem.deleted = '0'");
		if(activitys.size() > 500){
			sql.append("  and (act.id in (" + StringUtils.join(activitys.subList(0, 500), ",") + ")");
			sql.append(reportDao.getHql(activitys.subList(500, activitys.size())));
		}else{
			sql.append("  and act.id in (" + activity + ")");
		}
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
		SQLQuery query = session.createSQLQuery(sql.toString());
		@SuppressWarnings("unchecked")
		List<Object[]> list = query.list();
		return list;
	}
	
	
	
	public String getHql(List<Integer> activitys){
		int step = activitys.size() / 500;
		StringBuffer sql = new StringBuffer(" ");
		for(int i = 0; i < step; i++){
			sql.append(" or t.activity.id in ("+StringUtils.join(activitys.subList(500 * i, 500 * (i + 1)), ",")+")");
		}
		sql.append(" or t.activity.id in ("+StringUtils.join(activitys.subList(500 * step, activitys.size()),",")+"))");
		return sql.toString();
	}
	
	
	@SuppressWarnings("unchecked")
	public List<ConsequenceDO> achieveListBySysType(List<Integer> system) {
		String sql = "";
		List<ConsequenceDO> list = null;
		if (system.size() == 0) {
			sql = "from ConsequenceDO  where deleted = false";
			list = this.getHibernateTemplate().find(sql);
		} else {
			sql = "from ConsequenceDO  where deleted = false and system.id in (" + StringUtils.join(system, ",") + ")";
			list = this.getHibernateTemplate().find(sql);
		}
		return list;
	}


	public List<ConsequenceDO> getByInsecurity(List<Integer> insecurity){
		String _insecurity = null;
		if(insecurity.size() > 0){
			_insecurity = StringUtils.join(insecurity, ",");
		}
		StringBuffer sql = new StringBuffer("select distinct c from ConsequenceDO c");
		if(_insecurity != null){
			sql.append(" inner join c.insecuritys i ");
		}
		sql.append(" where c.deleted = false");
		if(_insecurity != null){
			sql.append(" and i.id in ("+_insecurity+")");
		}
		@SuppressWarnings("unchecked")
		List<ConsequenceDO> list = this.getHibernateTemplate().find(sql.toString());
		return list;
	}
	
	public List<ConsequenceDO> getBySystem(List<Integer> system){
		String _system = null;
		if(system.size() > 0){
			_system = StringUtils.join(system, ",");
		}
		StringBuffer sql = new StringBuffer("select distinct c from ConsequenceDO c");
		if(_system != null){
			sql.append(" inner join c.system s ");
		}
		sql.append(" where c.deleted = false");
		if(_system != null){
			sql.append(" and s.id in ("+_system+")");
		}
		@SuppressWarnings("unchecked")
		List<ConsequenceDO> list = this.getHibernateTemplate().find(sql.toString());
		return list;
	}
	
	@SuppressWarnings("unchecked")
	public Map<String,List<Object[]>> groupTemByOccurredDateTest(Map<String, List<Integer>> map, List<Date> datelist) {
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM");
		Map<String,List<Object[]>> temMap = new HashMap<String, List<Object[]>>();
		for(Date d : datelist){
			String tempdate = sdf.format(d);
			List<Object[]> temlist = null;
			if(map.get(tempdate) != null){
				String activity = null;
				if (map.get(tempdate).size() > 0 && map.get(tempdate).size() <= 500) {
					activity = StringUtils.join(map.get(tempdate).toArray(), ",");
				}
				StringBuffer sql = new StringBuffer("select con.id,pro.score"
						  + " from t_tem tem"
						  + " join t_provision pro"
						  + "  on tem.provision_id = pro.id"
						  + " join t_activity act"
						  + "  on act.id = tem.activity_id"
						  + " join t_consequence con"
						  + "  on tem.consequence_id = con.id"
						  + " where tem.deleted = '0'");
				if(map.get(tempdate).size() > 500){
					sql.append("  and (act.id in (" + StringUtils.join(map.get(tempdate).subList(0, 500), ",") + ")");
					sql.append(reportDao.getHql(map.get(tempdate).subList(500, map.get(tempdate).size())));
				}else{
					sql.append("  and act.id in (" + activity + ")");
				}
				Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
				SQLQuery query = session.createSQLQuery(sql.toString());
				temlist = query.list();
			}
			temMap.put(tempdate, temlist);
		}
		return temMap;
	} 
	
	@SuppressWarnings("unchecked")
	public Map<String,List<TemDO>> groupTemByOccurredDate(Map<String, List<Integer>> map, List<Date> datelist) {
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM");
		Map<String,List<TemDO>> Temmap = new HashMap<String, List<TemDO>>();
		for(Date d : datelist){
			String tempdate = sdf.format(d);
			List<TemDO> temlist = null;
			if(map.get(tempdate) != null){
				String activity = StringUtils.join(map.get(tempdate), ",");
				StringBuffer sql = new StringBuffer("from TemDO t where t.deleted = false and t.activity.id in ("+activity+")");
				temlist = this.getHibernateTemplate().find(sql.toString());
			}
			Temmap.put(tempdate, temlist);
			
		}
		return Temmap;
	} 
	
	public Map<String,Double> getGaugeWarningValue(Integer insecurityid, Date begin,Double flyTime,List<Object[]> templist, Double riskparam) throws ParseException {
		List<Double> riskList = new ArrayList<Double>();
		for(int i = 11; i >= 0 ; i--){
			Date FDate = DateHelper.getFirstDayOfMonth(DateUtils.addMonths(begin, -i));
			Date Sdate = DateHelper.getLastDayOfMonth(DateUtils.addMonths(begin, -i));
			Double score = 0.0;
			for(Object[] o : templist){
				if(o[0] != null && o[1] != null && o[2] != null){
					if(((Timestamp)o[0]).compareTo(FDate) == 0 && Integer.parseInt(o[1].toString()) == insecurityid){
						
					}
					if(((Timestamp)o[0]).after(FDate) && ((Timestamp)o[0]).before(Sdate) && Integer.parseInt(o[1].toString()) == insecurityid){
						score += Double.parseDouble(o[2].toString());
					}
				}
			}
			riskList.add(Double.parseDouble(df.format(score)));
		}
		Double sumPow = 0.0;
		Double sum = 0.0;
		for(Double dou : riskList){
			sum += (dou/flyTime);
		}
		for(Double dou : riskList){
			sumPow += Math.pow(dou/flyTime - (sum/12),2);
		}
		Map<String,Double> map = new HashMap<String,Double>();
		map.put("average", Double.parseDouble(df.format((sum/12))) * wp);
		map.put("warning", Double.parseDouble(df.format(Double.parseDouble(df.format((sum/12))) + (Double.parseDouble(df.format(Math.sqrt(sumPow/12)* riskparam))))) * wp);
		return map;
	}
	
	public List<Object[]> getGaugeRiskValue(Date begin) throws ParseException{
		Date beginDay = DateHelper.getFirstDayOfMonth(DateUtils.addMonths(begin, -11));
		Date endDay = DateHelper.getLastDayOfMonth(DateUtils.addMonths(begin, -0));
		StringBuffer sql = new StringBuffer("select a.occurredDate,t.insecurity.id,sum(p.score) from TemDO t left join t.provision p ,AccessInformationDO a "
				+ " where t.deleted = false "
				+ " and t.activity.id = a.activity.id ");
		List<Object> param2 = new ArrayList<Object>();
		sql.append(" and a.occurredDate >= ?");
		param2.add(beginDay);
		sql.append("  and a.occurredDate <= ?");
		param2.add(endDay);
		sql.append(" group by a.occurredDate,t.insecurity.id");
		@SuppressWarnings("unchecked")
		List<Object[]> templist = this.getHibernateTemplate().find(sql.toString(),param2.toArray());
		return templist;
	}
	
	public void setReportDao(ReportDao reportDao) {
		this.reportDao = reportDao;
	}

}
