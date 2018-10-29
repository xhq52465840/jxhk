
package com.usky.sms.core;

import java.io.Serializable;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.ParameterizedType;
import java.math.BigDecimal;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.apache.commons.lang.ArrayUtils;
import org.apache.commons.lang.ObjectUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.Validate;
import org.apache.log4j.Logger;
import org.hibernate.HibernateException;
import org.hibernate.LockMode;
import org.hibernate.Query;
import org.hibernate.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate3.HibernateCallback;
import org.springframework.orm.hibernate3.SessionFactoryUtils;
import org.springframework.orm.hibernate3.support.HibernateDaoSupport;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import com.google.gson.Gson;
import com.usky.sms.activity.ActivityDO;
import com.usky.sms.common.BeanHelper;
import com.usky.sms.common.DateHelper;
import com.usky.sms.custom.CustomFieldTypeDO;
import com.usky.sms.custom.CustomFieldTypeDao;
import com.usky.sms.custom.CustomFieldValueDO;
import com.usky.sms.custom.CustomFieldValueDao;
import com.usky.sms.http.service.GsonBuilder4SMS;

@Transactional(readOnly = true, propagation = Propagation.SUPPORTS)
public class BaseDao<O extends AbstractBaseDO> extends HibernateDaoSupport {
	
	private static final Logger log = Logger.getLogger(BaseDao.class);
	
	protected static final Gson gson = GsonBuilder4SMS.getInstance();
	
	public List<String> fieldExtensibleBeanNames = new ArrayList<String>();
	
	private WebApplicationContext context;
	
	protected Class<O> clazz;
	
	@Autowired
	private CustomFieldTypeDao customFieldTypeDao;
	
	@Autowired
	private CustomFieldValueDao customFieldValueDao;
	
	/**
	 * The setting of the DO class is required.
	 * 
	 * @param clazz
	 */
	protected BaseDao(final Class<O> clazz) {
		this.clazz = clazz;
	}
	
