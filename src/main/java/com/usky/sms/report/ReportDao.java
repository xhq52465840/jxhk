package com.usky.sms.report;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.text.DecimalFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.time.DateUtils;
import org.apache.log4j.Logger;
import org.hibernate.SQLQuery;
import org.hibernate.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate3.support.HibernateDaoSupport;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.comm.Utility;
import com.usky.sms.accessinformation.FlightInfoEntityDao;
import com.usky.sms.activity.type.EnumActivityType;
import com.usky.sms.aircraftType.AircraftModelDao;
import com.usky.sms.audit.todo.TodoViewDao;
import com.usky.sms.common.DateHelper;
import com.usky.sms.config.Config;
import com.usky.sms.config.ConfigService;
import com.usky.sms.core.SMSException;
import com.usky.sms.custom.CustomFieldDao;
import com.usky.sms.dictionary.DictionaryDO;
import com.usky.sms.dictionary.DictionaryDao;
import com.usky.sms.external.AirPlaneDubboService;
import com.usky.sms.flightmovementinfo.AirportDO;
import com.usky.sms.flightmovementinfo.FlightInfoCache;
import com.usky.sms.message.MessageDao;
import com.usky.sms.processor.ProcessorDao;
import com.usky.sms.safetyreview.inst.MethanolInstDao;
import com.usky.sms.search.template.ISearchTemplate;
import com.usky.sms.search.template.SearchTemplateRegister;
import com.usky.sms.service.QueryService;
import com.usky.sms.tem.ActionItemDO;
import com.usky.sms.tem.ActionItemDao;
import com.usky.sms.tem.ErrorMappingDO;
import com.usky.sms.tem.TemDO;
import com.usky.sms.tem.TemDao;
import com.usky.sms.tem.ThreatMappingDO;
import com.usky.sms.tem.consequence.ConsequenceDO;
import com.usky.sms.tem.consequence.ConsequenceDao;
import com.usky.sms.tem.error.ErrorDO;
import com.usky.sms.tem.error.ErrorDao;
import com.usky.sms.tem.insecurity.InsecurityDO;
import com.usky.sms.tem.insecurity.InsecurityDao;
import com.usky.sms.tem.severity.SeverityDO;
import com.usky.sms.tem.severity.SeverityDao;
import com.usky.sms.tem.threat.ThreatDO;
import com.usky.sms.tem.threat.ThreatDao;
import com.usky.sms.unit.UnitDO;
import com.usky.sms.unit.UnitDao;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;

public class ReportDao extends HibernateDaoSupport {
	
	private static final Logger LOGGER = Logger.getLogger(ReportDao.class);
	
	@Autowired
	private CustomFieldDao customFieldDao;
	
	@Autowired
	private DictionaryDao dictionaryDao;
	
	@Autowired
	private SeverityDao severityDao;
	
	@Autowired
	private ConsequenceDao consequenceDao;
	
	@Autowired
	private InsecurityDao insecurityDao;
	
	@Autowired
	private ThreatDao threatDao;
	
	@Autowired
	private ErrorDao errorDao;
	
	@Autowired
	private TemDao temDao;
	
	@Autowired
	private ReportFliterDao reportFliterDao;
	
	@Autowired
	private FlightInfoCache flightInfoCache;
	
	@Autowired
	private FlightInfoEntityDao flightInfoEntityDao;
	
	@Autowired
	private AircraftModelDao aircraftModelDao;
	
	@Autowired
	private UnitDao unitDao;
	
	@Autowired
	private MessageDao messageDao;
	
	@Autowired
	private ActionItemDao actionItemDao;
	
	@Autowired
	private TodoViewDao todoViewDao;
	
	@Autowired
	private MethanolInstDao methanolInstDao;
	
	@Autowired
	private ProcessorDao processorDao;
	
	@Autowired
	private AirPlaneDubboService airPlaneDubboService;
	
	@Autowired
	private QueryService queryService;
	
	private static final DecimalFormat df = new DecimalFormat("0.000");
	
	private static final SimpleDateFormat sdfyM = new SimpleDateFormat("yyyyMM");
	
	private static final SimpleDateFormat sdfyyMM = new SimpleDateFormat("yyyy-MM");
	
	private static final SimpleDateFormat sdfyMd = new SimpleDateFormat("yyyy-MM-dd");
	
	private static final SimpleDateFormat sdfyyyMd = new SimpleDateFormat("yyyy/MM/dd");
	
	private static final SimpleDateFormat sdfsim = new SimpleDateFormat("yyyy-MM-dd HH:ss:mm");
	
	private static final Integer wp = 10000;
	
	/**
	 * 获取各待办的统计信息
	 * @return
	 */
	public Map<String, Object> getToDoStatistics(UserDO user) {
		Map<String, Object> result = new HashMap<String, Object>();
		// 待我处理的信息任务
		// 风险的类型code
		String[] riskTypeCodes = {EnumActivityType.RISK_MANAGEMENT.toString(), EnumActivityType.RISK_ANALYSIS.toString(), EnumActivityType.NEW_AIRLINE.toString()};
		Integer activityCount = processorDao.getToDoCount(user.getId(), riskTypeCodes, false);
		result.put("activityCount", activityCount);
		// 待我处理的审计任务
		Integer auditCount = todoViewDao.getTodoCount(user);
		result.put("auditCount", auditCount);
		// 待我处理的行动项
		Integer actionItemCount = actionItemDao.getActionItemCountByUser(user.getId());
		result.put("actionItemCount", actionItemCount);
		// 待我处理的风险任务
		Integer riskCount = processorDao.getToDoCount(user.getId(), riskTypeCodes, true);
		result.put("riskCount", riskCount);
		// 待我处理的协助任务
		Integer assistCount = messageDao.getUncheckedMessageCountByReceiver(user, "ACTIVITY");
		result.put("assistCount", assistCount);
		// 待我处理的评审
		Integer methanolCount = methanolInstDao.getToDoCount(user);
		result.put("methanolCount", methanolCount);
		// 站内通知
		Integer messageCount = messageDao.getUncheckedMessageCountByReceiver(user, null);
		result.put("messageCount", messageCount);
		
		return result;
	}
	
	/**
	 * 根据事件类型查询前12个月的所用次数
	 * @param date
	 * @return
	 * @throws ParseException 
	 */
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public Map<String,Object> getByIncidentType(Date date,String mark,String symbol,Integer unit,String system) throws ParseException {
		List<DictionaryDO> dictionary = new ArrayList<DictionaryDO>();
		String customFieldValueKey = null;
		StringBuffer sql = null;
		Date firstDay = DateHelper.getFirstDayOfMonth(DateUtils.addMonths(date, -12));
		Date lastDay = DateHelper.getLastDayOfMonth(DateUtils.addMonths(date, -1));
		List<Object> param = new ArrayList<Object>();
		if("T".equals(mark) || mark == "T"){//事件类型
			 dictionary = dictionaryDao.getListByType("事件类型");
			 customFieldValueKey = "customfield_"+(customFieldDao.getByName("事件类型").get(0).getId().toString());
			 sql = new StringBuffer("select ma.occurredDate,cus.textValue ,count(ac) from CustomFieldValueDO cus right join cus.activity ac ,AccessInformationDO ma where ac.id = ma.activity.id");
		}else if("S".equals(mark) || mark == "S"){//系统类型
			 dictionary = dictionaryDao.getListByType("系统分类");
			 customFieldValueKey = "customfield_"+(customFieldDao.getByName("系统分类").get(0).getId().toString());
			 sql = new StringBuffer("select ma.occurredDate,cus.stringValue ,count(ac) from CustomFieldValueDO cus right join cus.activity ac ,AccessInformationDO ma where ac.id = ma.activity.id");
		}
		sql.append(" and cus.key = ? ");
		param.add(customFieldValueKey);
		sql.append(" and ma.occurredDate >= ? ");
		param.add(firstDay);
		sql.append(" and ma.occurredDate <= ? ");
		param.add(lastDay);
		if(unit != null){
			sql.append(" and ac.unit.id = ?");
			param.add(unit);
		}
		if("E".equals(symbol) || (symbol == "E")){//员工安全报告
			sql.append(" and ac.type.name = ?");
			param.add("员工安全报告");
		}
		if("A".equals(symbol) || (symbol == "A")){//航空安全信息
			sql.append(" and ac.type.name = ?");
			param.add("航空安全信息");
		}
		if("S".equals(mark) || mark == "S"){
			sql.append(" group by ma.occurredDate, cus.stringValue");
		}
		if("T".equals(mark) || mark == "T"){
			if(!("总数".equals(system))){
				sql.append(" and ac.id in ("+this.getActivity(unit,system)+")");
			}
			sql.append(" group by ma.occurredDate, cus.textValue");
		}
		@SuppressWarnings("unchecked")
		List<Object[]> list = this.getHibernateTemplate().find(sql.toString(),param.toArray());
		Map<String,Object> map = new LinkedHashMap<String, Object>();
		if("S".equals(mark) || mark == "S"){
			map.put("总数", this.everyMonth(date, unit,symbol));
		}
		for(DictionaryDO dic : dictionary){
			List<Integer> countList = new ArrayList<Integer>();
			for(int i = 12; i > 0; i--){
				Date begin = DateHelper.getFirstDayOfMonth(DateUtils.addMonths(date, -i));
				Date end = DateHelper.getLastDayOfMonth(DateUtils.addMonths(date, -i));
				Integer count = 0;
				for(Object[] o : list){
					if(o[0] != null && o[1] != null){
						if("S".equals(mark) || mark == "S"){
							if((dic.getName().equals(o[1].toString()) || dic.getName() == o[1].toString()) && ((Timestamp)o[0]).compareTo(begin) == 0){
								count += ((Long)o[2]).intValue();
							}
							if((dic.getName().equals(o[1].toString()) || dic.getName() == o[1].toString()) && ((Timestamp)o[0]).after(begin) && ((Timestamp)o[0]).before(end)){
								count += ((Long)o[2]).intValue();
							}
						}
						if("T".equals(mark) || mark == "T"){
							if(((Timestamp)o[0]).compareTo(begin) == 0){
								if((o[1].toString()).indexOf(dic.getName()) > -1 ){
									count += ((Long)o[2]).intValue();
								}
							}
							if(((Timestamp)o[0]).after(begin) && ((Timestamp)o[0]).before(end)){
								if((o[1].toString()).indexOf(dic.getName()) > -1 ){
									count += ((Long)o[2]).intValue();
								}
							}
						}
					}
				}
				countList.add(count);
			}
			map.put(dic.getName(), countList);
		}
		return map;
	}
	
	// 通过安监机构 、系统类别查询所有的安全信息
	private String getActivity(Integer unit,String system){
		StringBuffer sql = new StringBuffer("select act.id from CustomFieldValueDO cus join cus.activity act "
				+ " where cus.deleted = false "
				+ " and cus.activity.id = act.id");
		List<Object> param = new ArrayList<Object>();
		sql.append(" and cus.key = ?");
		param.add("customfield_"+(customFieldDao.getByName("系统分类").get(0).getId().toString()));
		if(unit != null){
			sql.append(" and act.unit.id = ?");
			param.add(unit);
		}
		if(system != null){
			sql.append(" and cus.stringValue = ?");
			param.add(system);
		}
		@SuppressWarnings("unchecked")
		List<Integer> list = this.getHibernateTemplate().find(sql.toString(),param.toArray());
		if(list.isEmpty()){
			return null;
		}else{
			return StringUtils.join(list.toArray(),",");
		}
	}
	
