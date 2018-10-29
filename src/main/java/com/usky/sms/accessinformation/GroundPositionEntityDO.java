
package com.usky.sms.accessinformation;
import org.hibernate.cfg.Comment;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.activity.ActivityDO;
import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.dictionary.DictionaryDO;

@Entity
@Table(name = "T_GROUND_POSITION_ENTITY")
@Comment("信息获取中的地面位置")
public class GroundPositionEntityDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = 1133643596282183838L;
	
	/** 安全信息主键  **/
	private ActivityDO activity;
	
	/** 地面位置类型  **/
	private DictionaryDO groundPosition;
	
	/** 描述  **/
	private String description;
	
	@ManyToOne
	@JoinColumn(name = "ACTIVITY_ID")
	@Comment("安全信息主键")
	public ActivityDO getActivity() {
		return activity;
	}
	
	public void setActivity(ActivityDO activity) {
		this.activity = activity;
	}
	
	@ManyToOne
	@JoinColumn(name = "ground_position")
	@Comment("地面位置类型")
	public DictionaryDO getGroundPosition() {
		return groundPosition;
	}
	
	public void setGroundPosition(DictionaryDO groundPosition) {
		this.groundPosition = groundPosition;
	}
	
	@Column(length = 4000)
	@Comment("描述")
	public String getDescription() {
		return description;
	}
	
	public void setDescription(String description) {
		this.description = description;
	}
	
}
