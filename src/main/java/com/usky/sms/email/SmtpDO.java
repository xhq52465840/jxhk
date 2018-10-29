package com.usky.sms.email;

import org.hibernate.cfg.Comment;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.core.IDisplayable;
import com.usky.sms.user.UserDO;

@Entity
@Table(name = "T_SMTP")
@Comment("邮件设置")
public class SmtpDO extends AbstractBaseDO implements IDisplayable {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	
	/** 名称 */
	private String name;

	/** 描述 */
	private String description;
	
	/** 地址 */
	private String address;
	
	/** 创建人 */
	private UserDO creator;
	
	/** 是否启用 */
	private boolean active;
	
	/** 前缀 */
	private String prefix;
	
	/** 协议 */
	private String protocol;
	
	/** 服务器 */
	private String server;
	
	/** 端口 */
	private int port;
	
	/** 超时 */
	private int timeout;
	
	/**  是否使用TLS 安全协议 */
	private boolean tls;
	
	/** 密码 */
	private String password;
	
	/** 帐号 */
	private String account;

	@Column(length = 50)
	@Comment("帐号")
	public String getAccount() {
		return account;
	}

	public void setAccount(String account) {
		this.account = account;
	}

	@Column(length = 50)
	@Comment("名称")
	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}
	
	@Column(length = 1000)
	@Comment("描述")
	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}
	
	@Column(length = 200)
	@Comment("地址")
	public String getAddress() {
		return address;
	}

	@Column(length = 1)
	@Comment("是否启用")
	public boolean isActive() {
		return active;
	}

	public void setActive(boolean active) {
		this.active = active;
	}

	public void setAddress(String address) {
		this.address = address;
	} 

	@Column(length = 100)
	@Comment("前缀")
	public String getPrefix() {
		return prefix;
	}

	public void setPrefix(String prefix) {
		this.prefix = prefix;
	}

	@Column(length = 20)
	@Comment("协议")
	public String getProtocol() {
		return protocol;
	}

	public void setProtocol(String protocol) {
		this.protocol = protocol;
	}

	@Column(length = 50)
	@Comment("服务器")
	public String getServer() {
		return server;
	}

	public void setServer(String server) {
		this.server = server;
	}

	@Column(length = 10)
	@Comment("端口")
	public int getPort() {
		return port;
	}

	public void setPort(int port) {
		this.port = port;
	}

	@Column(length = 10)
	@Comment("超时")
	public int getTimeout() {
		return timeout;
	}

	public void setTimeout(int timeout) {
		this.timeout = timeout;
	}

	@Column(length = 1)
	@Comment("是否使用TLS 安全协议")
	public boolean isTls() {
		return tls;
	}

	public void setTls(boolean tls) {
		this.tls = tls;
	}

	@Column(length = 20)
	@Comment("密码")
	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "creator")
	@Comment("创建人")
	public UserDO getCreator() {
		return creator;
	}

	public void setCreator(UserDO creator) {
		this.creator = creator;
	}		

	@Override
	@Transient
	public String getDisplayName() {
		return this.getName();
	}
}