	//每个月安全信息的数量
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public List<Integer> everyMonth(Date date,Integer unit,String symbol) throws ParseException{
		String temp = "select count(act),ma.occurredDate from ActivityDO act,AccessInformationDO ma "
				+ " where act.deleted = false "
				+ " and act.id = ma.activity.id";
		StringBuffer sql = new StringBuffer(temp);
		List<Object> param = new ArrayList<Object>();
		if(unit != null){
			sql.append(" and act.unit.id = ?");
			param.add(unit);
		}
		if("E".equals(symbol) || symbol == "E"){//员工安全报告
			sql.append(" and act.type.name = ?");
			param.add("员工安全报告");
		}
		if("A".equals(symbol) || symbol == "A"){//航空安全信息
			sql.append(" and act.type.name = ?");
			param.add("航空安全信息");
		}
		Date firstDay = DateHelper.getFirstDayOfMonth(DateUtils.addMonths(date, -12));
		Date lastDay = DateHelper.getLastDayOfMonth(DateUtils.addMonths(date, -1));
		sql.append(" and ma.occurredDate >= ? ");
		param.add(firstDay);
		sql.append(" and ma.occurredDate <= ? ");
		param.add(lastDay);
		sql.append(" group by ma.occurredDate");
		@SuppressWarnings("unchecked")
		List<Object[]> list = this.getHibernateTemplate().find(sql.toString(),param.toArray());
		List<Integer> dataList = new ArrayList<Integer>();
		for(int i = 12; i > 0; i--){
			Date begin = DateHelper.getFirstDayOfMonth(DateUtils.addMonths(date, -i));
			Date end = DateHelper.getLastDayOfMonth(DateUtils.addMonths(date, -i));
			Integer count = 0;
			for(Object[] o : list){
				if(o[0] != null && o[1] != null){
					if(((Timestamp)o[1]).compareTo(begin) == 0){
						count += ((Long)o[0]).intValue();
					}
					if(((Timestamp)o[1]).after(begin) && ((Timestamp)o[1]).before(end)){
						count += ((Long)o[0]).intValue();
					}
				}
			}
			dataList.add(count);
		}
		return dataList;
	}
	
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public Map<String,Object> getSeverityScore(Date date,Integer unit,String system,String symbol) throws ParseException {
		List<SeverityDO> severity = severityDao.seachAll();
		Date firstDay = DateHelper.getFirstDayOfMonth(DateUtils.addMonths(date, -12));
		Date lastDay = DateHelper.getLastDayOfMonth(DateUtils.addMonths(date, -1));
		StringBuffer sql = 
				new StringBuffer("select a.occurredDate, s.name from TemDO t "
						+ " left join t.severity s ,AccessInformationDO a "
						+ " where t.deleted = false "
						+ " and a.activity.id = t.activity.id");
		List<Object> param = new ArrayList<Object>();
		sql.append(" and a.occurredDate >= ?");
		param.add(firstDay);
		sql.append(" and a.occurredDate <= ?");
		param.add(lastDay);
		if(unit != null){
			sql.append(" and t.activity.unit.id = ?");
			param.add(unit);
		}
		if("总数".equals(system)){
			sql.append(" and t.sysType.name = ?");
			param.add(system);
		}
		if("E".equals(symbol) || symbol == "E"){//员工安全报告
			sql.append(" and t.activity.type.name = ?");
			param.add("员工安全报告");
		}
		if("A".equals(symbol) || symbol == "A"){//航空安全信息
			sql.append(" and t.activity.type.name = ?");
			param.add("航空安全信息");
		}
		sql.append(" group by a.occurredDate,s.name");
		@SuppressWarnings("unchecked")
		List<Object[]> list = this.getHibernateTemplate().find(sql.toString(),param.toArray());
		Map<String,Object> map = new HashMap<String, Object>();
		for(SeverityDO s : severity){
			List<Integer> dataList = new ArrayList<Integer>();
			for(int i = 12; i > 0; i--){
				Date begin = DateHelper.getFirstDayOfMonth(DateUtils.addMonths(date, -i));
				Date end = DateHelper.getLastDayOfMonth(DateUtils.addMonths(date, -i));
				Integer count = 0;
				for(Object[] o : list){
					if(o[0] != null && o[1] != null){
						if((s.getName().equals(o[1].toString()) || s.getName() == o[1].toString()) && ((Timestamp)o[0]).compareTo(begin) == 0){
							count++;
						}
						if((s.getName().equals(o[1].toString()) || s.getName() == o[1].toString()) && ((Timestamp)o[0]).after(begin) && ((Timestamp)o[0]).before(end)){
							count++;
						}
					}
				}
				dataList.add(count);
			}
			map.put(s.getName(), dataList);
		}
		return map;
	}
	/**
	 * 统计前30天每天创建安全信息次数
	 * @param date
	 * @param unit
	 * @return
	 * @throws ParseException
	 */
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public List<Integer> countActivity(Date date, Integer unit) throws ParseException {
		Date firstDay = ((SimpleDateFormat)sdfsim.clone()).parse(((SimpleDateFormat)sdfyMd.clone()).format(DateUtils.addDays(date, -30))+" 00:00:00");
		Date lastDay = ((SimpleDateFormat)sdfsim.clone()).parse(((SimpleDateFormat)sdfyMd.clone()).format(DateUtils.addDays(date, -1))+" 23:59:59");
		StringBuffer sql = new StringBuffer("select ma.occurredDate from ActivityDO ac left join ac.unit un,AccessInformationDO ma where ac.deleted = false and ac.id = ma.activity.id");
		List<Object> param = new ArrayList<Object>();
		sql.append(" and ma.occurredDate >= ?");
		param.add(firstDay);
		sql.append(" and ma.occurredDate <= ?");
		param.add(lastDay);
		if(unit != null){
			sql.append(" and un.id = ?");
			param.add(unit);
		}
		sql.append(" group by ma.occurredDate");
		@SuppressWarnings("unchecked")
		List<Timestamp> list = this.getHibernateTemplate().find(sql.toString(),param.toArray());
		List<Integer> datalist = new ArrayList<Integer>();
		for(int i = 30; i > 0; i--){
			Date begin = ((SimpleDateFormat)sdfsim.clone()).parse(((SimpleDateFormat)sdfyMd.clone()).format(DateUtils.addDays(date, -i))+" 00:00:00");
			Date end = ((SimpleDateFormat)sdfsim.clone()).parse(((SimpleDateFormat)sdfyMd.clone()).format(DateUtils.addDays(date, -i))+" 23:59:59");
			Integer count = 0;
			for(Timestamp o : list){
				if(o != null){
					if(((Timestamp)o).compareTo(begin) == 0){
						count++;
					}
					if(((Timestamp)o).after(begin) && ((Timestamp)o).before(end)){
						count++;
					}
				}
			}
			datalist.add(count);
		}
		return datalist;
	}
	
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public List<ActionItemDO> getActionItemByUser(Integer userId) {
		String sql = "select act from ActionItemDO act "
					+ " left join act.organizations org "
					+ " inner join org.users use "
					+ " where use.id =:id "
					+ " and act.status in (:status)";
		List<String> params = new ArrayList<String>();
		params.add("id");
		params.add("status");
		List<Object> values = new ArrayList<Object>();
		values.add(userId);
		values.add(new String[] { ActionItemDao.ACTION_ITEM_STATUS_COMFIRM_WAITING, ActionItemDao.ACTION_ITEM_STATUS_AUDIT_REJECTED });
		@SuppressWarnings("unchecked")
		List<ActionItemDO> list = this.getHibernateTemplate().findByNamedParam(sql, new String[]{"id", "status"}, values.toArray());
		return list;
	}
	
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public List<Double> systemLine(Integer unit,Integer system,Date date) throws ParseException{
		String temp = "select a.occurredDate,sum(p.score) from TemDO t join t.provision p ,AccessInformationDO a where t.deleted = false and t.activity.id = a.activity.id";
		StringBuffer sql = new StringBuffer(temp);
		List<Object> param = new ArrayList<Object>();
		Date firstDay = DateHelper.getFirstDayOfMonth(DateUtils.addMonths(date, -12));
		Date lastDay = DateHelper.getLastDayOfMonth(DateUtils.addMonths(date, -1));
		sql.append(" and a.occurredDate >= ?");
		param.add(firstDay);
		sql.append(" and a.occurredDate <= ?");
		param.add(lastDay);
		if (unit != null) {
			sql.append(" and t.activity.unit.id = ?");
			param.add(unit);
		}
		if (system != null) {
			sql.append(" and t.sysType.id = ?");
			param.add(system);
		}
		sql.append(" group by a.occurredDate");
		@SuppressWarnings("unchecked")
		List<Object[]> list = this.getHibernateTemplate().find(sql.toString(),param.toArray());
		Map<String, Double> flyTimeMap = this.getFlyTimePerMonth(DateUtils.addMonths(date, -12), DateUtils.addMonths(date, -1));
		SimpleDateFormat ss = new SimpleDateFormat("yyyy-MM");
		List<Double> dataList = new ArrayList<Double>();
		for (int i = 12; i > 0; i--) {
			Date first = DateHelper.getFirstDayOfMonth(DateUtils.addMonths(date, -i));
			Date last = DateHelper.getLastDayOfMonth(DateUtils.addMonths(date, -i));
			Double flyTime = flyTimeMap.get(ss.format(first)) == null ? 1.0 : flyTimeMap.get(ss.format(first));
			Double score = 0.0;
			for(Object[] o : list){
				if(o[0] != null && o[1] != null){
					if(((Timestamp)o[0]).compareTo(first) == 0){
						score += Double.parseDouble(o[1].toString());
					}
					if(((Timestamp)o[0]).after(first) && ((Timestamp)o[0]).before(last)){
						score += Double.parseDouble(o[1].toString());
					}
				}
			}
			dataList.add(Double.parseDouble(df.format(score/flyTime)) * wp);
		}
		return dataList;
	}
	/**
	 * 查询给定时间所在月的飞行小时数
	 * @param date 日期
	 * @return
	 */
	public Double getFlyTime(Date date) {
		Map<String, Double> flyTime = airPlaneDubboService.getFlyHoursPerMonth(date, date);
		if (flyTime.isEmpty()) {
			return 0.0;
		}
		return flyTime.values().iterator().next();
	}
	/**
	 * 从数据字典中获取风险值参数
	 * @return
	 */
	public Double getRiskParam(){
		List<DictionaryDO> list = dictionaryDao.getListByType("风险参数");
		return Double.parseDouble(list.get(0).getValue().toString());
	}
	/**
	 *  求得 当前重大风险前12个月的实际值
	 * @param unit
	 * @param system
	 * @param consequenceid
	 * @param firstDay 当前传入时间
	 * @return
	 * @throws ParseException
	 */
	public List<Object[]> getRadarRiskValue(Integer system,Date firstDay) throws ParseException {
		Date beginDay = DateHelper.getFirstDayOfMonth(DateUtils.addMonths(firstDay, -11));
		Date endDay = DateHelper.getLastDayOfMonth(DateUtils.addMonths(firstDay, -0));
		StringBuffer sql = 
				new StringBuffer("select a.occurredDate,sum(p.score),t.consequence.id from TemDO t"
								+ " left join t.provision p ,AccessInformationDO a "
								+ " where  t.deleted = false "
								+ " and t.activity.id = a.activity.id ");
		List<Object> param = new ArrayList<Object>();
		sql.append(" and a.occurredDate >= ?");
		param.add(beginDay);
		sql.append("  and a.occurredDate <= ?");
		param.add(endDay);
		if(system != null){
			sql.append(" and t.sysType.id = ?");
			param.add(system);
		}
		sql.append(" group by a.occurredDate,t.consequence.id");
		@SuppressWarnings("unchecked")
		List<Object[]> temlist = this.getHibernateTemplate().find(sql.toString(),param.toArray());
		return temlist;
	}
	/**
	 * 
	 * @param unit
	 * @param system
	 * @param consequenceid
	 * @param value 当前重大风险，当前月的风险值
	 * @param firstDay
	 * @param flyTime 飞行小时数
	 * @return
	 * @throws ParseException
	 */
	public Map<String,Double> getRadarWaringValue(Integer consequenceid, Date firstDay,Double flyTime,List<Object[]> temlist, Double riskparam) throws ParseException {
		List<Double> riskList = new ArrayList<Double>();
		for(int i = 11; i >= 0 ; i--){
			Date FDate = DateHelper.getFirstDayOfMonth(DateUtils.addMonths(firstDay, -i));
			Date Sdate = DateHelper.getLastDayOfMonth(DateUtils.addMonths(firstDay, -i));
			Double score = 0.0;
			for(Object[] o : temlist){
				if(o[0] != null && o[1] != null && o[2] != null){
					if(((Timestamp)o[0]).compareTo(FDate) == 0 && Integer.parseInt(o[2].toString()) == consequenceid){
						score += Double.parseDouble(o[1].toString());
					}
					if(((Timestamp)o[0]).after(FDate) && ((Timestamp)o[0]).before(Sdate) && Integer.parseInt(o[2].toString()) == consequenceid){
						score += Double.parseDouble(o[1].toString());
					}
				}
			}
			riskList.add(Double.parseDouble(df.format(score)));
		}
		Double sum = 0.0;
		for(Double dou : riskList){
			sum += (dou/flyTime);//每个重大风险前12个月的总分
		}
		Double sumPow = 0.0;
		for(Double dou : riskList){
			sumPow += Math.pow(dou/flyTime - sum/12,2);//方差
		}
		Map<String,Double> map = new HashMap<String,Double>();
		map.put("average", Double.parseDouble(df.format((sum/12))) * wp);
		map.put("warning", Double.parseDouble(df.format(Double.parseDouble(df.format((sum/12))) + (Double.parseDouble(df.format(Math.sqrt(sumPow/12) * riskparam))))) * wp);
		return map;
	}
	
	public List<String> getTimeLine() throws ParseException {
		Date date = new Date();
		List<String> list = new ArrayList<String>();
		for (int i = 12; i > 0; i--) {
			Date tempDate = DateHelper.getFirstDayOfMonth(DateUtils.addMonths(date, -i));
			list.add(((SimpleDateFormat)sdfyyyMd.clone()).format(tempDate));
		}
		return list;
	}
	public List<String> getTimeLineF() throws ParseException {
		Date date = new Date();
		List<String> list = new ArrayList<String>();
		for (int i = 12; i > 0; i--) {
			Date tempDate = DateHelper.getFirstDayOfMonth(DateUtils.addMonths(date, -i));
			list.add(((SimpleDateFormat)sdfyMd.clone()).format(tempDate));
		}
		return list;
	}
	
	public List<String> getTimeLineByF(String begin, String end) throws ParseException{
		List<Date> datelist = this.getTimeLineByFliter(begin, end);
		List<String> list = new ArrayList<String>();
		for(Date d : datelist){
			list.add(((SimpleDateFormat)sdfyMd.clone()).format(d));
		}
		return list;
	}
	/**
	 * 取出两个日期之间的月份
	 * @param begin 
	 * @param end
	 * @return
	 * @throws ParseException
	 */
	public List<Date> getTimeLineByFliter(String begin, String end) throws ParseException{
		List<Date> list = new ArrayList<Date>();
		if(begin != null && end != null){
			Date begintime = DateHelper.getFirstDayOfMonth(((SimpleDateFormat)sdfyMd.clone()).parse(begin));
			Date endtime = DateHelper.getLastDayOfMonth(((SimpleDateFormat)sdfyMd.clone()).parse(end));
			list.add(begintime);
			int i = 2;
			Date temptime =DateUtils.addMonths(begintime, 1);
			while(temptime.before(endtime)){
				list.add(temptime);
				temptime = DateUtils.addMonths(begintime, i);
				i++;
			}
		}
		return list;
	}
	
	
	public Map<String,Double> getGaugeWarningValue(Integer system,Integer insecurityid,Date begin,Double flyTime,Double riskParam) throws ParseException {
		List<Double> riskList = this.getGaugeRiskValue(system, insecurityid, begin);
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
		map.put("warning", Double.parseDouble(df.format(Double.parseDouble(df.format((sum/12))) + (Double.parseDouble(df.format(Math.sqrt(sumPow/12)* riskParam))))) * wp);
		return map;
	}
	
