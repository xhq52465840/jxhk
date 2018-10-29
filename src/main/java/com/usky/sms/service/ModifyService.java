
package com.usky.sms.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.SMSException;
import com.usky.sms.http.service.GsonBuilder4SMS;
import com.usky.sms.solr.SolrService;
import com.usky.sms.utils.SpringBeanUtils;

@Transactional(readOnly = true, propagation = Propagation.SUPPORTS)
public class ModifyService extends AbstractService {
	
	private static Gson gson = GsonBuilder4SMS.getInstance();
	
	@Autowired
	private SolrService solrService;
	
	@Override
	public void doDefault(HttpServletRequest request, HttpServletResponse response) {
		try {
			Object result = getResult(request, response);
			ResponseHelper.output(response, result);
		} catch (SMSException e) {
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	private Object getResult(HttpServletRequest request, HttpServletResponse response) {
		String method = request.getParameter("method");
		Object data;
		if ("stdcomponent.add".equals(method)) {
			data = add(request);
		} else if ("stdcomponent.addall".equals(method)) {
			data = addAll(request);
		} else if ("stdcomponent.addextend".equals(method)) {
			ModifyService modifyService = (ModifyService) SpringBeanUtils.getBean("modify");
			data = modifyService.addExtend(request);
		} else if ("stdcomponent.update".equals(method)) {
			data = update(request);
		} else if ("stdcomponent.updateall".equals(method)) {
			ModifyService modifyService = (ModifyService) SpringBeanUtils.getBean("modify");
			data = modifyService.updateAll(request);
		} else if ("stdcomponent.updateextend".equals(method)) {
			data = updateExtend(request);
		} else if ("stdcomponent.delete".equals(method)) {
			data = delete(request);
		} else {
			throw SMSException.UNRECOGNIZED_REQUEST;
		}
		Map<String, Object> result = new HashMap<String, Object>();
		result.put("success", true);
		result.put("data", data);
		return result;
	}
	
	private Integer add(HttpServletRequest request) {
		String objName = request.getParameter("dataobject");
		String obj = request.getParameter("obj");
		Map<String, Object> map = gson.fromJson(obj, new TypeToken<Map<String, Object>>() {}.getType());
		Integer instanceId;
		switch (getDataObjectType(request)) {
			case DATABASE:
			case SOLR:
				instanceId = addToDatabase(request, objName, map);
				//				addToSolr(objName, instanceId, map);
				return instanceId;
			default:
				throw SMSException.UNRECOGNIZED_REQUEST;
		}
	}
	
	private Integer addToDatabase(HttpServletRequest request, String objName, Map<String, Object> map) {
		return (Integer) getDataAccessObject(request, objName).save(map);
	}
	
	private List<Integer> addAll(HttpServletRequest request) {
		String objName = request.getParameter("dataobject");
		String objs = request.getParameter("objs");
		List<Map<String, Object>> maps = gson.fromJson(objs, new TypeToken<List<Map<String, Object>>>() {}.getType());
		List<Integer> instanceIds;
		switch (getDataObjectType(request)) {
			case DATABASE:
			case SOLR:
				instanceIds = addAllToDatabase(request, objName, maps);
				//				addToSolr(objName, instanceId, map);
				return instanceIds;
			default:
				throw SMSException.UNRECOGNIZED_REQUEST;
		}
	}
	
	private List<Integer> addAllToDatabase(HttpServletRequest request, String objName, List<Map<String, Object>> maps) {
		return getDataAccessObject(request, objName).save(maps);
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public Integer addExtend(HttpServletRequest request) {
		String objName = request.getParameter("dataobject");
		String obj = request.getParameter("obj");
		Map<String, Object> map = gson.fromJson(obj, new TypeToken<Map<String, Object>>() {}.getType());
		Integer instanceId;
		switch (getDataObjectType(request)) {
			case DATABASE:
			case SOLR:
				instanceId = addToDatabaseExtend(request, objName, map);
				addToSolr(objName, instanceId, map);
				return instanceId;
			default:
				throw SMSException.UNRECOGNIZED_REQUEST;
		}
	}
	
	private Integer addToDatabaseExtend(HttpServletRequest request, String objName, Map<String, Object> map) {
		return (Integer) getDataAccessObject(request, objName).saveExtend(map);
	}
	
	private void addToSolr(String objName, Integer id, Map<String, Object> map) {
		solrService.addMapBySolrj(objName, map);
//		solrService.addDoc(objName, id, map);
	}
	
	private Object update(HttpServletRequest request) {
		String objName = request.getParameter("dataobject");
		String obj = request.getParameter("obj");
		String id = request.getParameter("dataobjectid");
		if (id == null || id.trim().length() == 0) throw SMSException.NO_ENTRY_SELECTED;
		Map<String, Object> map = gson.fromJson(obj, new TypeToken<Map<String, Object>>() {}.getType());
		switch (getDataObjectType(request)) {
			case DATABASE:
			case SOLR:
				updateToDatabase(request, objName, id, map);
				//				updateToSolr(objName, id, map);
				return null;
			default:
				throw SMSException.UNRECOGNIZED_REQUEST;
		}
	}
	
	private void updateToDatabase(HttpServletRequest request, String objName, String id, Map<String, Object> map) {
		getDataAccessObject(request, objName).update(Integer.parseInt(id), map);
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public Object updateAll(HttpServletRequest request) {
		switch (getDataObjectType(request)) {
			case DATABASE:
			case SOLR:
				// TODO: 待优化
				String objName = request.getParameter("dataobject");
				String objs = request.getParameter("objs");
				Map<String, Object>[] maps = gson.fromJson(objs, new TypeToken<Map<String, Object>[]>() {}.getType());
				this.getDataAccessObject(request, objName).updateAll(maps);
				return null;
			default:
				throw SMSException.UNKNOWN_EXCEPTION;
		}
	}
	
	private Object updateExtend(HttpServletRequest request) {
		String objName = request.getParameter("dataobject");
		String obj = request.getParameter("obj");
		String dataObjectId = request.getParameter("dataobjectid");
		if (dataObjectId == null || dataObjectId.trim().length() == 0) throw SMSException.NO_ENTRY_SELECTED;
		int id = Integer.parseInt(dataObjectId);
		Map<String, Object> map = gson.fromJson(obj, new TypeToken<Map<String, Object>>() {}.getType());
		switch (getDataObjectType(request)) {
			case DATABASE:
			case SOLR:
				updateToDatabaseExtend(request, objName, id, map);
				updateToSolr(objName, id, map);
				return null;
			default:
				throw SMSException.UNRECOGNIZED_REQUEST;
		}
	}
	
	private void updateToDatabaseExtend(HttpServletRequest request, String objName, int id, Map<String, Object> map) {
		getDataAccessObject(request, objName).updateExtend(id, map);
	}
	
	private void updateToSolr(String objName, int id, Map<String, Object> map) {
		solrService.updateSolrFields(objName, id, map);
	}
	
	private Object delete(HttpServletRequest request) {
		String objName = request.getParameter("dataobject");
		String ids = request.getParameter("dataobjectids");
		if (ids == null || ids.trim().length() == 0) throw SMSException.NO_ENTRY_SELECTED;
		String[] idArray = gson.fromJson(ids, String[].class);
		this.deleteInDatabase(request, objName, idArray);
		//		this.deleteInSolr(objName, idArray);
		return null;
	}
	
	private void deleteInDatabase(HttpServletRequest request, String objName, String[] ids) {
		getDataAccessObject(request, objName).delete(ids);
	}
	
	public void setSolrService(SolrService solrService) {
		this.solrService = solrService;
	}
	
}
