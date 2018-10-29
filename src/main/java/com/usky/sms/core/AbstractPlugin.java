
package com.usky.sms.core;

import org.springframework.web.context.WebApplicationContext;

public abstract class AbstractPlugin {
	
	public abstract void initialize(WebApplicationContext context) throws Exception;
	
	public abstract void uninstall() throws Exception;
	
}