	private List<Double> getGaugeRiskValue(Integer system,Integer insecurityid, Date begin) throws ParseException{
		Date beginDay = DateHelper.getFirstDayOfMonth(DateUtils.addMonths(begin, -12));
		Date endDay = DateHelper.getLastDayOfMonth(DateUtils.addMonths(begin, -1));
		StringBuffer sql = new StringBuffer("select a.occurredDate,sum(p.score) from TemDO t left join t.provision p ,AccessInformationDO a "
				+ " where t.deleted = false "
				+ " and t.activity.id = a.activity.id ");
		List<Object> param2 = new ArrayList<Object>();
		sql.append(" and a.occurredDate >= ?");
		param2.add(beginDay);
		sql.append("  and a.occurredDate <= ?");
		param2.add(endDay);
		if(system != null){
			sql.append(" and t.sysType.id = ?");
			param2.add(system);
		}
		if(insecurityid != null){
			sql.append(" and t.insecurity.id = ?");
			param2.add(insecurityid);
		}
		sql.append(" group by a.occurredDate");
		@SuppressWarnings("unchecked")
		List<Object[]> temlist = this.getHibernateTemplate().find(sql.toString(),param2.toArray());
		List<Double> list = new ArrayList<Double>();
		for(int i = 12; i > 0 ; i--){
			Date FDate = DateHelper.getFirstDayOfMonth(DateUtils.addMonths(begin, -i));
			Date Sdate = DateHelper.getLastDayOfMonth(DateUtils.addMonths(begin, -i));
			Double score = 0.0;
			for(Object[] o : temlist){
				if(o[0] != null && o[1] != null){
					if(((Timestamp)o[0]).compareTo(FDate) == 0){
						score += Double.parseDouble(o[1].toString());
					}
					if(((Timestamp)o[0]).after(FDate) && ((Timestamp)o[0]).before(Sdate)){
						score += Double.parseDouble(o[1].toString());
					}
				}
			}
			list.add(Double.parseDouble(df.format(score)));
		}
		return list;
	}
	
	
	/**
	 * 查询此条件下tem中重大风险的分数
	 * @param activitys 安全信息集合
	 * @param system 系统类别
	 * @throws ParseException 
	 */ 
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public List<Map<String,Object>> getConsequenceRadarScore(List<Integer> activitys,List<Integer> system,String begin, String end) throws ParseException{
		Date date = ((SimpleDateFormat)sdfyMd.clone()).parse(begin);
		Double flytime = reportFliterDao.getFlyTimeCount(begin, end);
		List<Object[]> actlist = reportFliterDao.getRadarRiskValue(date);
		List<Object[]> temlist = reportFliterDao.getConsequenceTem(activitys);
		List<ConsequenceDO> consequencelist = reportFliterDao.achieveListBySysType(system);
		Double riskparam = this.getRiskParam();
		List<Map<String,Object>> list = new ArrayList<Map<String,Object>>();
		for(ConsequenceDO consequence : consequencelist){
			Map<String,Object> map = new HashMap<String, Object>();
			Integer score = 0;
			for(Object[] tem : temlist){
				if(tem[0] != null && tem[1] != null && consequence.getId().equals(((BigDecimal)tem[0]).intValue())){
					score = score + ((BigDecimal)tem[1]).intValue();
				}
			}
			Map<String,Double> riskMap = reportFliterDao.getRadarWaringValue(consequence.getId(), date, flytime, actlist,riskparam);
			map.put("id", consequence.getId());
			map.put("name", consequence.getName());
			int showValue = this.getRiskValue((score * wp / flytime));
			Double value = Double.parseDouble(df.format(score * wp / flytime));
			Double average = riskMap.get("average");
			Double warning = riskMap.get("warning");
			map.put("showValue", showValue);
			map.put("showWarning", warning);
			map.put("value", this.getValue(value, average, warning));
			map.put("max", 6);
			list.add(map);
		}
		return list;
	}
	
	public int getValue(Double value, Double average, Double warning){
		int temp = 0;
		if(value == 0){
			return temp;
		}
		if(value > 0 && value <= average){
			temp = 1;
		}else if(value > average && value <= warning){
			temp = 3;
		}else if(value > warning){
			temp = 5;
		}
		return temp;
	}
	
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public List<Map<String, Object>> getConsequenceLineScore(List<Integer> activitys, List<Integer> system, String begin, String end) throws ParseException {
		List<Date> datelist = this.getTimeLineByFliter(begin, end);
		Map<String, List<Integer>> activityAndOccurredDate = this.getActivitysByOccurredDate(activitys);
		Map<String, List<Object[]>> temmap = reportFliterDao.groupTemByOccurredDateTest(activityAndOccurredDate, datelist);
		List<ConsequenceDO> consequencelist = reportFliterDao.achieveListBySysType(system);
		Map<String,Double> flyTimeMap = reportFliterDao.groupFlytimeByDate(begin, end);
		List<Map<String,Object>> list = new ArrayList<Map<String,Object>>();
		for(ConsequenceDO consequence : consequencelist){
			Map<String,Object> valuemap = new HashMap<String, Object>();
			List<Integer> valuelist = new ArrayList<Integer>();
			double sum = 0;
			for(Date d : datelist){
				String tempdate = ((SimpleDateFormat)sdfyyMM.clone()).format(d);
				Double flytime = 1.0;
				Integer score = 0;
				if(temmap.get(tempdate) != null){
					flytime = flyTimeMap.get(tempdate) == null ? 1.0 : flyTimeMap.get(tempdate);
					for(Object[] o : temmap.get(tempdate)){
						if(o[0] != null && o[1] != null && consequence.getId().equals(((BigDecimal)o[0]).intValue())){
							score = score + ((BigDecimal)o[1]).intValue();
						}
					}
				}
				double median = score * wp / flytime;
				valuelist.add(this.getRiskValue(median));
				sum  = sum + median;
			}
			valuemap.put("id", consequence.getId());
			valuemap.put("name", consequence.getName());
			valuemap.put("value", valuelist);
			if(sum != 0){
				valuemap.put("mark", true);
			}else{
				valuemap.put("mark", false);
			}
			list.add(valuemap);
		}
		list.add(this.getConsequenceLineScoreAll(datelist.size(), list));
		Collections.reverse(list);
		return list;
	}
	
	private Map<String, Object> getConsequenceLineScoreAll(int size, List<Map<String, Object>> list) {
		List<Integer> valuelist = new ArrayList<Integer>();
		Map<String, Object> map = new HashMap<String, Object>();
		for (int i = 0; i < size; i++) {
			int count = 0;
			for (Map<String, Object> entry : list) {
				@SuppressWarnings("unchecked")
				List<Integer> v = (List<Integer>) entry.get("value");
				Integer value = v.get(i);
				count += value;
			}
			valuelist.add(count);
		}
		map.put("id", 0);
		map.put("name", "全部");
		map.put("value", valuelist);
		map.put("mark", true);
		return map;
	}
 	/**
	 * 查询此条件下tem中不安全状态的分数
	 * @param activitys 安全信息集合
	 * @param system 系统类别
	 * @param consequence 重大风险
	 * @return
	 */
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public List<Map<String, Object>> getInsecurityPieScore(List<Integer> activitys, String begin, String end) {
		Double flytime = reportFliterDao.getFlyTimeCount(begin, end);
		List<Object[]> temlist = reportFliterDao.getInsecurityTem(activitys);
		List<Map<String,Object>> insecuritylist = getInsecuritys(temlist);
		List<Map<String,Object>> list = new ArrayList<Map<String,Object>>();
		for(Map<String,Object> obj : insecuritylist){
			Map<String,Object> map = new HashMap<String, Object>();
			Double score = 0.0;
			for(Object[] tem : temlist){
				if(tem[0] != null && tem[1] != null && obj.get("id").equals(tem[0])){
					score += ((BigDecimal)tem[1]).intValue();
				}
			}
			map.put("id", obj.get("id"));
			map.put("name", obj.get("name"));
			double median = score * wp / flytime;
			map.put("value", this.getRiskValue(median));
			double mark = median;
			if(mark != 0){
				map.put("mark", true);
			}else{
				map.put("mark", false);
			}
			list.add(map);
		}
		return getSortInteger(list);
	}
	
	private List<Map<String,Object>> getInsecuritys(List<Object[]> tems) {
		List<Map<String,Object>> list = new ArrayList<Map<String,Object>>();
		for (Object[] o : tems) {
			if (o[0] != null && o[2] != null) {
				Map<String,Object> map = new HashMap<String, Object>();
				map.put("id", o[0]);
				map.put("name", o[2]);
				if(list.contains(map)) continue;
				list.add(map);
			}
		}
		return list;
	}
	
	
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public List<Map<String, Object>> getInsecurityGauge(List<Integer> activitys, String begin, String end) throws ParseException {
		Date date = ((SimpleDateFormat)sdfyMd.clone()).parse(begin);
		Double flytime = reportFliterDao.getFlyTimeCount(begin, end);
		List<TemDO> temlist = reportFliterDao.getTem(activitys);
		List<Object[]> actlist = reportFliterDao.getGaugeRiskValue(date);
		Double riskparam = this.getRiskParam();
		List<Map<String,Object>> list = new ArrayList<Map<String,Object>>();
		List<Integer> idList = new ArrayList<Integer>();
		for (TemDO tem : temlist) {
			if (tem.getInsecurity() != null && tem.getProvision() != null) {
				if (!idList.contains(tem.getInsecurity().getId())) {
					idList.add(tem.getInsecurity().getId());
					Map<String, Object> map1 = new HashMap<String, Object>();					
					map1.put("id", tem.getInsecurity().getId());
					map1.put("name", tem.getInsecurity().getName());
					Double score = 0.0;
					for (TemDO tem1 : temlist) {
						if(tem1.getInsecurity() == null || tem1.getProvision() == null) continue;
						if (tem1.getInsecurity().getId().equals(tem.getInsecurity().getId())) {
							score += tem1.getProvision().getScore();
						}
					}
					Map<String,Double> warnMap = reportFliterDao.getGaugeWarningValue(tem.getInsecurity().getId(), date, flytime, actlist, riskparam);
					double median = score * wp / flytime;
					map1.putAll(getGaugeParam(median, warnMap.get("average"), warnMap.get("warning")));
					double sign = 1;
					if(sign != 0){
						map1.put("mark", true);
					}else{
						map1.put("mark", false);
					}
					list.add(map1);
				}
			}
		}
		
		return list;
	}
	
	
	
	public Map<String,Double> getGaugeParam(double value, double average, double warning){
		double sum = 0.0;
		if(average + warning != 0){
			sum = average + warning;
		};
		DecimalFormat dft = new DecimalFormat("0.00");
		Map<String,Double> map = new HashMap<String, Double>();
		map.put("value", (double)this.getRiskValue(value));
		if(sum != 0){
			map.put("green", Double.parseDouble(dft.format((average / sum))));
			map.put("red", Double.parseDouble(dft.format((warning / sum))));
		}else{
			map.put("green", 0.0);
			map.put("red", 0.0);
		}
		map.put("max", sum);
		return map;
	}
	
	/**
	 * 查询此条件下tem中威胁的分数
	 * @param activitys 安全信息集合
	 * @param system 系统
	 * @param insecurity 不安全状态
	 * @return
	 */
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public List<Map<String,Object>> getThreatScore(List<Integer> activitys,List<Integer> insecurity, String begin, String end){
		Double flytime = reportFliterDao.getFlyTimeCount(begin, end);
		List<TemDO> temlist = reportFliterDao.getTem(activitys);
		List<ThreatDO> threatlist = getThreats(temlist);
		List<Map<String,Object>> list = new ArrayList<Map<String,Object>>();
		for(ThreatDO threat : threatlist){
			Map<String,Object> map = new HashMap<String, Object>();
			Double score = temToThreat(temlist, threat);
			map.put("id", threat.getId());
			map.put("name", threat.getName());
			double median = score * wp / flytime;
			map.put("value", this.getRiskValue(median));
			double mark = median;
			if(mark != 0){
				map.put("mark", true);
			}else{
				map.put("mark", false);
			}
			list.add(map);
		}
		return getSortInteger(list);
	}
	
	private static List<ThreatDO> getThreats(List<TemDO> tems) {
		List<ThreatDO> list = new ArrayList<ThreatDO>();
		for (TemDO tem : tems) {
			if (tem.getPrimaryThreat() != null) {
				if (!(list.contains(tem.getPrimaryThreat().getThreat()))) {
					list.add(tem.getPrimaryThreat().getThreat());
				}
			}
			if (tem.getThreats().size() > 0) {
				for (ThreatMappingDO tm : tem.getThreats()) {
					if (list.contains(tm.getThreat())) continue;
					list.add(tm.getThreat());
				}
			}
		}
		return list;
	}
	
	private static List<ErrorDO> getErrors(List<TemDO> tems) {
		List<ErrorDO> list = new ArrayList<ErrorDO>();
		for (TemDO tem : tems) {
			if (tem.getPrimaryError() != null) {
				if (!(list.contains(tem.getPrimaryError().getError()))) {
					list.add(tem.getPrimaryError().getError());
				}
			}
			if (tem.getErrors().size() > 0) {
				for (ErrorMappingDO em : tem.getErrors()) {
					if (list.contains(em.getError()))
						continue;
					list.add(em.getError());
				}
			}
		}
		return list;
	}
	
	private static double temToThreat(List<TemDO> temlist, ThreatDO threat){
		Double score = 0.0;
		for(TemDO tem : temlist){
			if(tem.getProvision() == null || tem.getPrimaryThreat() == null) continue;
			Double provisionScore = tem.getProvision().getScore() * 1.0;
			if(tem.getErrors().size() > 0){
				provisionScore = tem.getProvision().getScore() * 0.4;
			}
			List<ThreatDO> tempthreat = new ArrayList<ThreatDO>();
			for(ThreatMappingDO  m : tem.getThreats()){
				tempthreat.add(m.getThreat());
			}
			if(tem.getThreats().size() == 0){
				continue;
			}else if(tem.getThreats().size() == 1 && threat.getName().equals(tem.getPrimaryThreat().getThreat().getName())){
				score += provisionScore;
			}else if(tem.getThreats().size() == 2){
				if(threat.getName().equals(tem.getPrimaryThreat().getThreat().getName())){
					score = score + (provisionScore * 0.6);
				}else if(tempthreat.contains(threat)){
					score = score + (provisionScore * 0.4);
				}
			}else if(tem.getThreats().size() == 3){
				if(threat.getName().equals(tem.getPrimaryThreat().getThreat().getName())){
					score = score + (provisionScore * 0.6);
				}else if(tempthreat.contains(threat)){
					score = score + (provisionScore * 0.2);
				}
			}else if(tem.getThreats().size() == 4){
				if(threat.getName().equals(tem.getPrimaryThreat().getThreat().getName())){
					score = score + (provisionScore * 0.7);
				}else if(tempthreat.contains(threat)){
					score = score + (provisionScore * 0.1);
				}
			}
		}
		return score;
	}
	/**
	 * 查询此条件下tem中差错的分数
	 * @param activitys 安全信息集合
	 * @param system 系统类别
	 * @param insecurity 不安全状态
	 * @return
	 */
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public List<Map<String,Object>> getErrorScore(List<Integer> activitys,List<Integer> insecurity, String begin, String end){
		Double flytime = reportFliterDao.getFlyTimeCount(begin, end);
		List<TemDO> temlist = reportFliterDao.getTem(activitys);
		List<ErrorDO> errorlist = getErrors(temlist);
		List<Map<String,Object>> list = new ArrayList<Map<String,Object>>();
		for(ErrorDO error : errorlist){
			Map<String,Object> map = new HashMap<String, Object>();
			Double score = temToError(temlist, error);
			map.put("id", error.getId());
			map.put("name",error.getName());
			double median = score * wp / flytime;
			map.put("value", this.getRiskValue(median));
			double mark = median;
			if(mark != 0){
				map.put("mark", true);
			}else{
				map.put("mark", false);
			}
			list.add(map);
		}
		return getSortInteger(list);
	}
	
