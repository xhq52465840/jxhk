package com.usky.sms.flightmovementinfo;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.common.DateHelper;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.PagedData;
import com.usky.sms.external.AirportDubboService;
import com.usky.sms.external.FlightDubboService;

public class AirportDao extends BaseDao<AirportDO> {

	@Autowired
	private FlightDubboService flightDubboService;
	
	@Autowired
	private AirportDubboService airportDubboService;
	
//	@Autowired
//	private FlightInfoCache flightInfoCache;
		
	@Autowired
	private FlightInfoDao flightInfoDao;
	
	@Autowired
	private FlightSupportInfoDao flightSupportInfoDao;
	
	protected AirportDao() {
		super(AirportDO.class);
	}
	
	/**
	 * 根据时间返回航班号及机场等 (成功)
	 */
	public Map<String, Object> getBaseInfo(Date dateTime, String flightNum, Integer start, Integer length) {
		Map<String, Object> result = new HashMap<String, Object>();
		List<FlightInfoDO> flightInfoList = flightDubboService.getFlightInfoByTime(dateTime, dateTime);
		// 排序(按航班号升序)
		Collections.sort(flightInfoList, new Comparator<FlightInfoDO>() {
			@Override
			public int compare(FlightInfoDO o1, FlightInfoDO o2) {
				return o1.getFlightNO().compareTo(o2.getFlightNO());
			}
		});
		// 筛选
		List<FlightInfoDO> filteredFlightInfoList = new ArrayList<FlightInfoDO>();
		if (StringUtils.isNotBlank(flightNum)) {
			for (FlightInfoDO flightInfo : flightInfoList) {
				if (StringUtils.containsIgnoreCase(flightInfo.getFlightNO(), flightNum)) {
					filteredFlightInfoList.add(flightInfo);
				}
			}
		} else {
			filteredFlightInfoList = flightInfoList;
		}
		Integer totalNum = filteredFlightInfoList.size();
		
		// 分页
		if (start == null) {
			start = 0;
		}
		Integer to = length == null ? totalNum : (start + length < totalNum ? start + length : totalNum);
		filteredFlightInfoList = filteredFlightInfoList.subList(start, to);
		
		// 返回字段
		List<Map<String, Object>> data = new ArrayList<Map<String, Object>>();
		for (FlightInfoDO flightInfo : filteredFlightInfoList) {
				Map<String, Object> flightMap = new HashMap<String, Object>();
				// 航班ID
				flightMap.put("flightInfoID", flightInfo.getFlightInfoID());
				// 机号
				flightMap.put("tailNO", flightInfo.getTailNO());
				// 承运人代码
				flightMap.put("carrier", flightInfo.getCarrier());
				// 航班号
				flightMap.put("flightNO", flightInfo.getFlightNO());
				// 北京时间 航班日期
				flightMap.put("flightBJDate", flightInfo.getFlightBJDate() == null ? null : DateHelper.formatIsoDate(flightInfo.getFlightBJDate()));
				// 实际起飞机场四字码
				flightMap.put("deptAirport", flightInfo.getDeptAirport());
				// 实际到达机场四字码
				flightMap.put("arrAirport", flightInfo.getArrAirport());
				// 实际起飞时间
				flightMap.put("atd", flightInfo.getAtd() == null ? null : DateHelper.formatIsoSecond(flightInfo.getAtd()));
				
				AirportDO dept = airportDubboService.getFlightAirportBy4Code(flightInfo.getDeptAirportCaoCode());
				AirportDO arr = airportDubboService.getFlightAirportBy4Code(flightInfo.getArrAirportCaoCode());
				if (dept == null) {
					flightMap.put("deptAirportName", "");// 实际起飞机场
					flightMap.put("deptCityName", "");// 实际起飞机场所在城市
				} else {
					flightMap.put("deptAirportName", dept.getFullName());// 实际起飞机场
					flightMap.put("deptCityName", dept.getCityName());// 实际起飞机场所在城市
				}
				if (arr == null) {
					flightMap.put("arrAirportName", "");// 实际到达机场
					flightMap.put("arrCityName", "");// 实际到达机场所在城市
				} else {
					flightMap.put("arrAirportName", arr.getFullName());// 实际到达机场
					flightMap.put("arrCityName", arr.getCityName());// 实际到达机场所在城市
				}
				data.add(flightMap);
			}
		result.put("aaData", data);
		result.put("iTotalRecords", totalNum);
		result.put("iTotalDisplayRecords", totalNum);
		return result;
	}
	
