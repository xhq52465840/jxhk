
package com.usky.sms.field.screen;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.core.BaseDao;
import com.usky.sms.custom.CustomFieldDO;
import com.usky.sms.field.FieldRegister;

public class FieldScreenLayoutItemDao extends BaseDao<FieldScreenLayoutItemDO> {
	
	@Autowired
	private FieldRegister fieldRegister;
	
	public FieldScreenLayoutItemDao() {
		super(FieldScreenLayoutItemDO.class);
	}
	
	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		String fieldName = field.getName();
		FieldScreenLayoutItemDO item = (FieldScreenLayoutItemDO) obj;
		if ("key".equals(fieldName)) {
			String key = item.getKey();
			map.put("name", fieldRegister.getFieldName(key));
			map.put("description", fieldRegister.getFieldDescription(key));
		}
		super.setField(map, obj, claz, multiple, field);
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void copyByFieldScreenTab(FieldScreenTabDO tabSrc, FieldScreenTabDO tabDest) throws Exception {
		List<FieldScreenLayoutItemDO> srcs = this.getByFieldScreenTab(tabSrc);
		for (FieldScreenLayoutItemDO src : srcs) {
			FieldScreenLayoutItemDO dest = new FieldScreenLayoutItemDO();
			this.copyValues(src, dest);
			dest.setTab(tabDest);
			this.internalSave(dest);
		}
	}

	public List<FieldScreenLayoutItemDO> getByCustomField() {
		@SuppressWarnings("unchecked")
		List<FieldScreenLayoutItemDO> list = this.getHibernateTemplate().find("from FieldScreenLayoutItemDO where key like 'customfield_%'");
		return list;
    }
	
	public List<FieldScreenLayoutItemDO> getByCustomFields(Collection<CustomFieldDO> fields) {
		List<String> keys = new ArrayList<String>();
		for (CustomFieldDO field : fields) {
			keys.add("customfield_" + field.getId());
		}
		@SuppressWarnings("unchecked")
		List<FieldScreenLayoutItemDO> list = this.getHibernateTemplate().findByNamedParam("from FieldScreenLayoutItemDO where key in (:keys)", "keys", keys);
		return list;
	}
	
	public List<FieldScreenLayoutItemDO> getByField(String key) {
		@SuppressWarnings("unchecked")
		List<FieldScreenLayoutItemDO> list = this.getHibernateTemplate().find("from FieldScreenLayoutItemDO where key = ?", key);
		return list;
	}
	
	public List<FieldScreenLayoutItemDO> getByFieldScreenTab(FieldScreenTabDO tab) {
		@SuppressWarnings("unchecked")
		List<FieldScreenLayoutItemDO> list = this.getHibernateTemplate().find("from FieldScreenLayoutItemDO where tab = ?", tab);
		return list;
	}
	
	public List<FieldScreenLayoutItemDO> getByFieldScreenId(Integer screenId) {
		@SuppressWarnings("unchecked")
		List<FieldScreenLayoutItemDO> list = this.getHibernateTemplate().find("from FieldScreenLayoutItemDO where tab.screen.id = ?", screenId);
		return list;
	}

	public List<FieldScreenLayoutItemDO> getSortedItemsByTabId(Integer tabId) {
		@SuppressWarnings("unchecked")
		List<FieldScreenLayoutItemDO> list = this.getHibernateTemplate().find("from FieldScreenLayoutItemDO where tab.id = ? order by sequence", tabId);
		return list;
    }
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void sort(Integer[] ids) {
		int sequence = 1;
		for (Integer id : ids) {
			FieldScreenLayoutItemDO item = this.internalGetById(id);
			item.setSequence(sequence++);
		}
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void setFieldTabMapping(String key, List<Map<String, Object>> mapping) throws Exception {
		List<FieldScreenLayoutItemDO> items = this.getByField(key);
		List<FieldScreenLayoutItemDO> toAdd = new ArrayList<FieldScreenLayoutItemDO>();
		List<FieldScreenLayoutItemDO> toUpdate = new ArrayList<FieldScreenLayoutItemDO>();
		List<FieldScreenLayoutItemDO> toDelete = new ArrayList<FieldScreenLayoutItemDO>();
		for (Map<String, Object> map : mapping) {
			int screenId = ((Number) map.get("screen")).intValue();
			int tabId = ((Number) map.get("tab")).intValue();
			boolean selected = (Boolean) map.get("selected");
			FieldScreenLayoutItemDO matchedItem = null;
			for (FieldScreenLayoutItemDO item : items) {
				if (screenId == item.getTab().getScreen().getId()) {
					matchedItem = item;
					break;
				}
			}
			if (selected && matchedItem != null && tabId != matchedItem.getTab().getId()) {
				FieldScreenTabDO tab = new FieldScreenTabDO();
				tab.setId(tabId);
				matchedItem.setTab(tab);
				toUpdate.add(matchedItem);
				items.remove(matchedItem);
			} else if (selected && matchedItem == null) {
				FieldScreenLayoutItemDO item = new FieldScreenLayoutItemDO();
				item.setKey(key);
				FieldScreenTabDO tab = new FieldScreenTabDO();
				tab.setId(tabId);
				item.setTab(tab);
				item.setSequence(this.getNextSequence(tabId));
				toAdd.add(item);
			} else if (!selected && matchedItem != null) {
				toDelete.add(matchedItem);
				items.remove(matchedItem);
			}
		}
		this.internalSave(toAdd);
		this.internalUpdate(toUpdate);
		this.delete(toDelete);
	}
	
	public int getNextSequence(int tabId) {
		@SuppressWarnings("unchecked")
		List<FieldScreenLayoutItemDO> items = this.getHibernateTemplate().find("from FieldScreenLayoutItemDO where tab.id = ?", tabId);
		int lastSequence = 0;
		for (FieldScreenLayoutItemDO item : items) {
			Integer sequence = item.getSequence();
			if (sequence != null && sequence > lastSequence) lastSequence = sequence;
		}
		return lastSequence + 1;
	}
	
	public void setFieldRegister(FieldRegister fieldRegister) {
		this.fieldRegister = fieldRegister;
	}
	
}
