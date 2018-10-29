package com.usky.sms.flightmovementinfo;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.core.AbstractCache;
import com.usky.sms.flightmovementinfo.Maintenance.AircraftDO;
import com.usky.sms.flightmovementinfo.Maintenance.AircraftDao;

public class FlightInfoCache extends AbstractCache {
	
	private static Map<String, AirportDO> airportMap = new HashMap<String,AirportDO>();
	
	private static List<AircraftDO> aircraftList = new ArrayList<AircraftDO>();
	
	

	@Autowired
	private AirportDao airportDao;
	
	@Autowired
	private AircraftDao aircraftDao;

	@Override
	protected void refresh() {
		airportMap.clear();
		List<AirportDO> airports = airportDao.getAll();
		List<AircraftDO> aircrafts =  aircraftDao.getAll();
		aircraftList.addAll(aircrafts);
		for(AirportDO airport : airports){
			airportMap.put(airport.getiATACode(), airport);//三字码
			airportMap.put(airport.getiCaoCode(), airport);//四字码
		}
	}
	
	public AirportDO getAirport(String iATACode){
		return airportMap.get(iATACode);
	}
	
	public AirportDO getAirportByICaoCode(String iCaoCode){
		return airportMap.get(iCaoCode);
	}
	
	public  List<Map<String,Object>> getAllAirport(){
		List<AirportDO> airports = airportDao.getAll();
		List<Map<String,Object>> list = new ArrayList<Map<String,Object>>();
		for(AirportDO air : airports){
			Map<String,Object> map = new HashMap<String, Object>();
			map.put("iCaoCode", air.getiATACode());
			map.put("shortName", air.getShortName());
			map.put("fullName", air.getFullName());
			map.put("shortEnName", air.getShortEnName());
			map.put("fullEnName", air.getFullEnName());
			list.add(map);
		}
		return list;
	}
	
	public List<Map<String,Object>> getAllAircraft(){
		List<Map<String,Object>> list = new ArrayList<Map<String,Object>>();
		for(AircraftDO air : aircraftList){
			Map<String,Object> map = new HashMap<String, Object>();
			map.put("aircraftType", air.getAircraft_type());
			if(list.contains(map)) continue;
			list.add(map);
		}
		return list;
	}
	
	/**
	 * 返回所有飞机信息
	 * @return
	 */
	public List<AircraftDO> getAircraftList(){
		return aircraftList;
	}
	
	public void setAirportDao(AirportDao airportDao) {
		this.airportDao = airportDao;
	}

	public void setAircraftDao(AircraftDao aircraftDao) {
		this.aircraftDao = aircraftDao;
	}

	
	
}
