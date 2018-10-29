
package com.usky.sms.matrix;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;

import com.google.gson.reflect.TypeToken;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.core.AbstractService;
import com.usky.sms.user.UserDao;
import com.usky.sms.user.UserGroupDao;

public class MatrixService extends AbstractService {
	
	@Autowired
	private PerspectivesDao perspectivesDao;
	
	@Autowired
	private BandingDao bandingDao;
	
	@Autowired
	private RangeDao rangeDao;
	
	@Autowired
	private AidsDao aidsDao;
	
	@Autowired
	private MatrixDao matrixDao;
	
	@Autowired
	private CoefficientDao coefficientDao;
	
	//批量更新
	public void updateAll(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try{
			String subObj = request.getParameter("subObj");
			String objs = request.getParameter("objs");
			List<Map<String,Object>> param = gson.fromJson(objs, new TypeToken<List<Map<String,Object>>>() {}.getType());
			if("perspectives".equals(subObj)){						
				perspectivesDao.updateAllPerspectives(param);
			}else if("banding".equals(subObj)){							
				bandingDao.updateAllBanding(param);
			}else if("range".equals(subObj)){			
				rangeDao.updateAllRange(param);
			}
			Map<String, Object> map = new HashMap<String, Object>();
			List<Map<String,Object>> list = new ArrayList<Map<String,Object>>();
			map.put("success", true);
			map.put("data", list);
			ResponseHelper.output(response, map);
		}catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getByMatrix(HttpServletRequest request, HttpServletResponse response) throws Exception {
		String subObj = request.getParameter("subObj");
		Integer matrixId = request.getParameter("matrixId")==null?null:Integer.parseInt(request.getParameter("matrixId").toString());
		Map<String, Object> map = new HashMap<String, Object>();
		try{
			if("aids".equals(subObj)){						
				Map<String,List<Map<String,Object>>> aidsMap =aidsDao.getByMatrix(matrixDao.internalGetById(matrixId));			
				map.put("success", true);
				map.put("data", aidsMap);
			}else if("coefficient".equals(subObj)){
				Map<String,List<Map<String,Object>>> coefficientMap = coefficientDao.getByMatrix(matrixDao.internalGetById(matrixId));			
				map.put("success", true);
				map.put("data", coefficientMap);
			}
			ResponseHelper.output(response, map);
		}catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}

	public void setPerspectivesDao(PerspectivesDao perspectivesDao) {
		this.perspectivesDao = perspectivesDao;
	}

	public void setBandingDao(BandingDao bandingDao) {
		this.bandingDao = bandingDao;
	}

	public void setRangeDao(RangeDao rangeDao) {
		this.rangeDao = rangeDao;
	}
	public void setAidsDao(AidsDao aidsDao) {
		this.aidsDao = aidsDao;
	}
	public void setMatrixDao(MatrixDao matrixDao) {
		this.matrixDao = matrixDao;
	}
	public void setCoefficientDao(CoefficientDao coefficientDao) {
		this.coefficientDao = coefficientDao;
	}
}
