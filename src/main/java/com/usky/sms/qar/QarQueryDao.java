package com.usky.sms.qar;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate3.support.HibernateDaoSupport;

import com.usky.sms.flightmovementinfo.AirportDO;
import com.usky.sms.flightmovementinfo.AirportDao;

public class QarQueryDao extends HibernateDaoSupport{
	
	@Autowired
	private AirportDao airportDao;

	public void setAirportDao(AirportDao airportDao) {
		this.airportDao = airportDao;
	}
	
	/**
	 * 
	 * @param 得到机场列表
	 * @return
	 * @throws ParseException 
	 */
	public List<Map<String, Object>> getQarCompany() throws ParseException {
		String sql = " select t.company_name  from QarCompanyDO t ";	
		@SuppressWarnings("unchecked")
		List<String> qarList = this.getHibernateTemplate().find(sql);
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		int count = 0;
		for (String do1 : qarList) {
			if(count >= 10)break;
			count++;
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("airline_code", do1);//公司编码		
			list.add(map);
		}
		return list;
	}
	
	/**
	 * 
	 * @param 得到机场列表
	 * @return
	 * @throws ParseException 
	 */
	public List<Map<String, Object>> getQarEvent(String qarsql) throws ParseException {
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		String sql = " select d.company_name,t.flight_no ,s.pro_desc,t.ac_tail , "
				+ " t.severity_class_no,t.start_date,k.shortName, "
				+ " h.shortName,t.takeoff_runway,t.landing_runway,t.limit_value,t.maximum_value,"
				+ " t.procedure_no,t.procedure_type,t.exceedance_duration,g.version_no,t.flight_phase_no,"
				+ " t.time_to_peak ,t.average_gap "
				+ " from QarStaProDO s,QarCompanyDO d,FlightInfoDO w,QarFlightListDO g, QarEventListDO t left join t.airportDO h "
				+ " left join t.airportDO2 k "
				+ " where t.file_no = g.file_no and t.belong_station = g.belong_station and t.procedure_no = s.pro_no "
				+ " and d.company_code = w.carrierCode and w.flightInfoID = g.flight_info_id "
				+ " and s.ver_no = g.version_no and s.belong_station = t.belong_station ";	
		if(!StringUtils.isBlank(qarsql)){
			sql = sql + qarsql;
		}
		List<?> qarList = this.getHibernateTemplate().find(sql);
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		for(int i=0;i<qarList.size();i++){
			Object[] obj = (Object[])qarList.get(i);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("airline_code", obj[0]);//公司编码	
			map.put("flight_no", obj[1]);// 航班号
			map.put("pro_desc", obj[2]);
			map.put("ac_tail", obj[3]);// 机号
			map.put("severity_class_no",obj[4]);// 安全等级
			map.put("start_date", sdf.format(obj[5]));// 起飞日期
			map.put("departure_airport",null==obj[6]?"":obj[6]);// 出发机场
			map.put("arrival_airport", null==obj[7]?"":obj[7]);// 到达机场
			map.put("takeoff_runway", null==obj[8]?"":obj[8]);
			map.put("landing_runway", null==obj[9]?"":obj[9]);
			map.put("Limit_value", obj[10]);
			map.put("maximum_value", obj[11]);
			map.put("procedure_no", obj[12]);
			map.put("procedure_type", obj[13]);
			map.put("exceedance_duration", obj[14]);
			map.put("version_no", obj[15]);
			map.put("flight_phase_no", obj[16]);
			map.put("time_to_peak", obj[17]);
			map.put("average_gap", obj[18]);
			list.add(map);
		}
		return list;
	}
	
	/*
	 * 根据时间返回航班号及机场等 (成功)
	 */
	public List<Map<String,Object>> getBaseInfo(Date dateTime,Integer page,String flightNum) {
		List<AirportDO> list = this.getAirportList(page,flightNum);
		List<Map<String, Object>> flightList = new ArrayList<Map<String, Object>>();
		if(page==1){
			Map<String, Object> flightMap1 = new HashMap<String, Object>();
			flightMap1.put("flightInfoID", "AA");//航班ID
			flightMap1.put("flightNO", "清空");//航班号
			flightMap1.put("deptAirportName", "");// 实际起飞机场
			flightList.add(flightMap1);
		}		
		for(AirportDO vo:list){
			Map<String, Object> flightMap = new HashMap<String, Object>();
			flightMap.put("flightInfoID", vo.getiCaoCode());//航班ID
			flightMap.put("flightNO", vo.getiCaoCode());//航班号
			flightMap.put("deptAirportName", vo.getShortName());// 实际起飞机场
			flightList.add(flightMap);
		}
		return flightList;
	}
	
	@SuppressWarnings("unchecked")
	private List<AirportDO> getAirportList(Integer page, String flightNum) {
		String sql = "";
		List<AirportDO> list = null;
//		String s1 = "";
//		String s2 = "";
//		String regex1 = "[A-Z]";
//		String regex2 = "\\d";
//		Pattern pattern1 = Pattern.compile(regex1);
//		Pattern pattern2 = Pattern.compile(regex2);
//		Matcher matcher1 = pattern1.matcher(flightNum);
//		Matcher matcher2 = pattern2.matcher(flightNum);
//		while (matcher1.find()) {
//			s1 += matcher1.group();
//		}
//		while (matcher2.find()) {
//			s2 += matcher2.group();
//		}
//		if ("".equals(s1) && !("".equals(s2)) && s2 !=null) {
//			sql = "from AirportDO where rownum > ? and rownum <= ? and ( iCaoCode like ? or shortName like ? ) ";
//			list = this.getHibernateTemplate().find(sql, (page - 1) * 10l, (page * 10l), flightNum + "%",flightNum + "%");
//		} else if("".equals(s2) && !("".equals(s1)) && s1 !=null){
//			sql = "from AirportDO where  rownum > ? and rownum <= ? and ( iCaoCode like ? or shortName like ? ) ";
//			list = this.getHibernateTemplate().find(sql, (page - 1) * 10l, (page * 10l), flightNum + "%",flightNum + "%");
//		}else if(!("".equals(s1)) && !("".equals(s2)) && s1 != null && s2 != null){
//			sql = "from AirportDO where rownum > ? and rownum <= ? and ( iCaoCode like ? or shortName like ? ) ";
//			list = this.getHibernateTemplate().find(sql, (page - 1) * 10l, (page * 10l), flightNum + "%",flightNum + "%");
//		}else{
//			sql = "from AirportDO";
//			list = this.getHibernateTemplate().find(sql).subList((page - 1) * 10, (page * 10));
//		}
		if(StringUtils.isBlank(flightNum)){
			sql = "from AirportDO";
			list = this.getHibernateTemplate().find(sql).subList((page - 1) * 10, (page * 10));
		}else{
			sql = "from AirportDO where rownum > ? and rownum <= ? and ( iCaoCode like ? or shortName like ? ) ";
			list = this.getHibernateTemplate().find(sql, (page - 1) * 10l, (page * 10l), flightNum.toUpperCase() + "%",flightNum + "%");
		}
		return list;
	}

	@SuppressWarnings("unchecked")
	public Integer count(Date date,Integer page) {
		String sql = "select count(f) from AirportDO f ";
		String sizesql = "select count(f) from AirportDO f where rownum <= ?";
		List<Long> list = this.getHibernateTemplate().find(sql);
		List<Long> sizelist = this.getHibernateTemplate().find(sizesql,(page * 10l));
		return list.get(0).intValue()-sizelist.get(0).intValue();
	}

}
