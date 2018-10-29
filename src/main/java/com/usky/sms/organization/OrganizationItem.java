
package com.usky.sms.organization;

import java.util.List;

public class OrganizationItem {
	
	private OrganizationDO organization;
	
	private String path;
	
	private OrganizationItem parent = null;
	
	private List<OrganizationItem> children = null;
	
	public OrganizationDO getOrganization() {
		return organization;
	}
	
	public void setOrganization(OrganizationDO organization) {
		this.organization = organization;
	}
	
	public String getPath() {
		return path;
	}
	
	public void setPath(String path) {
		this.path = path;
	}
	
	public OrganizationItem getParent() {
		return parent;
	}
	
	public void setParent(OrganizationItem parent) {
		this.parent = parent;
	}
	
	public List<OrganizationItem> getChildren() {
		return children;
	}
	
	public void setChildren(List<OrganizationItem> children) {
		this.children = children;
	}
	
}
