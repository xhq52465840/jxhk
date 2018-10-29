
package com.usky.sms.service;

public class Service {
	
	private String beanName;
	
	private String methodName;
	
	public Service(String beanName, String methodName) {
		this.beanName = beanName;
		this.methodName = methodName;
	}
	
	public String getBeanName() {
		return beanName;
	}
	
	public void setBeanName(String beanName) {
		this.beanName = beanName;
	}
	
	public String getMethodName() {
		return methodName;
	}
	
	public void setMethodName(String methodName) {
		this.methodName = methodName;
	}
	
}
