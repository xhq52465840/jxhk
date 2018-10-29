
package com.usky.sms.permission;

import java.util.HashMap;
import java.util.Map;

import com.usky.sms.core.AbstractCache;

public class PermissionSetRegister extends AbstractCache {
	
	private Map<String, PermissionSet> permissionSetMap = new HashMap<String, PermissionSet>();
	
	@Override
	protected void refresh() {
		permissionSetMap.clear();
		registerPermissionSets();
	}
	
	private void registerPermissionSets() {
		for (PermissionSets permissionSets : PermissionSets.values()) {
			registerPermissionSet(permissionSets.name(), permissionSets.getName(), permissionSets.getType(), permissionSets.getDescription());
		}
	}
	
	public void registerPermissionSet(String key, String name, String type, String description) {
		PermissionSet permissionSet = new PermissionSet(key, name, type, description);
		permissionSetMap.put(key, permissionSet);
	}
	
}
