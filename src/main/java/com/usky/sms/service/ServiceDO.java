
package com.usky.sms.service;
import org.hibernate.cfg.Comment;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;

@Entity
@Table(name = "T_SERVICE")
@Comment("服务")
public class ServiceDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = -5192119272968156873L;
	
	/** 服务名称 */
	private String serviceName;
	
	/** 客户端调用对应的服务名称 */
	private String methodSign;
	
	/** 服务方法所在的service类的bean名称 */
	private String beanName;
	
	/** 方法名称 */
	private String methodName;
	
	@Column(name = "service_name")
	@Comment("服务名称")
	public String getServiceName() {
		return serviceName;
	}
	
	public void setServiceName(String serviceName) {
		this.serviceName = serviceName;
	}
	
	@Column(name = "method_sign")
	@Comment("客户端调用对应的服务名称")
	public String getMethodSign() {
		return methodSign;
	}
	
	public void setMethodSign(String methodSign) {
		this.methodSign = methodSign;
	}
	
	@Column(name = "bean_name")
	@Comment("服务方法所在的service类的bean名称")
	public String getBeanName() {
		return beanName;
	}
	
	public void setBeanName(String beanName) {
		this.beanName = beanName;
	}
	
	@Column(name = "method_name")
	@Comment("方法名称")
	public String getMethodName() {
		return methodName;
	}
	
	public void setMethodName(String methodName) {
		this.methodName = methodName;
	}
	
}
