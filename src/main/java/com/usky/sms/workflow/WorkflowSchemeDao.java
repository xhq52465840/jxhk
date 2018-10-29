
package com.usky.sms.workflow;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.activity.type.ActivityTypeDao;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;
import com.usky.sms.core.TransactionHelper;
import com.usky.sms.unit.UnitConfigDO;
import com.usky.sms.unit.UnitConfigDao;
import com.usky.sms.unit.UnitDO;
import com.usky.sms.unit.UnitDao;
import com.usky.sms.user.UserContext;
import com.usky.sms.uwf.WfSetup;

public class WorkflowSchemeDao extends BaseDao<WorkflowSchemeDO> {
	
	public static final SMSException EXIST_SAME_WORKFLOW_SCHEME = new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "已存在相同名称的工作流方案！");
	
	@Autowired
	private ActivityTypeDao activityTypeDao;
	
	@Autowired
	private TransactionHelper transactionHelper;
	
	@Autowired
	private UnitDao unitDao;
	
	@Autowired
	private UnitConfigDao unitConfigDao;
	
	@Autowired
	private WorkflowSchemeEntityDao workflowSchemeEntityDao;
	
	public WorkflowSchemeDao() {
		super(WorkflowSchemeDO.class);
	}
	
	private void checkDuplicate(Integer id, String name) {
		@SuppressWarnings("unchecked")
		List<WorkflowSchemeDO> list = this.getHibernateTemplate().find("from WorkflowSchemeDO where name = ?", name);
		int size = list.size();
		if (size > 1 || (size == 1 && !list.get(0).getId().equals(id))) throw EXIST_SAME_WORKFLOW_SCHEME;
	}
	
	private void checkConstraints(Integer id, Map<String, Object> map) {
		if (map.containsKey("name")) {
			String name = (String) map.get("name");
			checkDuplicate(id, name);
		}
	}
	
	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		checkConstraints(null, map);
		return true;
	}
	
	@Override
	protected void afterSave(WorkflowSchemeDO scheme) {
		WorkflowSchemeEntityDO entity = new WorkflowSchemeEntityDO();
		entity.setScheme(scheme);
		String workflowId = (String) transactionHelper.doInTransaction(new WfSetup(), "GetDefaultId");
		entity.setWorkflow(workflowId);
		workflowSchemeEntityDao.internalSave(entity);
	}
	
	@Override
	protected void beforeUpdate(int id, Map<String, Object> map) {
		checkConstraints(id, map);
	}
	
	@Override
	protected void beforeDelete(Collection<WorkflowSchemeDO> schemes) {
		if (schemes == null || schemes.size() == 0) return;
		@SuppressWarnings("unchecked")
		List<WorkflowSchemeEntityDO> list = this.getHibernateTemplate().findByNamedParam("from WorkflowSchemeEntityDO where scheme in (:schemes)", "schemes", schemes);
		workflowSchemeEntityDao.delete(list);
	}
	
	@Override
	protected void afterGetList(List<Map<String, Object>> list, Map<String, Object> paramMap, Map<String, Object> searchMap, List<String> orders) {
		List<UnitConfigDO> configs = unitConfigDao.getAllList();
		Map<Integer, List<Map<String, Object>>> idUnitsMap = new HashMap<Integer, List<Map<String, Object>>>();
		List<String> fields = Arrays.asList(new String[] { "id", "name" });
		for (UnitConfigDO config : configs) {
			Integer id = config.getWorkflowScheme().getId();
			List<Map<String, Object>> units = idUnitsMap.get(id);
			if (units == null) {
				units = new ArrayList<Map<String, Object>>();
				idUnitsMap.put(id, units);
			}
			units.add(unitDao.convert(config.getUnit(), fields));
		}
		List<WorkflowSchemeEntityDO> entities = workflowSchemeEntityDao.getAllList();
		Map<Integer, List<Map<String, Object>>> idEntitiesMap = new HashMap<Integer, List<Map<String, Object>>>();
		for (WorkflowSchemeEntityDO entity : entities) {
			Integer id = entity.getScheme().getId();
			List<Map<String, Object>> entityMaps = idEntitiesMap.get(id);
			if (entityMaps == null) {
				entityMaps = new ArrayList<Map<String, Object>>();
				idEntitiesMap.put(id, entityMaps);
			}
			Map<String, Object> entityMap = workflowSchemeEntityDao.convert(entity);
			@SuppressWarnings("unchecked")
			Map<String, Object> workflowMap = ((List<Map<String, Object>>) transactionHelper.doInTransaction(new WfSetup(), "GetSetupList", entityMap.get("workflow"))).get(0);
			entityMap.put("workflow", workflowMap);
			Integer type = (Integer) entityMap.get("type");
			if (type != null) {
				entityMap.put("type", activityTypeDao.convert(activityTypeDao.internalGetById(type)));
				entityMaps.add(entityMap);
			} else {
				entityMaps.add(0, entityMap);
			}
		}
		for (Object obj : list) {
			@SuppressWarnings("unchecked")
			Map<String, Object> map = (Map<String, Object>) obj;
			Integer id = (Integer) map.get("id");
			map.put("units", idUnitsMap.get(id));
			map.put("entities", idEntitiesMap.get(id));
		}
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void copy(Integer id, String name, String description) throws Exception {
		WorkflowSchemeDO src = this.internalGetById(id);
		WorkflowSchemeDO dest = new WorkflowSchemeDO();
		this.copyValues(src, dest);
		dest.setName(name);
		dest.setDescription(description);
		dest.setType(null);
		this.internalSave(dest);
		workflowSchemeEntityDao.copyByWorkflowScheme(src, dest);
	}
	
	public List<WorkflowSchemeEntityDO> getByWorkflowSchemeId(int schemeId) {
		@SuppressWarnings("unchecked")
		List<WorkflowSchemeEntityDO> list = this.getHibernateTemplate().find("from WorkflowSchemeEntityDO where scheme.id = ?", schemeId);
		return list;
	}
	
	public WorkflowSchemeDO getDefaultScheme() {
		@SuppressWarnings("unchecked")
		List<WorkflowSchemeDO> list = this.getHibernateTemplate().find("from WorkflowSchemeDO where type = ?", "default");
		if (list.size() == 0) return null;
		return list.get(0);
	}
	
	public Map<String, List<Map<String, Object>>> getByWorkflow(String workflow) throws Exception {
		Map<String, List<Map<String, Object>>> workflowSchemesMap = new HashMap<String, List<Map<String, Object>>>();
		if (workflow == null) {
			List<WorkflowSchemeEntityDO> entities = workflowSchemeEntityDao.getAllList();
			for (WorkflowSchemeEntityDO entity : entities) {
				List<Map<String, Object>> workflowSchemeMaps = workflowSchemesMap.get(entity.getWorkflow());
				if (workflowSchemeMaps == null) {
					workflowSchemeMaps = new ArrayList<Map<String, Object>>();
					workflowSchemesMap.put(entity.getWorkflow(), workflowSchemeMaps);
				}
				boolean contains = false;
				for (Map<String, Object> workflowSchemeMap : workflowSchemeMaps) {
					if (workflowSchemeMap.get("id").equals(entity.getScheme().getId())) {
						contains = true;
						break;
					}
				}
				if (!contains) workflowSchemeMaps.add(this.convert(entity.getScheme()));
			}
		} else {
			List<UnitDO> units = unitDao.getByWorkflow(workflow);
			workflowSchemesMap.put(workflow, unitDao.convert(units));
		}
		return workflowSchemesMap;
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public Boolean operate(String action, String data) {
		Boolean result = (Boolean) transactionHelper.doInTransaction(new WfSetup(), "Operate", UserContext.getUserId().toString(), action, "", data);
		return result;
	}
	
	public void setActivityTypeDao(ActivityTypeDao activityTypeDao) {
		this.activityTypeDao = activityTypeDao;
	}
	
	public void setTransactionHelper(TransactionHelper transactionHelper) {
		this.transactionHelper = transactionHelper;
	}
	
	public void setUnitDao(UnitDao unitDao) {
		this.unitDao = unitDao;
	}
	
	public void setUnitConfigDao(UnitConfigDao unitConfigDao) {
		this.unitConfigDao = unitConfigDao;
	}
	
	public void setWorkflowSchemeEntityDao(WorkflowSchemeEntityDao workflowSchemeEntityDao) {
		this.workflowSchemeEntityDao = workflowSchemeEntityDao;
	}
	
}
