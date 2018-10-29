package com.usky.sms.audit.neishen;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate3.support.HibernateDaoSupport;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.google.gson.Gson;
import com.usky.sms.audit.plan.EnumPlanType;
import com.usky.sms.audit.plan.PlanDO;
import com.usky.sms.audit.plan.PlanDao;
import com.usky.sms.audit.workflow.AuditWorkflowSchemeDao;
import com.usky.sms.common.NumberHelper;
import com.usky.sms.core.TransactionHelper;
import com.usky.sms.http.service.GsonBuilder4SMS;
import com.usky.sms.organization.OrganizationDO;
import com.usky.sms.organization.OrganizationDao;
import com.usky.sms.unit.UnitDO;
import com.usky.sms.unit.UnitDao;
import com.usky.sms.unit.UnitRoleActorDao;
import com.usky.sms.user.UserContext;
import com.usky.sms.uwf.WfSetup;

public class InnerPlanDao extends HibernateDaoSupport {

	@Autowired
	private UnitRoleActorDao unitRoleActorDao;
	
	@Autowired
	private TransactionHelper transactionHelper;
	
	@Autowired
	private PlanDao planDao;
	
	@Autowired
	private UnitDao unitDao;
	
	@Autowired
	private OrganizationDao organizationDao;

	@Autowired
	private AuditWorkflowSchemeDao auditWorkflowSchemeDao;
	
	protected static final Gson gson = GsonBuilder4SMS.getInstance();
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public Integer innerCreatePlan(Map<String, Object> objMap) {
		String planType = (String) objMap.get("planType");
		Integer year = NumberHelper.toInteger(objMap.get("year").toString());
		String planName = (String) objMap.get("planName");
		PlanDO plan = new PlanDO();
		plan.setPlanType(planType);
		plan.setYear(year);
		plan.setCreator(UserContext.getUser());
		plan.setLastUpdater(UserContext.getUser());
		plan.setCreated(new Date());
		plan.setLastUpdate(new Date());
		plan.setPlanName(planName);
		if (EnumPlanType.SUB2.toString().equals(planType)){
			Integer operator = NumberHelper.toInteger(objMap.get("operator").toString());
			plan.setOperator(operator.toString());
		} else if (EnumPlanType.SUB3.toString().equals(planType)){
			Integer operator = NumberHelper.toInteger(objMap.get("operator").toString());
			plan.setOperator(operator.toString());
		} else if (EnumPlanType.TERM.toString().equals(planType)){
			String termOperator = planDao.getOperator(planType, null); //安监部id
			plan.setOperator(termOperator);
		}
		int id = (int) planDao.internalSave(plan);
		planDao.addActivityLoggingForAddPlan(plan);
		this.instancePlan(plan, planType);
		return id;
	}

	
	
	public void instancePlan(PlanDO obj, String planType) {
		String workflowTemplateId = auditWorkflowSchemeDao.getWorkflowTempIdBySearch(planType, obj.getCheckType(), "PLAN");
		Map<String, Object> objmap = new HashMap<String, Object>();
		objmap.put("id", obj.getId());
		objmap.put("dataobject", "plan");
		String workflowId = (String) transactionHelper.doInTransaction(new WfSetup(), "Submit", UserContext.getUserId().toString(), workflowTemplateId, "", "", gson.toJson(objmap));
		obj.setFlowId(workflowId);
		planDao.internalUpdate(obj);
	}


	public List<Map<String, Object>> getErJiZuZhiByUnit(String unitId, String term) {
		List<Map<String, Object>> orgs = new ArrayList<Map<String,Object>>();
		if (unitId != null && !"".equals(unitId)){
			UnitDO unit  = unitDao.internalGetById(NumberHelper.toInteger(unitId));
			if (unit != null){
				List<OrganizationDO> organizations = organizationDao.getByOlevelAndUnit("3", unit.getId());
				if (term != null && !"".equals(term)) {
					for (OrganizationDO o : organizations) {
						if (o.getName().indexOf(term) > -1) {
							Map<String, Object> m = new HashMap<String, Object>();
							m.put("id", o.getId());
							m.put("name", o.getName());
							orgs.add(m);
						}
					}
				} else {
					for (OrganizationDO o : organizations) {
						Map<String, Object> m = new HashMap<String, Object>();
						m.put("id", o.getId());
						m.put("name", o.getName());
						orgs.add(m);
					}
				}
			}
		}
		return orgs;
	}
	
	public void setUnitRoleActorDao(UnitRoleActorDao unitRoleActorDao) {
		this.unitRoleActorDao = unitRoleActorDao;
	}

	public void setTransactionHelper(TransactionHelper transactionHelper) {
		this.transactionHelper = transactionHelper;
	}

	public void setPlanDao(PlanDao planDao) {
		this.planDao = planDao;
	}

	public void setUnitDao(UnitDao unitDao) {
		this.unitDao = unitDao;
	}

	public void setOrganizationDao(OrganizationDao organizationDao) {
		this.organizationDao = organizationDao;
	}

	public void setAuditWorkflowSchemeDao(AuditWorkflowSchemeDao auditWorkflowSchemeDao) {
		this.auditWorkflowSchemeDao = auditWorkflowSchemeDao;
	}
}
