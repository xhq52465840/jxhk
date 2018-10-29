package com.usky.sms.tem.threat;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;
import com.usky.sms.dictionary.DictionaryDO;
import com.usky.sms.permission.PermissionSetDao;
import com.usky.sms.permission.PermissionSets;
import com.usky.sms.tem.control.ControlDO;
import com.usky.sms.tem.insecurity.InsecurityDO;
import com.usky.sms.user.UserContext;

public class ThreatDao extends BaseDao<ThreatDO> {

	@Autowired
	private PermissionSetDao permissionSetDao;

	protected ThreatDao() {
		super(ThreatDO.class);
	}

	@Override
	protected String getBaseHql(Map<String, Object> map) {
		boolean includeInsecurity = false;
		@SuppressWarnings("unchecked")
		List<List<Map<String, Object>>> insecurityList = (List<List<Map<String, Object>>>) map
				.get("rule");
		for (List<Map<String, Object>> list : insecurityList) {
			for (Map<String, Object> paramMap : list) {
				if ("insecurity".equals(paramMap.get("key"))) {
					includeInsecurity = true;
					break;
				}
			}
			if (includeInsecurity)
				break;
		}
		if (includeInsecurity) {
			return "select distinct t from "
					+ clazz.getSimpleName()
					+ " t left join t.insecuritys g where t.deleted = false and (";
		} else {
			return super.getBaseHql(map);
		}
	}

	@Override
	protected String getQueryParamName(String key) {
		if ("insecurity".equals(key))
			return "g.id";
		return super.getQueryParamName(key);
	}

