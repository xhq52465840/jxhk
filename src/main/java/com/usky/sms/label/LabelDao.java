
package com.usky.sms.label;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import org.apache.commons.lang.StringUtils;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.core.BaseDao;

public class LabelDao extends BaseDao<LabelDO> {
	
	public LabelDao() {
		super(LabelDO.class);
	}
	
	public List<String> getLabels(String filter) {
		if (filter == null || filter.trim().length() == 0) return getLabels();
		String transferredContent = filter.replaceAll("/", "//").replaceAll("%", "/%").replaceAll("_", "/_");
		transferredContent = "%" + transferredContent + "%";
		@SuppressWarnings("unchecked")
		List<String> labels = this.getHibernateTemplate().find("select distinct label from LabelDO where upper(label) like upper(?)", transferredContent);
		return labels;
	}
	
	public List<String> getLabels() {
		@SuppressWarnings("unchecked")
		List<String> labels = this.getHibernateTemplate().find("select distinct label from LabelDO");
		return labels;
	}
	
	public List<String> getLabels(int activityId) {
		@SuppressWarnings("unchecked")
		List<String> labels = this.getHibernateTemplate().find("select distinct label from LabelDO where activity.id = ?", activityId);
		return labels;
	}
	
	/**
	 * 通过activityId的list查询对应的label字符串的map(key:activityId, value:labelList)
	 * @param activityIds
	 * @return label字符串的map
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> getLabels(List<Integer> activityIds) {
		if (null == activityIds || activityIds.isEmpty()) {
			return Collections.emptyMap();
		}
		List<Object[]> objs = (List<Object[]>) getHibernateTemplate().findByNamedParam("select distinct activity.id, label from LabelDO where activity.id in (:ids)", "ids", activityIds);
		return this.getLabelsGroupByActivityId(objs);
	}
	
	/**
	 * 通过activityId的list查询对应的label字符串的map(key:activityId, value:labelList)
	 * <br>
	 * 调用前先将activityid插入到临时表中
	 * @return label字符串的map
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> getLabelsThroughTempTable() {
		List<Object[]> objs = (List<Object[]>) getHibernateTemplate().find("select distinct activity.id, label from LabelDO where activity.id in (select id from TempTableDO)");
		return this.getLabelsGroupByActivityId(objs);
	}

	/**
	 * 将查询出的label以安全信息的id分组返回
	 * @param objs
	 * @return
	 */
	@SuppressWarnings("unchecked")
	private Map<String, Object> getLabelsGroupByActivityId(List<Object[]> objs) {
		Map<String, Object> labelMap = new HashMap<>();
		for (Object[] obj : objs) {
			String id = obj[0].toString();
			String label = (String) obj[1];
			List<String> labels;
			if (!labelMap.containsKey(id)) {
				labels = new ArrayList<>();
				labels.add(label);
				labelMap.put(id, labels);
			} else {
				labels = (List<String>) labelMap.get(id);
				labels.add(label);
			}
		}
		return labelMap;
	}
	
	public List<LabelDO> getLabels(int id, List<String> labels) {
		StringBuilder hql = new StringBuilder("from LabelDO where activity.id = :activityId");
		List<String> paramNames = new ArrayList<String>();
		List<Object> values = new ArrayList<Object>();
		paramNames.add("activityId");
		values.add(id);
		if (!labels.isEmpty()) {
			hql.append(" and label in (:labels)");
			paramNames.add("labels");
			values.add(labels);
		}
		@SuppressWarnings("unchecked")
		List<LabelDO> list = this.getHibernateTemplate().findByNamedParam(hql.toString(), paramNames.toArray(new String[0]), values.toArray());
		return list;
	}
	
	/**
	 * 删除安全信息的标签<br>
	 * 如果该标签还存在其他安全信息中，则删除该安全信息的标签，否则将该安全信息的标签的安全信息设置为null
	 * @param id
	 * @param labels
	 */
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void deleteActivitLabel(int id, List<String> labels) {
		if (null != labels && !labels.isEmpty()) {
			// 数据库中已存在的标签
			@SuppressWarnings("unchecked")
			List<String> other = (List<String>) this.query("select distinct label from LabelDO where label in (?) and (activity.id <> ? or activity is null)", StringUtils.join(labels, ","), id);
			// 待删除的安全信息的标签
			List<LabelDO> list = this.getLabels(id, labels);
			for (LabelDO label : list) {
				if (other.contains(label.getLabel())) {
					this.internalDelete(label);
				} else {
					label.setActivity(null);
					this.update(label);
				}
			}
		}
	}
	
	/**
	 * 通过activityId的list获取ProcessorDO的UserDO的Map
	 * @param activityIds activityId的list
	 * @return ProcessorDO的UserDO的list
	 */
	@SuppressWarnings("unchecked")
	public Map<String, List<String>> getLabelsByActivityIds(List<Integer> activityIds){
		Map<String, List<String>> map = new HashMap<String, List<String>>();
		if (null != activityIds && !activityIds.isEmpty()) {
			List<Object[]> objs = (List<Object[]>) getHibernateTemplate()
					.findByNamedParam(
							"select p.activity.id, p.label from LabelDO p where p.deleted = false and p.activity.id in (:ids)",
							"ids", activityIds);
			// 将查询出来的结果按activityId分组
			for (Object[] obj : objs) {
				String activityId = obj[0].toString();
				String label = (String) obj[1];
				if (map.containsKey(activityId)) {
					map.get(activityId).add(label);
				} else {
					List<String> labels = new ArrayList<String>();
					labels.add(label);
					map.put(activityId, labels);
				}
			}

		}
		return map;
	}
	
	/**
	 * 根据activityId获取要更新到solr里的标签<br>
	 * @param activityId
	 * @return
	 */
	public Map<String, Object> getLabelsForSolr(List<Integer> activityIds) {
		Map<String, Object> result = new HashMap<String, Object>();
		Map<String, List<String>> labelsMap = this.getLabelsByActivityIds(activityIds);
		for(Entry<String, List<String>> entry : labelsMap.entrySet()){
			List<String> labels = entry.getValue();
			if (labels != null && !labels.isEmpty()) {
				Map<String, Object> map = new HashMap<String, Object>();
				map.put("label", StringUtils.join(labels, " "));
				result.put(entry.getKey(), map);
			}
		}
		return result;
	}
	
}
