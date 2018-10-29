/* UpsUser.java created by James on Mon 04-Feb-2013 */

package com.usky.sms.ups;

import java.io.Serializable;

/**
 * @author li_siliang
 */
public class UpsUser implements Serializable {
	
	private static final long serialVersionUID = -5885839533739451262L;
	
	private String usercode;
	
	private String username;
	
	private String create_time;
	
	private String last_update;
	
	private String active;
	
	private String deleted;
	
	private String type;
	
	public String getUsercode() {
		return usercode;
	}
	
	public void setUsercode(String usercode) {
		this.usercode = usercode;
	}
	
	public String getUsername() {
		return username;
	}
	
	public void setUsername(String username) {
		this.username = username;
	}
	
	public String getCreate_time() {
		return create_time;
	}
	
	public void setCreate_time(String create_time) {
		this.create_time = create_time;
	}
	
	public String getLast_update() {
		return last_update;
	}
	
	public void setLast_update(String last_update) {
		this.last_update = last_update;
	}
	
	public String getActive() {
		return active;
	}
	
	public void setActive(String active) {
		this.active = active;
	}
	
	public String getDeleted() {
		return deleted;
	}
	
	public void setDeleted(String deleted) {
		this.deleted = deleted;
	}
	
	public String getType() {
		return type;
	}
	
	public void setType(String type) {
		this.type = type;
	}
	
}