	private static double temToError(List<TemDO> temlist, ErrorDO error){
		Double score = 0.0;
		for(TemDO tem : temlist){
			if(tem.getProvision() == null || tem.getPrimaryError() == null) continue;
			Double provisionScore = tem.getProvision().getScore() * 1.0;
			if(tem.getThreats().size() > 0){
				provisionScore = tem.getProvision().getScore() * 0.6;
			}
			List<ErrorDO> temperror = new ArrayList<ErrorDO>();
			for(ErrorMappingDO m : tem.getErrors()){
				temperror.add(m.getError());
			}
			if(tem.getErrors().size() == 0){
				continue;
			}else if(tem.getErrors().size() == 1 && error.getName().equals(tem.getPrimaryError().getError().getName())){
				score += provisionScore;
			}else if(tem.getErrors().size() == 2){
				if(error.getName().equals(tem.getPrimaryError().getError().getName())){
					score = score + (provisionScore * 0.6);
				}else if(temperror.contains(error)){
					score = score + (provisionScore * 0.4);
				}
			}else if(tem.getErrors().size() == 3){
				if(error.getName().equals(tem.getPrimaryError().getError().getName())){
					score = score + (provisionScore * 0.6);
				}else if(temperror.contains(error)){
					score = score + (provisionScore * 0.2);
				}
			}else if(tem.getErrors().size() == 4){
				if(error.getName().equals(tem.getPrimaryError().getError().getName())){
					score = score + (provisionScore * 0.7);
				}else if(temperror.contains(error)){
					score = score + (provisionScore * 0.1);
				}
			}
		}
		return score;
	}
	
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public List<Map<String, Object>> getInsecurityByThreatOrError(List<Integer> activitys, String begin, String end) {
		Double flytime = reportFliterDao.getFlyTimeCount(begin, end);
		List<TemDO> temlist = reportFliterDao.getTem(activitys);
		List<Map<String,Object>> list = new ArrayList<Map<String,Object>>();
		List<Integer> idList = new ArrayList<Integer>();
		for (TemDO tem : temlist) {
			if (tem.getInsecurity() != null && tem.getProvision() != null) {
				if (!idList.contains(tem.getInsecurity().getId())) {
					idList.add(tem.getInsecurity().getId());
					Map<String, Object> map1 = new HashMap<String, Object>();					
					map1.put("id", tem.getInsecurity().getId());
					map1.put("name", tem.getInsecurity().getName());
					Double score = 0.0;
					for (TemDO tem1 : temlist) {
						if(tem1.getInsecurity() == null || tem1.getProvision() == null) continue;
						if (tem1.getInsecurity().getId().equals(tem.getInsecurity().getId())) {
							score += tem1.getProvision().getScore();
						}
					}
					double median = score * wp / flytime;
					map1.put("value", this.getRiskValue(median));
					double sign = median;
					if(sign != 0){
						map1.put("mark", true);
					}else{
						map1.put("mark", false);
					}
					list.add(map1);
				}
			}
		}
		return getSortInteger(list);
	}
	
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public List<Map<String, Object>> getConsequenceByInsecurity(List<Integer> activitys, List<Integer> insecurity, String begin, String end) {
		Double flytime = reportFliterDao.getFlyTimeCount(begin, end);
		List<Object[]> temlist = reportFliterDao.getConsequenceTem(activitys);
		List<ConsequenceDO> consequencelist = reportFliterDao.getByInsecurity(insecurity);
		List<Map<String,Object>> list = new ArrayList<Map<String,Object>>();
		for(ConsequenceDO consequence : consequencelist){
			Map<String,Object> map = new HashMap<String, Object>();
			Double score = 0.0;
			for(Object[] tem : temlist){
				if(tem[0] != null && tem[1] != null && consequence.getId().equals(((BigDecimal)tem[0]).intValue())){
					score += ((BigDecimal)tem[1]).intValue();
				}
			}
			map.put("id", consequence.getId());
			map.put("name", consequence.getName());
			double median = score * wp /flytime;
			map.put("value", this.getRiskValue(median));
			double mark = median;
			if(mark != 0){
				map.put("mark", true);
			}else{
				map.put("mark", false);
			}
			list.add(map);
		}
		return getSortInteger(list);
	}
	
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public List<Map<String, Object>> getConsequenceBySystem(List<Integer> activitys, List<Integer> system, String begin, String end) {
		Double flytime = reportFliterDao.getFlyTimeCount(begin, end);
		List<Object[]> temlist = reportFliterDao.getConsequenceTem(activitys);
		List<ConsequenceDO> consequencelist = reportFliterDao.getBySystem(system);
		List<Map<String,Object>> list = new ArrayList<Map<String,Object>>();
		for(ConsequenceDO consequence : consequencelist){
			Map<String,Object> map = new HashMap<String, Object>();
			Double score = 0.0;
			for(Object[] tem : temlist){
				if(tem[0] != null && tem[1] != null && consequence.getId().equals(((BigDecimal)tem[0]).intValue())){
					score += ((BigDecimal)tem[1]).intValue();
				}
			}
			map.put("id", consequence.getId());
			map.put("name", consequence.getName());
			double median = score * wp /flytime;
			map.put("value", this.getRiskValue(median));
			double mark = median;
			if(mark != 0){
				map.put("mark", true);
			}else{
				map.put("mark", false);
			}
			list.add(map);
		}
		return getSortInteger(list);
	}
	
	private static List<Map<String,Object>> getSortInteger(List<Map<String,Object>> list){
		Collections.sort(list, new Comparator<Map<String,Object>>(){
			@Override
			public int compare(Map<String, Object> o1,Map<String, Object> o2) {
				Integer value1 = (Integer) o1.get("value");
				Integer value2 = (Integer) o2.get("value");
				return value1.compareTo(value2);
			}
		});
		return list;
	}
	
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public List<Map<String, Object>> getInsecurityLine(List<Integer> activitys, List<Integer> insecuritys, String begin, String end) throws ParseException {
		List<Map<String,Object>> list = new ArrayList<Map<String,Object>>();
		for(int i=0;i<insecuritys.size();i++){
			Integer insecurity = insecuritys.get(i);
			List<Date> datelist = this.getTimeLineByFliter(begin, end);
			Map<String, List<Integer>> activityAndOccurredDate = this.getActivitysByOccurredDate(activitys);
			Map<String, List<TemDO>> temmap = reportFliterDao.groupTemByOccurredDate(activityAndOccurredDate, datelist);
			InsecurityDO _insecurity = insecurityDao.internalGetById(insecurity);
			Map<String,Double> flyTimeMap = reportFliterDao.groupFlytimeByDate(begin, end);
			
			List<Integer> valuelist = new ArrayList<Integer>();
			for(Date d : datelist){
				String tempdate = ((SimpleDateFormat)sdfyyMM.clone()).format(d);
				Double flytime = 1.0;
				Integer score = 0;
				if(temmap.get(tempdate) != null){
					flytime = flyTimeMap.get(tempdate) == null ? 1.0 : flyTimeMap.get(tempdate);
					for(TemDO tem : temmap.get(tempdate)){
						if(tem.getInsecurity() != null && tem.getProvision() != null && _insecurity.getName().equals(tem.getInsecurity().getName()))
							score += tem.getProvision().getScore();
					}
				}
				double median = score * wp / flytime;
				valuelist.add(this.getRiskValue(median));
			
			}
			Map<String,Object> map = new HashMap<String, Object>();
			map.put("id", _insecurity.getId());
			map.put("name", _insecurity.getName());
			map.put("value", valuelist);
			list.add(map);
		}
		return list;
	}
	
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public List<Map<String, Object>> getThreatLine(List<Integer> activitys, List<Integer> threats, String begin, String end) throws ParseException {
		List<Map<String,Object>> list = new ArrayList<Map<String,Object>>();
		for(int i=0;i<threats.size();i++){
			Integer threat = threats.get(i);
			List<Date> datelist = this.getTimeLineByFliter(begin, end);
			Map<String, List<Integer>> activityAndOccurredDate = this.getActivitysByOccurredDate(activitys);
			Map<String, List<TemDO>> temmap = reportFliterDao.groupTemByOccurredDate(activityAndOccurredDate, datelist);
			ThreatDO _threat = threatDao.internalGetById(threat);
			Map<String,Double> flyTimeMap = reportFliterDao.groupFlytimeByDate(begin, end);
			List<Integer> valuelist = new ArrayList<Integer>();
			for(Date d : datelist){
				String tempdate = ((SimpleDateFormat)sdfyyMM.clone()).format(d);
				Double flytime = 1.0;
				Double score = 0.0;
				if(temmap.get(tempdate) != null){
					flytime = flyTimeMap.get(tempdate) == null ? 1.0 : flyTimeMap.get(tempdate);
					score = temToThreat(temmap.get(tempdate), _threat);
				}
				double median = score * wp / flytime;
				valuelist.add(this.getRiskValue(median));
			}
			Map<String,Object> map = new HashMap<String, Object>();
			map.put("id", _threat.getId());
			map.put("name", _threat.getName());
			map.put("value", valuelist);
			list.add(map);
		}
		return list;
	}
	
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public List<Map<String, Object>> getErrorLine(List<Integer> activitys, List<Integer> errors, String begin, String end) throws ParseException {
		List<Map<String,Object>> list = new ArrayList<Map<String,Object>>();
		for(int i=0;i<errors.size();i++){
			Integer error = errors.get(i);
			List<Date> datelist = this.getTimeLineByFliter(begin, end);
			Map<String, List<Integer>> activityAndOccurredDate = this.getActivitysByOccurredDate(activitys);
			Map<String, List<TemDO>> temmap = reportFliterDao.groupTemByOccurredDate(activityAndOccurredDate, datelist);
			ErrorDO _error = errorDao.internalGetById(error);
			Map<String,Double> flyTimeMap = reportFliterDao.groupFlytimeByDate(begin, end);
			
			List<Integer> valuelist = new ArrayList<Integer>();
			for(Date d : datelist){
				String tempdate = ((SimpleDateFormat)sdfyyMM.clone()).format(d);
				Double flytime = 1.0;
				Double score = 0.0;
				if(temmap.get(tempdate) != null){
					flytime = flyTimeMap.get(tempdate) == null ? 1.0 : flyTimeMap.get(tempdate);
					score = temToError(temmap.get(tempdate), _error);
				}
				double median = score * wp / flytime;
				valuelist.add(this.getRiskValue(median));			
			}
			Map<String,Object> map = new HashMap<String, Object>();
			map.put("id", _error.getId());
			map.put("name", _error.getName());
			map.put("value", valuelist);
			list.add(map);
		}
		return list;
	}
	
	private Map<String, List<Integer>> getActivitysByOccurredDate(List<Integer> activitys) throws ParseException{
		String activity = null;
		if(activitys.size() > 0 && activitys.size() <= 500){
			activity = StringUtils.join(activitys.toArray(), ",");
		}
		StringBuffer sql = new StringBuffer("select t.activity.id ,t.occurredDate from AccessInformationDO t");
		sql.append(" where t.deleted = false ");
		if(activitys.size() > 500){
			sql.append(" and (t.activity.id in ("+StringUtils.join(activitys.subList(0, 500), ",")+")");
			sql.append(reportFliterDao.getHql(activitys.subList(500, activitys.size())));
		}else{
			sql.append(" and t.activity.id in ("+activity+")");
		}
		sql.append(" group by t.activity.id ,t.occurredDate");
		@SuppressWarnings("unchecked")
		List<Object[]> list = this.getHibernateTemplate().find(sql.toString());
		Map<String, List<Integer>> map = this.groupByActivityOccurredDate(list);
		return map;
	}
	
	private Map<String, List<Integer>> groupByActivityOccurredDate(List<Object[]> list) {
		// 信息获取的发生时间按月分组，并按升序排列
		Map<String, List<Integer>> map = new LinkedHashMap<String, List<Integer>>();
		for (Object[] object : list) {
			String occurredDate = ((SimpleDateFormat)sdfyyMM.clone()).format(object[1]);
			if (map.containsKey(occurredDate)) {
				map.get(occurredDate).add((Integer) object[0]);
			} else {
				List<Integer> tempList = new ArrayList<Integer>();
				tempList.add((Integer) object[0]);
				map.put(occurredDate, tempList);
			}
		}
		return map;
	}
	
	
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public List<Map<String, Object>> getEventBySystem(List<Integer> activitys, List<Date> datelist) throws ParseException {
		String activity = null;
		if(activitys.size() > 0 && activitys.size() <= 500){
			activity = StringUtils.join(activitys, ",");
		}
		StringBuffer cussql = new StringBuffer("select acc.occurred_date,act.id"
				  + " from t_activity act"
				  + " join t_access_information acc"
				  + " on act.id = acc.activity_id"
				  + " where act.deleted = '0' and acc.deleted = '0'");
		if(activitys.size() > 500){
			cussql.append(" and (act.id in ("+StringUtils.join(activitys.subList(0, 500), ",")+")");
			cussql.append(this.getHql(activitys.subList(500, activitys.size())));
		}else{
			cussql.append(" and act.id in ("+activity+")");
		}
		Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();
		SQLQuery query = session.createSQLQuery(cussql.toString());
		@SuppressWarnings("unchecked")
		List<Object[]> customfilelist = query.list();
		List<Map<String,Object>> list = new ArrayList<Map<String,Object>>();
		list.add(getCountList(datelist, customfilelist));//总数
		return list;
	}
	
	/**
	 * 求和
	 * @param list
	 * @return
	 */
	private static Integer sum(List<Integer> list) {
		int count = 0;
		for (Integer i : list) {
			if (i != null) {
				count += i;
			}
		}
		return count;
	}
	
	private static Map<String, Object> getCountList(List<Date> datelist, List<Object[]> datalist) throws ParseException {
		List<Integer> list = new ArrayList<Integer>();
		for (Date d : datelist) {
			Date first = DateHelper.getFirstDayOfMonth(d);
			Date last = DateHelper.getLastDayOfMonth(d);
			Integer count = 0;
			for (Object[] o : datalist) {
				if (o[0] != null && o[1] != null) {
					if (((Timestamp) o[0]).compareTo(first) == 0) {
						count++;
					}
					if (((Timestamp) o[0]).after(first) && ((Timestamp) o[0]).before(last)) {
						count++;
					}
				}
			}
			list.add(count);
		}
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("id", 0);
		map.put("count", "全部" + "(" + sum(list) + ")");
		map.put("name", "全部");
		map.put("value", list);
		map.put("mark", true);
		return map;
	}
	
