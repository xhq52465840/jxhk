package com.usky.sms.audit.terminal;

import org.hibernate.cfg.Comment;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.user.UserDO;

@Entity
@Table(name = "A_TERMINAL")
@Comment("外站")
public class TerminalDO extends AbstractBaseDO {

	private static final long serialVersionUID = 5342568148130537698L;
	/** 序号 **/
	private Integer num;
	/** 归属地 **/
	private String attribution;
	/** 城市 **/
	private String city;
	/** 机场 **/
	private String airport;
	/** 三字码 **/
	private String iatacode;
	/** 类别 1:国内、2：国外 **/
	private String type;

	/** 创建人 */
	private UserDO creator;

	/** 更新人 */
	private UserDO lastupdater;

	@Column(length = 100)
	@Comment("序号")
	public Integer getNum() {
		return num;
	}

	public void setNum(Integer num) {
		this.num = num;
	}

	@Column(length = 100)
	@Comment("归属地")
	public String getAttribution() {
		return attribution;
	}

	public void setAttribution(String attribution) {
		this.attribution = attribution;
	}

	@Column(length = 100)
	@Comment("城市")
	public String getCity() {
		return city;
	}

	public void setCity(String city) {
		this.city = city;
	}

	@Column(length = 100)
	@Comment("机场")
	public String getAirport() {
		return airport;
	}

	public void setAirport(String airport) {
		this.airport = airport;
	}

	@Column(length = 100)
	@Comment("三字码")
	public String getIatacode() {
		return iatacode;
	}

	public void setIatacode(String iatacode) {
		this.iatacode = iatacode;
	}

	@Column(name = "`type`", length = 100)
	@Comment("类别 1:国内、2：国外")
	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	@ManyToOne
	@JoinColumn(name = "CREATOR_ID")
	@Comment("创建人")
	public UserDO getCreator() {
		return creator;
	}

	public void setCreator(UserDO creator) {
		this.creator = creator;
	}

	@ManyToOne
	@JoinColumn(name = "LASTUPDATER_ID")
	@Comment("更新人")
	public UserDO getLastupdater() {
		return lastupdater;
	}

	public void setLastupdater(UserDO lastupdater) {
		this.lastupdater = lastupdater;
	}

}
