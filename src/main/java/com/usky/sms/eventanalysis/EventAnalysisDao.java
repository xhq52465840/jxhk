
package com.usky.sms.eventanalysis;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import org.apache.commons.lang.StringUtils;
import org.apache.log4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.common.NumberHelper;
import com.usky.sms.core.BaseDao;
import com.usky.sms.dictionary.DictionaryDO;
import com.usky.sms.dictionary.DictionaryDao;
import com.usky.sms.log.ActivityLoggingDao;
import com.usky.sms.log.operation.ActivityLoggingOperationRegister;
import com.usky.sms.solr.SolrService;
import com.usky.sms.tem.ActionItemDO;
import com.usky.sms.tem.ActionItemDao;
import com.usky.sms.tem.ActionItemOperationDao;

public class EventAnalysisDao extends BaseDao<EventAnalysisDO> {
	
	@Autowired
	private ActionItemDao actionItemDao;
	
	@Autowired
	private ActivityLoggingDao activityLoggingDao;
	
	@Autowired
	private DictionaryDao dictionaryDao;
	
	@Autowired
	private ActionItemOperationDao actionItemOperationDao;
	
	@Autowired
	private SolrService solrService;
	
	public EventAnalysisDao() {
		super(EventAnalysisDO.class);
	}
	
	@SuppressWarnings("unchecked")
	@Override
	protected Object getQueryParamValue(String key, Object value) {
		if ("id".equals(key) || "actionItem.id".equals(key) || "activity.id".equals(key) || "defectType.id".equals(key) || "measureType.id".equals(key)) {
			if (null == value) {
				return null;
			}
			if (value instanceof Collection || value instanceof Object[]) {
				List<Integer> resultList = new ArrayList<Integer>();
				if (value instanceof Collection) {
					for (Object o : (Collection<Object>) value) {
						resultList.add((Integer) getQueryParamValue(key, o));
					}
				} else {
					for (Object o : (Object[]) value) {
						resultList.add((Integer) getQueryParamValue(key, o));
					}
				}
				return resultList;
			} else if (value instanceof Number) {
				return ((Number) value).intValue();
			}
			return (NumberHelper.toInteger((String) value));
		}
		return super.getQueryParamValue(key, value);
	}
	
	public List<EventAnalysisDO> getByActivityId(int activityId) {
		@SuppressWarnings("unchecked")
		List<EventAnalysisDO> list = this.getHibernateTemplate().find("from EventAnalysisDO t where t.deleted = false and activity.id = ? order by created", activityId);
		return list;
	}
	
