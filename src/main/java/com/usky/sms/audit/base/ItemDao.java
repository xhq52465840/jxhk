package com.usky.sms.audit.base;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.google.gson.reflect.TypeToken;
import com.usky.sms.audit.check.CheckDO;
import com.usky.sms.audit.check.CheckDao;
import com.usky.sms.audit.plan.EnumCheckGrade;
import com.usky.sms.audit.plan.EnumPlanType;
import com.usky.sms.audit.task.TaskDO;
import com.usky.sms.audit.task.TaskDao;
import com.usky.sms.common.NumberHelper;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;
import com.usky.sms.dictionary.DictionaryDO;
import com.usky.sms.dictionary.DictionaryDao;
import com.usky.sms.organization.OrganizationDO;
import com.usky.sms.organization.OrganizationDao;
import com.usky.sms.unit.UnitDO;
import com.usky.sms.unit.UnitDao;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;

public class ItemDao extends BaseDao<ItemDO> {
	
	@Autowired
	private DictionaryDao dictionaryDao;
	
	@Autowired
	private CheckDao checkDao;
	
	@Autowired
	private UnitDao unitDao;
	
	@Autowired
	private OrganizationDao organizationDao;
	
	@Autowired
	private TaskDao taskDao;
	
	@Autowired
	private ProfessionUserDao professionUserDao;

	protected ItemDao() {
		super(ItemDO.class);
	}

	private static final String version = "审计库版本";
	
	public static List<Map<String,String>> searchFields = new ArrayList<Map<String,String>>();
	
	static {
		
		registerItemFields("{\"name\":\"类型\",\"key\":\"type\",\"object\":\"null\",\"type\":\"static\",\"propplugin\":\"com.audit.plugin.checklist.auditTypeProp\"}");

		registerItemFields("{\"name\":\"审计要点\",\"key\":\"point\",\"object\":\"item\",\"type\":\"null\",\"propplugin\":\"com.audit.plugin.checklist.auditTextProp\"}");

		registerItemFields("{\"name\":\"审计依据\",\"key\":\"according\",\"object\":\"item\",\"type\":\"null\",\"propplugin\":\"com.audit.plugin.checklist.auditTextProp\"}");

		registerItemFields("{\"name\":\"审计提示\",\"key\":\"prompt\",\"object\":\"item\",\"type\":\"null\",\"propplugin\":\"com.audit.plugin.checklist.auditTextProp\"}");

		registerItemFields("{\"name\":\"分值\",\"key\":\"value\",\"object\":\"item\",\"type\":\"null\",\"propplugin\":\"com.audit.plugin.checklist.auditTextProp\"}");

		//registerItemFields("{\"name\":\"排序号\",\"key\":\"orderNo\",\"object\":\"item\",\"type\":\"null\",\"propplugin\":\"com.audit.plugin.checklist.auditTextProp\"}");

//		registerItemFields("{\"name\":\"时限日期\",\"key\":\"limitDate\",\"object\":\"item\",\"type\":\"null\",\"propplugin\":\"com.audit.plugin.checklist.auditDateProp\"}");

		registerItemFields("{\"name\":\"审计专业\",\"key\":\"profession\",\"object\":\"dictionary\",\"type\":\"static\",\"propplugin\":\"com.audit.plugin.checklist.auditProfessionProp\"}");

		registerItemFields("{\"name\":\"版本号\",\"key\":\"version\",\"object\":\"dictionary\",\"type\":\"static\",\"propplugin\":\"com.audit.plugin.checklist.auditVersionProp\"}");

//		registerItemFields("{\"name\":\"权重\",\"key\":\"weightType\",\"object\":\"item\",\"type\":\"null\",\"propplugin\":\"com.audit.plugin.checklist.auditWeightProp\"}");
		
		registerItemFields("{\"name\":\"章节\",\"key\":\"parent\",\"object\":\"item\",\"type\":\"null\",\"propplugin\":\"com.audit.plugin.checklist.chartTextProp\"}");

	}
	
