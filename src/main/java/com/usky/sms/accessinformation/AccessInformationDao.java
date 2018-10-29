
package com.usky.sms.accessinformation;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.log4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.common.DateHelper;
import com.usky.sms.core.BaseDao;
import com.usky.sms.log.ActivityLoggingDao;
import com.usky.sms.log.operation.ActivityLoggingOperationRegister;
import com.usky.sms.solr.SolrService;

public class AccessInformationDao extends BaseDao<AccessInformationDO> {
	
	@Autowired
	private ActivityLoggingDao activityLoggingDao;
	
	@Autowired
	private SolrService solrService;
	
	public AccessInformationDao() {
		super(AccessInformationDO.class);
	}
	
	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		String fieldName = field.getName();
		AccessInformationDO accessInformation = (AccessInformationDO) obj;
		if ("occurredDate".equals(fieldName)) {
			if (accessInformation.getOccurredDate() != null) map.put(fieldName, DateHelper.formatIsoSecond(accessInformation.getOccurredDate()));
		} else {
			super.setField(map, obj, claz, multiple, field);
		}
	}
	
	public AccessInformationDO getByActivityId(Integer activityId) {
		@SuppressWarnings("unchecked")
		List<AccessInformationDO> list = this.getHibernateTemplate().find("select distinct a from AccessInformationDO a left join fetch a.activity where a.activity.id = ?", activityId);
		if (list.isEmpty()) return null;
		return list.get(0);
	}
	
	@SuppressWarnings("unchecked")
	public List<AccessInformationDO> getByActivityIds(List<Integer> activityIds) {
		if (null != activityIds && !activityIds.isEmpty()) {
			return this.getHibernateTemplate().findByNamedParam("select distinct a from AccessInformationDO a left join fetch a.activity where a.activity.id in (:ids)","ids", activityIds);
		} else {
			return new ArrayList<AccessInformationDO>();
		}
	}

	@Override
	protected void afterSave(AccessInformationDO obj) {
		// 更新solr
		updateOccurredDateToSolr(obj);
		// 添加活动日志
		List<String> details = new ArrayList<String>();
		details.add("添加发生时间为:" + DateHelper.formatIsoSecond(obj.getOccurredDate()));
		MDC.put("details", details.toArray());
		activityLoggingDao.addLogging(obj.getActivity().getId(), ActivityLoggingOperationRegister.getOperation("ADD_ACCESSINFO_OCCURRENCETIME"));
		MDC.remove("details");
	}

	@Override
	protected void afterUpdate(AccessInformationDO obj, AccessInformationDO dbObj) {
		// 更新solr
		updateOccurredDateToSolr(obj);
		// 添加活动日志
		List<String> details = new ArrayList<String>();
		details.add("将发生时间修改为:" + DateHelper.formatIsoSecond(obj.getOccurredDate()));
		MDC.put("details", details.toArray());
		activityLoggingDao.addLogging(obj.getActivity().getId(), ActivityLoggingOperationRegister.getOperation("UPDATE_ACCESSINFO_OCCURRENCETIME"));
		MDC.remove("details");
	}
	
	private void updateOccurredDateToSolr(AccessInformationDO obj){
		solrService.updateSolrField("activity", obj.getActivity().getId(), "occurredDate",obj.getOccurredDate());
	}
	
	/**
	 * 根据activityId获取要更新到solr里的发生时间<br>
	 * @param activityId
	 * @return
	 */
	public Map<String, Object> getOccurredDateForSolr(Integer activityId) {
		Map<String, Object> map = new HashMap<String, Object>();
		AccessInformationDO accessInformation = this.getByActivityId(activityId);
		if (null != accessInformation) {
			map.put("occurredDate", accessInformation.getOccurredDate());
		}
		return map;
	}
	
	/**
	 * 根据activityId获取要更新到solr里的发生时间<br>
	 * @param activityId
	 * @return
	 */
	public Map<String, Object> getOccurredDateForSolr(List<Integer> activityIds) {
		Map<String, Object> map = new HashMap<String, Object>();
		List<AccessInformationDO> accessInformations = this.getByActivityIds(activityIds);
		for (AccessInformationDO accessInformation : accessInformations) {
			Map<String, Object> occurredDateMap = new HashMap<String, Object>();
			occurredDateMap.put("occurredDate", accessInformation.getOccurredDate());
			map.put(accessInformation.getActivity().getId().toString(), occurredDateMap);
		}
		return map;
	}
	
	/**
	 * 通过activityId的list获取发生时间的map的Map(key是activityId)
	 * @param activityIds activityId的list
	 * @return 
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> getOccurredDateMapsByActivityIds(List<Integer> activityIds){
		if (null == activityIds || activityIds.isEmpty()) {
			return Collections.emptyMap();
		}
		List<Object[]> objs = (List<Object[]>) getHibernateTemplate()
				.findByNamedParam(
						"select a.activity.id, a.occurredDate from AccessInformationDO a where a.deleted = false and a.activity.id in (:ids)",
						"ids", activityIds);
		return this.getOccurredDateMapsGroupByActivityId(objs);
	}
	
	/**
	 * 通过activityId的list获取发生时间的map的Map(key是activityId)
	 * <br>
	 * 调用前先将activityid插入到临时表中
	 * @return 
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> getOccurredDateMapsThroughTempTable() {
		List<Object[]> objs = (List<Object[]>) getHibernateTemplate()
				.find("select a.activity.id, a.occurredDate from AccessInformationDO a where a.deleted = false and a.activity.id in (select id from TempTableDO)");
		return this.getOccurredDateMapsGroupByActivityId(objs);
	}
	
	/**
	 * 将查询出来的发生时间以安全信息id分组
	 * @param objs
	 * @return
	 */
	private Map<String, Object> getOccurredDateMapsGroupByActivityId(List<Object[]> objs) {
		Map<String, Object> result = new HashMap<String, Object>();
		for(Object[] obj : objs){
			result.put(obj[0].toString(), DateHelper.formatIsoSecond((Date) obj[1]));
		}
		return result;
	}

	/**
	 * @param activityLoggingDao the activityLoggingDao to set
	 */
	public void setActivityLoggingDao(ActivityLoggingDao activityLoggingDao) {
		this.activityLoggingDao = activityLoggingDao;
	}

	public void setSolrService(SolrService solrService) {
		this.solrService = solrService;
	}
	
}
