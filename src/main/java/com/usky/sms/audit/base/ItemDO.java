package com.usky.sms.audit.base;

import org.hibernate.cfg.Comment;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import javax.persistence.Transient;

import com.usky.sms.audit.check.CheckDO;
import com.usky.sms.audit.task.TaskDO;
import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.core.IDisplayable;
import com.usky.sms.dictionary.DictionaryDO;
import com.usky.sms.unit.UnitDO;
import com.usky.sms.user.UserDO;

@Entity
@Table(name = "A_ITEM")
@Comment("检查单库")
public class ItemDO extends AbstractBaseDO implements IDisplayable {

	private static final long serialVersionUID = -8520360257652773771L;

	/** 类型 */
	private String type;

	/** 审计要点 */
	private String point;

	/** 审计依据 */
	private String according;

	/** 审计提示 */
	private String prompt;

	/** 分值 */
	private Integer value;

	/** 排序号 */
	private Integer orderNo;

	/** 时限开始时间 */
	private Date startDate;

	/** 时限结束时间 */
	private Date endDate;

	/** 状态 */
	private String status;

	/** 父章节 */
	private ItemDO parent;

	/** 创建人 */
	private UserDO creator;

	/** 更新人 */
	private UserDO lastUpdater;

	/** 审计专业 */
	private DictionaryDO profession;

	/** 版本号 */
	private DictionaryDO version;

	/** 类型:是章节chapter还是要点point */
	private String pointType;

	/** 安监机构 */
	private UnitDO unit;

	/** 工作单 */
	private TaskDO task;

	/** 检查单 */
	private CheckDO check;
	
	/** 新加字段，权重分类 3,2,1 **/
	private Integer weightType;

	@Column(length = 100)
	@Comment("类型")
	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	@Column(length = 4000)
	@Comment("审计要点")
	public String getPoint() {
		return point;
	}

	public void setPoint(String point) {
		this.point = point;
	}

	@Column(length = 4000)
	@Comment("审计依据")
	public String getAccording() {
		return according;
	}

	public void setAccording(String according) {
		this.according = according;
	}

	@Column(length = 4000)
	@Comment("审计提示")
	public String getPrompt() {
		return prompt;
	}

	public void setPrompt(String prompt) {
		this.prompt = prompt;
	}

	@Column
	@Comment("分值")
	public Integer getValue() {
		return value;
	}

	public void setValue(Integer value) {
		this.value = value;
	}

	@Column(name = "order_no")
	@Comment("排序号")
	public Integer getOrderNo() {
		return orderNo;
	}

	public void setOrderNo(Integer orderNo) {
		this.orderNo = orderNo;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "start_date", columnDefinition = "DATE")
	@Comment("时限开始时间")
	public Date getStartDate() {
		return startDate;
	}

	public void setStartDate(Date startDate) {
		this.startDate = startDate;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "end_date", columnDefinition = "DATE")
	@Comment("时限结束时间")
	public Date getEndDate() {
		return endDate;
	}

	public void setEndDate(Date endDate) {
		this.endDate = endDate;
	}

	@Column(length = 10)
	@Comment("状态")
	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
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
	public UserDO getLastUpdater() {
		return lastUpdater;
	}

	public void setLastUpdater(UserDO lastUpdater) {
		this.lastUpdater = lastUpdater;
	}

	@ManyToOne
	@JoinColumn(name = "parent_id")
	@Comment("父章节")
	public ItemDO getParent() {
		return parent;
	}

	public void setParent(ItemDO parent) {
		this.parent = parent;
	}

	@ManyToOne
	@JoinColumn(name = "PROFESSION_ID")
	@Comment("审计专业")
	public DictionaryDO getProfession() {
		return profession;
	}

	public void setProfession(DictionaryDO profession) {
		this.profession = profession;
	}

	@ManyToOne
	@JoinColumn(name = "VERSION_ID")
	@Comment("版本号")
	public DictionaryDO getVersion() {
		return version;
	}

	public void setVersion(DictionaryDO version) {
		this.version = version;
	}

	@Column(length = 100)
	@Comment("类型:是章节chapter还是要点point")
	public String getPointType() {
		return pointType;
	}

	public void setPointType(String pointType) {
		this.pointType = pointType;
	}

	@ManyToOne
	@JoinColumn(name = "UNIT_ID")
	@Comment("安监机构")
	public UnitDO getUnit() {
		return unit;
	}

	public void setUnit(UnitDO unit) {
		this.unit = unit;
	}

	@ManyToOne
	@JoinColumn(name = "TASK_ID")
	@Comment("工作单")
	public TaskDO getTask() {
		return task;
	}

	public void setTask(TaskDO task) {
		this.task = task;
	}

	@ManyToOne
	@JoinColumn(name = "CHECK_ID")
	@Comment("检查单")
	public CheckDO getCheck() {
		return check;
	}

	public void setCheck(CheckDO check) {
		this.check = check;
	}

	@Column(name = "WEIGHT_TYPE")
	@Comment("新加字段，权重分类 3,2,1")
	public Integer getWeightType() {
		return weightType;
	}

	public void setWeightType(Integer weightType) {
		this.weightType = weightType;
	}
	
	/**
	 * 无参构造函数
	 */
	public ItemDO() {
		
	}

	/**
	 * 带参构造函数
	 * @param parent 父章节
	 * @param pointType 类型（chapter:章节; point:要点）
	 * @param type 类型
	 * @param orderNo 序号
	 * @param profession 专业
	 * @param version 版本
	 * @param point 章节或要点的内容
	 * @param according 审计依据
	 * @param prompt 审计提示
	 * @param value 分数
	 * @param creator 创建人
	 */
	public ItemDO(ItemDO parent, String pointType, String type, Integer orderNo, DictionaryDO profession, DictionaryDO version,
			String point, String according, String prompt, Integer value, UserDO creator) {
		super();
		this.parent = parent;
		this.pointType = pointType;
		this.type = type;
		this.orderNo = orderNo;
		this.profession = profession;
		this.version = version;
		this.point = point;
		this.according = according;
		this.prompt = prompt;
		this.value = value;
		this.creator = creator;
	}

	@Transient
	@Override
	public String getDisplayName() {
		return this.point;
	}

}
