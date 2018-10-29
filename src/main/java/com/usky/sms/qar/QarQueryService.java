package com.usky.sms.qar;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.common.PageHelper;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.SMSException;
import com.usky.sms.field.Field;
import com.usky.sms.field.FieldQarRegister;
import com.usky.sms.field.screen.FieldScreenLayoutItemDO;
import com.usky.sms.field.screen.FieldScreenLayoutItemDao;

public class QarQueryService extends AbstractService{
	
	@Autowired
	private QarQueryDao qarQueryDao;
	
	@Autowired
	private FieldQarRegister fieldQarRegister;
	
	@Autowired
	private FieldScreenLayoutItemDao fieldScreenLayoutItemDao;
	
	public void setQarQueryDao(QarQueryDao qarQueryDao) {
		this.qarQueryDao = qarQueryDao;
	}

	public void getQarEventList(HttpServletRequest request, HttpServletResponse response){
		try{
			String qarsql = request.getParameter("qarsql");
			List<Map<String, Object>> list2 = qarQueryDao.getQarEvent(qarsql);		
			
			Map<String, Object> result = new HashMap<String, Object>();
			Map<String, Object> data = new HashMap<String, Object>();		
			
			data.put("QarEventlist", PageHelper.getPagedResult(list2, request));
			result.put("success", true);
			result.put("data", data);

			ResponseHelper.output(response, result);
			
		}catch(SMSException e){
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}catch(Exception e){
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getQarCompany(HttpServletRequest request, HttpServletResponse response){
		try{
			
			List<Map<String, Object>> list = qarQueryDao.getQarCompany();
			
			Map<String, Object> result = new HashMap<String, Object>();
			Map<String, Object> data = new HashMap<String, Object>();		
			
			data.put("companyList", PageHelper.getPagedResult(list, request));
			result.put("success", true);
			result.put("data", data);

			ResponseHelper.output(response, result);
			
		}catch(SMSException e){
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}catch(Exception e){
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getAirportList(HttpServletRequest request,HttpServletResponse response) throws Exception {
		try {
			String flightNum = request.getParameter("flightNum");
//			String dateTime = request.getParameter("dataTime");
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
			Integer page = Integer.parseInt(request.getParameter("page"));
//			Date date = sdf.parse(dateTime);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("data", qarQueryDao.getBaseInfo(null,page,flightNum));
			map.put("count", qarQueryDao.count(null,page));
			map.put("success", true);
			ResponseHelper.output(response, map);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getAllFieldList(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			Collection<Field> fields = fieldQarRegister.getAllFields();
			String screenId = request.getParameter("screenId");
			try {
				Integer id = Integer.parseInt(screenId);
				List<Field> fieldList = new ArrayList<Field>();
				List<FieldScreenLayoutItemDO> items = fieldScreenLayoutItemDao.getByFieldScreenId(id);
				for (Field field : fields) {
					boolean contain = false;
					for (FieldScreenLayoutItemDO item : items) {
						if (field.getKey().equals(item.getKey())) {
							contain = true;
							break;
						}
					}
					if (!contain) fieldList.add(field);
				}
				fields = fieldList;
			} catch (NumberFormatException e) {
				// do nothing
			}
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", PageHelper.getPagedResult(new ArrayList<Field>(fields), request));
			ResponseHelper.output(response, map);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
		
	public void setFieldQarRegister(FieldQarRegister fieldQarRegister) {
		this.fieldQarRegister = fieldQarRegister;
	}

	public void setFieldScreenLayoutItemDao(FieldScreenLayoutItemDao fieldScreenLayoutItemDao) {
		this.fieldScreenLayoutItemDao = fieldScreenLayoutItemDao;
	}
}
