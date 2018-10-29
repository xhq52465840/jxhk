
package com.usky.sms.menu;

import java.util.ArrayList;
import java.util.List;

public class MenuItem {
	
	private MenuDO menu;
	
	private String path;
	
	private MenuItem parent = null;
	
	private List<MenuItem> children = null;
	
	public MenuDO getMenu() {
		return menu;
	}
	
	public void setMenu(MenuDO menu) {
		this.menu = menu;
	}
	
	public String getPath() {
		return path;
	}
	
	public void setPath(String path) {
		this.path = path;
	}
	
	public MenuItem getParent() {
		return parent;
	}
	
	public void setParent(MenuItem parent) {
		this.parent = parent;
	}
	
	public List<MenuItem> getChildren() {
		return children;
	}
	
	public void setChildren(List<MenuItem> children) {
		this.children = children;
	}
	
	public void addChild(MenuItem item) {
		if (children == null) children = new ArrayList<MenuItem>();
		children.add(item);
	}
	
	public void removeChild(MenuItem item) {
		if (children != null) children.remove(item);
	}
	
}
