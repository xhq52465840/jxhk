package com.usky.sms.flightmovementinfo.Maintenance;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.common.ResponseHelper;
import com.usky.sms.core.AbstractService;

public class AircraftService extends AbstractService {
	
	@Autowired
	private AircraftDao aircraftDao;
	
	/**
	 * 查询所有的飞机信息
	 */
	public void getAllAircrafts(HttpServletRequest request,HttpServletResponse response) throws Exception {
		try {
			String aircraftType = request.getParameter("aircraftType");
			List<AircraftDO> list = aircraftDao.getByAircraftType(aircraftType);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("data", list);
			map.put("success", true);
			ResponseHelper.output(response, map);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	/**
	 * 查询机号信息
	 */
	public void getTailNOs(HttpServletRequest request,HttpServletResponse response) throws Exception {
		try {
			String tailNO = request.getParameter("tailNO");
			List<AircraftDO> list = aircraftDao.fuzzySearchByTailNO(tailNO);
			List<String> tailNOs = new ArrayList<String>();
			for (AircraftDO aircraft : list) {
				if (!tailNOs.contains(tailNO)) {
					tailNOs.add(aircraft.getTail_no());
				}
			}
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("data", tailNOs);
			map.put("success", true);
			ResponseHelper.output(response, map);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void setAircraftDao(AircraftDao aircraftDao) {
		this.aircraftDao = aircraftDao;
	}

}