	private static void registerItemFields(String str){
		Map<String, String> map = gson.fromJson(str, new TypeToken<Map<String, String>>() {}.getType());
		searchFields.add(map);
	}
	
	public List<Map<String, String>> getFieldData(boolean str) {
		List<Map<String, String>> list = new ArrayList<Map<String, String>>();
//		if (str) {
//			for (EnumItemType item : EnumItemType.values()) {
//				Map<String, String> map = new HashMap<String, String>();
//				map.put("id", item.name());
//				map.put("name", item.getDescription());
//				list.add(map);
//			}
//		} else {
			List<UserDO> yiJiShenJiZhuGuan = professionUserDao.getYiJiShenJiZhuGuan();
			if (yiJiShenJiZhuGuan.contains(UserContext.getUser())) {
				for (EnumItemType item : EnumItemType.values()) {
					Map<String, String> map = new HashMap<String, String>();
					map.put("id", item.name());
					map.put("name", item.getDescription());
					list.add(map);
				}
			} else {
				Map<String, String> map = new HashMap<String, String>();
				map.put("id", "SUB_ADD");
				map.put("name", "分子公司新增检查项");
				list.add(map);
			}
//		}
		return list;
	}
	
	@Override
	@Transactional(readOnly = false, propagation = Propagation.REQUIRES_NEW, isolation = Isolation.READ_COMMITTED)
	public void delete(String[] ids) {
		this.markAsDeleted(ids);
	}

