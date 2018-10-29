
package com.usky.sms.custom;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.core.BaseDao;
import com.usky.sms.field.FieldRegister;
import com.usky.sms.search.template.ISearchTemplate;
import com.usky.sms.search.template.SearchTemplateRegister;

public class CustomFieldValueDao extends BaseDao<CustomFieldValueDO> {
	
	@Autowired
	private FieldRegister fieldRegister;
	
	public void setFieldRegister(FieldRegister fieldRegister) {
		this.fieldRegister = fieldRegister;
	}
	
	public CustomFieldValueDao() {
		super(CustomFieldValueDO.class);
	}
	
	public List<CustomFieldValueDO> getByActivityId(int activityId) {
		@SuppressWarnings("unchecked")
		List<CustomFieldValueDO> list = this.getHibernateTemplate().find("from CustomFieldValueDO where activity.id = ?", activityId);
		return list;
	}
	
	public List<CustomFieldValueDO> getByActivityIds(List<Integer> activityIds) {
		StringBuffer hql = new StringBuffer("select distinct t from CustomFieldValueDO t left join fetch t.activity")
		.append(" where t.activity.id in (:ids)");
		@SuppressWarnings("unchecked")
		List<CustomFieldValueDO> values = this.getHibernateTemplate().findByNamedParam(hql.toString(),"ids",activityIds);
		return values;
	}
	
	
	public List<CustomFieldValueDO> getByActivityId(int activityId,String keyValue) {
		@SuppressWarnings("unchecked")
		List<CustomFieldValueDO> list  = this.getHibernateTemplate().find("from CustomFieldValueDO where activity.id = ? and key=?", activityId,keyValue);
		return list;
	}
	
	@SuppressWarnings("unchecked")
	public Map<Integer, Map<String, Object>> findByIds(String[] ids) {
		if (ids == null || ids.length == 0) {
			return null;
		}
		List<CustomFieldValueDO> list = this.getHibernateTemplate().find("from CustomFieldValueDO where activity.id in (" + StringUtils.join(ids, ",") + ")");
		return this.getCustomFieldDisplayValueGroupByActivityId(list);
	}
	
	/**
	 * 调用前先将activityid插入到临时表中
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public Map<Integer, Map<String, Object>> findByActivityIdsThroughTempTable() {
		List<CustomFieldValueDO> list = this.getHibernateTemplate().find("from CustomFieldValueDO where activity.id in (select id from TempTableDO)");
		return this.getCustomFieldDisplayValueGroupByActivityId(list);
	}
	
	/**
	 * 获取自定义字段的显示值，以安全信息id为key
	 * @param list
	 * @return
	 */
	private Map<Integer, Map<String, Object>> getCustomFieldDisplayValueGroupByActivityId(List<CustomFieldValueDO> list) {
		Map<Integer, Map<String, Object>> m_result = new LinkedHashMap<Integer, Map<String, Object>>();
		for (CustomFieldValueDO cfv : list) {
			Map<String, Object> m_kv;
			if (m_result.containsKey(cfv.getActivity().getId()))
				m_kv = m_result.get(cfv.getActivity().getId());
			else {
				m_kv = new LinkedHashMap<String, Object>();
				m_result.put(cfv.getActivity().getId(), m_kv);
			}
			
			//System.out.println("key = " + cfv.getKey());
			ISearchTemplate ist = SearchTemplateRegister.getSearchTemplate(fieldRegister.getFieldSearcher(cfv.getKey()));
			if (ist == null) continue;
			m_kv.put(cfv.getKey(), ist.getCustomFieldDisplayValue(cfv));
		}
		return m_result;
	}
	
	/**
	 * 删除自定义字段的值
	 */
	@Transactional(readOnly = false, propagation = Propagation.REQUIRES_NEW, isolation = Isolation.READ_COMMITTED)
	public void deleteCustomFieldValue(Integer activityId, String customFieldName) {
		for (com.usky.sms.field.Field field : fieldRegister.getAllFields()) {
			if (customFieldName.equals(field.getName())) {
				List<CustomFieldValueDO> list = this.getByActivityId(activityId, field.getKey());
				this.delete(list);
				break;
			}
		}
	}
	
}
