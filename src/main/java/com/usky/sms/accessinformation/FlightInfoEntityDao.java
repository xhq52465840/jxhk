
package com.usky.sms.accessinformation;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import org.apache.log4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.aircraftType.AircraftModelDao;
import com.usky.sms.common.DateHelper;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;
import com.usky.sms.external.AirportDubboService;
import com.usky.sms.external.FlightDubboService;
import com.usky.sms.field.EnumCommonField;
import com.usky.sms.flightmovementinfo.AirportDO;
import com.usky.sms.flightmovementinfo.AirportDao;
import com.usky.sms.flightmovementinfo.FlightInfoDO;
import com.usky.sms.flightmovementinfo.FlightInfoDao;
import com.usky.sms.flightmovementinfo.Maintenance.AircraftDO;
import com.usky.sms.flightmovementinfo.Maintenance.AircraftDao;
import com.usky.sms.log.ActivityLoggingDao;
import com.usky.sms.log.operation.ActivityLoggingOperationRegister;
import com.usky.sms.solr.SolrService;

public class FlightInfoEntityDao extends BaseDao<FlightInfoEntityDO> {
	
	public static final SMSException EXIST_SAME_FLIGHT_INFO = new SMSException(MessageCodeConstant.MSG_CODE_129000004);
	
	@Autowired
	private ActivityLoggingDao activityLoggingDao;
	
	@Autowired
	private FlightInfoDao flightInfoDao;
	
	@Autowired
	private AircraftDao aircraftDao;
	
	@Autowired
	private SolrService solrService;
	
	@Autowired
	private AircraftModelDao aircraftModelDao;
	
	@Autowired
	private FlightDubboService flightDubboService;
	
	@Autowired
	private AirportDubboService airportDubboService;
	
	@Autowired
	private AirportDao airportDao;
	
	public FlightInfoEntityDao() {
		super(FlightInfoEntityDO.class);
	}
	
	@Override
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	protected boolean beforeSave(Map<String, Object> map) {
		checkConstraints(map);
		saveFlightInfos(map);

		return true;
	}

	private void checkConstraints(Map<String, Object> map) {
		int activityId = ((Number) map.get("activity")).intValue();
		int flightInfoId = ((Number) map.get("flightInfo")).intValue();
		if (this.hasFlightInfoEntity(activityId, flightInfoId)) {
			throw EXIST_SAME_FLIGHT_INFO;
		}
	}
	
	/**
	 * 保存航班和机场信息
	 * @param map
	 */
	private void saveFlightInfos(Map<String, Object> map) {
		// 保存航班和机场信息
		if (map.containsKey("flightInfo")) {
			int flightInfoId = ((Number) map.get("flightInfo")).intValue();
			FlightInfoDO flightInfo = flightDubboService.getFlightInfoById(flightInfoId);
			if (flightInfo == null) {
//				throw new SMSException(MessageCodeConstant.MSG_CODE_129000001, flightInfoId);
				flightInfo = new FlightInfoDO();
				flightInfo.setFlightInfoID(flightInfoId);
			}
			List<FlightInfoDO> flightInfos = flightInfoDao.getByFlightInfoID(flightInfoId);
			if (flightInfos.isEmpty()) {
				flightInfoDao.internalSave(flightInfo);
			} else {
				flightInfo = flightInfos.get(0);
			}
//			AirportDO dptApt = airportDubboService.getFlightAirportBy4Code(flightInfo.getDeptAirportCaoCode());
//			if (dptApt == null) {
//				throw new SMSException(MessageCodeConstant.MSG_CODE_126000002, flightInfo.getDeptAirportCaoCode());
//			} else {
//				airportDao.internalSave(dptApt);
//			}
//			AirportDO arrApt = airportDubboService.getFlightAirportBy4Code(flightInfo.getArrAirportCaoCode());
//			if (arrApt == null) {
//				throw new SMSException(MessageCodeConstant.MSG_CODE_126000002, flightInfo.getArrAirportCaoCode());
//			} else {
//				airportDao.internalSave(arrApt);
//			}
			map.put("flightInfo", flightInfo.getId());
		}
	}

