
package com.usky.sms.field.screen;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.activity.ActivityOperation;
import com.usky.sms.core.BaseDao;

public class FieldScreenDao extends BaseDao<FieldScreenDO> {
	
	@Autowired
	private FieldScreenSchemeItemDao fieldScreenSchemeItemDao;
	
	@Autowired
	private FieldScreenTabDao fieldScreenTabDao;
	
	public FieldScreenDao() {
		super(FieldScreenDO.class);
	}
	
	@Override
	protected void afterSave(FieldScreenDO screen) {
		FieldScreenTabDO tab = new FieldScreenTabDO();
		tab.setName("字段标签页");
		tab.setSequence(1);
		tab.setScreen(screen);
		fieldScreenTabDao.internalSave(tab);
	}
	
	@Override
	protected void beforeDelete(Collection<FieldScreenDO> screens) {
		if (screens == null || screens.size() == 0) return;
		@SuppressWarnings("unchecked")
		List<FieldScreenTabDO> list = this.getHibernateTemplate().findByNamedParam("from FieldScreenTabDO where screen in (:screens)", "screens", screens);
		fieldScreenTabDao.delete(list);
	}
	
	@Override
	protected void afterGetList(List<Map<String, Object>> list, Map<String, Object> paramMap, Map<String, Object> searchMap, List<String> orders) {
		List<FieldScreenSchemeItemDO> items = fieldScreenSchemeItemDao.getList();
		Map<Integer, List<Map<String, Object>>> idMap = new HashMap<Integer, List<Map<String, Object>>>();
		for (FieldScreenSchemeItemDO item : items) {
			Integer id = item.getScreen().getId();
			List<Map<String, Object>> idList = idMap.get(id);
			if (idList == null) {
				idList = new ArrayList<Map<String, Object>>();
				idMap.put(id, idList);
			}
			boolean exist = false;
			for (Map<String, Object> temp : idList) {
				if (temp.get("id").equals(item.getScheme().getId())) {
					exist = true;
					break;
				}
			}
			if (exist) continue;
			Map<String, Object> map = new HashMap<String, Object>();
			FieldScreenSchemeDO scheme = item.getScheme();
			map.put("id", scheme.getId());
			map.put("name", scheme.getName());
			idList.add(map);
		}
		for (Object obj : list) {
			@SuppressWarnings("unchecked")
			Map<String, Object> map = (Map<String, Object>) obj;
			map.put("schemes", idMap.get(map.get("id")));
		}
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void copy(Integer id, String name, String description) throws Exception {
		FieldScreenDO src = this.internalGetById(id);
		FieldScreenDO dest = new FieldScreenDO();
		this.copyValues(src, dest);
		dest.setName(name);
		dest.setDescription(description);
		this.internalSave(dest);
		fieldScreenTabDao.copyByFieldScreen(src, dest);
	}
	
	public FieldScreenDO getFieldScreen(int unitId, int typeId, ActivityOperation activityOperation) {
		List<FieldScreenSchemeItemDO> items = fieldScreenSchemeItemDao.getByUnitAndType(unitId, typeId);
		if (items.size() == 0) items = fieldScreenSchemeItemDao.getByUnitAndNullType(unitId);
		FieldScreenSchemeItemDO defaultItem = null;
		for (FieldScreenSchemeItemDO item : items) {
			String operation = item.getOperation();
			if (activityOperation.name().equals(operation)) {
				return item.getScreen();
			}
			if (operation == null) defaultItem = item;
		}
		return defaultItem.getScreen();
	}
	
	public void setFieldScreenSchemeItemDao(FieldScreenSchemeItemDao fieldScreenSchemeItemDao) {
		this.fieldScreenSchemeItemDao = fieldScreenSchemeItemDao;
	}
	
	public void setFieldScreenTabDao(FieldScreenTabDao fieldScreenTabDao) {
		this.fieldScreenTabDao = fieldScreenTabDao;
	}
	
}
