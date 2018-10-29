
package com.usky.sms.core;

import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.BeansException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.context.support.WebApplicationContextUtils;

import com.google.gson.Gson;
import com.usky.sms.common.BeanHelper;
import com.usky.sms.common.DateHelper;
import com.usky.sms.entity.EntityDO;
import com.usky.sms.entity.EntityDao;
import com.usky.sms.http.service.GsonBuilder4SMS;

public abstract class AbstractService {
	
	protected static final Gson gson = GsonBuilder4SMS.getInstance();
	
	@Autowired
	private EntityDao entityDao;
	
	protected void doDefault(HttpServletRequest request, HttpServletResponse response) {
		//do nothing
	}
	
	protected DataObjectType getDataObjectType(HttpServletRequest request) {
		String objName = request.getParameter("dataobject");
		if ("files".equals(objName)) return DataObjectType.ATTACHMENT;
		List<EntityDO> list = entityDao.getEntitiesByName(objName);
		return list == null || list.size() == 0 ? DataObjectType.DATABASE : DataObjectType.SOLR;
	}
	
	protected String getDOName(String objName) {
		String daoName = this.getDaoName(objName);
		return daoName.substring(0, 1).toUpperCase() + daoName.substring(1, daoName.length() - 3) + "DO";
	}
	
	private String getDaoName(String objName) {
		return objName + "Dao";
	}
	
	@SuppressWarnings("unchecked")
	protected BaseDao<? extends AbstractBaseDO> getDataAccessObject(HttpServletRequest request, String objName) {
		try {
			return (BaseDao<? extends AbstractBaseDO>) WebApplicationContextUtils.getRequiredWebApplicationContext(request.getSession().getServletContext()).getBean(getDaoName(objName));
		} catch (BeansException e) {
			throw SMSException.UNRECOGNIZED_REQUEST;
		}
	}
	
	protected List<?> convert(List<?> list, Class<?> claz) throws SecurityException, IllegalArgumentException, NoSuchMethodException, IllegalAccessException, InvocationTargetException {
		List<Map<String, Object>> result = new ArrayList<Map<String, Object>>();
		for (Object obj : list) {
			Map<String, Object> map = new HashMap<String, Object>();
			setFields(map, obj, claz, true);
			result.add(map);
		}
		return result;
	}
	
	protected Map<String, Object> convert(Object obj, Class<?> claz) throws SecurityException, IllegalArgumentException, NoSuchMethodException, IllegalAccessException, InvocationTargetException {
		Map<String, Object> map = new HashMap<String, Object>();
		setFields(map, obj, claz, false);
		return map;
	}
	
	protected List<Map<String, Object>> convertList(Object obj) throws SecurityException, IllegalArgumentException, NoSuchMethodException, IllegalAccessException, InvocationTargetException {
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		for (Object o : (List<?>) obj) {
			Map<String, Object> map = new HashMap<String, Object>();
			setFields(map, o, o.getClass(), false);
			list.add(map);
		}
		return list;
	}
	
	protected void setFields(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple) throws SecurityException, NoSuchMethodException, IllegalArgumentException, IllegalAccessException, InvocationTargetException {
		for (Field field : claz.getDeclaredFields()) {
			Class<?> type = field.getType();
			if (Modifier.isStatic(field.getModifiers())) continue;
			if (Modifier.isFinal(field.getModifiers())) continue;
			if (type == String.class || type == Integer.class || type == Double.class || type == Boolean.class) {
				Method getter = BeanHelper.determineGetter(claz, field.getName());
				map.put(field.getName(), getter.invoke(obj));
			}
			if (type == Date.class) {
				Method getter = BeanHelper.determineGetter(claz, field.getName());
				Date date = (Date) getter.invoke(obj);
				if (date != null) map.put(field.getName(), DateHelper.formatIsoDate(date));
			}
			if (Enum.class.isAssignableFrom(type)) {
				Method getter = BeanHelper.determineGetter(claz, field.getName());
				map.put(field.getName(), getter.invoke(obj));
			}
			if (AbstractBaseDO.class.isAssignableFrom(type)) {
				Method getter = BeanHelper.determineGetter(claz, field.getName());
				AbstractBaseDO baseDO = (AbstractBaseDO) getter.invoke(obj);
				if (baseDO != null) {
					if (multiple) {
						map.put(field.getName() + "Id", baseDO.getId());
						map.put(field.getName() + "Deleted", baseDO.isDeleted());
						if (baseDO instanceof IDisplayable) {
							map.put(field.getName(), ((IDisplayable) baseDO).getDisplayName());
						}
					} else {
						map.put(field.getName(), baseDO.getId());
					}
				} else {
					map.put(field.getName(), null);
				}
			}
			if (Collection.class.isAssignableFrom(type)) {
				Method getter = BeanHelper.determineGetter(claz, field.getName());
				Collection<?> collection = (Collection<?>) getter.invoke(obj);
				if (collection != null && collection.size() > 0) {
					List<Integer> ids = new ArrayList<Integer>();
					for (Object o : collection) {
						ids.add(((AbstractBaseDO) o).getId());
					}
					map.put(field.getName(), ids);
				} else {
					map.put(field.getName(), null);
				}
			}
		}
		final Class<?> superClazz = claz.getSuperclass();
		if (superClazz != null) setFields(map, obj, superClazz, multiple);
	}
	
	public void setEntityDao(EntityDao entityDao) {
		this.entityDao = entityDao;
	}
	
}