	@Override
	protected void afterSave(FlightInfoEntityDO obj) {
		// 更新航班信息到solr
		updateFlightInfoToSolr(obj);
		// 添加活动日志
		List<String> details = new ArrayList<String>();
		FlightInfoDO flightInfo = flightInfoDao.internalGetById(obj.getFlightInfo().getId());
		details.add("添加航班信息为:[航班号:" + flightInfo.getFlightNO() + "]");
		MDC.put("details", details.toArray());
		activityLoggingDao.addLogging(obj.getActivity().getId(),
				ActivityLoggingOperationRegister.getOperation("UPDATE_ACCESSINFO"));
		MDC.remove("details");
	}
	
	/**
	 * 根据activityId获取要更新到solr里的航班的信息<br>
	 * 航班号，航班日期，飞行阶段，起飞机场，降落机场，机型，机号，机型类型
	 * @param activityId
	 * @return
	 */
	public Map<String, Object> getFlightInfoForSolr(Integer activityId){
		// 对应activity的所有航班信息
		StringBuffer hql = new StringBuffer("select distinct f from FlightInfoEntityDO f left join fetch f.activity left join fetch f.flightInfo")
		.append(" left join fetch f.flightPhase where f.activity.id = ?");
		@SuppressWarnings("unchecked")
		List<FlightInfoEntityDO> flightInfoEntities = (List<FlightInfoEntityDO>) this.query(hql.toString(),activityId);
//		List<FlightInfoEntityDO> flightInfoEntities = this.getByActivityId(activityId);
		// 航班号
		List<String> flightNO = new ArrayList<String>();
		// 航班日期
		Date flightBJDate = null;
		// 飞行阶段
		List<String> flightPhase = new ArrayList<String>();
		// 起飞机场(城市)
		List<String> deptAirport = new ArrayList<String>();
		// 到达机场(城市)
		List<String> arrAirport = new ArrayList<String>();
		// 机型(长机型)
		List<String> aircraftType = new ArrayList<String>();
		// 机号
		List<String> tailNO = new ArrayList<String>();
		// 机型分类(短机型)
		List<String> aircraftTypeCat = new ArrayList<String>();
		int i = 0;
		for (FlightInfoEntityDO flightInfoEntity : flightInfoEntities) {
			// 飞行阶段
			if (null != flightInfoEntity.getFlightPhase()) {
				flightPhase.add(flightInfoEntity.getFlightPhase().getId().toString());
			}
			if (null != flightInfoEntity.getFlightInfo()) {
				FlightInfoDO flightInfo = flightInfoEntity.getFlightInfo();
				flightInfo = flightInfoDao.internalGetById(flightInfo.getId());
				if (flightInfo.getFlightNO() == null) {
					flightInfo = flightDubboService.getFlightInfoById(flightInfo.getFlightInfoID());
				}
				if (flightInfo == null) {
					continue;
				}
				// 航班号
				flightNO.add(flightInfo.getFlightNO());
				// 航班日期
				if (0 == i++) {
					flightBJDate = flightInfo.getFlightBJDate();
				}
				// 起飞机场(城市)
				AirportDO dept = airportDubboService.getFlightAirportBy4Code(flightInfo.getDeptAirportCaoCode());
				if (null != dept) {
					deptAirport.add(dept.getCityName());
				}
				// 到达机场(城市)
				AirportDO arr = airportDubboService.getFlightAirportBy4Code(flightInfo.getArrAirportCaoCode());
				if (null != arr) {
					arrAirport.add(arr.getCityName());
				}
				if (null != flightInfo.getTailNO()) {
					// 机型
					// 机型 去掉字母进行查询
					AircraftDO aircraft = aircraftDao.getByTailNO(flightInfo.getTailNO().replaceAll("[a-zA-Z]", ""));
					if (null != aircraft && null != aircraft.getAircraft_type()) {
						aircraftTypeCat.add(aircraft.getAircraft_type());
					}
					// 机号
					tailNO.add(flightInfo.getTailNO());
				}
			}
		}
		
		Map<String,Object> map = new HashMap<String,Object>();
		map.put("flightNO", flightNO);
		map.put("flightBJDate", flightBJDate);
		map.put("flightPhase", flightPhase);
		map.put("deptAirport", deptAirport);
		map.put("arrAirport", arrAirport);
		map.put("aircraftType", aircraftType);
		map.put("tailNO", tailNO);
		map.put("aircraftTypeCat", aircraftTypeCat);
		
		return map;
	}
	
