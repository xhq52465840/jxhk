
package com.usky.sms.workflow;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.activity.type.ActivityTypeDO;
import com.usky.sms.core.BaseDao;

public class WorkflowSchemeEntityDao extends BaseDao<WorkflowSchemeEntityDO> {
	
	public WorkflowSchemeEntityDao() {
		super(WorkflowSchemeEntityDO.class);
	}
	
	@Override
	@SuppressWarnings("unchecked")
	protected void afterSave(WorkflowSchemeEntityDO entity) {
		ActivityTypeDO type = entity.getType();
		String hql;
		List<Object> params = new ArrayList<Object>();
		if (type == null) {
			hql = "from WorkflowSchemeEntityDO where type is null and scheme = ? and id <> ?";
		} else {
			hql = "from WorkflowSchemeEntityDO where type = ? and scheme = ? and id <> ?";
			params.add(type);
		}
		params.add(entity.getScheme());
		params.add(entity.getId());
		List<WorkflowSchemeEntityDO> entities = this.getHibernateTemplate().find(hql, params.toArray());
		this.internalDelete(entities);
	}
	
	@Override
	protected void afterDelete(Collection<WorkflowSchemeEntityDO> entities) {
		if (entities.size() == 0) return;
		for (WorkflowSchemeEntityDO entity : entities) {
			if (entity.getType() == null) {
				@SuppressWarnings("unchecked")
				List<WorkflowSchemeEntityDO> dbEntities = this.getHibernateTemplate().find("from WorkflowSchemeEntityDO where scheme = ?", entity.getScheme());
				if (dbEntities.size() == 0) return;
				WorkflowSchemeEntityDO newEntity = new WorkflowSchemeEntityDO();
				newEntity.setScheme(dbEntities.get(0).getScheme());
				newEntity.setWorkflow(dbEntities.get(0).getWorkflow());
				this.internalSave(newEntity);
				return;
			}
		}
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void copyByWorkflowScheme(WorkflowSchemeDO schemeSrc, WorkflowSchemeDO schemeDest) throws Exception {
		List<WorkflowSchemeEntityDO> srcs = this.getByWorkflowSchemeId(schemeSrc.getId());
		for (WorkflowSchemeEntityDO src : srcs) {
			WorkflowSchemeEntityDO dest = new WorkflowSchemeEntityDO();
			this.copyValues(src, dest);
			dest.setScheme(schemeDest);
			this.internalSave(dest);
		}
	}
	
	public WorkflowSchemeEntityDO getByUnitAndNullType(int unitId) {
		@SuppressWarnings("unchecked")
		List<WorkflowSchemeEntityDO> list = this.getHibernateTemplate().find("select e from WorkflowSchemeEntityDO e, UnitConfigDO c where c.unit.id = ? and c.workflowScheme = e.scheme and e.type is null", unitId);
		if (list.size() > 0) return list.get(0);
		return null;
	}
	
	public WorkflowSchemeEntityDO getByUnitAndType(int unitId, int typeId) {
		@SuppressWarnings("unchecked")
		List<WorkflowSchemeEntityDO> list = this.getHibernateTemplate().find("select e from WorkflowSchemeEntityDO e, UnitConfigDO c where c.unit.id = ? and c.workflowScheme = e.scheme and e.type.id = ?", unitId, typeId);
		if (list.size() > 0) return list.get(0);
		return null;
	}
	
	public List<WorkflowSchemeEntityDO> getByWorkflowSchemeId(Integer schemeId) {
		@SuppressWarnings("unchecked")
		List<WorkflowSchemeEntityDO> list = this.getHibernateTemplate().find("from WorkflowSchemeEntityDO where scheme.id = ?", schemeId);
		return list;
	}
	
}