	private Map<String, Object> getCountListRate(List<Date> datelist, List<Object[]> datalist) throws ParseException {
		List<Double> list = new ArrayList<Double>();
		Map<String,Double> flyTimeMap = this.getRiskManFlyTime(datelist);
		DecimalFormat dft = new DecimalFormat("0.00");
		for (Date d : datelist) {
			Date first = DateHelper.getFirstDayOfMonth(d);
			Date last = DateHelper.getLastDayOfMonth(d);
			Double flyTime = flyTimeMap.get(((SimpleDateFormat)sdfyyMM.clone()).format(first)) == null ? 1.0 : flyTimeMap.get(((SimpleDateFormat)sdfyyMM.clone()).format(first));
			Integer count = 0;
			for (Object[] o : datalist) {
				if (o[0] != null && o[1] != null) {
					if (((Timestamp) o[0]).compareTo(first) == 0) {
						count++;
					}
					if (((Timestamp) o[0]).after(first) && ((Timestamp) o[0]).before(last)) {
						count++;
					}
				}
			}
			list.add(Double.parseDouble(dft.format((count * 10000)/flyTime)));
		}
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("id", 0);
		map.put("count", "全部");
		map.put("name", "全部");
		map.put("value", list);
		map.put("mark", true);
		return map;
	}
	
	//统计 严重程度 次数
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public List<Map<String,Object>> getSeverityByFliter(List<Integer> activitys,List<Date> datelist,String symbol) throws ParseException {
		String activity = null;
		if(activitys.size() > 0 && activitys.size() <= 500){
			activity = StringUtils.join(activitys, ",");
		}
		List<SeverityDO> severity = severityDao.seachAll();
		StringBuffer sql = new StringBuffer("select a.occurredDate, s.name from TemDO t left join t.severity s ,AccessInformationDO a where t.deleted = false and a.activity.id = t.activity.id");
		if(activitys.size() > 500){
			sql.append(" and (t.activity.id in ("+StringUtils.join(activitys.subList(0, 500), ",")+")");
			sql.append(reportFliterDao.getHql(activitys.subList(500, activitys.size())));
		}else{
			sql.append(" and t.activity.id in ("+activity+")");
		}
		@SuppressWarnings("unchecked")
		List<Object[]> temlist = this.getHibernateTemplate().find(sql.toString());
		List<Map<String,Object>> list = new ArrayList<Map<String,Object>>();
		DecimalFormat dft = new DecimalFormat("0.00");
		if("count".equals(symbol)){
			list.add(getCountList(datelist, temlist));
		}else if("rate".equals(symbol)){
			list.add(this.getCountListRate(datelist, temlist));
		}
		Map<String,Double> flyTimeMap = this.getRiskManFlyTime(datelist);
		for(SeverityDO s : severity){
			int mark = 0;
			Map<String,Object> map = new HashMap<String, Object>();
			List<Integer> dataList = new ArrayList<Integer>();
			List<Double> dataListDou = new ArrayList<Double>();
			for(Date d : datelist){
				Date begin = DateHelper.getFirstDayOfMonth(d);
				Date end = DateHelper.getLastDayOfMonth(d);
				Double flyTime = flyTimeMap.get(((SimpleDateFormat)sdfyyMM.clone()).format(begin)) == null ? 1.0 : flyTimeMap.get(((SimpleDateFormat)sdfyyMM.clone()).format(begin));
				Integer count = 0;
				for(Object[] o : temlist){
					if(o[0] != null && o[1] != null){
						if((s.getName().equals(o[1].toString()) && ((Timestamp)o[0]).compareTo(begin) == 0)){
							count++;
						}
						if((s.getName().equals(o[1].toString()) && ((Timestamp)o[0]).after(begin) && ((Timestamp)o[0]).before(end))){
							count++;
						}
					}
				}
				if("count".equals(symbol)){
					dataList.add(count);
				}else if("rate".equals(symbol)){
					dataListDou.add(Double.parseDouble(dft.format((count * 10000)/flyTime)));
				}
				mark += count;
			}
			map.put("id", s.getId());
			map.put("name", s.getName());
			if("count".equals(symbol)){
				map.put("count",s.getName() + "(" + sum(dataList) + ")");
				map.put("value", dataList);
			}else if("rate".equals(symbol)){
				map.put("count",s.getName());
				map.put("value", dataListDou);
			}
			if(mark != 0){
				map.put("mark", true);
			}else{
				map.put("mark", false);
			}
			list.add(map);
		}
		return list;
	}
	
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public List<Map<String, Object>> getEventTypeFliter(List<Integer> activitys) {
		String activity = null;
		if(activitys.size() > 0 && activitys.size() <= 500){
			activity = StringUtils.join(activitys, ",");
		}
		List<DictionaryDO> dictionary = dictionaryDao.getListByType("事件类型");
		String customFieldValueKey = "customfield_"+(customFieldDao.getByName("事件类型").get(0).getId().toString());
		StringBuffer cussql = new StringBuffer("select cfv.text_value"
					  + " from t_activity act"
					  + " join t_custom_field_value cfv"
					  + " on act.id = cfv.activity_id"
					  + " join t_access_information acc"
					  + " on act.id = acc.activity_id"
					  + " where act.deleted = '0'");
	    if(activitys.size() > 500){
			cussql.append(" and (act.id in ("+StringUtils.join(activitys.subList(0, 500), ",")+")");
			cussql.append(this.getHql(activitys.subList(500, activitys.size())));
		}else{
			cussql.append(" and act.id in ("+activity+")");
		}			  
	    cussql.append(" and cfv.\"key\" = '"+customFieldValueKey+"'");
		Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();
		SQLQuery query = session.createSQLQuery(cussql.toString());
		@SuppressWarnings("unchecked")
		List<String> customfilelist = query.list();
		List<Map<String,Object>> list = new ArrayList<Map<String,Object>>();
		for(DictionaryDO dic : dictionary){
			Map<String,Object> map = new HashMap<String, Object>();
			Integer count = 0;
			for(String o : customfilelist){
				if(o != null){
					if(o.toString().indexOf(dic.getName()) > -1){
						count ++;
					}
				}
			}
			map.put("id", dic.getId());
			map.put("name", dic.getName());
			map.put("value", count);
			if(count != 0){
				map.put("mark", true);
			}else{
				map.put("mark", false);
			}
			
			list.add(map);
		}
		return getSortInteger(list);
	}
	
	@SuppressWarnings("unchecked")
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public List<Map<String, Object>> getFlightPhaseFliter(List<Integer> activitys) {
		String activity = null;
		if(activitys.size() > 0 && activitys.size() <= 500){
			activity = StringUtils.join(activitys, ",");
		}
		List<DictionaryDO> dictionary = dictionaryDao.getListByType("飞行阶段");
		StringBuffer sql = new StringBuffer("select phase.name,count(flight) from FlightInfoEntityDO flight "
				+ " join flight.activity act"
				+ " join flight.flightPhase phase"
				+ " where flight.deleted = false");
		if(activitys.size() > 500){
			sql.append(" and (act.id in ("+StringUtils.join(activitys.subList(0, 500), ",")+")");
			sql.append(this.getHql(activitys.subList(500, activitys.size())));
		}else{
			sql.append(" and act.id in ("+activity+")");
		}
		sql.append(" group by phase.name");
		List<Object[]> flightinfolist = this.getHibernateTemplate().find(sql.toString());
		List<Map<String,Object>> list = new ArrayList<Map<String,Object>>();
		for(DictionaryDO dic : dictionary){
			Map<String,Object> map = new HashMap<String, Object>();
			Integer count = 0;
			for(Object[] o : flightinfolist){
				if(o[0] != null){
					if(dic.getName().equals(o[0].toString())){
						count += ((Long)o[1]).intValue();
					}
				}
			}
			map.put("id", dic.getId());
			map.put("name", dic.getName());
			map.put("value", count);
			if(count != 0){
				map.put("mark", true);
			}else{
				map.put("mark", false);
			}
			list.add(map);
		}
		return getSortInteger(list);
	}
	
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public List<Map<String, Object>> getFlightPhaseLineFliter(List<Integer> activitys, List<Integer> flightPhases, String start, String enddate, List<Date> datelist) throws ParseException {
		List<Map<String, Object>> list = new ArrayList<Map<String,Object>>();
		for(int k=0;k<flightPhases.size();k++){
			Integer flightPhase = flightPhases.get(k);	
			String activity = null;
			if(activitys.size() > 0 && activitys.size() <= 500){
				activity = StringUtils.join(activitys, ",");
			}
			Date first = DateHelper.getFirstDayOfMonth(DateUtils.addMonths(new Date(), -12));
			Date last = DateHelper.getLastDayOfMonth(DateUtils.addMonths(new Date(), -1));
			if(datelist.size() > 1){
				first = DateHelper.getFirstDayOfMonth(((SimpleDateFormat)sdfyMd.clone()).parse(start));
				last = DateHelper.getLastDayOfMonth(((SimpleDateFormat)sdfyMd.clone()).parse(enddate));
			}
			List<Object> param = new ArrayList<Object>();
			StringBuffer sql = new StringBuffer("select acc.occurredDate, count(t) from FlightInfoEntityDO t, AccessInformationDO acc"
					+ " where t.deleted = false"
					+ " and t.activity.id = acc.activity.id");
			sql.append(" and t.flightPhase.id = ?");
			param.add(flightPhase);
			sql.append(" and acc.occurredDate >= ?");
			param.add(first);
			sql.append(" and acc.occurredDate <= ?");
			param.add(last);
			if(activitys.size() > 500){
				sql.append(" and (t.activity.id in ("+StringUtils.join(activitys.subList(0, 500), ",")+")");
				sql.append(reportFliterDao.getHql(activitys.subList(500, activitys.size())));
			}else{
				sql.append(" and t.activity.id in ("+activity+")");
			}
			sql.append(" group by acc.occurredDate");
			@SuppressWarnings("unchecked")
			List<Object[]> phaselist = this.getHibernateTemplate().find(sql.toString(), param.toArray());
			List<Integer> datalist = new ArrayList<Integer>();
			if(datelist.size() > 1){
				for(Date d : datelist){
					Date begin = DateHelper.getFirstDayOfMonth(d);
					Date end = DateHelper.getLastDayOfMonth(d);
					Integer count = 0;
					for(Object[] o : phaselist){
						if(o[0] != null){
							if(((Timestamp)o[0]).compareTo(begin) == 0){
								count += ((Long)o[1]).intValue();
							}
							if(((Timestamp)o[0]).after(begin) && ((Timestamp)o[0]).before(end)){
								count += ((Long)o[1]).intValue();
							}
						}
					}
					datalist.add(count);
				}
			}else{
				for(int i = 12; i > 0; i--){
					Date begin = DateHelper.getFirstDayOfMonth(DateUtils.addMonths(new Date(), -i));
					Date end = DateHelper.getLastDayOfMonth(DateUtils.addMonths(new Date(), -i));
					Integer count = 0;
					for(Object[] o : phaselist){
						if(o[0] != null){
							if(((Timestamp)o[0]).compareTo(begin) == 0){
								count += ((Long)o[1]).intValue();
							}
							if(((Timestamp)o[0]).after(begin) && ((Timestamp)o[0]).before(end)){
								count += ((Long)o[1]).intValue();
							}
						}
					}
					datalist.add(count);
				}
			}
			Map<String,Object> map = new HashMap<String, Object>();
			map.put("id", flightPhase);
			map.put("name", dictionaryDao.internalGetById(flightPhase).getName());
			map.put("value", datalist);
			list.add(map);
		}
		return list;
	}
	
	@SuppressWarnings("unchecked")
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public List<Map<String, Object>> getlabelFliter(List<Integer> activitys) {
		String activity = null;
		if(activitys.size() > 0 && activitys.size() <= 500){
			activity = StringUtils.join(activitys, ",");
		}
		StringBuffer sql = new StringBuffer("select lab.label,count(lab) from LabelDO lab "
				+ " join lab.activity act "
				+ " where lab.deleted = false");
		if(activitys.size() > 500){
			sql.append(" and (act.id in ("+StringUtils.join(activitys.subList(0, 500), ",")+")");
			sql.append(this.getHql(activitys.subList(500, activitys.size())));
		}else{
			sql.append(" and act.id in ("+activity+")");
		}
		sql.append(" group by lab.label");
		List<Object[]> labellist = this.getHibernateTemplate().find(sql.toString());
		List<Map<String,Object>> list = new ArrayList<Map<String,Object>>();
		for(Object[] o : labellist){
			if(o[0] != null){
				Map<String,Object> map = new HashMap<String, Object>();
				map.put("name", o[0].toString());
				map.put("value", ((Long)o[1]).intValue());
				int mark = ((Long)o[1]).intValue();
				if(mark == 0) continue;
				if(mark != 0){
					map.put("mark", true);
				}else{
					map.put("mark", false);
				}
				list.add(map);
			}
		}
		return list;
	}
	