	/**
	 * 根据航班ID返回该航班的信息(成功)
	 * @param flightInfoID
	 * @return
	 */
	public Map<String, Object> getFlightInfo(Integer flightInfoID) {
		FlightInfoDO flightInfo = flightDubboService.getFlightInfoById(flightInfoID);
		if (flightInfo == null) {
			return null;
		}
		Map<String, Object> flightMap = new HashMap<String, Object>();
		// 桥位号
		flightMap.put("deptBay", flightInfo.getDeptBay());
		flightMap.put("tailNO", flightInfo.getTailNO());// 机号
		flightMap.put("flightNO", flightInfo.getFlightNO());// 航班号
		flightMap.put("flightBJDate", DateHelper.formatIsoDate((flightInfo.getFlightBJDate())));// 航班日期(BJ)
		flightMap.put("etd", flightInfo.getEtd() == null ? null : DateHelper.formatIsoSecond(flightInfo.getEtd()));// 预计起飞时间
		flightMap.put("std", flightInfo.getStd() == null ? null : DateHelper.formatIsoSecond((flightInfo.getStd())));// 计划起飞时间
		flightMap.put("sta", flightInfo.getSta() == null ? null : DateHelper.formatIsoSecond(flightInfo.getSta()));// 计划到达时间
		flightMap.put("atd", flightInfo.getAtd() == null ? null : DateHelper.formatIsoSecond(flightInfo.getAtd()));//实际起飞时间
		flightMap.put("ata", flightInfo.getAta() == null ? null : DateHelper.formatIsoSecond(flightInfo.getAta()));//实际到达时间
		flightMap.put("internationalFlight",flightInfo.getInternationalFlight());// 航班类型(I国际,D国内)
		flightMap.put("cabinOpenTime", flightInfo.getCabinOpenTime() == null ? null : DateHelper.formatIsoSecond(flightInfo.getCabinOpenTime()));//开客舱门时间
		flightMap.put("cabinCloseTime", flightInfo.getCabinCloseTime() == null ? null : DateHelper.formatIsoSecond(flightInfo.getCabinCloseTime()));//关客舱门时间
		flightMap.put("BlockOffTime", flightInfo.getBlockOffTime() == null ? null : DateHelper.formatIsoSecond(flightInfo.getBlockOffTime()));//撤轮档时间
		flightMap.put("blockOnTime", flightInfo.getBlockOnTime() == null ? null : DateHelper.formatIsoSecond(flightInfo.getBlockOnTime()));//上轮档时间
		AirportDO dept = airportDubboService.getFlightAirportBy4Code(flightInfo.getDeptAirportCaoCode());
		AirportDO arr = airportDubboService.getFlightAirportBy4Code(flightInfo.getArrAirportCaoCode());
		if (dept == null){
			flightMap.put("deptAirportName", "");// 实际起飞机场
		} else {
			flightMap.put("deptAirportName", dept.getFullName());// 实际起飞机场
		}
		if (arr == null){
			flightMap.put("arrAirportName", "");// 实际到达机场
		} else {
			flightMap.put("arrAirportName", arr.getFullName());// 实际到达机场
		}
		return flightMap;
	}