	/**
	 * 根据activityId获取要更新到solr里的航班的信息<br>
	 * 航班号，飞行阶段，起飞机场，降落机场，机型，机号,机型类型
	 * @param activityId
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> getFlightInfoForSolr(List<Integer> activityIds){
		Map<String,Object> result = new HashMap<String, Object>();
		// 对应activity的所有航班信息
		StringBuffer hql = new StringBuffer("select distinct f from FlightInfoEntityDO f left join fetch f.activity left join fetch f.flightInfo")
		.append(" left join fetch f.flightPhase where f.activity.id in (:activityIds)");
		List<FlightInfoEntityDO> flightInfoEntities = (List<FlightInfoEntityDO>) this.getHibernateTemplate().findByNamedParam(hql.toString(),"activityIds",activityIds);
		// 分组
		Map<String,Object> flightInfoMap = new HashMap<String, Object>();
		for (FlightInfoEntityDO flightInfoEntity : flightInfoEntities) {
			String avtivityId = flightInfoEntity.getActivity().getId().toString();
			if (flightInfoMap.containsKey(avtivityId)) {
				((List<Object>) flightInfoMap.get(avtivityId)).add(flightInfoEntity);
			} else {
				List<FlightInfoEntityDO> list = new ArrayList<FlightInfoEntityDO>();
				list.add(flightInfoEntity);
				flightInfoMap.put(avtivityId, list);
			}
		}
		for (Entry<String, Object> entry : flightInfoMap.entrySet()) {
			flightInfoEntities = (List<FlightInfoEntityDO>) entry.getValue();
			// 航班号
			List<String> flightNO = new ArrayList<String>();
			// 航班日期
			Date flightBJDate = null;
			// 飞行阶段
			List<String> flightPhase = new ArrayList<String>();
			// 起飞机场(城市)
			List<String> deptAirport = new ArrayList<String>();
			// 到达机场(城市)
			List<String> arrAirport = new ArrayList<String>();
			// 机型
			List<String> aircraftType = new ArrayList<String>();
			// 机号
			List<String> tailNO = new ArrayList<String>();
			// 机型分类
			List<String> aircraftTypeCat = new ArrayList<String>();
			int i = 0;
			for(FlightInfoEntityDO flightInfoEntity : flightInfoEntities){
				// 飞行阶段
				if (null != flightInfoEntity.getFlightPhase()) {
					flightPhase.add(flightInfoEntity.getFlightPhase().getId().toString());
				}
				if (null != flightInfoEntity.getFlightInfo()) {
					FlightInfoDO flightInfo = flightInfoEntity.getFlightInfo();
					flightInfo = flightInfoDao.internalGetById(flightInfo.getId());
					if (flightInfo.getFlightNO() == null) {
						flightInfo = flightDubboService.getFlightInfoById(flightInfo.getFlightInfoID());
					}
					if (flightInfo == null) {
						continue;
					}
					// 航班号
					flightNO.add(flightInfo.getFlightNO());
					// 航班日期
					if (0 == i++) {
						flightBJDate = flightInfo.getFlightBJDate();
					}
					// 起飞机场(城市)
					AirportDO dept = airportDubboService.getFlightAirportBy4Code(flightInfo.getDeptAirportCaoCode());
					if (null != dept) {
						deptAirport.add(dept.getCityName());
					}
					// 到达机场(城市)
					AirportDO arr = airportDubboService.getFlightAirportBy4Code(flightInfo.getArrAirportCaoCode());
					if (null != arr) {
						arrAirport.add(arr.getCityName());
					}
					if (null != flightInfo.getTailNO()) {
						// 机型 去掉字母进行查询
						AircraftDO aircraft = aircraftDao.getByTailNO(flightInfo.getTailNO().replaceAll("[a-zA-Z]", ""));
						if (null != aircraft && null != aircraft.getAircraft_type()) {
							aircraftTypeCat.add(aircraft.getAircraft_type());
						}
						// 机号
						tailNO.add(flightInfo.getTailNO());
					}
				}
			}
			Map<String,Object> map = new HashMap<String,Object>();
			map.put("flightNO", flightNO);
			map.put("flightBJDate", flightBJDate);
			map.put("flightPhase", flightPhase);
			map.put("deptAirport", deptAirport);
			map.put("arrAirport", arrAirport);
			map.put("aircraftType", aircraftType);
			map.put("tailNO", tailNO);
			map.put("aircraftTypeCat", aircraftTypeCat);
			
			result.put(entry.getKey(), map);
			
		}
		return result;
	}
	
	/**
	 * 通过activityId的list获取航班信息的的map的Map
	 * @param activityIds activityId的list
	 * @return 航班信息的的map的Map
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> getFlightInfoMapsByActivityIds(List<Integer> activityIds, Collection<String> returnKeys){
		if (null == activityIds || activityIds.isEmpty()) {
			return Collections.emptyMap();
		}
		List<Object[]> objs = (List<Object[]>) getHibernateTemplate()
				.findByNamedParam(
						"select t.activity.id, t from FlightInfoEntityDO t where t.deleted = false and t.activity.id in (:ids)",
						"ids", activityIds);
		return this.getFlightInfoMapsGroupByActivityId(objs, returnKeys);
	}
	
	/**
	 * 通过activityId的list获取航班信息的的map的Map
	 * <br>
	 * 调用前先将activityid插入到临时表中
	 * @return 航班信息的的map的Map
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> getFlightInfoMapsByActivityIds(Collection<String> returnKeys){
		List<Object[]> objs = (List<Object[]>) getHibernateTemplate()
				.find("select t.activity.id, t from FlightInfoEntityDO t where t.deleted = false and t.activity.id in (select id from TempTableDO)");
		return this.getFlightInfoMapsGroupByActivityId(objs, returnKeys);
	}
	
	/**
	 * 通过activityId的list获取航班信息的的map的Map
	 * @param activityIds activityId的list
	 * @return 航班信息的的map的Map
	 */
	@SuppressWarnings("unchecked")
	private Map<String, Object> getFlightInfoMapsGroupByActivityId(List<Object[]> objs, Collection<String> returnKeys){
		Map<String, Object> result = new HashMap<String, Object>();
		
		// 需要返回的字段
		boolean returnFlightNO = returnKeys.contains(EnumCommonField.FLIGHT_NO.getKey());
		boolean returnFlightBJDate = returnKeys.contains(EnumCommonField.FLIGHT_DATE.getKey());
		boolean returnFlightPhase = returnKeys.contains(EnumCommonField.FLIGHT_PHASE.getKey());
		boolean returnDeptAirport = returnKeys.contains(EnumCommonField.DEPT_AIRPORT.getKey());
		boolean returnArrAirport = returnKeys.contains(EnumCommonField.ARR_AIRPORT.getKey());
		boolean returnAircraftType = returnKeys.contains(EnumCommonField.AIRCRAFT_TYPE.getKey());
		boolean returnTailNO = returnKeys.contains(EnumCommonField.TAIL_NO.getKey());
		boolean returnAircraftTypeCat = returnKeys.contains(EnumCommonField.AIRCRAFT_TYPE_CAT.getKey());
		
		Map<String, Object> map = new HashMap<String, Object>();
		// 将查询出来的结果按activityId分组
		for (Object[] obj : objs) {
			String activityId = obj[0].toString();
			FlightInfoEntityDO flightInfo = (FlightInfoEntityDO) (obj[1] == null ? "" : obj[1]);
			if (map.containsKey(activityId)) {
				((List<FlightInfoEntityDO>)map.get(activityId)).add(flightInfo);
			} else {
				List<FlightInfoEntityDO> flightInfos = new ArrayList<FlightInfoEntityDO>();
				flightInfos.add(flightInfo);
				map.put(activityId, flightInfos);
			}
		}
		for (String activityId : map.keySet()) {
			List<FlightInfoEntityDO> flightInfoEntities = (List<FlightInfoEntityDO>) map.get(activityId.toString());
			// 航班号
			List<String> flightNO = new ArrayList<String>();
			// 航班日期
			Date flightBJDate = null;
			// 飞行阶段
			List<String> flightPhase = new ArrayList<String>();
			// 起飞机场(城市)
			List<String> deptAirport = new ArrayList<String>();
			// 到达机场(城市)
			List<String> arrAirport = new ArrayList<String>();
			// 机型
			List<String> aircraftType = new ArrayList<String>();
			// 机号
			List<String> tailNO = new ArrayList<String>();
			// 机型分类
			List<String> aircraftTypeCat = new ArrayList<String>();
			if (null != flightInfoEntities) {
				int i = 0;
				for (FlightInfoEntityDO flightInfoEntity : flightInfoEntities) {
					// 飞行阶段
					if (returnFlightPhase && null != flightInfoEntity.getFlightPhase()) {
						flightPhase.add(flightInfoEntity.getFlightPhase().getName().toString());
					}
					if (returnFlightNO || returnFlightBJDate || returnDeptAirport || returnArrAirport || returnAircraftType || returnTailNO || returnAircraftTypeCat) {
						if (null != flightInfoEntity.getFlightInfo()) {
							FlightInfoDO flightInfo = flightInfoEntity.getFlightInfo();
							flightInfo = flightInfoDao.internalGetById(flightInfo.getId());
							if (flightInfo.getFlightNO() == null) {
								flightInfo = flightDubboService.getFlightInfoById(flightInfo.getFlightInfoID());
							}
							if (flightInfo == null) {
								continue;
							}
							// 航班号
							if (returnFlightNO) {
								flightNO.add(flightInfo.getFlightNO());
							}
							// 航班日期
							if (returnFlightBJDate) {
								if (0 == i++) {
									flightBJDate = flightInfo.getFlightBJDate();
								}
							}
							// 起飞机场(城市)
							if (returnDeptAirport) {
								AirportDO dept = airportDubboService.getFlightAirportBy4Code(flightInfo.getDeptAirportCaoCode());
								if (null != dept) {
									deptAirport.add(dept.getCityName());
								}
							}
							// 到达机场(城市)
							if (returnArrAirport) {
								AirportDO arr = airportDubboService.getFlightAirportBy4Code(flightInfo.getArrAirportCaoCode());
								if (null != arr) {
									arrAirport.add(arr.getCityName());
								}
							}
							if (returnAircraftType || returnTailNO || returnAircraftTypeCat) {
								if (null != flightInfo.getTailNO()) {
									// 机型 去掉字母进行查询
									AircraftDO aircraft = aircraftDao.getByTailNO(flightInfo.getTailNO().replaceAll(
											"[a-zA-Z]", ""));
									if (null != aircraft && null != aircraft.getAircraft_type()) {
										aircraftTypeCat.add(aircraft.getAircraft_type());
									}
									// 机号
									tailNO.add(flightInfo.getTailNO());
								}
							}
						}
					}
				}
			}
			
			Map<String,Object> flightInfoMap = new HashMap<String,Object>();
			flightInfoMap.put("flightNO", flightNO.toArray());
			flightInfoMap.put("flightBJDate", DateHelper.formatIsoDate(flightBJDate));
			flightInfoMap.put("flightPhase", flightPhase.toArray());
			flightInfoMap.put("deptAirport", deptAirport.toArray());
			flightInfoMap.put("arrAirport", arrAirport.toArray());
			flightInfoMap.put("aircraftType", aircraftType.toArray());
			flightInfoMap.put("tailNO", tailNO.toArray());
			flightInfoMap.put("aircraftTypeCat", aircraftTypeCat.toArray());
			
			result.put(activityId.toString(), flightInfoMap);
		}
		return result;
	}
	