	@SuppressWarnings("unchecked")
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public List<Map<String, Object>> getlabelLineFliter(List<Integer> activitys, List<String> labels, String start, String enddate, List<Date> datelist) throws ParseException {
		List<Map<String, Object>> list = new ArrayList<Map<String,Object>>();
		for(int k=0;k<labels.size();k++){
			String label = labels.get(k);	
			String activity = null;
			if(activitys.size() > 0 && activitys.size() <= 500){
				activity = StringUtils.join(activitys, ",");
			}
			Date first = DateHelper.getFirstDayOfMonth(DateUtils.addMonths(new Date(), -12));
			Date last = DateHelper.getLastDayOfMonth(DateUtils.addMonths(new Date(), -1));
			if(datelist.size() > 1){
				first = DateHelper.getFirstDayOfMonth(((SimpleDateFormat)sdfyMd.clone()).parse(start));
				last = DateHelper.getLastDayOfMonth(((SimpleDateFormat)sdfyMd.clone()).parse(enddate));
			}
			List<Object> param = new ArrayList<Object>();
			StringBuffer sql = new StringBuffer("select acc.occurredDate, count(t) from AccessInformationDO acc,LabelDO t"
					+ " where t.deleted = false"
					+ " and t.activity.id = acc.activity.id");
			sql.append(" and acc.occurredDate >= ?");
			param.add(first);
			sql.append(" and acc.occurredDate <= ?");
			param.add(last);
			sql.append(" and upper(t.label) like upper(?)");
			param.add(label);
			if(activitys.size() > 500){
				sql.append(" and (t.activity.id in ("+StringUtils.join(activitys.subList(0, 500), ",")+")");
				sql.append(reportFliterDao.getHql(activitys.subList(500, activitys.size())));
			}else{
				sql.append(" and t.activity.id in ("+activity+")");
			}
			sql.append(" group by acc.occurredDate");
			List<Object[]> labellist = this.getHibernateTemplate().find(sql.toString(), param.toArray());
			List<Integer> datalist = new ArrayList<Integer>();
			if(datelist.size() > 1){
				for(Date d : datelist){
					Date begin = DateHelper.getFirstDayOfMonth(d);
					Date end = DateHelper.getLastDayOfMonth(d);
					Integer count = 0;
					for(Object[] o : labellist){
						if(o[0] != null){
							if(((Timestamp)o[0]).compareTo(begin) == 0){
								count += ((Long)o[1]).intValue();
							}
							if(((Timestamp)o[0]).after(begin) && ((Timestamp)o[0]).before(end)){
								count += ((Long)o[1]).intValue();
							}
						}
					}
					datalist.add(count);
				}
			}else{
				for(int i = 12; i > 0; i--){
					Date begin = DateHelper.getFirstDayOfMonth(DateUtils.addMonths(new Date(), -i));
					Date end = DateHelper.getLastDayOfMonth(DateUtils.addMonths(new Date(), -i));
					Integer count = 0;
					for(Object[] o : labellist){
						if(o[0] != null){
							if(((Timestamp)o[0]).compareTo(begin) == 0){
								count += ((Long)o[1]).intValue();
							}
							if(((Timestamp)o[0]).after(begin) && ((Timestamp)o[0]).before(end)){
								count += ((Long)o[1]).intValue();
							}
						}
					}
					datalist.add(count);
				}
				
			}
			Map<String,Object> map = new HashMap<String, Object>();
			map.put("name", label);
			map.put("value", datalist);
			list.add(map);
		}
		return list;
	}
	
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public List<Map<String,Object>> getEventTypeLine(List<Integer> activitys, List<String> _eventTypes, String customFieldValueKey, Date _date, String start, String enddate, List<Date> datelist) throws ParseException {
		List<Map<String,Object>> list = new ArrayList<Map<String,Object>>();
		for(int k=0;k<_eventTypes.size();k++){
			String _eventType = _eventTypes.get(k);
			String activity = null;
			if(activitys.size() > 0 && activitys.size() <= 500){
				activity = StringUtils.join(activitys, ",");
			}
			Date first = DateHelper.getFirstDayOfMonth(DateUtils.addMonths(_date, -12));
			Date last = DateHelper.getLastDayOfMonth(DateUtils.addMonths(_date, -1));
			if(datelist.size() > 1){
				first = DateHelper.getFirstDayOfMonth(((SimpleDateFormat)sdfyMd.clone()).parse(start));
				last = DateHelper.getLastDayOfMonth(((SimpleDateFormat)sdfyMd.clone()).parse(enddate));
			}
			List<Object> param = new ArrayList<Object>();
			StringBuffer cussql = new StringBuffer("select acc.occurredDate, count(cus) "
					+ " from CustomFieldValueDO cus join cus.activity act, AccessInformationDO acc"
					+ " where cus.deleted = false"
					+ " and act.id = acc.activity.id");
			cussql.append(" and cus.key = ?");
			param.add(customFieldValueKey);
			cussql.append(" and acc.occurredDate >= ?");
			param.add(first);
			cussql.append(" and acc.occurredDate <= ?");
			param.add(last);
			cussql.append(" and upper(cus.textValue) like upper(?)");
			param.add("%"+_eventType+"%");
			if(activitys.size() > 500){
				cussql.append(" and (act.id in ("+StringUtils.join(activitys.subList(0, 500), ",")+")");
				cussql.append(this.getHql(activitys.subList(500, activitys.size())));
			}else{
				cussql.append(" and act.id in ("+activity+")");
			}
			cussql.append(" group by acc.occurredDate");
			@SuppressWarnings("unchecked")
			List<Object[]> cuslist = this.getHibernateTemplate().find(cussql.toString(), param.toArray());
			List<Integer> datalist = new ArrayList<Integer>();
			Map<String,Object> map = new HashMap<String, Object>();
			if(datelist.size() > 1){
				for(Date d : datelist){
					Date begin = DateHelper.getFirstDayOfMonth(d);
					Date end = DateHelper.getLastDayOfMonth(d);
					Integer count = 0;
					for(Object[] o : cuslist){
						if(o[0] != null){
							if(((Timestamp)o[0]).compareTo(begin) == 0){
								count += ((Long)o[1]).intValue();
							}
							if(((Timestamp)o[0]).after(begin) && ((Timestamp)o[0]).before(end)){
								count += ((Long)o[1]).intValue();
							}
						}
					}
					datalist.add(count);
				}
			}else{
				for(int i = 12; i > 0; i--){
					Date begin = DateHelper.getFirstDayOfMonth(DateUtils.addMonths(_date, -i));
					Date end = DateHelper.getLastDayOfMonth(DateUtils.addMonths(_date, -i));
					Integer count = 0;
					for(Object[] o : cuslist){
						if(o[0] != null){
							if(((Timestamp)o[0]).compareTo(begin) == 0){
								count += ((Long)o[1]).intValue();
							}
							if(((Timestamp)o[0]).after(begin) && ((Timestamp)o[0]).before(end)){
								count += ((Long)o[1]).intValue();
							}
						}
					}
					datalist.add(count);
				}
				
			}
			map.put("name", _eventType);
			map.put("value", datalist);
			list.add(map);
		}
		return list;
	}
	
	@SuppressWarnings("unchecked")
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public List<Map<String, Object>> getOrganizationLineFliter(List<Integer> activitys, List<Integer> units, String start, String enddate, List<Date> datelist) throws ParseException {
		List<Map<String, Object>> currlist = new ArrayList<Map<String,Object>>();
		for(int k=0;k<units.size();k++){
			int unit = units.get(k);
			String activity = null;
			if(activitys.size() > 0 && activitys.size() <= 500){
				activity = StringUtils.join(activitys, ",");
			}
			Date first = DateHelper.getFirstDayOfMonth(DateUtils.addMonths(new Date(), -12));
			Date last = DateHelper.getLastDayOfMonth(DateUtils.addMonths(new Date(), -1));
			if(datelist.size() > 1){
				first = DateHelper.getFirstDayOfMonth(((SimpleDateFormat)sdfyMd.clone()).parse(start));
			    last = DateHelper.getLastDayOfMonth(((SimpleDateFormat)sdfyMd.clone()).parse(enddate));
			}
			List<Object> param = new ArrayList<Object>();
			StringBuffer sql = new StringBuffer("select acc.occurredDate, count(act) from ActivityDO act, AccessInformationDO acc"
					+ " where act.deleted = false"
					+ " and act.id = acc.activity.id");
			sql.append(" and act.unit.id = ?");
			param.add(unit);
			sql.append(" and acc.occurredDate >= ?");
			param.add(first);
			sql.append(" and acc.occurredDate <= ?");
			param.add(last);
			if(activitys.size() > 500){
				sql.append(" and (act.id in ("+StringUtils.join(activitys.subList(0, 500), ",")+")");
				sql.append(this.getHql(activitys.subList(500, activitys.size())));
			}else{
				sql.append(" and act.id in ("+activity+")");
			}
			sql.append(" group by acc.occurredDate");
			List<Object[]> list = this.getHibernateTemplate().find(sql.toString(),param.toArray());
			List<Integer> datalist = new ArrayList<Integer>();
			Map<String,Object> map = new HashMap<String, Object>();
			if(datelist.size() > 1){
				for(Date d : datelist){
					Date begin = DateHelper.getFirstDayOfMonth(d);
					Date end = DateHelper.getLastDayOfMonth(d);
					Integer count = 0;
					for(Object[] o : list){
						if(o[0] != null){
							if(((Timestamp)o[0]).compareTo(begin) == 0){
								count += ((Long)o[1]).intValue();
							}
							if(((Timestamp)o[0]).after(begin) && ((Timestamp)o[0]).before(end)){
								count += ((Long)o[1]).intValue();
							}
						}
					}
					datalist.add(count);
				}
			}else{
				for(int i = 12; i > 0; i--){
					Date begin = DateHelper.getFirstDayOfMonth(DateUtils.addMonths(new Date(), -i));
					Date end = DateHelper.getLastDayOfMonth(DateUtils.addMonths(new Date(), -i));
					Integer count = 0;
					for(Object[] o : list){
						if(o[0] != null){
							if(((Timestamp)o[0]).compareTo(begin) == 0){
								count += ((Long)o[1]).intValue();
							}
							if(((Timestamp)o[0]).after(begin) && ((Timestamp)o[0]).before(end)){
								count += ((Long)o[1]).intValue();
							}
						}
					}
					datalist.add(count);
				}
			}
			map.put("id", unit);
			map.put("name", unitDao.internalGetById(unit).getName());
			map.put("value", datalist);
			currlist.add(map);
		}
		return currlist;
	}
	
	@SuppressWarnings("unchecked")
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public List<Map<String,Object>> getAirportFliter(List<Integer> activitys) {
		String activity = null;
		if(activitys.size() > 0 && activitys.size() <= 500){
			activity = StringUtils.join(activitys, ",");
		}
		StringBuffer entitysql = new StringBuffer("select t.flightInfo.deptAirport,t.flightInfo.arrAirport from FlightInfoEntityDO t where t.deleted = false ");
		if(activitys.size() > 500){
			entitysql.append(" and (t.activity.id in ("+StringUtils.join(activitys.subList(0, 500), ",")+")");
			entitysql.append(reportFliterDao.getHql(activitys.subList(500, activitys.size())));
		}else{
			entitysql.append(" and t.activity.id in ("+activity+")");
		}
		List<Object[]> infolist = this.getHibernateTemplate().find(entitysql.toString());
		List<AirportDO> airportlist = new ArrayList<AirportDO>();
		for(Object[] o : infolist){
			if(o[0] != null){
				airportlist.add(flightInfoCache.getAirport(o[0].toString()));
			}
			if(o[1] != null){
				airportlist.add(flightInfoCache.getAirport(o[1].toString()));
			}
		}
		List<Map<String,Object>> list = new ArrayList<Map<String,Object>>();
		for(AirportDO air : airportlist){
			Map<String,Object> map = new HashMap<String, Object>();
			map.put("name", air.getFullName());
			map.put("value", Collections.frequency(airportlist, air));
			int mark = Collections.frequency(airportlist, air);
			if(mark != 0){
				map.put("mark", true);
			}else{
				map.put("mark", false);
			}
			if(list.contains(map)) continue;
			list.add(map);
		}
		return getSortInteger(list);
	}
	
	
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public List<Map<String, Object>> getUnitEmpReport(List<Integer> activitys) {
		String activity = null;
		if(activitys.size() > 0 && activitys.size() <= 500){
			activity = StringUtils.join(activitys, ",");
		}
		StringBuffer sql = new StringBuffer("select u.id ,u.name from t_activity act"
				   + " join t_unit u "
				   + " on act.unit_id = u.id"
				   + " join t_unit_category tuc"
				   + " on u.category_id = tuc.id"
				   + " where act.deleted = '0'"
				   + " and tuc.name in ('分子公司','二级部门')");
		if(activitys.size() > 500){
			sql.append(" and (act.id in ("+StringUtils.join(activitys.subList(0, 500), ",")+")");
			sql.append(this.getHql(activitys.subList(500, activitys.size())));
		}else{
			sql.append(" and act.id in ("+activity+")");
		}
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
		SQLQuery query = session.createSQLQuery(sql.toString());
		@SuppressWarnings("unchecked")
		List<Object[]> unitlist = query.list();
		List<Map<String,Object>> list = new ArrayList<Map<String,Object>>();
		for(Object[] o : unitlist){
			if(o[0] != null && o[1] != null){
				Map<String,Object> map = new HashMap<String, Object>();
				map.put("id", o[0]);
				map.put("name", o[1]);
				map.put("value", frequency(unitlist, o));
				int syob = frequency(unitlist, o);
				if(syob != 0){
					map.put("mark", true);
				}else{
					map.put("mark", false);
				}
				if(list.contains(map)) continue;
				list.add(map);
			}
		}
		return getSortInteger(list);
	}
	
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public Map<String,Object> getUnitEmp(List<Integer> activitys){
		List<Map<String,Object>> alllist = this.getUnitEmpAll(activitys);
		List<Map<String,Object>> finshlist = this.getUnitEmpFinsh(activitys);
		@SuppressWarnings("unchecked")
		List<UnitDO> unitlist = this.getHibernateTemplate().find("from UnitDO u where u.deleted = false ");
		List<String> unit = new ArrayList<String>();
		List<Integer> finish = new ArrayList<Integer>();
		List<Integer> working = new ArrayList<Integer>();
		List<Double> process = new ArrayList<Double>();
		for(UnitDO un : unitlist){
			int allvalue = 0, finishvalue = 0;
			for(Map<String,Object> all : alllist){
				if(un.getId().equals(((BigDecimal)all.get("id")).intValue())){
					allvalue = Integer.parseInt(all.get("value").toString());
				}
			}
			for(Map<String,Object> fin : finshlist){
				if(un.getId().equals(((BigDecimal)fin.get("id")).intValue())){
					finishvalue = Integer.parseInt(fin.get("value").toString());
				}
			}
			unit.add(un.getName());//把安监机构名称放入list
			finish.add(finishvalue);
			working.add(allvalue - finishvalue);
			if(allvalue == 0){
				process.add(0.0);
			}else{
				process.add(Double.parseDouble(df.format((((finishvalue*1.0)/(allvalue*1.0)) * 100))));
			}
		}
		Map<String,Object> map = new HashMap<String, Object>();
		map.put("unit", unit);
		map.put("finish", finish);
		map.put("unfinish", working);
		map.put("completionRate", process);
		return map;
	}
	
	private List<Map<String, Object>> getUnitEmpAll(List<Integer> activitys) {
		String activity = null;
		if(activitys.size() > 0 && activitys.size() <= 500){
			activity = StringUtils.join(activitys, ",");
		}
		StringBuffer sql = new StringBuffer("select u.id ,u.name from t_activity act"
				+ " join t_unit u "
				+ " on act.unit_id = u.id"
				+ " where act.deleted = '0'");
		if(activitys.size() > 500){
			sql.append(" and (act.id in ("+StringUtils.join(activitys.subList(0, 500), ",")+")");
			sql.append(this.getHql(activitys.subList(500, activitys.size())));
		}else{
			sql.append(" and act.id in ("+activity+")");
		}
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
		SQLQuery query = session.createSQLQuery(sql.toString());
		@SuppressWarnings("unchecked")
		List<Object[]> unitlist = query.list();
		List<Map<String,Object>> list = new ArrayList<Map<String,Object>>();
		for(Object[] o : unitlist){
			if(o[0] != null && o[1] != null){
				Map<String,Object> map = new HashMap<String, Object>();
				map.put("id", o[0]);
				map.put("name", o[1]);
				map.put("value", frequency(unitlist, o));
				int syob = frequency(unitlist, o);
				if(syob != 0){
					map.put("mark", true);
				}else{
					map.put("mark", false);
				}
				if(list.contains(map)) continue;
				list.add(map);
			}
		}
		return list;
	}
	
