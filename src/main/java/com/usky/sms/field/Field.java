
package com.usky.sms.field;

public class Field {
	
	private String key;
	
	private String name;
	
	private String description;
	
	private String renderer;
	
	private String searcher;
	
	/** 是否能作为搜索条件进行搜索 */
	private boolean searchable;
	
	/** 是否作为安全信息查询的显示列 */
	private boolean display;
	
	private String config;
	
	public Field(String key, String name, String description, String renderer, String searcher, String config) {
		this.key = key;
		this.name = name;
		this.description = description;
		this.renderer = renderer;
		this.searcher = searcher;
		this.config = config;
	}
	
	public Field(String key, String name, String description, String renderer, String searcher, String config, boolean searchable, boolean display) {
		this.key = key;
		this.name = name;
		this.description = description;
		this.renderer = renderer;
		this.searcher = searcher;
		this.config = config;
		this.searchable = searchable;
		this.display = display;
	}
	
	public String getKey() {
		return key;
	}
	
	public void setKey(String key) {
		this.key = key;
	}
	
	public String getName() {
		return name;
	}
	
	public void setName(String name) {
		this.name = name;
	}
	
	public String getDescription() {
		return description;
	}
	
	public void setDescription(String description) {
		this.description = description;
	}
	
	public String getRenderer() {
		return renderer;
	}
	
	public void setRenderer(String renderer) {
		this.renderer = renderer;
	}
	
	public String getSearcher() {
		return searcher;
	}
	
	public void setSearcher(String searcher) {
		this.searcher = searcher;
	}
	
	public String getConfig() {
		return config;
	}
	
	public void setConfig(String config) {
		this.config = config;
	}

	public boolean isSearchable() {
		return searchable;
	}

	public void setSearchable(boolean searchable) {
		this.searchable = searchable;
	}

	public boolean isDisplay() {
		return display;
	}

	public void setDisplay(boolean display) {
		this.display = display;
	}
	
}
