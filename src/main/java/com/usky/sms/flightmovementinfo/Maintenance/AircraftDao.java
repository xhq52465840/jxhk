package com.usky.sms.flightmovementinfo.Maintenance;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate3.support.HibernateDaoSupport;

import com.usky.sms.common.DateHelper;
import com.usky.sms.external.MaintenanceWebService;
import com.usky.sms.flightmovementinfo.FlightInfoCache;

public class AircraftDao extends HibernateDaoSupport {
	
	@Autowired
	private MaintenanceWebService maintenanceWebService;
	
	@Autowired
	private FlightInfoCache flightInfoCache;
	
	/**
	 * 根据飞机号获取飞机信息
	 */
	public List<Map<String, Object>> getAircraftInfo(String tailNo) {
		List<AircraftDO> aircraftList = maintenanceWebService.getPlaneInfo(tailNo);
		Map<String, Object> map = new HashMap<String, Object>();
		List<Map<String, Object>> list = new ArrayList<Map<String,Object>>();
		for (AircraftDO aircraft : aircraftList) {
			map.put("tailNo", aircraft.getTail_no());// 机号
			map.put("aircraftType", aircraft.getAircraft_type());// 机型
			map.put("engineTypeModel", aircraft.getEngine_type_model());//发动机型号
			map.put("tsn", aircraft.getInit_tsn());// TSN(总飞行小时)
			map.put("engineCount", aircraft.getEngine_count());// 发动机装机数
			map.put("exitFactoryDate",aircraft.getExit_factory_date() == null ? null : DateHelper.formatIsoDate(aircraft.getExit_factory_date()));// 出厂日期
			map.put("apuType", aircraft.getApu_type());// APU型号
			map.put("fsn", aircraft.getFsn());// FSN 机队序号
			map.put("csn", aircraft.getInit_csn());// CSN 总飞行循环小时
			map.put("aircraftManufacturer", aircraft.getAircraft_manufacturer());//飞机制造商(英文名)
			map.put("status", aircraft.getStatus());// 飞机状态
			map.put("maintDeptId", aircraft.getMaint_dept_id());//执管单位
			map.put("msn", aircraft.getMsn());//出厂序号
			map.put("transFlag", aircraft.getTrans_flag());// 转移或卖出标记
			map.put("aircraftDescription", aircraft.getAircraft_description());// 飞机描述
			map.put("airwayId", aircraft.getAirway_id());// 营运人
			list.add(map);
		}
		return list;
	}
	
	/**
	 * 通过机号查询飞行信息<br>
	 * 如果没有返回null
	 * @param tailNO
	 * @return
	 */
	public AircraftDO getByTailNO(String tailNO){
		if (StringUtils.isBlank(tailNO)) {
			return null;
		}
		List<AircraftDO> aircraftList = maintenanceWebService.getPlaneInfo(tailNO);
		if (aircraftList.isEmpty()) {
			return null;
		}
		return aircraftList.get(0);
	}
	
	/**
	 * 通过模糊查询飞机机型获取飞机编号
	 */
	@SuppressWarnings("unchecked")
	public List<String> getTailNoByAircraftType(String aircraftType){
		if(null == aircraftType){
			return new ArrayList<String>();
		}else{
			aircraftType = aircraftType.replaceAll("/", "//").replaceAll("%", "/%").replaceAll("_", "/_");
			aircraftType = "%" + aircraftType + "%";
			return this.getHibernateTemplate().find("select t.tail_no from AircraftDO t where t.aircraft_type like ? escape '/'", aircraftType);
		}
	}
	
	/**
	 * 通过机型模糊查询飞机信息<br>
	 * 如果机型为空，返回所有飞机信息
	 * @param name
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<AircraftDO> getByAircraftType(String aircraftType){
		StringBuffer hql = new StringBuffer("from AircraftDO t");
		List<Object> values = null;
		if (!StringUtils.isBlank(aircraftType)) {
			aircraftType = aircraftType.replaceAll("/", "//").replaceAll("%", "/%").replaceAll("_", "/_");
			values = new ArrayList<Object>();
			hql.append(" where t.aircraft_type like ? escape '/'");
			values.add("%" + aircraftType + "%");
		}
		hql.append(" order by t.aircraft_type");
		return this.getHibernateTemplate().find(hql.toString(), values == null ? null : values.toArray());
	}
	
	public List<Map<String,Object>> getAircraftByType(String aircraftType){
		if(aircraftType == null){
			return flightInfoCache.getAllAircraft();
		}
		aircraftType = aircraftType.replaceAll("/", "//").replaceAll("%", "/%").replaceAll("_", "/_");
		String sql = "select distinct t.aircraft_type from AircraftDO t where t.aircraft_type like '%"+aircraftType+"%' escape '/' order by t.aircraft_type asc";
		List<String> list = this.getHibernateTemplate().find(sql);
		List<Map<String,Object>> airlist = new ArrayList<Map<String,Object>>();
		for(String o : list){
			Map<String,Object> map = new HashMap<String, Object>();
			map.put("aircraftType", o);
			airlist.add(map);
		}
		return airlist;
	}
	
	/**
	 * 通过机号查询飞行信息<br>
	 * 如果没有返回所有
	 * @param tailNO
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<AircraftDO> fuzzySearchByTailNO(String tailNO){
		if (StringUtils.isBlank(tailNO)) {
			return flightInfoCache.getAircraftList();
		}
		StringBuffer hql = new StringBuffer("from AircraftDO t");
		List<Object> values = null;
		tailNO = tailNO.replaceAll("/", "//").replaceAll("%", "/%").replaceAll("_", "/_");
		values = new ArrayList<Object>();
		hql.append(" where t.tail_no like ? escape '/'");
		values.add("%" + tailNO + "%");
		hql.append(" order by t.tail_no");
		return this.getHibernateTemplate().find(hql.toString(), values.toArray());
	}
	
	public List<AircraftDO> getAll(){
		List<AircraftDO> list = this.getHibernateTemplate().find("from AircraftDO");
		return list;
	}

	public void setFlightInfoCache(FlightInfoCache flightInfoCache) {
		this.flightInfoCache = flightInfoCache;
	}

	public void setMaintenanceWebService(MaintenanceWebService maintenanceWebService) {
		this.maintenanceWebService = maintenanceWebService;
	}
	
	
}