	private List<Map<String, Object>> getUnitEmpFinsh(List<Integer> activitys) {
		String activity = null;
		if(activitys.size() > 0 && activitys.size() <= 500){
			activity = StringUtils.join(activitys, ",");
		}
		StringBuffer sql = new StringBuffer("select u.id ,u.name from t_activity act"
				+ " join t_unit u "
				+ " on act.unit_id = u.id"
				+ " join t_activity_status tas"
				+ " on act.status_id = tas.id"
				+ " where act.deleted = '0'"
				+ " and tas.category = 'COMPLETE'");
		if(activitys.size() > 500){
			sql.append(" and (act.id in ("+StringUtils.join(activitys.subList(0, 500), ",")+")");
			sql.append(this.getHql(activitys.subList(500, activitys.size())));
		}else{
			sql.append(" and act.id in ("+activity+")");
		}
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
		SQLQuery query = session.createSQLQuery(sql.toString());
		@SuppressWarnings("unchecked")
		List<Object[]> unitlist = query.list();
		List<Map<String,Object>> list = new ArrayList<Map<String,Object>>();
		for(Object[] o : unitlist){
			if(o[0] != null && o[1] != null){
				Map<String,Object> map = new HashMap<String, Object>();
				map.put("id", o[0]);
				map.put("name", o[1]);
				map.put("value", frequency(unitlist, o));
				int syob = frequency(unitlist, o);
				if(syob != 0){
					map.put("mark", true);
				}else{
					map.put("mark", false);
				}
				if(list.contains(map)) continue;
				list.add(map);
			}
		}

		return list;
	}
	
	public int getRiskValue(double value) {
		if (value < 1 && value > 0) {
			return 1;
		} else {
			return  (int)value;
		}
	}
	
	private static int frequency(List<Object[]> c, Object[] o) {
        int result = 0;
        for(Object[] obj : c){
        	if(obj[0].equals(o[0]) && obj[1].equals(o[1])) result++;
        }
        return result;
    }
	
	protected String getHql(List<Integer> activitys){
		int step = activitys.size() / 500;
		StringBuffer sql = new StringBuffer(" ");
		for(int i = 0; i < step; i++){
			sql.append(" or act.id in ("+StringUtils.join(activitys.subList(500 * i, 500 * (i + 1)), ",")+")");
		}
		if (activitys.size() % 500 > 0) {
			sql.append(" or act.id in ("+StringUtils.join(activitys.subList(500 * step, activitys.size()),",")+")");
		}
		sql.append(")");
		return sql.toString();
	}
	
	public List<Map<String, Object>> getAircraftTypeChart(String query, String search) {
		Map<String, Object> countMap = this.getActivityCountGroupByKeyThroughSolr(query, search, "aircraftTypeCat");
		
		List<String> familyCodes = aircraftModelDao.getFieldBySearch("familycode", null, null, null, false);
		
		List<Map<String, Object>> list = new ArrayList<Map<String,Object>>();
		for (String familyCode : familyCodes) {
			Map<String, Object> map = new HashMap<String, Object>();
			Integer countValue = (Integer) (countMap.get(familyCode) == null ? 0 : countMap.get(familyCode));
			map.put("name", familyCode);
			map.put("value", countValue);
			if (countValue != 0){
				map.put("mark", true);
			}else{
				map.put("mark", false);
			}
			list.add(map);
		}
		return getSortInteger(list);
	}
	
	/**
	 * 通过solr进行关于指定key的安全信息的数量统计
	 * @param query 查询条件
	 * @param search 查询条件
	 * @param key 指定的key
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> getActivityCountGroupByKeyThroughSolr(String query, String search, String key) {
		Map<String, Object> result = new HashMap<String, Object>();
		List<ISearchTemplate> searchTemplates = SearchTemplateRegister.getSearchTemplates(key);
		if (searchTemplates != null && !searchTemplates.isEmpty()) {
			try {
				String solrKey = searchTemplates.get(0).getSolrFieldName(key);
				String solrUql = queryService.getSolrUql(UserContext.getUserId().toString(), query, search, false);
				Map<String, String> facetOption = new HashMap<String, String>();
				facetOption.put("facet", "true");
				facetOption.put("facet.field", solrKey);
				Config config = new ConfigService().getConfig();
				String url = config.getSolr() + "/activity/select";
				Map<String, Object> m_solr = Utility.SolrQuery(url, "*:*", solrUql, "0", "0", null, null, facetOption);
				if (m_solr != null && m_solr.containsKey("facet_counts")) {
					Map<String, Object> facetFields = (Map<String, Object>) ((Map<String, Object>) m_solr.get("facet_counts")).get("facet_fields");
					List<Object> counts = (List<Object>) facetFields.get(solrKey);
					for (int i = 0; i < counts.size() / 2; i++) {
						result.put((String) counts.get(2 * i), ((Number) counts.get(2 * i + 1)).intValue());
					}
				}
			} catch (Exception e) {
				LOGGER.error("solr查询失败", e);
			}
		}
		return result;
	}
	
	@SuppressWarnings("unchecked")
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public List<Map<String,Object>> getAircraftTypeLine(List<Integer> activitys, List<String> aircraftTypes, String begin, String end) throws ParseException{
		List<Map<String, Object>> currlist = new ArrayList<Map<String,Object>>();
		for(int k=0;k<aircraftTypes.size();k++){
			String aircraftType = aircraftTypes.get(k);
			List<Date> dateList = this.getTimeLineByFliter(begin, end);
			String activity = null;
			if(activitys.size() > 0 && activitys.size() <= 500){
				activity = StringUtils.join(activitys, ",");
			}
			StringBuffer sql = new StringBuffer("select trunc(t.occurredDate,'mm'),count(t) from AccessInformationDO t where t.deleted = false");
			if(activitys.size() > 500){
				sql.append(" and (t.activity.id in ("+StringUtils.join(activitys.subList(0, 500), ",")+")");
				sql.append(reportFliterDao.getHql(activitys.subList(500, activitys.size())));
			}else{
				sql.append(" and t.activity.id in ("+activity+")");
			}
			sql.append(" group by trunc(t.occurredDate,'mm')");
			List<Object[]> activityList = this.getHibernateTemplate().find(sql.toString());
			List<Integer> data = new ArrayList<Integer>();
			for (Date d : dateList) {
				int count = 0;
				Date first = DateHelper.getFirstDayOfMonth(d);
				Date last = DateHelper.getLastDayOfMonth(d);
				for(Object[] o : activityList){
					if(o[0] != null && o[1] != null){
						if(((Timestamp)o[0]).compareTo(first) == 0){
							count += ((Long)o[1]).intValue();
						}
						if(((Timestamp)o[0]).after(first) && ((Timestamp)o[0]).before(last)){
							count += ((Long)o[1]).intValue();
						}
					}
				}
				data.add(count);
			}
			Map<String,Object> map = new HashMap<String, Object>();
			map.put("id", aircraftType);
			map.put("name", aircraftType);
			map.put("value", data);
			currlist.add(map);
		}
		return currlist;	
	}
	
	//1、把tem按月分类
	@SuppressWarnings("unchecked")
	private Map<String, List<Object[]>> getRiskManTems() throws ParseException {
		Date first = DateHelper.getFirstDayOfMonth(DateUtils.addMonths(new Date(), -12));
		Date last = DateHelper.getLastDayOfMonth(DateUtils.addMonths(new Date(), -1));
		StringBuffer sql = new StringBuffer("select acc.occurred_date,tem.id,tm2.threat_id as primary_threat,em2.error_id as primary_error,tm.threat_id,em.error_id,p.score"
						+ " from t_tem tem"
						+ " left join t_threat_mapping tm"
						+ " on tem.id = tm.tem_id"
						+ " left join t_threat_mapping tm2"
						+ " on tem.primary_threat = tm2.id"
						+ " left join t_error_mapping em"
						+ " on tem.id = em.tem_id"
						+ " left join t_error_mapping em2"
						+ " on tem.primary_error = em2.id"
						+ " left join t_provision p"
						+ " on tem.provision_id = p.id"
						+ " join t_activity act"
						+ " on tem.activity_id = act.id"
						+ " join t_access_information acc"
						+ " on act.id = acc.activity_id"
						+ " where tem.deleted = '0'"
						+ " and acc.occurred_date >= to_date('"+ ((SimpleDateFormat)sdfsim.clone()).format(first)+ "','yyyy-MM-dd HH24:mi:ss')"
						+ " and acc.occurred_date <= to_date('"+ ((SimpleDateFormat)sdfsim.clone()).format(last) + "','yyyy-MM-dd HH24:mi:ss')");

		Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();
		SQLQuery query = session.createSQLQuery(sql.toString());
		List<Object[]> tems = query.list();
		Map<String, List<Object[]>> temmap = groupByTemOccurredDate(tems);
		return temmap;

	}
		
	private static Map<String, List<Object[]>> groupByTemOccurredDate(List<Object[]> list) {
		Map<String, List<Object[]>> map = new LinkedHashMap<String, List<Object[]>>();
		for (Object[] object : list) {
			String occurredDate = ((SimpleDateFormat)sdfyyMM.clone()).format(object[0]);
			if (map.containsKey(occurredDate)) {
				Object arr[] = new Object[6];
				arr[0] = object[1];
				arr[1] = object[2];
				arr[2] = object[3];
				arr[3] = object[4];
				arr[4] = object[5];
				arr[5] = object[6];
				map.get(occurredDate).add(arr);
			} else {
				List<Object[]> tempList = new ArrayList<Object[]>();
				Object arr[] = new Object[6];
				arr[0] = object[1];
				arr[1] = object[2];
				arr[2] = object[3];
				arr[3] = object[4];
				arr[4] = object[5];
				arr[5] = object[6];
				tempList.add(arr);
				map.put(occurredDate, tempList);
			}
		}
		return map;
	}

		
		
	@SuppressWarnings("unchecked")
	private Map<Integer,Map<String,Object>> packageTem(List<Object[]> tems){
		Map<Integer,Map<String,Object>> temmap = new HashMap<Integer, Map<String,Object>>();
		for(Object[] o : tems){
			Integer temid = null, primaryThreatid = null, threatsid = null, primaryErrorid = null, errorsid = null, provision = null;
			if(o[0] != null) temid = ((BigDecimal)o[0]).intValue();
			if(o[1] != null) primaryThreatid = ((BigDecimal)o[1]).intValue();
			if(o[2] != null) primaryErrorid = ((BigDecimal)o[2]).intValue();
			if(o[3] != null) threatsid= ((BigDecimal)o[3]).intValue();
			if(o[4] != null) errorsid = ((BigDecimal)o[4]).intValue();
			if(o[5] != null) provision = ((BigDecimal)o[5]).intValue();
			
			if(temid == null || provision == null) continue;//temid
			if(temmap.containsKey(temid)){
				Map<String,Object> tem = temmap.get(temid);
				if(primaryThreatid != null && threatsid != null){//威胁
					if(tem.containsKey("threats")){
						List<Integer> threats = (List<Integer>) tem.get("threats");
						if(!threats.contains(threatsid))  threats.add(threatsid);
					}else{
						List<Integer> threats = new ArrayList<Integer>();
						threats.add(threatsid);
						tem.put("primaryThreat", primaryThreatid);
						tem.put("threats", threats);
					}
				}
				if(primaryErrorid != null && errorsid != null){//差错
					if(tem.containsKey("errors")){
						List<Integer> errors = (List<Integer>) tem.get("errors");
						if(!errors.contains(errorsid)) errors.add(errorsid);
					}else{
						List<Integer> errors = new ArrayList<Integer>();
						errors.add(errorsid);
						tem.put("primaryError", primaryErrorid);
						tem.put("errors", errors);
					}
				}
			}else{
				Map<String,Object> tem = new HashMap<String, Object>();
				tem.put("provision", provision);
				temmap.put(temid, tem);
				if(primaryThreatid != null){//主威胁
					tem.put("primaryThreat", primaryThreatid);
					if(threatsid != null){//威胁
						List<Integer> threats = new ArrayList<Integer>();
						threats.add(threatsid);
						tem.put("threats", threats);
					}
				}
				if(primaryErrorid != null){//主差错
					tem.put("primaryError", primaryErrorid);
					if(errorsid != null){//差错
						List<Integer> errors = new ArrayList<Integer>();
						errors.add(errorsid);
						tem.put("errors", errors);
					}
				}
			}
		}
		return temmap;
	}
		
	//3、在这些tem中找出这个威胁、或差错的分数
	@SuppressWarnings("unchecked")
	private Double getRiskManThreatOrErrorValue(Integer paramid, String mark, List<Object[]> tem) throws ParseException{
		if(tem == null)  return 0.0;
		Map<Integer,Map<String,Object>> tems = packageTem(tem);
		Double score = 0.0;
		if("threat".equals(mark)){
			for(Map.Entry<Integer,Map<String,Object>> entry : tems.entrySet()){
				Integer primaryThreat = (Integer) entry.getValue().get("primaryThreat");
				Double provisionScore = (Integer) entry.getValue().get("provision") * 1.0;
				List<Integer> threats = (List<Integer>) entry.getValue().get("threats");
				List<Integer> errors = (List<Integer>) entry.getValue().get("errors");
				Boolean bool = (threats != null);
				if(errors != null && errors.size() > 0){
					provisionScore = provisionScore * 0.4;
				}
				if(bool && threats.size() == 0){
					continue;
				}else if(bool && threats.size() == 1 && paramid.equals(primaryThreat)){
					score += provisionScore;
				}else if(bool && threats.size() == 2){
					if(paramid.equals(primaryThreat)){
						score = score + (provisionScore * 0.6);
					}else if(threats.contains(paramid)){
						score = score + (provisionScore * 0.4);
					}
				}else if(bool && threats.size() == 3){
					if(paramid.equals(primaryThreat)){
						score = score + (provisionScore * 0.6);
					}else if(threats.contains(paramid)){
						score = score + (provisionScore * 0.2);
					}
				}else if(bool && threats.size() == 4){
					if(paramid.equals(primaryThreat)){
						score = score + (provisionScore * 0.7);
					}else if(threats.contains(paramid)){
						score = score + (provisionScore * 0.1);
					}
				}
			}
		}else if("error".equals(mark)){
			for(Map.Entry<Integer,Map<String,Object>> entry : tems.entrySet()){
				Integer primaryError = (Integer) entry.getValue().get("primaryError");
				Double provisionScore = (Integer) entry.getValue().get("provision") * 1.0;
				List<Integer> threats = (List<Integer>) entry.getValue().get("threats");
				List<Integer> errors = (List<Integer>) entry.getValue().get("errors");
				Boolean bool = (errors != null);
				if(threats != null && threats.size() > 0){
					provisionScore = provisionScore * 0.6;
				}
				if(bool && errors.size() == 0){
					continue;
				}else if(bool && errors.size() == 1 && paramid.equals(primaryError)){
					score += provisionScore;
				}else if(bool && errors.size() == 2){
					if(paramid.equals(primaryError)){
						score = score + (provisionScore * 0.6);
					}else if(errors.contains(paramid)){
						score = score + (provisionScore * 0.4);
					}
				}else if(bool && errors.size() == 3){
					if(paramid.equals(primaryError)){
						score = score + (provisionScore * 0.6);
					}else if(errors.contains(paramid)){
						score = score + (provisionScore * 0.2);
					}
				}else if(bool && errors.size() == 4){
					if(paramid.equals(primaryError)){
						score = score + (provisionScore * 0.7);
					}else if(errors.contains(paramid)){
						score = score + (provisionScore * 0.1);
					}
				}
			}
		}
		return score;
	}
	//4、查询每个月的飞行小时数
	@SuppressWarnings("unchecked")
	private Map<String, Double> getRiskManFlyTime(Date date) {
		String sql = "select t.flight_date, sum(t.fly_time) from FlightCrewEventDO t group by t.flight_date";
		List<Object[]> list = this.getHibernateTemplate().find(sql);
		Map<String, Double> map = new HashMap<String, Double>();
		for (Object[] o : list) {
			if (o[0] != null && o[1] != null) {
				map.put(o[0].toString(), Double.parseDouble(o[1].toString()));
			}
		}
		return map;
	}
	
	/** 
	 * 获取指定时间所在年的飞行小时数据，以月(yyyy-MM)为单位
	 * @param date
	 * @return
	 * @throws ParseException 
	 */
	public Map<String, Double> getOneYearFlyTimePerMonthOfDate(Date date) throws ParseException {
		return airPlaneDubboService.getFlyHoursPerMonth(DateHelper.getFirstDayOfYear(date), DateHelper.getLastDayOfYear(date));
	}
	