	@SuppressWarnings("unchecked")
	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		Integer parent = NumberHelper.toInteger(map.get("parent").toString());
//		String type = (String) map.get("type");
//		Integer profession = NumberHelper.toInteger(map.get("profession").toString());
//		String point = (String) map.get("point");
//		String sql = "from ItemDO t where t.deleted = false and t.type = ? and t.profession.id = ? and t.parent.id = ? and t.point = ?"; 
//		List<ItemDO> item = this.getHibernateTemplate().find(sql,type,profession,parent,point);
//		if (item.size() > 0){
//			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "此项要点已存在！");
//		}
		map.put("orderNo", getMaxOrderNo(parent).doubleValue());
		map.put("creator", UserContext.getUserId());
		map.put("lastUpdater", UserContext.getUserId());
		return true;
	}

	
	@SuppressWarnings("unchecked")
	private Integer getMaxOrderNo(Integer parent) {
		String sql = "select max(orderNo) from ItemDO where parent.id = ?";
		List<Integer> list = this.getHibernateTemplate().find(sql,parent);
		if (list.get(0) != null) {
			return list.get(0) + 1;
		}
		return 1;
	}
	
	@SuppressWarnings("unchecked")
	@Override
	protected void beforeUpdate(int id, Map<String, Object> map) {
		String type = (String) map.get("type");
		Integer profession = NumberHelper.toInteger(map.get("profession").toString());
		Integer parent = NumberHelper.toInteger(map.get("parent").toString());
		String point = (String) map.get("point");
		String sql = "from ItemDO t where t.deleted = false and t.type = ? and t.profession.id = ? and t.parent.id = ? and t.point = ?"; 
		List<ItemDO> item = this.getHibernateTemplate().find(sql,type,profession,parent,point);
		if (item.size() >= 1 && item.get(0).getId() != id) throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "此项要点已存在！"); 
		map.put("lastUpdater", UserContext.getUserId());
	}

	@Override
	protected void setFields(Map<String, Object> map, Object obj, Class<?> claz, List<String> fields, boolean multiple, boolean showExtendFields) {
		ItemDO item = (ItemDO) obj;
		DictionaryDO profession = item.getProfession();
		if (profession != null) {
			map.put("professionId", profession.getId());
		}
		DictionaryDO version = item.getVersion();
		if (version != null) {
			map.put("versionId", version.getId());
		}
		String type = item.getType();
		map.put("type", EnumItemType.getEnumByVal(type));
		super.setFields(map, obj, claz, fields, multiple, showExtendFields);
	}
	
	@SuppressWarnings("unchecked")
	@Override
	protected Object getQueryParamValue(String key, Object value) {
		if ("value".equals(key)) return ((Number) value).intValue();
		if ("unit.id".equals(key)){
			List<Integer> list = new ArrayList<Integer>();
			for (Object o : (List<Object>)value){
				list.add(NumberHelper.toInteger(o.toString()));
			}
			return list;
		}
		if ("weightType".equals(key)) return ((Number) value).intValue();
		return super.getQueryParamValue(key, value);
	}
	
	private Map<String, Object> getObjMap(List<List<Map<String, Object>>> obj){
		Map<String, Object> map = new HashMap<String, Object>();
		for (List<Map<String, Object>> o : obj) {
			map.put(o.get(0).get("key").toString(), o.get(0).get("value"));
		}
		return map;
	}
	
	@SuppressWarnings("unchecked")
	public List<Map<String, Object>> getRootNode(List<List<Map<String, Object>>> obj) {
		Map<String, Object> map = getObjMap(obj);
		StringBuffer sql = new StringBuffer("from ItemDO t where t.deleted = false and t.pointType = 'chapter'");
		List<Object> param = new ArrayList<Object>();
		if (map.get("type") != null) {
			sql.append(" and t.type = ?");
			param.add(map.get("type"));
		}
		if (map.get("version") != null) {
			sql.append(" and t.version.id = ?");
			param.add(NumberHelper.toInteger(map.get("version").toString()));
		}
		if (map.get("profession") != null) {
			sql.append(" and t.profession.id = ?");
			param.add(NumberHelper.toInteger(map.get("profession").toString()));
		}
		if (map.get("unit") != null) {
			sql.append(" and t.unit.id = ?");
			param.add(NumberHelper.toInteger(map.get("unit").toString()));
		}
		sql.append(" order by t.orderNo asc");
		List<ItemDO> list = this.getHibernateTemplate().find(sql.toString(), param.toArray());
		StringBuffer typeSql = new StringBuffer("from ItemDO t where t.deleted = false and t.parent is null");
		if (map.get("type") != null) {
			typeSql.append(" and t.type = '" + map.get("type") + "'");
		}
		List<ItemDO> typeList = this.getHibernateTemplate().find(typeSql.toString());
		list.addAll(typeList);
		List<Map<String, Object>> dataList = new ArrayList<Map<String, Object>>();
		for (ItemDO item : list) {
			Map<String, Object> dataMap = new HashMap<String, Object>();
			dataMap.put("id", item.getId());
			dataMap.put("name", item.getPoint());
			if (item.getParent() != null) {
				dataMap.put("parentId", item.getParent().getId());
				dataMap.put("parentName", item.getParent().getPoint());
			} else {
				dataMap.put("parentId", 0);
				dataMap.put("parentName", null);
			}
			dataMap.put("type", item.getType());
			dataList.add(dataMap);
		}
		return dataList;
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public int addTMPItem(Map<String, Object> map) {
		Integer taskId = map.get("taskId") == null ? null : NumberHelper.toInteger(map.get("taskId").toString());
		Integer profession = map.get("profession") == null ? null : NumberHelper.toInteger(map.get("profession").toString());
		Integer checkId = map.get("checkId") == null ? null : NumberHelper.toInteger(map.get("checkId").toString());
		
		Integer parentId = NumberHelper.toInteger(map.get("parentId").toString());
		ItemDO rootRiskNode = this.internalGetById(parentId);
		String point = (String) map.get("point");
		String according = (String) map.get("according");
		String prompt = (String) map.get("prompt");
		ItemDO pointItem = new ItemDO();//要点
		pointItem.setParent(rootRiskNode);
		pointItem.setType(EnumItemType.TEMP.toString());
		pointItem.setVersion(rootRiskNode.getVersion());
		pointItem.setPointType("point");
		pointItem.setPoint(point);
		pointItem.setAccording(according);
		pointItem.setPrompt(prompt);
		pointItem.setCreated(new Date());
		pointItem.setCreator(UserContext.getUser());
		pointItem.setLastUpdater(UserContext.getUser());
		if (profession != null){
			DictionaryDO dic = dictionaryDao.internalGetById(profession);
			pointItem.setProfession(dic);
		}
		if (checkId != null) {
			CheckDO check = checkDao.internalGetById(checkId);
			pointItem.setCheck(check);
		}
		if (taskId != null) {
			TaskDO task = taskDao.internalGetById(taskId);
			pointItem.setTask(task);
		}
		int pointId = (int) this.internalSave(pointItem);
		return pointId;
	}
	
	@SuppressWarnings("unchecked")
	public Map<String, Object> getItemByParent(Integer parentId) {
		String sql = "from ItemDO t where t.deleted = false and t.id = ?";
		List<ItemDO> list = this.getHibernateTemplate().find(sql, parentId);
		Map<String, Object> map = new HashMap<String, Object>();
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
		for (ItemDO item : list) {
			map.put("point", item.getPoint());
			map.put("according", item.getAccording());
			map.put("prompt", item.getPrompt());
			map.put("startDate", item.getStartDate() == null ? null : sdf.format(item.getStartDate()));
			map.put("endDate", item.getEndDate() == null ? null : sdf.format(item.getEndDate()));
			map.put("value", item.getValue());
			break;
		}
		return map;
	}
	
	@SuppressWarnings("unchecked")
	public List<ItemDO> getByParent(Integer parentId) {
		String sql = "from ItemDO t where t.deleted = false and t.parent.id = ?";
		List<ItemDO> list = this.getHibernateTemplate().find(sql, parentId);
		return list;
	}
	
	@SuppressWarnings("unchecked")
	private List<ItemDO> getIByParent(List<ItemDO> items) {
		List<Integer> parentIds = new ArrayList<Integer>();
		for (ItemDO item : items){
			parentIds.add(item.getId());
		}
		String sql = "from ItemDO t where t.deleted = false and t.parent.id in (" + StringUtils.join(parentIds, ",") + ")";
		List<ItemDO> list = this.getHibernateTemplate().find(sql);
		return list;
	}
	
	@Override
	protected void afterDelete(Collection<ItemDO> collection) {
		List<ItemDO> items = (List<ItemDO>) collection;
		while (items.size() > 0){
			items = getIByParent(items);
			for (ItemDO item : items){
				item.setDeleted(true);
				this.internalUpdate(item);
			}
		}
	}

	@SuppressWarnings("unchecked")
	public List<Map<String, Object>> getTermItemTree(List<List<Map<String, Object>>> rules) {
		Map<String, Object> param = getObjMap(rules);
		Integer profession = param.get("profession") == null ? null : NumberHelper.toInteger(param.get("profession").toString());
		Integer checkId = param.get("checkId") == null ? null : NumberHelper.toInteger(param.get("checkId").toString());
		Integer taskId = param.get("taskId") == null ? null : NumberHelper.toInteger(param.get("taskId").toString());
		//Integer target = param.get("target") == null ? null : NumberHelper.toInteger(param.get("target").toString());
		DictionaryDO dic = dictionaryDao.getByTypeAndKey(version, "当前审计库版本");
		if (dic == null) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "没有找到当前使用审计库！");
		}
		String planType = null;
		String checkType = null;
		Integer operator = null;
		UnitDO unit = null;
		if (checkId != null) {
			CheckDO check = checkDao.internalGetById(checkId);
			planType = check == null ? null : check.getTask().getPlanType();
			operator = check == null ? null : NumberHelper.toInteger(check.getTask().getOperator());
			checkType = check == null ? null : check.getTask().getCheckType();
		} else if (taskId != null){
			TaskDO task = taskDao.internalGetById(taskId);
			planType = task == null ? null : task.getPlanType();
			operator = task == null ? null : NumberHelper.toInteger(task.getOperator());
			checkType = task == null ? null : task.getCheckType();
		}
		
		List<ItemDO> items = new ArrayList<ItemDO>();
		String root_type = null;
		String data_type = null;
		if (EnumPlanType.TERM.toString().equals(planType)){ // 公司航站安全审计标准检查单、航站新增检查项、临时检查项
			root_type = StringUtils.join(Arrays.asList(new String[]{EnumItemType.TERM_STD.toString(), EnumItemType.TERM_ADD.toString(), EnumItemType.TEMP.toString()}), "','");
			data_type = StringUtils.join(Arrays.asList(new String[]{EnumItemType.TERM_STD.toString(), EnumItemType.TERM_ADD.toString()}), "','");
			String temp_type = EnumItemType.TEMP.toString();
			List<ItemDO> temp_items = this.getHibernateTemplate().find("from ItemDO t where t.deleted = false and t.type in ('" + temp_type + "') and t.task.id = ? order by t.orderNo asc",taskId);
			items.addAll(temp_items);
		} else if (EnumPlanType.SYS.toString().equals(planType)){ // 公司安全运行审计标准检查单 、公司新增检查项、临时检查项
			root_type = StringUtils.join(Arrays.asList(new String[]{EnumItemType.SYS_STD.toString(), EnumItemType.SYS_ADD.toString(), EnumItemType.TEMP.toString()}), "','");
			data_type = StringUtils.join(Arrays.asList(new String[]{EnumItemType.SYS_STD.toString(), EnumItemType.SYS_ADD.toString()}), "','");
			String temp_type = EnumItemType.TEMP.toString();
			List<ItemDO> temp_items = this.getHibernateTemplate().find("from ItemDO t where t.deleted = false and t.type in ('" + temp_type + "') and t.check.id = ? order by t.orderNo asc",checkId);
			items.addAll(temp_items);
		} else if (EnumPlanType.SUB2.toString().equals(planType) || EnumPlanType.SUB3.toString().equals(planType)){ // 公司安全运行审计标准检查单、公司新增检查项、江苏公司新增检查项、临时检查项
			if (EnumPlanType.SUB2.toString().equals(planType)){
				unit = unitDao.internalGetById(operator);
			} else if (EnumPlanType.SUB3.toString().equals(planType)){
				OrganizationDO organization = organizationDao.internalGetById(operator);
				if (organization.getUnit() != null) {
					unit = unitDao.internalGetById(organization.getUnit().getId());
				}
			}
			root_type = StringUtils.join(Arrays.asList(new String[]{EnumItemType.SYS_STD.toString(), EnumItemType.SYS_ADD.toString(), EnumItemType.SUB_ADD.toString(), EnumItemType.TEMP.toString()}), "','");
			data_type = StringUtils.join(Arrays.asList(new String[]{EnumItemType.SYS_STD.toString(), EnumItemType.SYS_ADD.toString()}), "','");
			String temp_type = EnumItemType.TEMP.toString();
			String sub_type = EnumItemType.SUB_ADD.toString();
			if (unit != null){
				List<ItemDO> sub_items = this.getHibernateTemplate().find("from ItemDO t where t.deleted = false and t.type in ('" + sub_type + "') and t.version.id = ? and t.profession.id = ?  and t.unit.id = ? order by t.orderNo asc",dic.getId(), profession, unit.getId());
				items.addAll(sub_items);
			}
			List<ItemDO> temp_items = this.getHibernateTemplate().find("from ItemDO t where t.deleted = false and t.type in ('" + temp_type + "') and t.check.id = ? order by t.orderNo asc",checkId);
			items.addAll(temp_items);
		} else if (EnumPlanType.SPOT.toString().equals(planType)) {
			if (EnumCheckGrade.SYS.toString().equals(checkType)) { // 公司现场检查标准检查单、现场检查新增检查项、临时检查项
				root_type = StringUtils.join(Arrays.asList(new String[]{EnumItemType.SPOT_STD.toString(), EnumItemType.SPOT_ADD.toString(), EnumItemType.TEMP.toString()}), "','");
				data_type = StringUtils.join(Arrays.asList(new String[]{EnumItemType.SPOT_STD.toString(), EnumItemType.SPOT_ADD.toString()}), "','");
				String temp_type = EnumItemType.TEMP.toString();
				List<ItemDO> temp_items = this.getHibernateTemplate().find("from ItemDO t where t.deleted = false and t.type in ('" + temp_type + "') and t.check.id = ? order by t.orderNo asc",checkId);
				items.addAll(temp_items);
			} else if (EnumCheckGrade.SUB2.toString().equals(checkType)) { // 公司现场检查标准检查单、现场检查新增检查项、分子公司新增、临时检查项
				unit = unitDao.internalGetById(operator);
				root_type = StringUtils.join(Arrays.asList(new String[]{EnumItemType.SPOT_STD.toString(), EnumItemType.SPOT_ADD.toString(), EnumItemType.SUB_ADD.toString(), EnumItemType.TEMP.toString()}), "','");
				data_type = StringUtils.join(Arrays.asList(new String[]{EnumItemType.SPOT_STD.toString(), EnumItemType.SPOT_ADD.toString()}), "','");
				String temp_type = EnumItemType.TEMP.toString();
				String sub_type = EnumItemType.SUB_ADD.toString();
				if (unit != null){
					List<ItemDO> sub_items = this.getHibernateTemplate().find("from ItemDO t where t.deleted = false and t.type in ('" + sub_type + "') and t.version.id = ? and t.profession.id = ?  and t.unit.id = ? order by t.orderNo asc",dic.getId(), profession, unit.getId());
					items.addAll(sub_items);
				}
				List<ItemDO> temp_items = this.getHibernateTemplate().find("from ItemDO t where t.deleted = false and t.type in ('" + temp_type + "') and t.check.id = ? order by t.orderNo asc",checkId);
				items.addAll(temp_items);
			}
			
		} else if (EnumPlanType.SPEC.toString().equals(planType)){
			if (EnumCheckGrade.SYS.toString().equals(checkType)) { // 公司专项检查标准检查单、专项检查新增检查项、临时检查项
				root_type = StringUtils.join(Arrays.asList(new String[]{EnumItemType.SPEC_STD.toString(), EnumItemType.SPEC_ADD.toString(), EnumItemType.TEMP.toString()}), "','");
				data_type = StringUtils.join(Arrays.asList(new String[]{EnumItemType.SPEC_STD.toString(), EnumItemType.SPEC_ADD.toString()}), "','");
				String temp_type = EnumItemType.TEMP.toString();
				List<ItemDO> temp_items = this.getHibernateTemplate().find("from ItemDO t where t.deleted = false and t.type in ('" + temp_type + "') and t.check.id = ? order by t.orderNo asc",checkId);
				items.addAll(temp_items);
			} else if (EnumCheckGrade.SUB2.toString().equals(checkType)) { // // 公司专项检查标准检查单、专项检查新增检查项、临时检查项、分子公司新增
				unit = unitDao.internalGetById(operator);
				root_type = StringUtils.join(Arrays.asList(new String[]{EnumItemType.SPEC_STD.toString(), EnumItemType.SPEC_ADD.toString(), EnumItemType.SUB_ADD.toString(), EnumItemType.TEMP.toString()}), "','");
				data_type = StringUtils.join(Arrays.asList(new String[]{EnumItemType.SPEC_STD.toString(), EnumItemType.SPEC_ADD.toString()}), "','");
				String temp_type = EnumItemType.TEMP.toString();
				String sub_type = EnumItemType.SUB_ADD.toString();
				if (unit != null){
					List<ItemDO> sub_items = this.getHibernateTemplate().find("from ItemDO t where t.deleted = false and t.type in ('" + sub_type + "') and t.version.id = ? and t.profession.id = ?  and t.unit.id = ? order by t.orderNo asc",dic.getId(), profession, unit.getId());
					items.addAll(sub_items);
				}
				List<ItemDO> temp_items = this.getHibernateTemplate().find("from ItemDO t where t.deleted = false and t.type in ('" + temp_type + "') and t.check.id = ? order by t.orderNo asc",checkId);
				items.addAll(temp_items);
			}
		}
		
		if (root_type != null && data_type != null){
			List<ItemDO> root_items = this.getHibernateTemplate().find("from ItemDO t where t.deleted = false and t.type in ('" + root_type + "') and t.parent is null order by t.orderNo asc");
			items.addAll(root_items);
			if (EnumPlanType.TERM.toString().equals(planType)){
				List<ItemDO> data_items = this.getHibernateTemplate().find("from ItemDO t where t.deleted = false and t.version.id = ? and t.type in ('" + data_type + "') order by t.orderNo asc",dic.getId());
				items.addAll(data_items);
			} else {
				List<ItemDO> data_items = this.getHibernateTemplate().find("from ItemDO t where t.deleted = false and t.version.id = ? and t.profession.id = ? and t.type in ('" + data_type + "') order by t.orderNo asc",dic.getId(), profession);
				items.addAll(data_items);
			}
		}
		
		List<Map<String, Object>> treeNodes = new ArrayList<Map<String,Object>>();
		for (ItemDO item : items) {
			Map<String, Object> map = new HashMap<String, Object>();
			if (item.getParent() == null) {
				map.put("id", item.getId());
				if (EnumItemType.SUB_ADD.toString().equals(item.getType()) && unit != null) {
					map.put("name", unit.getName() + "新增检查项");
				} else {
					map.put("name", item.getPoint());
				}
				map.put("parentId", 0);
			} else {
				map.put("id", item.getId());
				map.put("name", item.getPoint());
				map.put("parentId", item.getParent().getId());
			}
			treeNodes.add(map);
		}
		return treeNodes;
	}
	
	public List<ItemDO> getItemByTypeAndProfession(String profession, String pointType_, String parent) {
		DictionaryDO dic = dictionaryDao.getByTypeAndKey(version, "当前审计库版本");
		StringBuffer sql = new StringBuffer("from ItemDO t where t.deleted = false");
		sql.append(" and t.type = '"+EnumItemType.SYS_STD.toString() + "'");
		sql.append(" and t.version.id = " + dic.getId());
		if (profession != null && !"".equals(profession)) {
			sql.append(" and t.profession.id = " + NumberHelper.toInteger(profession));
		}
		if (pointType_ != null && !"".equals(pointType_)) {
			sql.append(" and t.pointType = '" + pointType_ + "'");
			if ("point".equals(pointType_) && parent != null && !"".equals(parent)) {
				sql.append(" and t.parent.id = " + NumberHelper.toInteger(parent));
			}
		}
		sql.append(" order by t.point");
		@SuppressWarnings("unchecked")
		List<ItemDO> list = this.getHibernateTemplate().find(sql.toString());
		return list;
	}
	
	public void setDictionaryDao(DictionaryDao dictionaryDao) {
		this.dictionaryDao = dictionaryDao;
	}

	public void setCheckDao(CheckDao checkDao) {
		this.checkDao = checkDao;
	}

	public void setUnitDao(UnitDao unitDao) {
		this.unitDao = unitDao;
	}

	public void setOrganizationDao(OrganizationDao organizationDao) {
		this.organizationDao = organizationDao;
	}

	public void setTaskDao(TaskDao taskDao) {
		this.taskDao = taskDao;
	}

	public void setProfessionUserDao(ProfessionUserDao professionUserDao) {
		this.professionUserDao = professionUserDao;
	}

	
}
