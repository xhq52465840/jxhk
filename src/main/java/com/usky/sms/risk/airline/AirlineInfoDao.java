
package com.usky.sms.risk.airline;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.apache.log4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.activity.ActivityDO;
import com.usky.sms.core.BaseDao;
import com.usky.sms.log.ActivityLoggingDao;
import com.usky.sms.log.operation.ActivityLoggingOperationRegister;
import com.usky.sms.unit.UnitDO;
import com.usky.sms.unit.UnitDao;

public class AirlineInfoDao extends BaseDao<AirlineInfoDO> {
	
	@Autowired
	private AircraftTypeDao aircraftTypeDao;
	
	@Autowired
	private StopoverDao stopoverDao;
	
	@Autowired
	private ActivityLoggingDao activityLoggingDao;
	
	@Autowired
	private UnitDao unitDao;
	
	public AirlineInfoDao() {
		super(AirlineInfoDO.class);
	}
	
	@Override
    protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		String fieldName = field.getName();
		AirlineInfoDO airlineInfo = (AirlineInfoDO) obj;
		if ("stopovers".equals(fieldName)) {
			List<Map<String,Object>> stopoverMaps = new ArrayList<Map<String,Object>>();
			for(StopoverDO stopover:airlineInfo.getStopovers()){
				Map<String,Object> stopoverMap = new HashMap<String,Object>();
				stopoverMap.put("airport", stopover.getAirport());
				stopoverMap.put("airportName", stopover.getAirportName());
				stopoverMap.put("sequence", stopover.getSequence());
				stopoverMaps.add(stopoverMap);
			}
			map.put("stopovers", stopoverMaps);
			return;
		} else if ("types".equals(fieldName)) {
			List<Map<String,Object>> aircraftTypeMaps = new ArrayList<Map<String,Object>>();
			for(AircraftTypeDO aircraft:airlineInfo.getTypes()){
				Map<String, Object> aircraftTypeMap = new HashMap<String,Object>();
				aircraftTypeMap.put("type", aircraft.getType());
				aircraftTypeMap.put("sequence", aircraft.getSequence());
				aircraftTypeMaps.add(aircraftTypeMap);
			}
			map.put("types", aircraftTypeMaps);
			return;
		}
	    super.setField(map, obj, claz, multiple, field);
    }

	public AirlineInfoDO getAirlineInfoByActivity(int activityId) {
		@SuppressWarnings("unchecked")
		List<AirlineInfoDO> list = this.getHibernateTemplate().find("from AirlineInfoDO where activity.id = ?", activityId);
		return list.isEmpty() ? null : list.get(0);
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public int addAirlineInfo(Map<String, Object> map) {
		AirlineInfoDO airlineInfo = new AirlineInfoDO();
		airlineInfo.setDepartureAirport((String) map.get("departureAirport"));
		airlineInfo.setArrivalAirport((String) map.get("arrivalAirport"));
		airlineInfo.setDepartureAirportName((String) map.get("departureAirportName"));
		airlineInfo.setArrivalAirportName((String) map.get("arrivalAirportName"));
		ActivityDO activity = new ActivityDO();
		activity.setId(((Number) map.get("activity")).intValue());
		airlineInfo.setActivity(activity);
		UnitDO unit = new UnitDO();
		unit.setId(((Number) map.get("unit")).intValue());
		airlineInfo.setUnit(unit);
		airlineInfo.setStopovers(new ArrayList<StopoverDO>());
		airlineInfo.setTypes(new ArrayList<AircraftTypeDO>());
		int id = (int) this.internalSave(airlineInfo);
		@SuppressWarnings("unchecked")
		List<Map<String, Object>> stopoverMaps = (List<Map<String, Object>>) map.get("stopovers");
		for (Map<String, Object> stopoverMap : stopoverMaps) {
			StopoverDO stopover = new StopoverDO();
			stopover.setAirlineInfo(airlineInfo);
			stopover.setAirport((String) stopoverMap.get("airport"));
			stopover.setAirportName((String) stopoverMap.get("airportName"));
			stopover.setSequence(((Number) stopoverMap.get("sequence")).intValue());
			airlineInfo.getStopovers().add(stopover);
			stopoverDao.internalSave(stopover);
		}
		@SuppressWarnings("unchecked")
		List<Map<String, Object>> typeMaps = (List<Map<String, Object>>) map.get("types");
		for (Map<String, Object> typeMap : typeMaps) {
			AircraftTypeDO aircraftType = new AircraftTypeDO();
			aircraftType.setAirlineInfo(airlineInfo);
			aircraftType.setType((String) typeMap.get("type"));
			aircraftType.setSequence(((Number) typeMap.get("sequence")).intValue());
			airlineInfo.getTypes().add(aircraftType);
			aircraftTypeDao.internalSave(aircraftType);
		}
		
		// 添加活动日志
		addActivityLoggingForAddAirlineInfo(airlineInfo);
		
		return id;
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void updateAirlineInfo(Map<String, Object> map) {
		int id = ((Number) map.get("id")).intValue();
		AirlineInfoDO airlineInfo = this.internalGetById(id);
		
		// 添加活动日志
		addActivityLoggingForUpdateAirlineInfo(airlineInfo, map);
		
		airlineInfo.setDepartureAirport((String) map.get("departureAirport"));
		airlineInfo.setArrivalAirport((String) map.get("arrivalAirport"));
		airlineInfo.setDepartureAirportName((String) map.get("departureAirportName"));
		airlineInfo.setArrivalAirportName((String) map.get("arrivalAirportName"));
		UnitDO unit = new UnitDO();
		unit.setId(((Number) map.get("unit")).intValue());
		airlineInfo.setUnit(unit);
		stopoverDao.internalDelete(airlineInfo.getStopovers());
		@SuppressWarnings("unchecked")
		List<Map<String, Object>> stopoverMaps = (List<Map<String, Object>>) map.get("stopovers");
		for (Map<String, Object> stopoverMap : stopoverMaps) {
			StopoverDO stopover = new StopoverDO();
			stopover.setAirlineInfo(airlineInfo);
			stopover.setAirport((String) stopoverMap.get("airport"));
			stopover.setAirportName((String) stopoverMap.get("airportName"));
			stopover.setSequence(((Number) stopoverMap.get("sequence")).intValue());
			airlineInfo.getStopovers().add(stopover);
			stopoverDao.internalSave(stopover);
		}
		aircraftTypeDao.internalDelete(airlineInfo.getTypes());
		@SuppressWarnings("unchecked")
		List<Map<String, Object>> typeMaps = (List<Map<String, Object>>) map.get("types");
		for (Map<String, Object> typeMap : typeMaps) {
			AircraftTypeDO aircraftType = new AircraftTypeDO();
			aircraftType.setAirlineInfo(airlineInfo);
			aircraftType.setType((String) typeMap.get("type"));
			aircraftType.setSequence(((Number) typeMap.get("sequence")).intValue());
			airlineInfo.getTypes().add(aircraftType);
			aircraftTypeDao.internalSave(aircraftType);
		}
	}
	
	/**
	 * 添加航线的活动日志
	 */
	private void addActivityLoggingForAddAirlineInfo(AirlineInfoDO airlineInfo) {
		// 添加活动日志
		List<String> details = new ArrayList<String>();
		if (null != airlineInfo) {
			// 起飞机场名
			String departureAirport = airlineInfo.getDepartureAirportName();
			// 到达机场名
			String arrivalAirport = airlineInfo.getArrivalAirportName();
			details.add("开通 " + departureAirport + " 至 " + arrivalAirport);
			// 经停
			List<StopoverDO> stopovers = airlineInfo.getStopovers();
			if(!stopovers.isEmpty()){
				List<String> stopoverName = new ArrayList<String>();
				for(StopoverDO stopover : stopovers){
					stopoverName.add(stopover.getAirportName());
				}
				details.add("经停: " + StringUtils.join(stopoverName.toArray(), " "));
			}
			UnitDO unit = unitDao.internalGetById(airlineInfo.getUnit().getId());
			details.add("执行单位: " + unit.getName());
			List<AircraftTypeDO> aircraftTypes = airlineInfo.getTypes();
			if(!aircraftTypes.isEmpty()){
				List<String> types = new ArrayList<String>();
				for(AircraftTypeDO aircraftType : aircraftTypes){
					types.add(aircraftType.getType());
				}
				details.add("机型: " + StringUtils.join(types.toArray(), " "));
			}
			MDC.put("details", details.toArray());
			activityLoggingDao.addLogging(airlineInfo.getActivity().getId(), ActivityLoggingOperationRegister.getOperation("ADD_AIRLINE"));
			MDC.remove("details");
		
		}
	}

	/**
	 * 更新航线的活动日志
	 */
	// TODO
	private void addActivityLoggingForUpdateAirlineInfo(AirlineInfoDO airlineInfo, Map<String, Object> map) {
		// 添加活动日志
		List<String> details = new ArrayList<String>();
		if (null != airlineInfo) {
			// 起飞机场名
			String oldDepartureAirport = airlineInfo.getDepartureAirportName();
			String newDepartureAirport = (String) map.get("departureAirportName");
			if (!newDepartureAirport.equals(oldDepartureAirport)) {
				details.add("将起飞机场改为 " + newDepartureAirport);
			}
			// 到达机场名
			String oldArrivalAirport = airlineInfo.getArrivalAirportName();
			String newArrivalAirport = (String) map.get("arrivalAirportName");
			if (!newArrivalAirport.equals(oldArrivalAirport)) {
				details.add("将到达机场改为 " + newArrivalAirport);
			}
			// 经停
			List<StopoverDO> oldStopovers = airlineInfo.getStopovers();
			List<String> oldStopoverNames = new ArrayList<String>();
			if (!oldStopovers.isEmpty()) {
				for (StopoverDO stopover : oldStopovers) {
					oldStopoverNames.add(stopover.getAirportName());
				}
			}
			@SuppressWarnings("unchecked")
			List<Map<String, Object>> newStopoverMaps = (List<Map<String, Object>>) map.get("stopovers");
			List<String> newStopoverNames = new ArrayList<String>();
			for (Map<String, Object> stopoverMap : newStopoverMaps) {
				newStopoverNames.add((String) stopoverMap.get("airportName"));
			}
			List<String> addedStopoverName = new ArrayList<String>();
			for (String newStopoverName : newStopoverNames) {
				// 如果旧的经停不包含新的经停则表示新增
				if (!oldStopoverNames.contains(newStopoverName)) {
					addedStopoverName.add(newStopoverName);
				}
			}
			if (!addedStopoverName.isEmpty()) {
				details.add("新增经停: " + StringUtils.join(addedStopoverName, " "));
			}
			List<String> deletedStopoverName = new ArrayList<String>();
			for (String oldStopoverName : oldStopoverNames) {
				// 如果新的经停不包含旧的经停则表示旧的经停被删除
				if (!newStopoverNames.contains(oldStopoverName)) {
					deletedStopoverName.add(oldStopoverName);
				}
			}
			if (!deletedStopoverName.isEmpty()) {
				details.add("删除经停: " + StringUtils.join(deletedStopoverName, " "));
			}
			// 执行单位
			Integer oldUnitId = airlineInfo.getUnit().getId();
			int newUnitId = ((Number) map.get("unit")).intValue();
			if (!oldUnitId.equals(newUnitId)) {
				details.add("将执行单位改为: " + unitDao.internalGetById(newUnitId).getName());
			}
			// 机型
			List<AircraftTypeDO> oldAircraftTypes = airlineInfo.getTypes();
			List<String> oldAircraftTypeNames = new ArrayList<String>();
			if (!oldAircraftTypes.isEmpty()) {
				for (AircraftTypeDO oldAircraftType : oldAircraftTypes) {
					oldAircraftTypeNames.add(oldAircraftType.getType());
				}
			}
			@SuppressWarnings("unchecked")
			List<Map<String, Object>> newAircraftTypeMaps = (List<Map<String, Object>>) map.get("types");
			List<String> newAircraftTypeNames = new ArrayList<String>();
			for (Map<String, Object> newAircraftTypeMap : newAircraftTypeMaps) {
				newAircraftTypeNames.add((String) newAircraftTypeMap.get("type"));
			}
			// 旧的没有，新的有表示新增
			List<String> addedAircraftTypeName = new ArrayList<String>();
			for (String newAircraftTypeName : newAircraftTypeNames) {
				// 如果旧的机型不包含新的机型则表示新增
				if (!oldAircraftTypeNames.contains(newAircraftTypeName)) {
					addedAircraftTypeName.add(newAircraftTypeName);
				}
			}
			if (!addedAircraftTypeName.isEmpty()) {
				details.add("新增机型: " + StringUtils.join(addedAircraftTypeName, " "));
			}
			List<String> deletedAircraftTypeName = new ArrayList<String>();
			for (String oldAircraftTypeName : oldAircraftTypeNames) {
				// 如果新的机型不包含旧的机型则表示旧的机型被删除
				if (!newAircraftTypeNames.contains(oldAircraftTypeName)) {
					deletedAircraftTypeName.add(oldAircraftTypeName);
				}
			}
			if (!deletedAircraftTypeName.isEmpty()) {
				details.add("删除机型: " + StringUtils.join(deletedAircraftTypeName, " "));
			}
			MDC.put("details", details.toArray());
			activityLoggingDao.addLogging(airlineInfo.getActivity().getId(), ActivityLoggingOperationRegister.getOperation("UPDATE_AIRLINE"));
			MDC.remove("details");
			}
	}
	
	public void setAircraftTypeDao(AircraftTypeDao aircraftTypeDao) {
		this.aircraftTypeDao = aircraftTypeDao;
	}
	
	public void setStopoverDao(StopoverDao stopoverDao) {
		this.stopoverDao = stopoverDao;
	}

	public void setActivityLoggingDao(ActivityLoggingDao activityLoggingDao) {
		this.activityLoggingDao = activityLoggingDao;
	}

	public void setUnitDao(UnitDao unitDao) {
		this.unitDao = unitDao;
	}
	
}