	//返回机场信息 (成功)
	public List<Map<String,Object>> getAirport(String iATACode, String iCaoCode) {
		AirportDO airportDO = null;
		if(iCaoCode != null){
			airportDO = airportDubboService.getFlightAirportBy4Code(iCaoCode);
		}else{
//			airportDO = flightInfoCache.getAirport(iATACode);
		}
		List<Map<String,Object>> list = new ArrayList<Map<String,Object>>();
		Map<String, Object> map = new HashMap<String, Object>();
		if (airportDO != null){
			map.put("iATACode", airportDO.getiATACode());//三字码
			map.put("iCaoCode", airportDO.getiCaoCode());//四字码
			map.put("fullName", airportDO.getFullName());//中文名
			map.put("fullEnName", airportDO.getFullEnName());//英文名
			map.put("countryCode", airportDO.getCountryCode());//国家代码
			map.put("cityName", airportDO.getCityName());//所在城市名称
			map.put("longitude", airportDO.getLongitude());//经度
			map.put("latitude", airportDO.getLatitude());//维度
			map.put("delayBuffer", airportDO.getDelayBuffer());//延误时间
			map.put("regionType", airportDO.getRegionType());//地区类型
			map.put("isJoinAirport", airportDO.getIsJoinAirport());//军民合用机场
			map.put("isOperativeAirport", airportDO.getIsOperativeAirport());//运行机场
			map.put("isBaseAirport", airportDO.getIsBaseAirport());//基地机场
			map.put("isMajorAirport", airportDO.getIsMajorAirport());//主要机场
			map.put("isTLAirport", airportDO.getIsTLAirport());//起降机场
			map.put("isALTNAirport", airportDO.getIsALTNAirport());//备降机场
			map.put("isETOpsAirport", airportDO.getIsETOpsAirport());//ETOPS运行机场
			map.put("isPolarAirport", airportDO.getIsPolarAirport());//极地机场
			map.put("plateauAirportCategory", airportDO.getPlateauAirportCategory());//高原机场类型
			map.put("operationCategory", airportDO.getOperationCategory());//机场类型
		}
		list.add(map);
		return list;
	}
	
	public List<AirportDO> getAll() {
		@SuppressWarnings("unchecked")
		List<AirportDO> list = this.getHibernateTemplate().find("from AirportDO");
		return list;
	}
	
	/**
	 * 通过机场名(fullName),四字码模糊查询机场的三字码
	 * @param name
	 * @return
	 */
	public List<String> getIATACodeByNameAndICaoCode(String name) {
		if (null == name) {
			return new ArrayList<String>();
		}
		name = name.replaceAll("/", "//").replaceAll("%", "/%").replaceAll("_", "/_");
		name = "%" + name + "%";
		@SuppressWarnings("unchecked")
		List<String> list = this.getHibernateTemplate().find(
				"select t.iATACode from AirportDO t where upper(concat(t.fullName, t.iCaoCode)) like upper(?) escape '/'", name);
		return list;
	}
	
	
	/**
	 * 根据机场名，城市名，机场三字码或机场四字码进程查询
	 * @param name
	 * @return
	 */
	public PagedData getAirportByNameAndICaoCode(String name, Integer start, Integer length) {
		PagedData pagedData = new PagedData();
		List<AirportDO> airports = airportDubboService.getFlightAirport();
		// 排序(按四字码和三字码进行排序)
		Collections.sort(airports);
		
		if (StringUtils.isNotBlank(name)) {
			Iterator<AirportDO> it = airports.iterator();
			while (it.hasNext()) {
				AirportDO airport = it.next();
				if ((airport.getFullName() == null || !StringUtils.containsIgnoreCase(airport.getFullName(), name))
					&& (airport.getiATACode() == null || !StringUtils.containsIgnoreCase(airport.getiATACode(), name))
					&& (airport.getiCaoCode() == null || !StringUtils.containsIgnoreCase(airport.getiCaoCode(), name))
					&& (airport.getCityName() == null || !StringUtils.containsIgnoreCase(airport.getCityName(), name))
					&& (airport.getCityEnName() == null || !StringUtils.containsIgnoreCase(airport.getCityEnName(), name))) {
					it.remove();
				}
			}
		}

		pagedData.setTotalCount(airports.size());
		start = start == null ? 0 : start;
		Integer to = length == null ? airports.size() : start + length;
		to = to < airports.size() ? to : airports.size();
		pagedData.setData(airports.subList(start, to));
		return pagedData;
	}

	public void setFlightInfoDao(FlightInfoDao flightInfoDao) {
		this.flightInfoDao = flightInfoDao;
	}
	
	public void setFlightSupportInfoDao(FlightSupportInfoDao flightSupportInfoDao) {
		this.flightSupportInfoDao = flightSupportInfoDao;
	}

	public void setFlightDubboService(FlightDubboService flightDubboService) {
		this.flightDubboService = flightDubboService;
	}

	public void setAirportDubboService(AirportDubboService airportDubboService) {
		this.airportDubboService = airportDubboService;
	}
	
	
}
