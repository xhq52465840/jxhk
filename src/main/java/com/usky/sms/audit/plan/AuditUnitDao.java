package com.usky.sms.audit.plan;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.core.BaseDao;
import com.usky.sms.unit.UnitDO;
import com.usky.sms.unit.UnitDao;

public class AuditUnitDao extends BaseDao<AuditUnitDO> {
	
	@Autowired
	private UnitDao unitDao;

	protected AuditUnitDao() {
		super(AuditUnitDO.class);
	}
	
	@SuppressWarnings("unchecked")
	public List<UnitDO> getAllUnits(List<Integer> unitIds){
		List<UnitDO> units = (List<UnitDO>) this.query("select t.unit from AuditUnitDO t where t.deleted = false order by t.sortKey");
		Set<Integer> unitIdSet = null;
		if (null != unitIds && !unitIds.isEmpty()) {
			unitIdSet = new HashSet<>(unitIds);
			for (UnitDO unit : units) {
				if (unitIdSet.isEmpty()) {
					break;
				}
				unitIdSet.remove(unit.getId());
			}
		}
		if (null != unitIdSet && !unitIdSet.isEmpty()) {
			units.addAll(unitDao.getByIds(new ArrayList<Integer>(unitIdSet)));
		}
		return units;
	}

	public void setUnitDao(UnitDao unitDao) {
		this.unitDao = unitDao;
	}

}