	/**
	 * 更新航班信息到solr<br>
	 * 航班号，飞行阶段，起飞机场，降落机场，机型，机号
	 * @param obj
	 */
	private void updateFlightInfoToSolr(Integer activityId){
		Map<String,Object> map = this.getFlightInfoForSolr(activityId);
		solrService.updateSolrFields("activity", activityId, map);
	}
	

	/**
	 * 更新航班信息到solr<br>
	 * 航班号，飞行阶段，起飞机场，降落机场，机型，机号
	 * @param obj
	 */
	private void updateFlightInfoToSolr(FlightInfoEntityDO obj){
		Integer activityId = obj.getActivity().getId();
		updateFlightInfoToSolr(activityId);
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void delete(String[] ids) {
		// 获取删除航班信息的activity的id,更新solr用
		List<FlightInfoEntityDO> list = this.internalGetByIds(ids);
		List<Integer> activityIds = new ArrayList<Integer>();
		for(FlightInfoEntityDO flightInfoEntity : list){
			activityIds.add(flightInfoEntity.getActivity().getId());
		}
		
		// 删除逻辑
		super.delete(ids);

		// 更新solr
		for (Integer activityId : activityIds) {
			updateFlightInfoToSolr(activityId);
		}
	}

	@Override
	public void delete(Collection<FlightInfoEntityDO> list) {
		// 获取删除航班信息的activity的id,更新solr用
		List<Integer> activityIds = new ArrayList<Integer>();
		for(FlightInfoEntityDO flightInfoEntity : list){
			activityIds.add(flightInfoEntity.getActivity().getId());
		}
		
		// 删除逻辑
		super.delete(list);
		
		// 更新solr
		for (Integer activityId : activityIds) {
			updateFlightInfoToSolr(activityId);
		}
	}

	@Override
	protected void afterDelete(Collection<FlightInfoEntityDO> collection) {
		for (FlightInfoEntityDO flightInfoEntity : collection) {
			// 添加活动日志
			List<String> details = new ArrayList<String>();
			details.add("删除了航班信息:[航班号:" + flightInfoEntity.getFlightInfo().getFlightNO() + "]");
			MDC.put("details", details.toArray());
			activityLoggingDao.addLogging(flightInfoEntity.getActivity().getId(),
					ActivityLoggingOperationRegister.getOperation("UPDATE_ACCESSINFO"));
			MDC.remove("details");
		}
	}
	
	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		String fieldName = field.getName();
		FlightInfoEntityDO entity = (FlightInfoEntityDO) obj;
		if ("flightInfo".equals(fieldName)) {
			FlightInfoDO flightInfo = flightInfoDao.internalGetById(entity.getFlightInfo().getId());
			if (flightInfo.getFlightNO() == null) {
				flightInfo = flightDubboService.getFlightInfoById(flightInfo.getFlightInfoID());
			}
			Map<String, Object> flightInfoMap = new HashMap<String, Object>();
			if (flightInfo != null) {
				flightInfoMap.put("flightInfoID", flightInfo.getFlightInfoID());
				flightInfoMap.put("flightNO", flightInfo.getFlightNO());
				flightInfoMap.put("flightBJDate", DateHelper.formatIsoDate(flightInfo.getFlightBJDate()));
				flightInfoMap.put("deptAirport", gson.fromJson(gson.toJson(airportDubboService.getFlightAirportBy4Code(flightInfo.getDeptAirportCaoCode()), AirportDO.class), Map.class));
				flightInfoMap.put("arrAirport", gson.fromJson(gson.toJson(airportDubboService.getFlightAirportBy4Code(flightInfo.getArrAirportCaoCode()), AirportDO.class), Map.class));
				flightInfoMap.put("tailNO", flightInfo.getTailNO());
				flightInfoMap.put("atd", flightInfo.getAtd() == null ? null : DateHelper.formatIsoSecond(flightInfo.getAtd()));
				flightInfoMap.put("ata", flightInfo.getAta() == null ? null : DateHelper.formatIsoSecond(flightInfo.getAta()));
				flightInfoMap.put("etd", flightInfo.getEtd() == null ? null : DateHelper.formatIsoSecond(flightInfo.getEtd()));
				flightInfoMap.put("eta", flightInfo.getEta() == null ? null : DateHelper.formatIsoSecond(flightInfo.getEta()));
			}
			map.put(fieldName, flightInfoMap);
		} else {
			super.setField(map, obj, claz, multiple, field);
		}
	}
	