	@Override
	protected Object getQueryParamValue(String key, Object value) {
		if ("insecurity".equals(key))
			return ((Number) value).intValue();
		return super.getQueryParamValue(key, value);
	}

	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz,
			boolean multiple, Field field) {
		String fieldName = field.getName();
		ThreatDO threat = (ThreatDO) obj;
		if ("name".equals(fieldName)) {
			map.put("num", threat.getNum());
			map.put("name", threat.getName());
		} else if ("riskLevelP".equals(fieldName)) {
			String vfyRisklevelColour = this.vfyRisklevelColour(
					threat.getRiskLevelP(), threat.getRiskLevelS());
			Integer no1 = threat.getRiskLevelP();
			Integer no2 = threat.getRiskLevelS();
			Integer riskTotal = null;
			if (null != no1 && null != no2) {
				riskTotal = no1 * no2;
			}
			map.put("riskTotal", riskTotal);
			map.put("colour", vfyRisklevelColour);
			map.put("riskLevelP", threat.getRiskLevelP());
		} else {
			super.setField(map, obj, claz, multiple, field);
		}

	}

	@Override
	protected void setFields(Map<String, Object> map, Object obj,
			Class<?> claz, List<String> fields, boolean multiple,
			boolean showExtendFields) {
		ThreatDO threat = (ThreatDO) obj;
		DictionaryDO dictionary = threat.getSystem();
		Set<InsecurityDO> insecurity = threat.getInsecuritys();
		Set<ControlDO> control = threat.getControls();
		List<Map<String, Object>> inseList = new ArrayList<Map<String, Object>>();
		List<Map<String, Object>> contList = new ArrayList<Map<String, Object>>();
		for (InsecurityDO insecurityDO : insecurity) {
			if (insecurityDO.isDeleted() == true) {
				continue;
			}
			Integer id = insecurityDO.getId();
			String num = insecurityDO.getNum();
			String name = insecurityDO.getName();
			Map<String, Object> inseMap = new HashMap<String, Object>();
			inseMap.put("id", id);
			inseMap.put("num", num);
			inseMap.put("name", name);
			inseList.add(inseMap);
		}
		for (ControlDO controlDO : control) {
			if (controlDO.isDeleted() == true) {
				continue;
			}
			Integer id = controlDO.getId();
			String number = controlDO.getNumber();
			String title = controlDO.getTitle();
			Map<String, Object> contMap = new HashMap<String, Object>();
			contMap.put("id", id);
			contMap.put("number", number);
			contMap.put("title", title);
			contList.add(contMap);
		}
		Collections.sort(inseList, new Comparator<Map<String, Object>>() {
			@Override
			public int compare(Map<String, Object> o1, Map<String, Object> o2) {
				return (o1.get("num") + "").compareTo(o2.get("num") + "");
			}
		});
		Collections.sort(contList, new Comparator<Map<String, Object>>() {
			@Override
			public int compare(Map<String, Object> o1, Map<String, Object> o2) {
				return (o1.get("number") + "").compareTo(o2.get("number") + "");
			}
		});
		map.put("insecuritys", inseList);
		map.put("controls", contList);
		if (dictionary != null) {
			map.put("systemDisplayName", dictionary.getDisplayName());
		} else {
			map.put("systemDisplayName", null);
		}
		super.setFields(map, obj, claz, fields, multiple, showExtendFields);
	}

	@Override
	public void afterGetList(java.util.Map<String, Object> map,
			java.util.Map<String, Object> ruleMap) {
		boolean perm = permissionSetDao
				.hasPermission(PermissionSets.MANAGE_TEM_DICTIONARY.getName());
		map.put("manageable", perm);
	};

	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		checkManagementPermission();
		map.put("creator", UserContext.getUserId());
		map.put("lastUpdater", UserContext.getUserId());
		return true;
	}

	@Override
	protected void beforeUpdate(int id, Map<String, Object> map) {
		checkManagementPermission();
		map.put("lastUpdater", UserContext.getUserId());
	}

	@Override
	protected void beforeDelete(Collection<ThreatDO> collection) {
		checkManagementPermission();
	}

	@Override
	@Transactional(readOnly = false, propagation = Propagation.REQUIRES_NEW, isolation = Isolation.READ_COMMITTED)
	public void delete(String[] ids) {
		this.markAsDeleted(ids);
	}

	/*
	 * 按照二级分类分组返回威胁
	 */
	public List<Map<String, Object>> getThreatForInputActivity(
			Integer systemId, Integer insecurityId, String category) {
		String hql = "select distinct t from ThreatDO t left join t.insecuritys g where t.deleted = false and t.system.id = ? and g.id = ? and t.category = ? order by t.classification";
		@SuppressWarnings("unchecked")
		List<ThreatDO> list = this.getHibernateTemplate().find(hql, systemId,
				insecurityId, category);
		return this.convert(list);
	}

	/*
	 * 按照二级分类分组返回其它威胁
	 */
	public List<Map<String, Object>> getOThreatForInputActivity(
			Integer systemId, Integer insecurityId, String category) {
		String hql = "from ThreatDO t1 where t1.deleted = false and t1.system.id = ? and t1.category = ? and not exists (from ThreatDO t2 left join t2.insecuritys g where g.id = ? and t1.id = t2.id) order by t1.classification";
		@SuppressWarnings("unchecked")
		List<ThreatDO> list = this.getHibernateTemplate().find(hql, systemId,
				category, insecurityId);
		return this.convert(list);
	}

	/*
	 * 查询威胁一级分类
	 */
	public List<Object> getThreatCategoryForInputActivity(Integer systemId) {
		String hql = "select t.category from ThreatDO t where t.deleted = false and t.system.id = ? and t.category is not null group by t.category";
		@SuppressWarnings("unchecked")
		List<Object> list = this.getHibernateTemplate().find(hql, systemId);
		return list;
	}

	/**
	 * 通过名称查找对应的威胁的记录，如果没有则返回null，否则返回第一条数据
	 */
	public ThreatDO getByName(String name) {
		if (null == name) {
			return null;
		}
		@SuppressWarnings("unchecked")
		List<ThreatDO> list = (List<ThreatDO>) this
				.query("select t from ThreatDO t where t.deleted = false and t.name = ?",
						name);
		if (list.isEmpty()) {
			return null;
		}
		return list.get(0);
	}

	/**
	 * 通过P、S校验风险等级显示的颜色
	 */
	public String vfyRisklevelColour(Integer riskp, Integer risks) {
		String colour = null;
		if (null == riskp || null == risks) {
			return null;
		}
		int totalrisk = riskp + risks;
		if (totalrisk <= 4) {
			colour = "G";
		} else if (totalrisk > 4 && totalrisk <= 7) {
			colour = "Y";
		} else if (totalrisk > 7) {
			colour = "R";
		}
		return colour;
	}

	/**
	 * 通过名称查找对应的威胁的记录，如果没有则返回null，否则返回第一条数据
	 */
	public ThreatDO getByAId(Integer id) {
		if (null == id) {
			return null;
		}
		@SuppressWarnings("unchecked")
		List<ThreatDO> list = (List<ThreatDO>) this
				.query("select t from ThreatDO t where t.deleted = false and t.id = ?",
						id);
		if (list.isEmpty()) {
			return null;
		}
		return list.get(0);
	}

	/**
	 * 校验是否有管理权限
	 */
	private void checkManagementPermission() {
		if (!permissionSetDao
				.hasPermission(PermissionSets.MANAGE_TEM_DICTIONARY.getName())) {
			throw SMSException.NO_ACCESS_RIGHT;
		}
	}

	public void setPermissionSetDao(PermissionSetDao permissionSetDao) {
		this.permissionSetDao = permissionSetDao;
	}
}