	public void registerFieldExtensibleBean(String name) {
		fieldExtensibleBeanNames.add(name);
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED)
	public Serializable internalSaveOrUpdate(final O obj) {
		Serializable id = null;
		if (obj.getId() != null) {
			internalUpdate(obj);
		} else {
			id = internalSave(obj);
		}
		return id;
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public Serializable internalSave(final O obj) {
		Validate.notNull(obj);
		obj.setCreated();
		obj.setLastUpdate();
		final Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();
		final Serializable id = session.save(obj);
		log.info("New object added (" + id + "): " + obj.toString());
		session.flush();
		return id;
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void internalSave(final Collection<O> col) {
		for (final O obj : col) {
			internalSave(obj);
		}
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public boolean internalUpdate(final O obj) {
		final Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();
		obj.setLastUpdate();
		session.update(obj);
		log.info("Object updated: " + obj.toString());
		session.flush();
		return true;
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void internalUpdate(final Collection<O> col) {
		for (final O obj : col) {
			internalUpdate(obj);
		}
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void internalMarkAsDeleted(final O obj) {
		final Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();
		obj.setDeleted(true);
		obj.setLastUpdate();
		session.update(obj);
		log.info("Object marked as deleted: " + obj.toString());
		session.flush();
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void internalMarkAsDeleted(final Collection<O> col) {
		for (final O obj : col) {
			internalMarkAsDeleted(obj);
		}
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void internalUndelete(final O obj) {
		final Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();
		obj.setDeleted(false);
		obj.setLastUpdate();
		log.info("Object undeleted: " + obj.toString());
		session.update(obj);
		session.flush();
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void internalDelete(final O obj) {
		this.getHibernateTemplate().delete(obj);
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void internalDelete(final Collection<O> col) {
		this.getHibernateTemplate().deleteAll(col);
	}
	
	@Transactional(readOnly = true, propagation = Propagation.SUPPORTS)
	public List<O> internalLoadAll(Class<O> clazz) {
		@SuppressWarnings("unchecked")
		final List<O> list = getHibernateTemplate().find("from " + clazz.getSimpleName() + " t");
		return list;
	}
	
	@Transactional(readOnly = true, propagation = Propagation.SUPPORTS)
	public List<O> getList() {
		return internalGetList(null, null, null);
	}
	
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public List<Object> getList(Map<String, Object> map, Map<String, Object> searchMap, List<String> orders, Integer firstResult, Integer maxResults) {
		beforeGetList(map, searchMap, orders);
		List<String> paramNames = new ArrayList<String>();
		List<Object> values = new ArrayList<Object>();
		String hql = generateHql(map, searchMap, orders, paramNames, values);
		List<O> list = internalGetList(hql, paramNames, values, firstResult, maxResults);
		List<Map<String, Object>> mapList = convert(list);
		int count = internalGetAllCount(hql, paramNames, values);
		afterGetList(mapList, map, searchMap, orders);
		List<Object> result = new ArrayList<Object>();
		result.add(mapList);
		result.add(count);
		return result;
	}
	
	private int internalGetAllCount(Map<String, Object> map, Map<String, Object> searchMap) {
		List<String> paramNames = new ArrayList<String>();
		List<Object> values = new ArrayList<Object>();
		String hql = generateHql(map, searchMap, null, paramNames, values);
		if (hql.startsWith("select")) {
			int pos = hql.indexOf("from");
			hql = "select count(" + hql.substring(7, pos - 1) + ") " + hql.substring(pos);
		} else {
			hql = "select count(*) " + hql;
		}
		@SuppressWarnings("unchecked")
		List<Long> list = this.getHibernateTemplate().findByNamedParam(hql, paramNames.toArray(new String[0]), values.toArray());
		return list.get(0).intValue();
	}
	
	private int internalGetAllCount(String hql, List<String> paramNames, List<Object> values) {
		if (hql.startsWith("select")) {
			int pos = hql.indexOf("from");
			hql = "select count(" + hql.substring(7, pos - 1) + ") " + hql.substring(pos);
		} else {
			hql = "select count(*) " + hql;
		}
		@SuppressWarnings("unchecked")
		List<Long> list = this.getHibernateTemplate().findByNamedParam(hql, paramNames.toArray(new String[0]), values.toArray());
		return list.get(0).intValue();
	}
	
	@SuppressWarnings("unchecked")
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public List<Map<String, Object>> getListEx(String objName, String query) {
		String hql = "from " + objName.substring(0, 1).toUpperCase() + objName.substring(1) + "DO t where t.deleted = false and (" + query + ")";
		List<O> list = this.getHibernateTemplate().find(hql);
		
		List<Map<String, Object>> mapList = convert(list);
		return mapList;
	}
	
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public List<O> getExportList() {
		return getList();
	}
	
	@Transactional(readOnly = true, propagation = Propagation.SUPPORTS)
	public List<O> internalGetList(Map<String, Object> map, Map<String, Object> searchMap, List<String> orders) {
		return internalGetList(map, searchMap, orders, null, null);
	}
	
	@Transactional(readOnly = true, propagation = Propagation.SUPPORTS)
	public List<O> internalGetList(Map<String, Object> map, Map<String, Object> searchMap, List<String> orders, final Integer firstResult, final Integer maxResults) {
		final List<String> paramNames = new ArrayList<String>();
		final List<Object> values = new ArrayList<Object>();
		final String hql = generateHql(map, searchMap, orders, paramNames, values);
		if (paramNames.size() != values.size()) {
			throw new IllegalArgumentException("Length of paramNames array must match length of values array");
		}
		return internalGetList(hql, paramNames, values, firstResult, maxResults);
	}
	
	@Transactional(readOnly = true, propagation = Propagation.SUPPORTS)
	public List<O> internalGetList(final String hql, final List<String> paramNames, final List<Object> values, final Integer firstResult, final Integer maxResults) {
		if (paramNames.size() != values.size()) {
			throw new IllegalArgumentException("Length of paramNames array must match length of values array");
		}
		List<O> list = this.getHibernateTemplate().executeWithNativeSession(new HibernateCallback<List<O>>() {
			
			@Override
			public List<O> doInHibernate(Session session) throws HibernateException, SQLException {
				Query query = session.createQuery(hql);
				prepareQuery(query);
				for (int i = 0; i < values.size(); i++) {
					applyNamedParameterToQuery(query, paramNames.get(i), values.get(i));
				}
				if (firstResult != null) query.setFirstResult(firstResult);
				if (maxResults != null) query.setMaxResults(maxResults);
				@SuppressWarnings("unchecked")
				List<O> list = query.list();
				return list;
			}
		});
		sortList(list);
		return list;
	}
	
	protected void prepareQuery(Query queryObject) {
		if (isCacheQueries()) {
			queryObject.setCacheable(true);
			if (getQueryCacheRegion() != null) {
				queryObject.setCacheRegion(getQueryCacheRegion());
			}
		}
		if (getFetchSize() > 0) {
			queryObject.setFetchSize(getFetchSize());
		}
		if (getMaxResults() > 0) {
			queryObject.setMaxResults(getMaxResults());
		}
		SessionFactoryUtils.applyTransactionTimeout(queryObject, getSessionFactory());
	}
	
	public boolean isCacheQueries() {
		return this.getHibernateTemplate().isCacheQueries();
	}
	
	public String getQueryCacheRegion() {
		return this.getHibernateTemplate().getQueryCacheRegion();
	}
	
	public int getFetchSize() {
		return this.getHibernateTemplate().getFetchSize();
	}
	
	public int getMaxResults() {
		return this.getHibernateTemplate().getMaxResults();
	}
	
	protected void applyNamedParameterToQuery(Query queryObject, String paramName, Object value) throws HibernateException {
		if (value instanceof Collection) {
			queryObject.setParameterList(paramName, (Collection<?>) value);
		} else if (value instanceof Object[]) {
			queryObject.setParameterList(paramName, (Object[]) value);
		} else {
			queryObject.setParameter(paramName, value);
		}
	}
	
	protected String generateHql(Map<String, Object> map, Map<String, Object> searchMap, List<String> orders, List<String> paramNames, List<Object> values) {
		StringBuilder hql = new StringBuilder(getBaseHql(map));
		int length = hql.length();
		if (map != null) {
			@SuppressWarnings("unchecked")
			List<List<Map<String, Object>>> ruleList = (List<List<Map<String, Object>>>) map.get("rule");
			if (ruleList != null && ruleList.size() > 0) {
				int i = 0;
				for (List<Map<String, Object>> andRule : ruleList) {
					hql.append("(");
					boolean flag = false;
					for (Map<String, Object> orRule : andRule) {
						String key = (String) orRule.get("key");
						Object value = orRule.get("value");
						String op = getOperation(orRule, "op");
						if (!"is null".equals(op) && !"is not null".equals(op) && (value == null || "".equals(value))) continue;
						if (!"is null".equals(op) && !"is not null".equals(op)) value = getQueryParamValue(key, value);
						if ("like".equals(op)) {
							value = ((String) value).replaceAll("/", "//").replaceAll("%","/%").replaceAll("_","/_").toUpperCase();
							value = "%" + value + "%";
							hql.append("upper(").append(getQueryParamName(key)).append(") ");
						} else {
							hql.append(getQueryParamName(key)).append(" ");
						}
						hql.append(op);
						if ("in".equals(op)) {
							hql.append(" (:").append(key.replace(".", "_") + i).append(")");
						} else if ("is null".equals(op)) {
						} else if ("is not null".equals(op)) {
						} else {
							hql.append(" :").append(key.replace(".", "_") + i);
							if ("like".equals(op)) {
								hql.append(" escape '/'");
							}
						}
						hql.append(" or ");
						Class<?> claz = clazz;
						do {
							try {
								if (claz.getDeclaredField(key).getType() == Date.class) {
									value = DateHelper.parseIsoDate((String) value);
								}
								break;
							} catch (NoSuchFieldException e) {
								claz = claz.getSuperclass();
							} catch (SecurityException e) {
								break;
							}
						} while (claz != null);
						if (!"is null".equals(op) && !"is not null".equals(op)) {
							paramNames.add(key.replace(".", "_") + i);
							values.add(value);
							i++;
						}
						flag = true;
					}
					int end = hql.length();
					int start = end - (flag ? 4 : 1);
					hql.delete(start, end);
					if (flag) hql.append(") and ");
				}
			}
		}
		if (length == hql.length()) {
			int end = hql.length();
			int start = end - 5;
			hql.delete(start, end);
		} else {
			int end = hql.length();
			int start = end - 4;
			hql.delete(start, end).append(")");
		}
		if (searchMap != null && !searchMap.isEmpty() && searchMap.get("value") != null && searchMap.get("value").toString().trim().length() > 0) {
			String[] fields = getSearchFields();
			if (fields != null && fields.length > 0) {
				hql.append(" and (");
				for (String field : fields) {
					hql.append(getQueryParamName(field)).append(" like '%").append(searchMap.get("value")).append("%' or ");
				}
				hql.delete(hql.length() - 4, hql.length());
				hql.append(")");
			}
		}
		if (orders == null || orders.isEmpty()) {
			orders = getDefaultOrder();
		}
		if (orders != null && orders.size() > 0) {
			hql.append(" order by");
			for (String order : orders) {
				hql.append(" ").append(order).append(",");
			}
			hql.deleteCharAt(hql.length() - 1);
		}
		return hql.toString();
	}
	
	/**
	 * 默认排序
	 * @return
	 */
	protected List<String> getDefaultOrder() {
		// 默认安装id排序
		List<String> orders = new ArrayList<String>();
		orders.add("t.id asc");
		return orders;
	}
	
	protected String getBaseHql(Map<String, Object> map) {
		return "from " + clazz.getSimpleName() + " t where t.deleted = false and (";
	}
	
	protected String getQueryParamName(String key) {
		try {
			if (AbstractBaseDO.class.isAssignableFrom(this.clazz.getDeclaredField(key).getType())) return "t." + key + ".id";
		} catch (NoSuchFieldException e) {
			// do nothing
		} catch (SecurityException e) {
			// do nothing
		}
		return "t." + key;
	}
	
	protected Object getQueryParamValue(String key, Object value) {
		try {
			if (AbstractBaseDO.class.isAssignableFrom(this.clazz.getDeclaredField(key).getType())) return ((Number) value).intValue();
		} catch (NoSuchFieldException e) {
			// do nothing
		} catch (SecurityException e) {
			// do nothing
		}
		return value;
	}
	
	protected String getOperation(Map<String, Object> opMap, String key) {
		String operation = opMap == null ? null : (String) opMap.get(key);
		if (operation == null || operation.trim().length() == 0 || operation.trim().equals("==")) operation = "=";
		return operation;
	}
	
	protected String[] getSearchFields() {
		// TODO: 全文检索字段获取方式临时方案
		return null;
	}
	
	protected void sortList(List<O> list) {
		// do nothing
	}
	
	protected void beforeGetList(Map<String, Object> map, Map<String, Object> searchMap, List<String> orders) {
		// do nothing
	}
	
	protected void afterGetList(List<Map<String, Object>> list, Map<String, Object> paramMap, Map<String, Object> searchMap, List<String> orders) {
		// do nothing
	}
	
	public void afterGetList(Map<String, Object> map, Map<String, Object> ruleMap) {
		// do nothing
	}
	
	@Transactional(readOnly = true, propagation = Propagation.SUPPORTS)
	public List<O> getAllList() {
		@SuppressWarnings("unchecked")
		List<O> list = this.getHibernateTemplate().find("from " + clazz.getSimpleName());
		return list;
	}
	
	@Transactional(readOnly = true, propagation = Propagation.SUPPORTS)
	public Map<String, Object> getById(int id) {
		beforeGetById(id);
		O obj = internalGetById(id);
		Map<String, Object> map = convert(obj);
		afterGetById(map);
		return map;
	}
	
	@Transactional(readOnly = true, propagation = Propagation.SUPPORTS)
	public O internalGetById(int id) {
		return this.getHibernateTemplate().get(clazz, id, LockMode.READ);
	}
	
	protected void beforeGetById(int id) {
		// do nothing
	}
	
	protected void afterGetById(Map<String, Object> map) {
		// do nothing
	}
	
	@Transactional(readOnly = true, propagation = Propagation.SUPPORTS)
	public List<Map<String, Object>> getByIds(String[] ids) {
		List<O> list = this.internalGetByIds(ids);
		return this.convert(list);
	}
	
	@Transactional(readOnly = true, propagation = Propagation.SUPPORTS)
	public List<O> internalGetByIds(String[] ids) {
		StringBuilder hql = new StringBuilder("from ").append(clazz.getSimpleName()).append(" where id in (");
		for (String id : ids) {
			hql.append(id).append(",");
		}
		hql.deleteCharAt(hql.length() - 1).append(")");
		@SuppressWarnings("unchecked")
		List<O> list = this.getHibernateTemplate().find(hql.toString());
		return list;
	}
	
	@Transactional(readOnly = true, propagation = Propagation.SUPPORTS)
	public List<O> getByIds(List<Integer> ids) {
		StringBuilder hql = new StringBuilder("from ").append(clazz.getSimpleName()).append(" where deleted = false and id in (:ids)");
		@SuppressWarnings("unchecked")
		List<O> list = getHibernateTemplate().findByNamedParam(hql.toString(), "ids", ids);
		return list;
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public Integer save(Map<String, Object> map) {
		try {
			if (!beforeSave(map)) return null;
			O obj = clazz.getConstructor().newInstance();
			copyValues(obj, map);
			Integer id = (Integer) this.internalSave(obj);
			afterSave(obj);
			return id;
		} catch (SMSException e) {
			throw e;
		} catch (Exception e) {
			e.printStackTrace();
			throw new SMSException(e);
		}
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public List<Integer> save(List<Map<String, Object>> maps) {
		List<Integer> ids = new ArrayList<Integer>();
		for (Map<String, Object> map : maps) {
			ids.add(save(map));
		}
		return ids;
	}
	
	protected boolean beforeSave(Map<String, Object> map) {
		return true;
	}
	
	protected void afterSave(O obj) {
		// do nothing
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public Integer saveExtend(Map<String, Object> map) {
		Map<String, Object> commonFieldMap = getCommonFieldMap(map);
		Map<String, Object> customFieldMap = getCustomFieldMap(map);
		Integer id = this.save(commonFieldMap);
		this.saveCustomFields(id, customFieldMap);
		afterSaveExtend(id, map);
		return id;
	}
	
	protected void afterSaveExtend(int id, Map<String, Object> map) {
		// do nothing
	}
	
	protected Map<String, Object> getCommonFieldMap(Map<String, Object> map) {
		Map<String, Object> commonFieldMap = new HashMap<String, Object>();
		for (String key : map.keySet()) {
			if (!key.startsWith("customfield_")) commonFieldMap.put(key, map.get(key));
		}
		return commonFieldMap;
	}
	
	protected Map<String, Object> getCustomFieldMap(Map<String, Object> map) {
		Map<String, Object> customFieldMap = new HashMap<String, Object>();
		for (String key : map.keySet()) {
			if (key.startsWith("customfield_")) customFieldMap.put(key, map.get(key));
		}
		return customFieldMap;
	}
	
	protected void saveCustomFields(Integer id, Map<String, Object> map) {
		// TODO: 对特殊的自定义字段类型，需要提供接口可供其实现一些特殊的业务功能，比如标签类型的数据，需要按照一定规则存储在标签自己所拥有的表中
		for (String key : map.keySet()) {
			Object value = map.get(key);
			CustomFieldValueDO customFieldValue = new CustomFieldValueDO();
			ActivityDO activity = new ActivityDO();
			activity.setId(id);
			customFieldValue.setActivity(activity);
			customFieldValue.setKey(key);
			CustomFieldTypeDO type = customFieldTypeDao.getByFieldKey(key);
			String valueType = type.getType();
			if (value == null || (!"string".equals(valueType) && "".equals(value))) {
				continue;
			} else if ("string".equals(valueType)) {
				customFieldValue.setStringValue((String) map.get(key));
			} else if ("date".equals(valueType)) {
				String date = (String) map.get(key);
				switch (date.length()) {
					case 10:
						customFieldValue.setDateValue(DateHelper.parseIsoDate(date));
						break;
					case 19:
						customFieldValue.setDateValue(DateHelper.parseIsoSecond(date));
						break;
				}
			} else if ("number".equals(valueType)) {
				customFieldValue.setNumberValue(((Number) map.get(key)).doubleValue());
			} else if ("text".equals(valueType)) {
				customFieldValue.setTextValue((String) map.get(key));
			} else if ("array".equals(valueType)) {
				customFieldValue.setTextValue(gson.toJson(map.get(key)));
			}
			customFieldValueDao.internalSave(customFieldValue);
		}
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void update(int id, Map<String, Object> map) {
		beforeUpdate(id, map);
		O dbObj = getHibernateTemplate().load(clazz, id, LockMode.PESSIMISTIC_WRITE);
		if (dbObj == null) throw SMSException.NO_MATCHABLE_OBJECT;
		final O dbObjBackup = getBackupObject(dbObj);
		boolean result = copyValues(dbObj, map);
		if (result) this.internalUpdate(dbObj);
		afterUpdate(dbObj, dbObjBackup);
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void update(O obj) {
		beforeUpdate(obj);
		O dbObj = getHibernateTemplate().load(clazz, obj.getId(), LockMode.PESSIMISTIC_WRITE);
		if (dbObj == null) throw SMSException.NO_MATCHABLE_OBJECT;
		final O dbObjBackup = getBackupObject(dbObj);
		boolean result = copyValues(obj, dbObj);
		if (result) this.internalUpdate(dbObj);
		afterUpdate(obj, dbObjBackup);
	}
	
	protected void beforeUpdate(int id, Map<String, Object> map) {
		// do nothing
	}
	
	protected void beforeUpdate(O obj) {
		// do nothing
	}
	
	protected O getBackupObject(O dbObj) {
		try {
			O backupObj = clazz.getConstructor().newInstance();
			backupObj.setId(dbObj.getId());
			backupObj.setCreated(dbObj.getCreated());
			backupObj.setLastUpdate(dbObj.getLastUpdate());
			backupObj.setDeleted(dbObj.isDeleted());
			copyValues(dbObj, backupObj);
			return backupObj;
		} catch (Exception e) {
			e.printStackTrace();
			throw new SMSException(e);
		}
	}
	
	protected void afterUpdate(O obj, O dbObj) {
		// do nothing
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void updateAll(Map<String, Object>[] maps) {
		beforeUpdateAll(maps);
		for (Map<String, Object> map : maps) {
			Integer id = ((Number) map.remove("id")).intValue();
			this.update(id, map);
		}
	}
	
	protected void beforeUpdateAll(Map<String, Object>[] maps) {
		// do nothing
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void updateExtend(int id, Map<String, Object> map) {
		Map<String, Object> commonFieldMap = getCommonFieldMap(map);
		Map<String, Object> customFieldMap = getCustomFieldMap(map);
		O dbObj = this.internalGetById(id);
		Map<String, Object> oldMap = this.convert(dbObj);
		this.update(id, commonFieldMap);
		oldMap.putAll(this.updateCustomFields(id, customFieldMap));
		afterUpdateExtend(id, map, oldMap);
	}
	
	protected Map<String, Object> updateCustomFields(int id, Map<String, Object> map) {
		// TODO: 对特殊的自定义字段类型，需要提供接口可供其实现一些特殊的业务功能，比如标签类型的数据，需要按照一定规则存储在标签自己所拥有的表中
		Map<String, Object> oldMap = new HashMap<String, Object>();
		Map<String, CustomFieldValueDO> keyMap = new HashMap<String, CustomFieldValueDO>();
		for (CustomFieldValueDO value : customFieldValueDao.getByActivityId(id)) {
			keyMap.put(value.getKey(), value);
		}
		for (String key : map.keySet()) {
			CustomFieldValueDO customFieldValue = keyMap.get(key);
			Object value = map.get(key);
			if (customFieldValue == null) {
				customFieldValue = new CustomFieldValueDO();
				ActivityDO activity = new ActivityDO();
				activity.setId(id);
				customFieldValue.setActivity(activity);
				customFieldValue.setKey(key);
				CustomFieldTypeDO type = customFieldTypeDao.getByFieldKey(key);
				String valueType = type.getType();
				if (value == null || "".equals(value) || "[]".equals(value)) {
					continue;
				} else if ("string".equals(valueType)) {
					customFieldValue.setStringValue((String) map.get(key));
				} else if ("date".equals(valueType)) {
					String date = (String) map.get(key);
					switch (date.length()) {
						case 10:
							customFieldValue.setDateValue(DateHelper.parseIsoDate(date));
							break;
						case 19:
							customFieldValue.setDateValue(DateHelper.parseIsoSecond(date));
							break;
					}
				} else if ("number".equals(valueType)) {
					customFieldValue.setNumberValue(((Number) map.get(key)).doubleValue());
				} else if ("text".equals(valueType)) {
					customFieldValue.setTextValue((String) map.get(key));
				} else if ("array".equals(valueType)) {
					customFieldValue.setTextValue(gson.toJson(map.get(key)));
				}
				oldMap.put(key, null);
				customFieldValueDao.internalSave(customFieldValue);
			} else {
				CustomFieldTypeDO type = customFieldTypeDao.getByFieldKey(key);
				String valueType = type.getType();
				if ("string".equals(valueType)) {
					if (ObjectUtils.equals(value, customFieldValue.getStringValue())) continue;
					oldMap.put(key, customFieldValue.getStringValue());
					if (value == null || ((String) value).isEmpty()) {
						customFieldValueDao.internalDelete(customFieldValue);
						continue;
					}
					customFieldValue.setStringValue((String) value);
				} else if ("date".equals(valueType)) {
					Date date = null;
					if (value != null) {
						String dateString = (String) value;
						switch (dateString.length()) {
							case 10:
								date = DateHelper.parseIsoDate(dateString);
								break;
							case 19:
								date = DateHelper.parseIsoSecond(dateString);
								break;
						}
					}
					if (ObjectUtils.equals(date, customFieldValue.getDateValue())) continue;
					oldMap.put(key, customFieldValue.getDateValue());
					if (date == null) {
						customFieldValueDao.internalDelete(customFieldValue);
						continue;
					}
					customFieldValue.setDateValue(date);
				} else if ("number".equals(valueType)) {
					if (ObjectUtils.equals(value, customFieldValue.getNumberValue())) continue;
					oldMap.put(key, customFieldValue.getNumberValue());
					if (value == null) {
						customFieldValueDao.internalDelete(customFieldValue);
						continue;
					}
					customFieldValue.setNumberValue(((Number) value).doubleValue());
				} else if ("text".equals(valueType)) {
					if (ObjectUtils.equals(value, customFieldValue.getTextValue())) continue;
					oldMap.put(key, customFieldValue.getTextValue());
					if (value == null || ((String) value).isEmpty()) {
						customFieldValueDao.internalDelete(customFieldValue);
						continue;
					}
					customFieldValue.setTextValue((String) value);
				} else if ("array".equals(valueType)) {
					if (value == null || ((Collection<?>) value).isEmpty()) {
						oldMap.put(key, null);
						customFieldValueDao.internalDelete(customFieldValue);
						continue;
					}
					String json = gson.toJson(value);
					if (ObjectUtils.equals(json, customFieldValue.getTextValue())) continue;
					oldMap.put(key, customFieldValue.getTextValue());
					customFieldValue.setTextValue(json);
				}
				customFieldValueDao.internalUpdate(customFieldValue);
			}
		}
		return oldMap;
	}
	
	protected void afterUpdateExtend(int id, Map<String, Object> map, Map<String, Object> oldMap) {
		map.clear();
		map.putAll(this.getById(id));
		Map<String, Object> customFieldMap = customFieldValueDao.findByIds(new String[] { Integer.toString(id) }).get(id);
		if (customFieldMap != null) map.putAll(customFieldMap);
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void delete(String[] ids) {
		List<O> list = internalGetByIds(ids);
		beforeDelete(list);
		this.internalDelete(list);
		afterDelete(list);
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void delete(Collection<O> list) {
		beforeDelete(list);
		this.internalDelete(list);
		afterDelete(list);
	}
	
	protected void beforeDelete(Collection<O> collection) {
		// do nothing
	}
	
	protected void afterDelete(Collection<O> collection) {
		// do nothing
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void markAsDeleted(String[] ids) {
		List<O> list = internalGetByIds(ids);
		beforeDelete(list);
		for (O obj : list) {
			obj.setDeleted(true);
		}
		this.getHibernateTemplate().saveOrUpdateAll(list);
		afterDelete(list);
	}
	
	protected boolean copyValues(O o, Map<String, Object> map) {
		try {
			boolean modified = false;
			for (Map.Entry<String, Object> entry : map.entrySet()) {
				String key = entry.getKey();
				Object value = entry.getValue();
				Field field = clazz.getDeclaredField(key);
				Class<?> type = field.getType();
				Method getter = BeanHelper.determineGetter(clazz, key);
				Object obj = getter.invoke(o);
				modified = copyValue(o, key, value, field, type, obj) || modified;
			}
			return modified;
		} catch (Exception e) {
			e.printStackTrace();
			throw new SMSException(e);
		}
	}
	
	protected boolean copyValues(O src, O dest, String... ignoreFields) {
		try {
			final Field[] fields = clazz.getDeclaredFields();
			boolean modified = false;
			for (final Field field : fields) {
				String modifiers = Integer.toBinaryString(field.getModifiers() + 4096);
				if (modifiers.charAt(5) == '1' || modifiers.charAt(9) == '1') continue;
				if (ignoreFields != null && ArrayUtils.contains(ignoreFields, field.getName())) {
					continue;
				}
				Method getter = BeanHelper.determineGetter(clazz, field.getName());
				Method setter = BeanHelper.determineSetter(clazz, field.getName());
				final Object srcFieldValue = getter.invoke(src);
				final Object destFieldValue = getter.invoke(dest);
				if (field.getType().isPrimitive() == true) {
					if (!ObjectUtils.equals(destFieldValue, srcFieldValue)) {
						setter.invoke(dest, srcFieldValue);
						modified = true;
					}
				} else if (srcFieldValue == null) {
					if (field.getType() == String.class) {
						if (StringUtils.isNotEmpty((String) destFieldValue)) {
							setter.invoke(dest, srcFieldValue);
							modified = true;
						}
					} else if (destFieldValue != null) {
						setter.invoke(dest, srcFieldValue);
						modified = true;
					} else {
						// dest was already null
					}
				} else if (srcFieldValue instanceof Collection) {
					@SuppressWarnings("unchecked")
					final Collection<Object> srcColl = (Collection<Object>) srcFieldValue;
					@SuppressWarnings("unchecked")
					Collection<Object> destColl = (Collection<Object>) destFieldValue;
					final Collection<Object> toRemove = new ArrayList<Object>();
					if (destColl == null) {
						if (srcColl instanceof Set) {
							destColl = new HashSet<Object>();
						} else if (srcColl instanceof List) {
							destColl = new ArrayList<Object>();
						} else {
							log.error("Unsupported collection type: " + srcColl.getClass().getName());
						}
						setter.invoke(dest, destColl);
					}
					for (final Object o : destColl) {
						if (!srcColl.contains(o)) toRemove.add(o);
					}
					for (final Object o : toRemove) {
						if (log.isDebugEnabled()) {
							log.debug("Removing collection entry: " + o);
						}
						destColl.remove(o);
						modified = true;
					}
					for (final Object srcEntry : srcColl) {
						if (!destColl.contains(srcEntry)) {
							if (log.isDebugEnabled() == true) {
								log.debug("Adding new collection entry: " + srcEntry);
							}
							destColl.add(srcEntry);
							modified = true;
						}
					}
				} else if (srcFieldValue instanceof AbstractBaseDO) {
					final Serializable srcFieldValueId = ((AbstractBaseDO) srcFieldValue).getId();
					if (srcFieldValueId != null) {
						if (destFieldValue == null || !ObjectUtils.equals(srcFieldValueId, ((AbstractBaseDO) destFieldValue).getId())) {
							setter.invoke(dest, srcFieldValue);
							modified = true;
						}
					} else {
						log.error("Can't get id though can't copy the BaseDO (see error message above about HHH-3502).");
					}
				} else if (srcFieldValue instanceof Date) {
					if (destFieldValue == null || ((Date) srcFieldValue).getTime() != ((Date) destFieldValue).getTime()) {
						setter.invoke(dest, srcFieldValue);
						modified = true;
					}
				} else if (srcFieldValue instanceof BigDecimal) {
					if (destFieldValue == null || ((BigDecimal) srcFieldValue).compareTo((BigDecimal) destFieldValue) != 0) {
						setter.invoke(dest, srcFieldValue);
						modified = true;
					}
				} else if (!ObjectUtils.equals(destFieldValue, srcFieldValue)) {
					setter.invoke(dest, srcFieldValue);
					modified = true;
				}
			}
			return modified;
		} catch (Exception e) {
			e.printStackTrace();
			throw new SMSException(e);
		}
	}
	
	protected boolean copyValue(O o, String key, Object value, Field field, Class<?> type, Object obj) throws Exception {
		if ((value == null || (type != String.class && "".equals(value))) && obj == null) {
			return false;
		} else if ((value == null || (type != String.class && "".equals(value))) && obj != null) {
			value = null;
			Method setter = BeanHelper.determineSetter(clazz, key);
			setter.invoke(o, value);
			return true;
		} else if (type == Boolean.class || type == boolean.class) {
			if (value instanceof String) value = Boolean.parseBoolean((String) value);
			if (value.equals(obj)) return false;
			Method setter = BeanHelper.determineSetter(clazz, key);
			setter.invoke(o, value);
			return true;
		} else if (type == String.class) {
			if (value.equals(obj)) return false;
			Method setter = BeanHelper.determineSetter(clazz, key);
			setter.invoke(o, value);
			return true;
		} else if (type == Integer.class || type == int.class) {
			if (value instanceof String) value = Double.parseDouble((String) value);
			value = ((Number) value).intValue();
			if (value.equals(obj)) return false;
			Method setter = BeanHelper.determineSetter(clazz, key);
			setter.invoke(o, value);
			return true;
		} else if (type == Double.class || type == double.class) {
			if (value instanceof String) value = Double.parseDouble((String) value);
			if (value.equals(obj)) return false;
			Method setter = BeanHelper.determineSetter(clazz, key);
			setter.invoke(o, value);
			return true;
		} else if (type == Date.class) {
			if (value instanceof String) {
				String date = (String) value;
				switch (date.length()) {
					case 10:
						value = DateHelper.parseIsoDate(date);
						break;
					case 19:
						value = DateHelper.parseIsoSecond(date);
						break;
				}
			}
			if (value == null || value.equals(obj)) return false;
			Method setter = BeanHelper.determineSetter(clazz, key);
			setter.invoke(o, value);
			return true;
		} else if (AbstractBaseDO.class.isAssignableFrom(type)) {
			value = ((Number) value).intValue();
			Integer objId = obj == null ? null : ((AbstractBaseDO) obj).getId();
			if (value.equals(objId)) return false;
			AbstractBaseDO baseDO = (AbstractBaseDO) type.newInstance();
			baseDO.setId((Integer) value);
			Method setter = BeanHelper.determineSetter(clazz, key);
			setter.invoke(o, baseDO);
			return true;
		} else if (Collection.class.isAssignableFrom(type)) {
			Class<?> componentType = (Class<?>) ((ParameterizedType) field.getGenericType()).getActualTypeArguments()[0];
			if (!AbstractBaseDO.class.isAssignableFrom(componentType)) return false;
			List<Double> list = new ArrayList<Double>();
			if (obj != null) {
				for (Object component : (Collection<?>) obj) {
					list.add(((AbstractBaseDO) component).getId().doubleValue());
				}
			}
			@SuppressWarnings("unchecked")
			List<Double> ids = (List<Double>) value;
			if (isEqual(list.toArray(new Double[0]), ids.toArray(new Double[0]))) return false;
			Collection<AbstractBaseDO> collection;
			if (type == List.class) {
				collection = new ArrayList<AbstractBaseDO>();
			} else if (type == Set.class) {
				collection = new HashSet<AbstractBaseDO>();
			} else {
				return false;
			}
			for (Double id : ids) {
				AbstractBaseDO baseDO = (AbstractBaseDO) componentType.newInstance();
				baseDO.setId(id.intValue());
				collection.add(baseDO);
			}
			Method setter = BeanHelper.determineSetter(clazz, key);
			setter.invoke(o, collection);
			return true;
		}
		return false;
	}
	
	private boolean isEqual(Double[] ary1, Double[] ary2) {
		Arrays.sort(ary1);
		Arrays.sort(ary2);
		return Arrays.equals(ary1, ary2);
	}
	
	public List<Map<String, Object>> convert(List<O> list) {
		return convert(list, true);
	}
	
	public List<Map<String, Object>> convert(List<O> list, List<String> fields) {
		return convert(list, fields, true);
	}
	
	public List<Map<String, Object>> convert(List<O> list, boolean showExtendFields) {
		return convert(list, null, showExtendFields);
	}
	
	public List<Map<String, Object>> convert(List<O> list, List<String> fields, boolean showExtendFields) {
		List<Map<String, Object>> mapList = new ArrayList<Map<String, Object>>();
		for (O o : list) {
			Map<String, Object> map = new HashMap<String, Object>();
			setFields(map, o, clazz, fields, true, showExtendFields);
			mapList.add(map);
		}
		return mapList;
	}
	
	public Map<String, Object> convert(O obj) {
		return convert(obj, null);
	}
	
	public Map<String, Object> convert(O obj, List<String> fields) {
		return convert(obj, fields, true);
	}
	
	public Map<String, Object> convert(O obj, boolean showExtendFields) {
		return convert(obj, null, showExtendFields);
	}
	
	public Map<String, Object> convert(O obj, List<String> fields, boolean showExtendFields) {
		return convert(obj, fields, false, showExtendFields);
	}
	
	public Map<String, Object> convert(O obj, List<String> fields, boolean multiple, boolean showExtendFields) {
		if (obj == null) return null;
		Map<String, Object> map = new HashMap<String, Object>();
		setFields(map, obj, clazz, fields, multiple, showExtendFields);
		return map;
	}
	
	protected void setFields(Map<String, Object> map, Object obj, Class<?> claz, List<String> fields, boolean multiple, boolean showExtendFields) {
		if (showExtendFields) {
			for (String beanName : fieldExtensibleBeanNames) {
				IFieldExtensible bean = (IFieldExtensible) context.getBean(beanName);
				map.putAll(bean.getExtendFields(obj));
			}
		}
		for (Field field : claz.getDeclaredFields()) {
			if (fields != null && !fields.contains(field.getName())) continue;
			setField(map, obj, claz, multiple, field);
		}
		final Class<?> superClazz = claz.getSuperclass();
		if (superClazz != null) setFields(map, obj, superClazz, fields, multiple, showExtendFields);
	}
	
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		try {
			Class<?> type = field.getType();
			if (Modifier.isStatic(field.getModifiers())) return;
			if (Modifier.isFinal(field.getModifiers())) return;
			if (type == String.class || type == Integer.class || type == Double.class || type == Boolean.class || type == int.class || type == double.class || type == boolean.class) {
				Method getter = BeanHelper.determineGetter(claz, field.getName());
				map.put(field.getName(), getter.invoke(obj));
			} else if (type == Date.class || type == Timestamp.class) {
				Method getter = BeanHelper.determineGetter(claz, field.getName());
				Date date = (Date) getter.invoke(obj);
				if (date != null) {
					map.put(field.getName(), DateHelper.formatIsoDate(date));
				} else {
					map.put(field.getName(), null);
				}
			} else if (Enum.class.isAssignableFrom(type)) {
				Method getter = BeanHelper.determineGetter(claz, field.getName());
				map.put(field.getName(), getter.invoke(obj));
			} else if (AbstractBaseDO.class.isAssignableFrom(type)) {
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
						if (baseDO instanceof IDisplayable) {
							map.put(field.getName() + "DisplayName", ((IDisplayable) baseDO).getDisplayName());
						}
					}
				} else {
					map.put(field.getName(), null);
				}
			} else if (Collection.class.isAssignableFrom(type)) {
				Method getter = BeanHelper.determineGetter(claz, field.getName());
				Collection<?> collection = (Collection<?>) getter.invoke(obj);
				if (collection != null && collection.size() > 0) {
					List<Map<String, Object>> ids = new ArrayList<Map<String, Object>>();
					for (Object subObj : collection) {
						Map<String, Object> subMap = new HashMap<String, Object>();
						subMap.put("id", ((AbstractBaseDO) subObj).getId());
						if (subObj instanceof IDisplayable) subMap.put("name", ((IDisplayable) subObj).getDisplayName());
						ids.add(subMap);
					}
					map.put(field.getName(), ids);
				} else {
					map.put(field.getName(), null);
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
			throw new SMSException(e);
		}
	}
	
	public List<?> query(String hql, Object... parameters) {
		return this.getHibernateTemplate().find(hql, parameters);
	}
	
	public List<?> query(String hql, String[] paramNames, Object[] values) {
		return this.getHibernateTemplate().findByNamedParam(hql, paramNames, values);
	}
	
	@Transactional(readOnly = true, propagation = Propagation.SUPPORTS)
	public List<?> query(final Integer firstResult, final Integer maxResults, final String hql, final Object... values) {
		// 获取数据
		List<?> list = this.getHibernateTemplate().executeWithNativeSession(new HibernateCallback<List<?>>() {
			
			@Override
			public List<?> doInHibernate(Session session) throws HibernateException, SQLException {
				Query query = session.createQuery(hql);
				prepareQuery(query);
				if (values != null) {
					for (int i = 0; i < values.length; i++) {
						query.setParameter(i, values[i]);
					}
				}
				if (firstResult != null) query.setFirstResult(firstResult);
				if (maxResults != null) query.setMaxResults(maxResults);
				List<?> list = query.list();
				return list;
			}
		});
		return list;
	}
	
	@Transactional(readOnly = true, propagation = Propagation.SUPPORTS)
	public PagedData pagedQuery(Integer firstResult, Integer maxResults, String hql, Object... values) {
		// 获取总数
		int count = this.queryCount(hql, values);
		
		// 获取数据
		List<?> list = this.query(firstResult, maxResults, hql, values);
		
		PagedData pagedData = new PagedData();
		pagedData.setTotalCount(count);
		pagedData.setData(list);
		return pagedData;
	}
	
	private int queryCount(String hql, Object... values) {
		// 获取总数
		String countHql = null;
		if (hql.startsWith("select")) {
			int pos = hql.indexOf("from");
			countHql = "select count(" + hql.substring(7, pos - 1) + ") " + hql.substring(pos);
		} else {
			countHql = "select count(*) " + hql;
		}
		@SuppressWarnings("unchecked")
		List<Long> counts = (List<Long>) this.query(null, null, countHql,values);
		
		return counts.get(0).intValue();
	}
	
	public Class<O> getClazz() {
		return clazz;
	}
	
	public void setContext(WebApplicationContext context) {
		this.context = context;
	}
	
	public void setCustomFieldTypeDao(CustomFieldTypeDao customFieldTypeDao) {
		this.customFieldTypeDao = customFieldTypeDao;
	}
	
	public void setCustomFieldValueDao(CustomFieldValueDao customFieldValueDao) {
		this.customFieldValueDao = customFieldValueDao;
	}
	
}