	public List<FlightInfoEntityDO> getByActivityId(int activityId) {
		@SuppressWarnings("unchecked")
		List<FlightInfoEntityDO> list = this.getHibernateTemplate().find("from FlightInfoEntityDO where deleted = ? and activity.id = ? order by id", false, activityId);
		return list;
	}
	
	public boolean hasFlightInfoEntity(int activityId, int flightInfoId) {
		@SuppressWarnings("unchecked")
		List<FlightInfoEntityDO> list = this.getHibernateTemplate().find("from FlightInfoEntityDO where deleted = ? and activity.id = ? and flightInfo.id = ?", false, activityId, flightInfoId);
		return !list.isEmpty();
	}

	/**
	 * @param activityLoggingDao the activityLoggingDao to set
	 */
	public void setActivityLoggingDao(ActivityLoggingDao activityLoggingDao) {
		this.activityLoggingDao = activityLoggingDao;
	}

	/**
	 * @param flightInfoDao the flightInfoDao to set
	 */
	public void setFlightInfoDao(FlightInfoDao flightInfoDao) {
		this.flightInfoDao = flightInfoDao;
	}

	public void setAircraftDao(AircraftDao aircraftDao) {
		this.aircraftDao = aircraftDao;
	}

	public void setSolrService(SolrService solrService) {
		this.solrService = solrService;
	}

	public void setFlightDubboService(FlightDubboService flightDubboService) {
		this.flightDubboService = flightDubboService;
	}

	public void setAirportDubboService(AirportDubboService airportDubboService) {
		this.airportDubboService = airportDubboService;
	}

	public void setAircraftModelDao(AircraftModelDao aircraftModelDao) {
		this.aircraftModelDao = aircraftModelDao;
	}

	public void setAirportDao(AirportDao airportDao) {
		this.airportDao = airportDao;
	}
	
}