	/** 
	 * 获取指定时间段的飞行小时数据，以月(yyyy-MM)为单位
	 * @param startDate 开始日期
	 * @param endDate 结束日期
	 * @return
	 */
	public Map<String, Double> getFlyTimePerMonth(Date startDate, Date endDate) {
		return airPlaneDubboService.getFlyHoursPerMonth(startDate, endDate);
	}
	
	/** 
	 * 获取所给时间list最小时间与最大时间之间的时间段的飞行小时数据，以月(yyyy-MM)为单位
	 * @param startDate 开始日期
	 * @param endDate 结束日期
	 * @return
	 */
	public Map<String, Double> getRiskManFlyTime(List<Date> datelist) {
		Date startDate = null;
		Date endDate = null;
		int i = 0;
		for (Date date : datelist) {
			if (i == 0) {
				startDate = date;
				endDate = date;
			} else {
				if (date.before(startDate)) {
					startDate = date;
				}
				if (date.after(endDate)) {
					endDate = date;
				}
			}
			i++;
		}
		return airPlaneDubboService.getFlyHoursPerMonth(startDate, endDate);
	}
	//5、计算某一个威胁或差错前12个月的风险值
	private List<Double> getRiskManThreatOrErrorActValue(Integer paramid,String mark, Map<String,Double> flytimemap, Map<String,List<Object[]>> temmap) throws ParseException{ 
		List<Double> datalist = new ArrayList<Double>();
		for(int i = 12; i > 0; i--){
			Date tempdate = DateUtils.addMonths(new Date(), -i);
			Double flytime = flytimemap.get(((SimpleDateFormat)sdfyyMM.clone()).format(tempdate)) == null ? 1.0 : flytimemap.get(((SimpleDateFormat)sdfyyMM.clone()).format(tempdate));
			datalist.add(this.getRiskManThreatOrErrorValue(paramid, mark, temmap.get(((SimpleDateFormat)sdfyyMM.clone()).format(tempdate)))/flytime);
		}
		return datalist;
	}
	//6、计算某一个威胁或差错的警戒值
	private Map<String,Double> getThreatOrErrorWarning(Integer paramid,String mark, Map<String,Double> flytimemap, Map<String,List<Object[]>> temmap) throws ParseException{
		List<Double> datalist = this.getRiskManThreatOrErrorActValue(paramid, mark, flytimemap,temmap);
		Double sum = 0.0;
		for(Double dou : datalist){
			sum += dou;
		}
		Double average = sum / 12;
		Double sumpow = 0.0;
		for(Double dou : datalist){
			sumpow = sumpow + Math.pow(dou - average, 2);
		}
		Double warning = average + Math.sqrt(sumpow / 12) * this.getRiskParam();
		Double value = sum / 12;
		Double standardValue = Math.sqrt(sumpow / 12);
		Map<String,Double> map = new HashMap<String, Double>();
//		map.put("warning", warning * wp);
//		map.put("average", average * wp);
		map.put("standardValue", standardValue * wp);
		map.put("value", value * wp);
		return map;
	}
	
	//7、返回威胁或差错的风险值和警戒值
	/**
	 * 
	 * @param paramid 威胁或差错的id
	 * @param mark threat或error
	 * @return
	 */
	public Map<String,Object> getThreatOrErrorValueAndWarning (Integer paramid,String mark){
		Map<String,Object> map = new HashMap<String, Object>();
		try {
			Map<String, Double> flytimemap = this.getFlyTimePerMonth(DateUtils.addMonths(new Date(), -12), DateUtils.addMonths(new Date(), -1));
			Map<String,List<Object[]>> temmap = this.getRiskManTems();//前12个月的tem
			//上一个月的飞行小时数
//			Double flytime = flytimemap.get(sdfyM.format(DateUtils.addMonths(new Date(), -1))) == null ? 1.0 : flytimemap.get(sdfyM.format(DateUtils.addMonths(new Date(), -1)));
			//上一个月 此 id 的风险值  
//			Double value = this.getRiskManThreatOrErrorValue(paramid, mark, temmap.get(sdfyyMM.format(DateUtils.addMonths(new Date(), -1))))/ flytime;
			//警戒值
			Map<String,Double> waMap = this.getThreatOrErrorWarning(paramid, mark,flytimemap,temmap);
//			Double warning = waMap.get("warning");
//			Double average = waMap.get("average");
//			map.put("value", Double.parseDouble(df.format(value)) * wp);
			Map<String,Double> warningMap = this.getStandardValue(mark);
			Double value = waMap.get("value");
			Double averageRiskValue = warningMap.get("averageRiskValue");
			Double warningvalue = warningMap.get("warningvalue");
			map.put("value", value);
			map.put("mark", getMark(value, warningvalue, averageRiskValue));
		} catch (ParseException e) {
			e.printStackTrace();
			throw new SMSException(e);
		}
		return map;
	}
	
	private static String getMark(Double value, Double warning, Double average) {
		String mark = null;
		if (value <= average) {
			mark = "green";
		} else if (value > average && value <= warning) {
			mark = "yellow";
		} else if (value > warning) {
			mark = "red";
		}
		return mark;
	}
		
	private List<BigDecimal> getAllThreatOrError(String mark) throws ParseException {
		Date first = DateHelper.getFirstDayOfMonth(DateUtils.addMonths(new Date(), -12));
		Date last = DateHelper.getLastDayOfMonth(DateUtils.addMonths(new Date(), -1));
		List<BigDecimal> list = null;
		if ("threat".equals(mark)){
			String sql = "select tm.threat_id" 
					+ " from t_tem tem"
					+ " join t_threat_mapping tm" 
					+ "   on tem.id = tm.tem_id"
					+ " join t_activity act " 
					+ "   on tem.activity_id = act.id"
					+ " join t_access_information acc"
					+ "   on acc.activity_id = act.id"
					+ " and tem.deleted = '0'"
					+ " and acc.occurred_date >= to_date('"+ ((SimpleDateFormat)sdfsim.clone()).format(first)+ "','yyyy-MM-dd HH24:mi:ss')"
					+ " and acc.occurred_date <= to_date('"+ ((SimpleDateFormat)sdfsim.clone()).format(last) + "','yyyy-MM-dd HH24:mi:ss')"
					+ " group by tm.threat_id";
			Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
			SQLQuery query = session.createSQLQuery(sql);
			list = query.list();
		} else if ("error".equals(mark)){
			String sql = "select em.error_id" 
					+ " from t_tem tem"
					+ " join t_error_mapping em" 
					+ "   on tem.id = em.tem_id"
					+ " join t_activity act " 
					+ "   on tem.activity_id = act.id"
					+ " join t_access_information acc"
					+ "   on acc.activity_id = act.id"
					+ " and tem.deleted = '0'"
					+ " and acc.occurred_date >= to_date('"+ ((SimpleDateFormat)sdfsim.clone()).format(first)+ "','yyyy-MM-dd HH24:mi:ss')"
					+ " and acc.occurred_date <= to_date('"+ ((SimpleDateFormat)sdfsim.clone()).format(last) + "','yyyy-MM-dd HH24:mi:ss')"
					+ " group by em.error_id";
			Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
			SQLQuery query = session.createSQLQuery(sql);
			list = query.list();
		}
		return list;
	}
	
	private Map<String,Double> getStandardValue(String mark) throws ParseException{
		List<BigDecimal> errorOrThreats = this.getAllThreatOrError(mark);
		Map<String, Double> flytimemap = this.getFlyTimePerMonth(DateUtils.addMonths(new Date(), -12), DateUtils.addMonths(new Date(), -1));
		Map<String,List<Object[]>> temmap = this.getRiskManTems();//前12个月的tem
		List<Double> riskValue = new ArrayList<Double>();
		List<Double> standardValue = new ArrayList<Double>();
		for (BigDecimal param : errorOrThreats){
			if (param == null) continue;
			Map<String,Double> waMap = this.getThreatOrErrorWarning(((BigDecimal) param).intValue(), mark,flytimemap,temmap);
			riskValue.add(waMap.get("value"));
			standardValue.add(waMap.get("standardValue"));
		}
		double sumRiskValue = 0;
		double sumStandardValue = 0;
		for (Double dou : riskValue){
			if (dou == null) continue;
			sumRiskValue += dou;
		}
		for (Double dou : standardValue){
			if (dou == null) continue;
			sumStandardValue += dou;
		}
		int num = 1;
		if (errorOrThreats.size() > 0){
			num = errorOrThreats.size();
		}
		double averageRiskValue = sumRiskValue / num;
		double averageStandardValue = sumStandardValue / num;
		double warningvalue = averageRiskValue + averageStandardValue * this.getRiskParam();
		Map<String,Double> map = new HashMap<String, Double>();
		map.put("averageRiskValue", averageRiskValue);
		map.put("warningvalue", warningvalue);
		return map;
	}
	
	@SuppressWarnings("unchecked")
	public List<Map<String,Object>> getInsecurityByConsequence(Integer consequence, String name) {
		List<Map<String,Object>> list = new ArrayList<Map<String,Object>>();
		StringBuffer hql = new StringBuffer("select distinct t from InsecurityDO t inner join  t.consequences c where t.deleted = false");
		List<Object> param = new ArrayList<Object>();
		List<InsecurityDO> inselist = null;
		if (name == null) {
			if(consequence == 0){
				String sql = "from InsecurityDO t where t.deleted = false";
				inselist = this.getHibernateTemplate().find(sql);
			}else{
				hql.append(" and c.id = ?") ;
				param.add(consequence);
				inselist = this.getHibernateTemplate().find(hql.toString(),param.toArray());
			}
		}else{
			if(consequence == 0){
				hql.append(" and upper(t.name) like upper(?)");
				param.add("%"+name+"%");
				inselist = this.getHibernateTemplate().find(hql.toString(),param.toArray());
			}else{
				hql.append(" and c.id = ?");
				param.add(consequence);
				hql.append(" and upper(t.name) like upper(?)");
				param.add("%"+name+"%");
				inselist = this.getHibernateTemplate().find(hql.toString(),param.toArray());
			}
		}
		for(InsecurityDO i : inselist){
			Map<String,Object> map = new HashMap<String, Object>();
			map.put("id", i.getId());
			map.put("name", i.getName());
			list.add(map);
		}
		return list;
	}
		
	
	public void setDictionaryDao(DictionaryDao dictionaryDao) {
		this.dictionaryDao = dictionaryDao;
	}

	public void setSeverityDao(SeverityDao severityDao) {
		this.severityDao = severityDao;
	}

	public void setCustomFieldDao(CustomFieldDao customFieldDao) {
		this.customFieldDao = customFieldDao;
	}

	public void setConsequenceDao(ConsequenceDao consequenceDao) {
		this.consequenceDao = consequenceDao;
	}

	public void setInsecurityDao(InsecurityDao insecurityDao) {
		this.insecurityDao = insecurityDao;
	}

	public void setThreatDO(ThreatDao threatDao) {
		this.threatDao = threatDao;
	}

	public void setErrorDao(ErrorDao errorDao) {
		this.errorDao = errorDao;
	}

	public void setTemDao(TemDao temDao) {
		this.temDao = temDao;
	}
	
	public void setReportFliterDao(ReportFliterDao reportFliterDao) {
		this.reportFliterDao = reportFliterDao;
	}
	
	public void setFlightInfoCache(FlightInfoCache flightInfoCache) {
		this.flightInfoCache = flightInfoCache;
	}
	
	public void setUnitDao(UnitDao unitDao) {
		this.unitDao = unitDao;
	}

	public void setFlightInfoEntityDao(FlightInfoEntityDao flightInfoEntityDao) {
		this.flightInfoEntityDao = flightInfoEntityDao;
	}

	public void setThreatDao(ThreatDao threatDao) {
		this.threatDao = threatDao;
	}

	public void setMessageDao(MessageDao messageDao) {
		this.messageDao = messageDao;
	}

	public void setActionItemDao(ActionItemDao actionItemDao) {
		this.actionItemDao = actionItemDao;
	}

	public void setTodoViewDao(TodoViewDao todoViewDao) {
		this.todoViewDao = todoViewDao;
	}

	public void setMethanolInstDao(MethanolInstDao methanolInstDao) {
		this.methanolInstDao = methanolInstDao;
	}

	public void setProcessorDao(ProcessorDao processorDao) {
		this.processorDao = processorDao;
	}

	public void setAirPlaneDubboService(AirPlaneDubboService airPlaneDubboService) {
		this.airPlaneDubboService = airPlaneDubboService;
	}

	public void setAircraftModelDao(AircraftModelDao aircraftModelDao) {
		this.aircraftModelDao = aircraftModelDao;
	}

	public void setQueryService(QueryService queryService) {
		this.queryService = queryService;
	}
	
}