	public List<ActionItemDO> getActionItemByActivityId(int activityId) {
		@SuppressWarnings("unchecked")
		List<ActionItemDO> list = this.getHibernateTemplate().find("select distinct t.actionItem from EventAnalysisDO t where t.deleted = false and t.actionItem.deleted = false and t.activity.id = ?", activityId);
		return list;
	}
	
	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		EventAnalysisDO eventAnalysis = (EventAnalysisDO) obj;
		if ("actionItem".equals(field.getName())) {
			map.put("actionItem", actionItemDao.convert(eventAnalysis.getActionItem()));
		}
		super.setField(map, obj, claz, multiple, field);
	}
	
	@Override
	protected void afterSave(EventAnalysisDO obj) {
		// 向solr中更新事件分析
		updateEventAnalysisInfoToSolr(obj);
		// 添加活动日志
		this.addActivityLoggingForUpdateEventAnalysis(obj, null);
	}
	
	@Override
	protected void afterUpdate(EventAnalysisDO obj, EventAnalysisDO dbObj) {
		// 向solr中更新事件分析
		updateEventAnalysisInfoToSolr(obj);
		// 添加活动日志
		this.addActivityLoggingForUpdateEventAnalysis(obj, dbObj);
	}
	
	/**
	 * 更新事件分析的信息到solr<br>
	 * 包括缺陷类型，缺陷分析，措施类型，行动项
	 * 
	 * @param obj
	 */
	public void updateEventAnalysisInfoToSolr(EventAnalysisDO obj) {
		if (null != obj) {
			Integer activityId = obj.getActivity().getId();
			updateEventAnalysisInfoToSolr(activityId);
		}
	}
	
	/**
	 * 更新事件分析的信息到solr<br>
	 * 包括缺陷类型，缺陷分析，措施类型，行动项
	 * 
	 * @param obj
	 */
	@SuppressWarnings("unchecked")
	public void updateEventAnalysisInfoToSolr(Integer activityId) {
		if (null != activityId) {
			List<Integer> activityIds = new ArrayList<Integer>();
			activityIds.add(activityId);
			Map<String, Object> map = this.getEventAnalysisInfoForSolr(activityIds);
			solrService.updateSolrFields("activity", activityId, (Map<String, Object>) map.get(activityId.toString()));
		}
	}
	
	/**
	 * 更新事件分析的信息到solr<br>
	 * 包括缺陷类型，缺陷分析，措施类型，行动项
	 * 
	 * @param obj
	 */
	@SuppressWarnings("unchecked")
	public void updateEventAnalysisInfoToSolr(List<Integer> activityIds) {
		if (null != activityIds && !activityIds.isEmpty()) {
			Map<String, Object> map = this.getEventAnalysisInfoForSolr(activityIds);
			for (Entry<String, Object> entry : map.entrySet()) {
				solrService.updateSolrFields("activity", Integer.parseInt(entry.getKey()), (Map<String, Object>) entry.getValue());
			}
		}
	}

	/**
	 * 添加更新事件分析的活动日志
	 * 
	 * @param eventAnalysis
	 * @param dbEventAnalysis
	 */
	private void addActivityLoggingForUpdateEventAnalysis(EventAnalysisDO eventAnalysis, EventAnalysisDO dbEventAnalysis) {
		List<String> details = new ArrayList<String>();
		// 缺陷类型
		DictionaryDO defectType = eventAnalysis == null ? null : eventAnalysis.getDefectType();
		DictionaryDO dbDefectType = dbEventAnalysis == null ? null : dbEventAnalysis.getDefectType();
		if (null != defectType && null == dbDefectType) {
			defectType = dictionaryDao.internalGetById(defectType.getId());
			details.add("添加缺陷类型:" + defectType.getName());
		} else if (!(null == defectType || null == dbDefectType || defectType.equals(dbDefectType))) {
			defectType = dictionaryDao.internalGetById(defectType.getId());
			dbDefectType = dictionaryDao.internalGetById(dbDefectType.getId());
			details.add("修改缺陷类型为:" + dbDefectType.getName() + " --> " + defectType.getName());
		}
		// 事件分析
		String defectAnalysis = eventAnalysis == null ? null : eventAnalysis.getDefectAnalysis();
		String dbDefectAnalysis = dbEventAnalysis == null ? null : dbEventAnalysis.getDefectAnalysis();
		if (null != defectAnalysis && null == dbDefectAnalysis) {
			details.add("添加事件分析:" + defectAnalysis);
		} else if (!(null == defectAnalysis || null == dbDefectAnalysis || defectAnalysis.equals(dbDefectAnalysis))) {
			details.add("修改事件分析为:" + dbDefectAnalysis + " --> " + defectAnalysis);
		}
		// 措施类型
		DictionaryDO measureType = eventAnalysis == null ? null : eventAnalysis.getMeasureType();
		DictionaryDO dbMeasureType = dbEventAnalysis == null ? null : dbEventAnalysis.getMeasureType();
		if (null != measureType && null == dbMeasureType) {
			measureType = dictionaryDao.internalGetById(measureType.getId());
			details.add("添加措施类型:" + measureType.getName());
		} else if (!(null == measureType || null == dbMeasureType || measureType.equals(dbMeasureType))) {
			measureType = dictionaryDao.internalGetById(measureType.getId());
			dbMeasureType = dictionaryDao.internalGetById(dbMeasureType.getId());
			details.add("修改措施类型为:" + dbMeasureType.getName() + " --> " + measureType.getName());
		}
		if (!details.isEmpty()) {
			MDC.put("details", details.toArray());
			activityLoggingDao.addLogging(eventAnalysis.getActivity().getId(), ActivityLoggingOperationRegister.getOperation("UPDATE_EVENT_ANALYSIS"));
			MDC.remove("details");
		}
	}
	
	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		return true;
	}
	
	@Override
	protected void beforeDelete(Collection<EventAnalysisDO> collection) {
	}

	@Override
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void delete(String[] ids) {
		this.markAsDeleted(ids);
	}
	
	@Override
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void delete(Collection<EventAnalysisDO> list) {
		List<String> ids = new ArrayList<String>();
		for (EventAnalysisDO eventAnalysis : list) {
			if (null != eventAnalysis) {
				ids.add(eventAnalysis.getId().toString());
			}
		}
		if (!ids.isEmpty()) {
			this.delete(ids.toArray(new String[0]));
		}
	}
	
	@Override
	protected void afterDelete(Collection<EventAnalysisDO> collection) {
		// 获取删除事件分析的activity的id,更新solr用
		List<Integer> activityIds = new ArrayList<Integer>();
		List<ActionItemDO> actionItems = new ArrayList<ActionItemDO>();
		for (EventAnalysisDO eventAnalysis : collection) {
			if (eventAnalysis.getActionItem() != null) {
				actionItems.add(eventAnalysis.getActionItem());
			}
			activityIds.add(eventAnalysis.getActivity().getId());
		}
		if (!actionItems.isEmpty()) {
			actionItemDao.deleteRelatedInfo(actionItems);
			actionItemDao.internalDelete(actionItems);
			actionItemDao.afterDelete(actionItems);
		}
		// 更新solr
		this.updateEventAnalysisInfoToSolr(activityIds);
	}
	
	/**
	 * 通过activityId的list获取事件分析信息的的map的Map
	 * 
	 * @param activityIds activityId的list
	 * @return 事件分析信息的的map的Map
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> getEventAnalysisInfoMapsByActivityIds(List<Integer> activityIds) {
		if (null == activityIds || activityIds.isEmpty()) {
			return Collections.emptyMap();
		}
		// 对应activity的所有航班信息
		StringBuffer hql = new StringBuffer("select distinct ea from EventAnalysisDO ea left join fetch ea.activity ")
		.append(" where ea.deleted = false and ea.activity.id in (:activityIds)");
		List<EventAnalysisDO> eventAnalysises = (List<EventAnalysisDO>) this.getHibernateTemplate().findByNamedParam(hql.toString(),"activityIds",activityIds);
		// 分组
		return this.getEventAnalysisInfoMapsGroupByActivityId(eventAnalysises);
	}
	
	/**
	 * 通过activityId的list获取事件分析信息的的map的Map
	 * 
	 * @param activityIds activityId的list
	 * @return 事件分析信息的的map的Map
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> getEventAnalysisInfoMapsThroughTempTable() {
		// 对应activity的所有航班信息
		StringBuffer hql = new StringBuffer("select distinct ea from EventAnalysisDO ea left join fetch ea.activity ")
		.append(" where ea.deleted = false and ea.activity.id in (select id from TempTableDO)");
		List<EventAnalysisDO> eventAnalysises = (List<EventAnalysisDO>) this.getHibernateTemplate().find(hql.toString());
		// 分组
		return this.getEventAnalysisInfoMapsGroupByActivityId(eventAnalysises);
	}
	
	/**
	 * 通过activityId的list获取事件分析信息的的map的Map
	 * 
	 * @param activityIds activityId的list
	 * @return 事件分析信息的的map的Map
	 */
	@SuppressWarnings("unchecked")
	private Map<String, Object> getEventAnalysisInfoMapsGroupByActivityId(List<EventAnalysisDO> eventAnalysises) {
		Map<String,Object> result = new HashMap<String, Object>();
		// 分组
		Map<String,Object> eventAnalysisMap = new HashMap<String, Object>();
		for (EventAnalysisDO eventAnalysis : eventAnalysises) {
			String activityId = eventAnalysis.getActivity().getId().toString();
			if (eventAnalysisMap.containsKey(activityId)) {
				((List<Object>) eventAnalysisMap.get(activityId)).add(eventAnalysis);
			} else {
				List<EventAnalysisDO> list = new ArrayList<EventAnalysisDO>();
				list.add(eventAnalysis);
				eventAnalysisMap.put(activityId, list);
			}
		}
		for (Entry<String, Object> entry : eventAnalysisMap.entrySet()) {
			eventAnalysises = (List<EventAnalysisDO>) entry.getValue();
			// 缺陷类型
			List<String> defectTypes = new ArrayList<String>();
			// 缺陷分析
			List<String> defectAnalysises = new ArrayList<String>();
			// 措施类型
			List<String> measureTypes = new ArrayList<String>();
			// 行动项
			List<String> actionItems = new ArrayList<String>();
			if (eventAnalysises != null) {
				for (EventAnalysisDO eventAnalysis : eventAnalysises){
					// 缺陷类型
					if (null != eventAnalysis.getDefectType()) {
						defectTypes.add(eventAnalysis.getDefectType().getName());
					} else {
						defectTypes.add("");
					}
					// 缺陷分析
					if (StringUtils.isNotBlank(eventAnalysis.getDefectAnalysis())) {
						defectAnalysises.add(eventAnalysis.getDefectAnalysis());
					} else {
						defectAnalysises.add("");
					}
					// 措施类型
					if (null != eventAnalysis.getMeasureType()) {
						measureTypes.add(eventAnalysis.getMeasureType().getName());
					} else {
						measureTypes.add("");
					}
					// 行动项
					if (eventAnalysis.getActionItem() != null && StringUtils.isNotBlank(eventAnalysis.getActionItem().getDescription())) {
						actionItems.add(eventAnalysis.getActionItem().getDescription());
					} else {
						actionItems.add("");
					}
				}
			}
			
			Map<String,Object> eventAnalysisInfoMap = new HashMap<String,Object>();
			eventAnalysisInfoMap.put("defectType", StringUtils.join(defectTypes, ";"));
			eventAnalysisInfoMap.put("defectAnalysis", StringUtils.join(defectAnalysises, ";"));
			eventAnalysisInfoMap.put("measureType", StringUtils.join(measureTypes, ";"));
			eventAnalysisInfoMap.put("actionItem", StringUtils.join(actionItems, ";"));
			
			result.put(entry.getKey(), eventAnalysisInfoMap);
		}
		return result;
	}
	
	/**
	 * 根据activityId获取要更新到solr里的事件分析的信息<br>
	 * 缺陷类型，缺陷分析，措施类型，行动项
	 * @param activityId
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> getEventAnalysisInfoForSolr(List<Integer> activityIds){
		Map<String,Object> result = new HashMap<String, Object>();
		// 对应activity的所有航班信息
		StringBuffer hql = new StringBuffer("select distinct ea from EventAnalysisDO ea left join fetch ea.activity ")
		.append(" where ea.deleted = false and ea.activity.id in (:activityIds)");
		List<EventAnalysisDO> eventAnalysises = (List<EventAnalysisDO>) this.getHibernateTemplate().findByNamedParam(hql.toString(),"activityIds",activityIds);
		// 分组
		Map<String,Object> eventAnalysisMap = new HashMap<String, Object>();
		for (EventAnalysisDO eventAnalysis : eventAnalysises) {
			String avtivityId = eventAnalysis.getActivity().getId().toString();
			if (eventAnalysisMap.containsKey(avtivityId)) {
				((List<Object>) eventAnalysisMap.get(avtivityId)).add(eventAnalysis);
			} else {
				List<EventAnalysisDO> list = new ArrayList<EventAnalysisDO>();
				list.add(eventAnalysis);
				eventAnalysisMap.put(avtivityId, list);
			}
		}
		for (Entry<String, Object> entry : eventAnalysisMap.entrySet()) {
			eventAnalysises = (List<EventAnalysisDO>) entry.getValue();
			// 缺陷类型
			List<Integer> defectTypeIds = new ArrayList<Integer>();
			// 缺陷分析
			List<String> defectAnalysises = new ArrayList<String>();
			// 措施类型
			List<Integer> measureTypeIds = new ArrayList<Integer>();
			// 行动项
			List<String> actionItems = new ArrayList<String>();
			for(EventAnalysisDO eventAnalysis : eventAnalysises){
				// 缺陷类型
				if (null != eventAnalysis.getDefectType()) {
					defectTypeIds.add(eventAnalysis.getDefectType().getId());
				}
				// 缺陷分析
				if (StringUtils.isNotBlank(eventAnalysis.getDefectAnalysis())) {
					defectAnalysises.add(eventAnalysis.getDefectAnalysis());
				}
				// 措施类型
				if (null != eventAnalysis.getMeasureType()) {
					measureTypeIds.add(eventAnalysis.getMeasureType().getId());
				}
				// 行动项
				if (eventAnalysis.getActionItem() != null && StringUtils.isNotBlank(eventAnalysis.getActionItem().getDescription())) {
					actionItems.add(eventAnalysis.getActionItem().getDescription());
				}
			}
			
			Map<String,Object> map = new HashMap<String,Object>();
			map.put("defectType", defectTypeIds);
			map.put("defectAnalysis", StringUtils.join(defectAnalysises, ";"));
			map.put("measureType", measureTypeIds);
			map.put("actionItem", StringUtils.join(actionItems, ";"));
			
			result.put(entry.getKey(), map);
		}
		return result;
	}
	
	/** 
	 * 保存或更新事件分析
	 * @param eventAnalysis 事件分析的map
	 */
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public Integer saveOrUpdateEventAnalysis(Map<String, Object> eventAnalysis) {
		// 先保存或更新事件分析，然后再保存或更新行动项
		@SuppressWarnings("unchecked")
		Map<String, Object> actionItem = (Map<String, Object>) eventAnalysis.remove("actionItem");
		Number eventAnalysisId = (Number) eventAnalysis.remove("id");
		if (eventAnalysisId != null) {
			this.update(eventAnalysisId.intValue(), eventAnalysis);
			if (actionItem == null) {
				// 删除行动项
				List<ActionItemDO> actionItems = this.getActionItemsByEventAnalysis(eventAnalysisId.intValue());
				if (!actionItems.isEmpty()) {
					actionItemDao.internalDelete(actionItems);
					actionItemDao.deleteRelatedInfo(actionItems);
				}
			}
		} else {
			eventAnalysisId = this.save(eventAnalysis);
		}
		if (actionItem != null) {
			if (actionItem.containsKey("id") && actionItem.get("id") != null) {
				Number actionItemId = (Number) actionItem.remove("id");
				actionItemDao.update(actionItemId.intValue(), actionItem);
			} else {
				actionItem.remove("id");
				actionItem.put("eventAnalysis", eventAnalysisId);
				actionItemDao.save(actionItem);
			}
		}
		return eventAnalysisId.intValue();
	}
	
	/**
	 * 根据事件分析的id获取行动项
	 * @param eventAnalysis
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<ActionItemDO> getActionItemsByEventAnalysis(Integer eventAnalysis) {
		return (List<ActionItemDO>) this.query("from ActionItemDO t where t.eventAnalysis.id = ?", eventAnalysis);
	}
	
	public void setActionItemDao(ActionItemDao actionItemDao) {
		this.actionItemDao = actionItemDao;
	}

	public void setActivityLoggingDao(ActivityLoggingDao activityLoggingDao) {
		this.activityLoggingDao = activityLoggingDao;
	}

	public void setDictionaryDao(DictionaryDao dictionaryDao) {
		this.dictionaryDao = dictionaryDao;
	}

	public void setActionItemOperationDao(ActionItemOperationDao actionItemOperationDao) {
		this.actionItemOperationDao = actionItemOperationDao;
	}

	public void setSolrService(SolrService solrService) {
		this.solrService = solrService;
	}
	
}
