
package com.usky.sms.permission;

import javax.servlet.http.HttpServletRequest;

public interface IPermission {
	
	boolean hasPermission(Integer id, HttpServletRequest request);
	
}
