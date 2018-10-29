
package com.usky.sms.organization;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.core.AbstractCache;
import com.usky.sms.unit.UnitDO;

public class OrganizationCache extends AbstractCache {
	
	private Map<Integer, OrganizationItem> mapById = new HashMap<Integer, OrganizationItem>();
	
	private Map<Integer, List<OrganizationItem>> mapByUnitId = new HashMap<Integer, List<OrganizationItem>>();
	
	@Autowired
	private OrganizationDao organizationDao;
	
	@Override
	protected void refresh() {
		mapById.clear();
		mapByUnitId.clear();
		buildTree();
	}
	
	private void buildTree() {
		List<OrganizationDO> organizations = organizationDao.getList();
		for (OrganizationDO organization : organizations) {
			OrganizationItem item = new OrganizationItem();
			item.setOrganization(organization);
			mapById.put(organization.getId(), item);
		}
		for (OrganizationItem item : mapById.values()) {
			OrganizationDO organization = item.getOrganization();
			OrganizationDO parent = organization.getParent();
			if (parent == null) continue;
			OrganizationItem parentItem = mapById.get(parent.getId());
			if (parentItem == null) continue;
			item.setParent(parentItem);
			List<OrganizationItem> list = parentItem.getChildren();
			if (list == null) list = new ArrayList<OrganizationItem>();
			list.add(item);
		}
		for (OrganizationItem item : mapById.values()) {
			String path = "";
			OrganizationItem parent = item.getParent();
			while (parent != null) {
				path = "/" + parent.getOrganization().getName() + path;
				parent = parent.getParent();
			}
			item.setPath(path);
		}
		for (OrganizationItem item : mapById.values()) {
			UnitDO unit = item.getOrganization().getUnit();
			if (unit == null) continue;
			List<OrganizationItem> items = mapByUnitId.get(unit.getId());
			if (items == null) {
				items = new ArrayList<OrganizationItem>();
				mapByUnitId.put(unit.getId(), items);
			}
			items.add(item);
		}
	}
	
	public OrganizationItem getItemById(Integer id) {
		return mapById.get(id);
	}
	
	public List<OrganizationItem> getItemsByUnitId(Integer id) {
		return mapByUnitId.get(id);
	}
	
	public void setOrganizationDao(OrganizationDao organizationDao) {
		this.organizationDao = organizationDao;
	}
	
}
