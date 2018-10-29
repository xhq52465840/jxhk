
package com.usky.sms.field.screen;

import java.util.Collection;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.core.BaseDao;

public class FieldScreenTabDao extends BaseDao<FieldScreenTabDO> {
	
	@Autowired
	private FieldScreenLayoutItemDao fieldScreenLayoutItemDao;
	
	public FieldScreenTabDao() {
		super(FieldScreenTabDO.class);
	}
	
	@Override
	protected void beforeDelete(Collection<FieldScreenTabDO> tabs) {
		if (tabs == null || tabs.size() == 0) return;
		@SuppressWarnings("unchecked")
		List<FieldScreenLayoutItemDO> list = this.getHibernateTemplate().findByNamedParam("from FieldScreenLayoutItemDO where tab in (:tabs)", "tabs", tabs);
		fieldScreenLayoutItemDao.delete(list);
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void copyByFieldScreen(FieldScreenDO screenSrc, FieldScreenDO screenDest) throws Exception {
		List<FieldScreenTabDO> srcs = this.getSortedTabsByFieldScreenId(screenSrc.getId());
		for (FieldScreenTabDO src : srcs) {
			FieldScreenTabDO dest = new FieldScreenTabDO();
			this.copyValues(src, dest);
			dest.setScreen(screenDest);
			this.internalSave(dest);
			fieldScreenLayoutItemDao.copyByFieldScreenTab(src, dest);
		}
	}

	public List<FieldScreenTabDO> getSortedTabsByFieldScreenId(int screenId) {
		@SuppressWarnings("unchecked")
		List<FieldScreenTabDO> list = this.getHibernateTemplate().find("from FieldScreenTabDO where screen.id = ? order by sequence desc", screenId);
		return list;
    }
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void sort(Integer[] ids) {
		int sequence = 1;
		for (Integer id : ids) {
			FieldScreenTabDO tab = this.internalGetById(id);
			tab.setSequence(sequence++);
		}
	}
	
	public void setFieldScreenLayoutItemDao(FieldScreenLayoutItemDao fieldScreenLayoutItemDao) {
		this.fieldScreenLayoutItemDao = fieldScreenLayoutItemDao;
	}
	
}
