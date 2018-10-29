package com.usky.sms.safetyreview.inst;

import java.text.ParseException;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.Validate;
import org.quartz.CronTrigger;
import org.quartz.JobDataMap;
import org.quartz.JobDetail;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.quartz.Trigger;
import org.quartz.impl.StdSchedulerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.common.DateHelper;
import com.usky.sms.config.Config;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;
import com.usky.sms.job.CronCloseMethanolInstJob;
import com.usky.sms.job.CronGenerateMethanolInstJob;
import com.usky.sms.job.CronSendMethanolCommitNoticeJob;
import com.usky.sms.job.CronSetMethanolCommitDelayJob;
import com.usky.sms.job.JobUtils;
import com.usky.sms.menu.MenuCache;
import com.usky.sms.menu.MenuItem;
import com.usky.sms.message.MessageDO;
import com.usky.sms.message.MessageDao;
import com.usky.sms.permission.IPermission;
import com.usky.sms.permission.PermissionSetDao;
import com.usky.sms.permission.PermissionSets;
import com.usky.sms.safetyreview.AssessmentCommentDO;
import com.usky.sms.safetyreview.AssessmentProjectDO;
import com.usky.sms.safetyreview.AssessmentProjectDao;
import com.usky.sms.safetyreview.AssessmentUnitDO;
import com.usky.sms.safetyreview.AssessmentUnitDao;
import com.usky.sms.safetyreview.EnumAssessmentSourceType;
import com.usky.sms.safetyreview.EnumMethanolStatus;
import com.usky.sms.safetyreview.MethanolRoleDao;
import com.usky.sms.safetyreview.ScoreStandardDO;
import com.usky.sms.safetyreview.ScoreStandardDao;
import com.usky.sms.safetyreview.ScoreStandardDetailDO;
import com.usky.sms.unit.UnitDO;
import com.usky.sms.unit.UnitDao;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserDao;

public class MethanolInstDao extends BaseDao<MethanolInstDO> implements IPermission{
	
	private static final org.apache.log4j.Logger log = org.apache.log4j.Logger.getLogger(MethanolInstDao.class);
	
	/** 默认生成评审单的时间(每个季度的最后一个月的30号) */
	private static final String CRON_EXPRESSION_FOR_GENERATE_METHANOL_INST = "0 0 0 30 3,6,9,12 ?";
	
	/** 默认关闭评审单的时间(每个季度的第一个月的10号) */
	private static final String CRON_EXPRESSION_FOR_CLOSE_METHANOL_INST = "0 0 0 10 1,4,7,10 ?";
	
	private static final String GROUP = "methanolInst";
	
	private static final String NAME_SUFIX_TRIGGER = "_trigger";
	
	private Config config;
	
	@Autowired
	private MenuCache menuCache;
	
	@Autowired
	private UnitDao unitDao;
	
	@Autowired
	private AssessmentProjectDao assessmentProjectDao;
	
	@Autowired
	private ScoreStandardDao scoreStandardDao;
	
	@Autowired
	private AssessmentProjectInstDao assessmentProjectInstDao;
	
	@Autowired
	private AssessmentCommentInstDao assessmentCommentInstDao;
	
	@Autowired
	private ScoreStandardInstDao scoreStandardInstDao;
	
	@Autowired
	private ScoreStandardDetailInstDao scoreStandardDetailInstDao;
	
	@Autowired
	private CompletionInstDao completionInstDao;
	
	@Autowired
	private PermissionSetDao permissionSetDao;
	
	@Autowired
	private UserDao userDao;
	
	@Autowired
	private MethanolRoleDao methanolRoleDao;
	
	@Autowired
	private AssessmentUnitDao assessmentUnitDao;
	
	@Autowired
	private MessageDao messageDao;

	protected MethanolInstDao() {
		super(MethanolInstDO.class);
		this.config = Config.getInstance();
	}
	
	@Override
	protected void beforeGetList(Map<String, Object> map, Map<String, Object> searchMap, List<String> orders) {
		// 通过unit检索时，如果unit为空，则查询所有安检机构
		if (map.containsKey("unit")) {
			if (map.get("unit") == null) {
				map.remove("unit");
			}
		}
		super.beforeGetList(map, searchMap, orders);
	}

	@Override
	protected void setFields(Map<String, Object> map, Object obj, Class<?> claz, List<String> fields, boolean multiple,
			boolean showExtendFields) {
		super.setFields(map, obj, claz, fields, multiple, showExtendFields);
	}

	@Override
	protected Object getQueryParamValue(String key, Object value) {
		if ("year".equals(key) || "season".equals(key)) return ((Number) value).intValue();
		return super.getQueryParamValue(key, value);
	}

	@Override
	protected void afterGetList(List<Map<String, Object>> list, Map<String, Object> paramMap, Map<String, Object> searchMap, List<String> orders) {
		// 查看权限
		boolean viewable = false;
		// 管理权限
		boolean manageable = false;
		// 审核权限
		boolean auditable = false;
		for (Map<String, Object> map : list) {
			String unitId = map.get("unitId").toString();
			viewable = permissionSetDao.hasUnitPermission(Integer.parseInt(unitId), PermissionSets.VIEW_SAFETY_REVIEW.getName());
			manageable = permissionSetDao.hasUnitPermission(Integer.parseInt(unitId), PermissionSets.MANAGE_SAFETY_REVIEW.getName());
			auditable = permissionSetDao.hasPermission(PermissionSets.AUDIT_SAFETY_REVIEW.getName());
			
			map.put("viewable", viewable);
			map.put("manageable", manageable);
			map.put("auditable", auditable);
		}
	}

	@Override
	protected void beforeUpdate(int id, Map<String, Object> map) {
		// 状态是完成的评审单不能进行更新操作
		MethanolInstDO methanolInst = this.internalGetById(id);
		if (EnumMethanolStatus.COMPLETE.toString().equals(methanolInst.getStatus())) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "评审单[ID:" + id + "]已被审核,不能进行更新操作！");
		}
	}
	
	@Override
	protected void afterUpdate(MethanolInstDO obj, MethanolInstDO dbObj) {
		if (EnumMethanolStatus.WAITING.toString().equals(obj.getStatus()) && !EnumMethanolStatus.WAITING.toString().equals(dbObj.getStatus())) {
			// 状态变成待审核时将相应的job关闭
			this.closeRelatedJob(obj.getId());
		} else if (EnumMethanolStatus.COMPLETE.toString().equals(obj.getStatus()) && !EnumMethanolStatus.COMPLETE.toString().equals(dbObj.getStatus())) { // 审核完成给分子公司一个站内通知
			// 给具有编辑该评审单的人发站内通知
			this.sendCompleteNotice(obj);
		}
		if (obj.isDelay() && !dbObj.isDelay()) {
			// 关闭设置延期的job
			this.closeSetMethanolCommitDelayJob(obj.getId());
		}
	}
	
	/**
	 * 获取待我处理的评审单的条数
	 * @return
	 */
	public Integer getToDoCount(UserDO user) {
		String hql = "select count(t) from MethanolInstDO t where t.deleted = false and t.creator = ? and t.status = ?";
		@SuppressWarnings("unchecked")
		List<Long> list = (List<Long>) this.query(hql, user, "NEW");
		return list.get(0).intValue();
	}
	
	/**
	 * 发送审核完成通知
	 */
	public void sendCompleteNotice(MethanolInstDO obj) {
		// 给具有编辑该评审单的人发站内通知
		List<UserDO> users = permissionSetDao.getPermittedUsers(obj.getUnit().getId(), PermissionSets.MANAGE_SAFETY_REVIEW.getName());
		MessageDO message = new MessageDO();
		message.setSender(UserContext.getUser());
		message.setSendTime(new Date());
		message.setTitle("安全评审审核完成通知");
		message.setContent("本季度安全评审已经完成，详情请点击链接。");
		messageDao.sendMessage(message, users);
	}
	
	@Override
	protected void afterDelete(Collection<MethanolInstDO> collection) {
		for (MethanolInstDO methanolInst : collection) {
			this.closeRelatedJob(methanolInst.getId());
		}
	}

	public void closeRelatedJob(int id) {
		// 关闭对应的job
		this.closeSendMethanolCommitNoticeJob(id);
		this.closeSetMethanolCommitDelayJob(id);
	}

	public void closeSendMethanolCommitNoticeJob(int id) {
		// 关闭对应的job
		Scheduler scheduler;
		try {
			scheduler = StdSchedulerFactory.getDefaultScheduler();
			scheduler.unscheduleJob("sendMethanolCommitNoticeJob_" + id + NAME_SUFIX_TRIGGER, GROUP);
		} catch (SchedulerException e) {
			e.printStackTrace();
			log.error("关闭job[" + "sendMethanolCommitNoticeJob_" + id + "]失败: " + e.getMessage(), e);
		}
	}
	
	public void closeSetMethanolCommitDelayJob(int id) {
		// 关闭对应的job
		Scheduler scheduler;
		try {
			scheduler = StdSchedulerFactory.getDefaultScheduler();
			scheduler.unscheduleJob("setMethanolCommitDelayJob_" + id + NAME_SUFIX_TRIGGER, GROUP);
		} catch (SchedulerException e) {
			e.printStackTrace();
			log.error("关闭job[" + "setMethanolCommitDelayJob_" + id + "]失败: " + e.getMessage(), e);
		}
	}
	
	/**
	 * 校验是否各项都完成打分
	 * @param methanolInstId
	 * @return
	 */
	public boolean checkAllComplete(Integer methanolInstId){
		StringBuffer hql = new StringBuffer();
		// 根据考核内容查询所有的完成情况
		hql.append("select count(c) from CompletionInstDO c where c.deleted = false and c.status <> ? and c.assessmentCommentInst.id in (select ac.id from AssessmentProjectInstDO ap left join ap.assessmentCommentInsts ac where ap.deleted = false and ap.methanolInst.id = ?)");
		@SuppressWarnings("unchecked")
		List<Long> counts = (List<Long>) this.query(hql.toString() , EnumCompletionInstStatus.COMPLETE.toString(), methanolInstId);
		if(counts.get(0) > 0){
			return false;
		}
		return true;
	}
	
	/**
	 * 算出评审单的总分
	 * @param methanolInstId
	 * @return
	 */
	public Double getSumScore(Integer methanolInstId){
		StringBuffer hql = new StringBuffer();
		// 根据考核内容查询所有的完成情况
		hql.append("select sum(c.score) from CompletionInstDO c where c.deleted = false and c.status = ? and c.assessmentCommentInst.id in (select ac.id from AssessmentProjectInstDO ap inner join ap.assessmentCommentInsts ac where ap.deleted = false and ap.methanolInst.id = ?)");
		@SuppressWarnings("unchecked")
		List<Double> sum = (List<Double>) this.query(hql.toString() , EnumCompletionInstStatus.COMPLETE.toString(), methanolInstId);
		return sum.get(0) == null ? 0.0 : sum.get(0);
		
	}

	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void generateMethanolInst() throws Exception{
		// 获取ADMIN的id
		UserDO admin = userDao.getByUsername("ADMIN");
		
		// 获取所有评审机构
		List<AssessmentUnitDO> assessmentUnits = assessmentUnitDao.getAllList();
		// 是生成当前季度
		int[] season = DateHelper.getSeasonNumOfDate(new Date());
		
		for (AssessmentUnitDO assessmentUnit : assessmentUnits) {
			UnitDO unit = assessmentUnit.getUnit();
			// 保存评审单实例
			MethanolInstDO methanolInst = new MethanolInstDO();
			methanolInst.setYear(season[0]);
			methanolInst.setSeason(season[1]);
			methanolInst.setUnit(unit);
			UserDO user = methanolRoleDao.getByMethnolRole(unit.getId());
			methanolInst.setCreator(user);
			this.internalSave(methanolInst);
			
			// 保存所有具有考核内容的评审项目
			List<AssessmentProjectDO> assessmentProjects = assessmentProjectDao.getAllHasComments();
			
			for (AssessmentProjectDO assessmentProject : assessmentProjects) {
				// 考核项目
				AssessmentProjectInstDO assessmentProjectInst = new AssessmentProjectInstDO();
				// 名称
				assessmentProjectInst.setName(assessmentProject.getName());
				// 评审单
				assessmentProjectInst.setMethanolInst(methanolInst);
				// 保存考核项目实例
				assessmentProjectInstDao.internalSave(assessmentProjectInst);
				
				// 考核内容
				List<AssessmentCommentDO> assessmentComments = new ArrayList<AssessmentCommentDO>(assessmentProject.getAssessmentComments());
				// 对考核内容按ID的升序进行排序
				Collections.sort(assessmentComments);
				for (AssessmentCommentDO assessmentComment : assessmentComments) {
					if (!assessmentComment.isDeleted()) {
						// 考核内容实例
						AssessmentCommentInstDO assessmentCommentInst = new AssessmentCommentInstDO();
						// 考核内容说明
						assessmentCommentInst.setDescription(assessmentComment.getDescription());
						// 考核来源
						assessmentCommentInst.setType(assessmentComment.getType());
						// 对应的过滤器id
						assessmentCommentInst.setFilterId(assessmentComment.getFilter() == null ? null : assessmentComment.getFilter().getId());
						// 对应的过滤器
						assessmentCommentInst.setFilterRule(assessmentComment.getFilter() == null ? null : assessmentComment.getFilter().getFilterRule());
						// 标准描述
						assessmentCommentInst.setStandardSummary(assessmentComment.getStandardSummary());
						// 考核项目
						assessmentCommentInst.setAssessmentProjectInst(assessmentProjectInst);
						// 考核内容模板的id
						assessmentCommentInst.setAssessmentCommentTemplateId(assessmentComment.getId());
						//保存考核内容实例
						assessmentCommentInstDao.internalSave(assessmentCommentInst);
	
						// 分值标准
						ScoreStandardDO scoreStandard = scoreStandardDao.getByAssessmentComment(assessmentComment);
						if (null != scoreStandard) {
							// 分值标准实例
							ScoreStandardInstDO scoreStandardInst = new ScoreStandardInstDO();
							// 最小值
							scoreStandardInst.setMin(scoreStandard.getMin());
							// 最大值
							scoreStandardInst.setMax(scoreStandard.getMax());
							// 描述
							scoreStandardInst.setDescription(scoreStandard.getDescription());
							// 考核内容实例
							scoreStandardInst.setAssessmentCommentInst(assessmentCommentInst);
							// 保存考核内容实例
							scoreStandardInstDao.internalSave(scoreStandardInst);
	
							// 考核内容详细
							Set<ScoreStandardDetailDO> scoreStandardDetails = scoreStandard.getDetails();
							for (ScoreStandardDetailDO scoreStandardDetail : scoreStandardDetails) {
								if (!scoreStandardDetail.isDeleted()) {
									// /考核内容详细实例
									ScoreStandardDetailInstDO scoreStandardDetailInst = new ScoreStandardDetailInstDO();
									// 左区间
									scoreStandardDetailInst.setLeftInterval(scoreStandardDetail.getLeftInterval());
									// 右区间
									scoreStandardDetailInst.setRightInterval(scoreStandardDetail.getRightInterval());
									// 数学表达式
									scoreStandardDetailInst.setExpression(scoreStandardDetail.getExpression());
									// 描述
									scoreStandardDetailInst.setDescription(scoreStandardDetail.getDescription());
									// 对应的评分标准实例
									scoreStandardDetailInst.setScoreStandardInst(scoreStandardInst);
									scoreStandardDetailInstDao.internalSave(scoreStandardDetailInst);
								}
							}
						}
						// 完成情况实例
						CompletionInstDO completionInst = completionInstDao.evalCompletionByAssessmentCommentInst(assessmentCommentInst, assessmentComment, methanolInst, admin);
						// 保存完成情况实例
						completionInstDao.internalSave(completionInst);
					}
				}
			}
			// 启动相关job
			this.startSendMethanolCommitNoticeJob(methanolInst);
			this.startSetMethanolCommitDelayJob(methanolInst);
		}
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void evalCompletionByMethanolInst(Integer methanolId) {
		// 获取ADMIN的id
		UserDO admin = userDao.getByUsername("ADMIN");
		MethanolInstDO methanolInst = this.internalGetById(methanolId);
		List<CompletionInstDO> completionInsts = completionInstDao.getByMethanonInstId(methanolId);
		List<ScoreStandardInstDO> scoreStandardInsts = scoreStandardInstDao.getByMethanonInstId(methanolId);
		
		for (CompletionInstDO completionInst : completionInsts) {
			AssessmentCommentInstDO assessmentCommentInst = completionInst.getAssessmentCommentInst();
			if (!EnumAssessmentSourceType.O.toString().equals(assessmentCommentInst.getType())) {
				for (ScoreStandardInstDO scoreStandardInst : scoreStandardInsts) {
					if (completionInst.getAssessmentCommentInst().equals(scoreStandardInst.getAssessmentCommentInst())) {
						completionInst = completionInstDao.evalCompletion(completionInst, scoreStandardInst, methanolInst, admin);
						completionInstDao.internalUpdate(completionInst);
						break;
					}
				}
			}
		}
	}
	
	/**
	 * 使用定时任务创建评审单
	 * @param scheduler
	 */
	public void generateMethanolInstWithScheduler(Scheduler scheduler){
		String expression = config.getCronExpressionForGenerateMethanolInst();
		if (StringUtils.isNotBlank(expression)) {
			try {
				scheduler = StdSchedulerFactory.getDefaultScheduler();
				createCron(scheduler, "generateMethanolInst", CronGenerateMethanolInstJob.class, CRON_EXPRESSION_FOR_GENERATE_METHANOL_INST, expression);
			} catch (Exception e) {
				e.printStackTrace();
				log.warn("生成评审单失败！" + e.getMessage(), e);
			}
		}
	}
	
	/**
	 * 将评审单的状态不是完成的评审单的状态置为关闭
	 */
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void closeMethanolInst(){
		
		// 检索所有状态不是完成的评审单
		@SuppressWarnings("unchecked")
		List<MethanolInstDO> list = (List<MethanolInstDO>) this.query("from MethanolInstDO t where t.deleted = false and t.status <> ? and t.status <> ?", EnumMethanolStatus.COMPLETE.toString(), EnumMethanolStatus.CLOSED.toString());
		
		for (MethanolInstDO methanolInst : list) {
			// 状态置为关闭
			methanolInst.setStatus(EnumMethanolStatus.CLOSED.toString());
			// 评分置为0
			methanolInst.setScore(0.0);
			this.internalUpdate(methanolInst);
		}
	}
	
	/**
	 * 使用定时任务关闭评审单
	 * @param scheduler
	 */
	public void closeMethanolInstWithScheduler(Scheduler scheduler){
		String expression = config.getCronExpressionForCloseMethanolInst();
		if (StringUtils.isNotBlank(expression)) {
			try {
				scheduler = StdSchedulerFactory.getDefaultScheduler();
				// enddate当前时间 + 一个月
				Calendar cal = Calendar.getInstance();
				cal.add(Calendar.MONTH, 1);
				JobUtils.createCron(scheduler, "closeMethanolInst", GROUP, CronCloseMethanolInstJob.class, CRON_EXPRESSION_FOR_CLOSE_METHANOL_INST, expression, null, cal.getTime());
//				createCron(scheduler, "closeMethanolInst", CronCloseMethanolInstJob.class, CRON_EXPRESSION_FOR_CLOSE_METHANOL_INST, expression);
			} catch (Exception e) {
				e.printStackTrace();
				log.warn("生成评审单失败！" + e.getMessage(), e);
			}
		}
	}
	
	/**
	 * 创建一个job
	 * 
	 * @param scheduler 
	 * @param name 定时任务的名称
	 * @param jobClass 定时任务的实现类
	 * @param cronDefaultExpression 默认的表达式
	 * @param cronExpression 表达式
	 * @param params 参数对
	 */
	private void createCron(final Scheduler scheduler, final String name, final Class<?> jobClass, final String cronDefaultExpression, final String cronExpression, final Object... params) {
		final JobDetail job = new JobDetail(name, GROUP, jobClass);
		if (params != null) {
			Validate.isTrue(params.length % 2 == 0);
			final JobDataMap map = job.getJobDataMap();
			for (int i = 0; i < params.length - 1; i += 2) {
				Validate.isTrue(params[i] instanceof String);
				map.put(params[i], params[i + 1]);
			}
		}
		String cronEx;
		if (StringUtils.isNotBlank(cronExpression) == true) {
			cronEx = cronExpression;
		} else {
			cronEx = cronDefaultExpression;
		}
		final Trigger trigger;
		try {
			trigger = new CronTrigger(name + NAME_SUFIX_TRIGGER, GROUP, cronEx);
		} catch (final ParseException ex) {
			log.error("Could not create cron trigger with expression '" + cronEx + "' (cron job is disabled): " + ex.getMessage(), ex);
			return;
		}
		try {
			// Schedule the job with the trigger
			scheduler.scheduleJob(job, trigger);
		} catch (final SchedulerException ex) {
			log.error("Could not create cron job: " + ex.getMessage(), ex);
			return;
		}
		log.info("Cron job '" + name + "' successfully configured: " + cronEx);
	}
	
	/**
	 * 获取所有安监机构的当前季度的上一个季度的评审单
	 */
	public List<MethanolInstDO> getAllMethanolInst(int year,int season) {
		int currYear = year;
		int currSeason = season;
		if(year==0){
			int[] currentSeason = DateHelper.getSeasonNumOfDate(new Date());
			int tempYear = currentSeason[0];
			int temPSeason = currentSeason[1];
			// 前一季度的年和季度数
			if (tempYear == 1) {
				tempYear -= 1;
				temPSeason = 4;
			} else {
				temPSeason -= 1;
			}
			currYear = tempYear;
			currSeason = temPSeason;
		}
		
		@SuppressWarnings("unchecked")
		List<MethanolInstDO> list = (List<MethanolInstDO>) this.query("from MethanolInstDO t where t.deleted = false and t.season = ? and t.year = ? order by t.created desc ", currSeason, currYear);

		return list;
	}
	
	/**
	 * 获取安监机构的给定时间所在季度的前n个季度的评审单，如果评审单还未评审，将其分数设置为0<br>
	 * @throws Exception 
	 */
	public Map<int[], List<MethanolInstDO>> getMethanolInstsByMultiCon(List<Integer> unitIds, Date date, Integer num) throws Exception {
		if (null == date) {
			date = new Date();
		}
		List<int[]> seasonList = DateHelper.getPreviousSeasonsNum(date, num);
		Map<int[], List<MethanolInstDO>> result = new LinkedHashMap<int[], List<MethanolInstDO>>();
		for (int[] season : seasonList) {
			StringBuffer hql = new StringBuffer("select t from MethanolInstDO t where t.deleted = false and t.season = :season and t.year = :year");
			List<String> params = new ArrayList<String>();
			List<Object> values = new ArrayList<Object>();

			params.add("season");
			values.add(season[1]);
			params.add("year");
			values.add(season[0]);

			hql.append(" and t.unit.id in (:unitIds)");
			params.add("unitIds");
			values.add(unitIds == null || unitIds.isEmpty() ? null : unitIds);
			@SuppressWarnings("unchecked")
			List<MethanolInstDO> list = (List<MethanolInstDO>) this.query(hql.toString(), params.toArray(new String[0]), values.toArray());

			result.put(season, list);
		}
		
		return result;
	}
	
	public Map<String, Object> getMethanolDataMapById(Integer id){
		MethanolInstDO methanol = this.internalGetById(id);
		if(null == methanol){
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "评审单[ID:" + id + "]不存在!");
		}
		
		if (!permissionSetDao.hasUnitPermission(methanol.getUnit().getId(), PermissionSets.VIEW_SAFETY_REVIEW.getName())
			&& !permissionSetDao.hasUnitPermission(methanol.getUnit().getId(), PermissionSets.MANAGE_SAFETY_REVIEW.getName())
			&& !permissionSetDao.hasPermission(PermissionSets.AUDIT_SAFETY_REVIEW.getName())) {
			throw SMSException.NO_ACCESS_RIGHT;
		}
		
		Map<String, Object> methanolMap = this.convert(methanol);

		List<AssessmentProjectInstDO> assessmentProjectInsts = assessmentProjectInstDao.getByMethanolInstId(methanol.getId());
		
		List<Map<String, Object>> assessmentProjectInstMaps = assessmentProjectInstDao.convert(assessmentProjectInsts, true);
		List<CompletionInstDO> completionInsts = completionInstDao.getByMethanonInstId(id);
		for (Map<String, Object> assessmentProjectInstMap : assessmentProjectInstMaps) {
			@SuppressWarnings("unchecked")
			List<Map<String, Object>> assessmentCommentList = (List<Map<String, Object>>) assessmentProjectInstMap.get("assessmentCommentInsts");
	
			for (Map<String, Object> assessmentComment : assessmentCommentList) {
				Iterator<CompletionInstDO> completionInstIt = completionInsts.iterator();
				while (completionInstIt.hasNext()) {
					CompletionInstDO completionInst = completionInstIt.next();
					if (completionInst.getAssessmentCommentInst().getId().equals(assessmentComment.get("id"))) {
						assessmentComment.put("completion", completionInstDao.convert(completionInst));
						completionInstIt.remove();
					}
				}
			}
		}
		methanolMap.put("assessmentProjectInsts", assessmentProjectInstMaps);
		return methanolMap;
	}
	
	/**
	 * 发送评审单提交提醒短信
	 */
	public void startSendMethanolCommitNoticeJob(MethanolInstDO methanol) {
		Scheduler scheduler;
		try {
			// 生成了评审单后，启动延期提交评审单期限前3天每天早上9点发短信的job，直到提交了评审单
			scheduler = StdSchedulerFactory.getDefaultScheduler();
			this.sendMethanolCommitNotice(scheduler, methanol);
		} catch (Exception e) {
			e.printStackTrace();
			log.warn("发送评审单提交提醒短信失败！" + e.getMessage(), e);
		}
	}
	
	public void sendMethanolCommitNotice(Scheduler scheduler, MethanolInstDO methanol) {
		if (StringUtils.isNotBlank(config.getCronExpForSendMethanolCommitNotice()) && EnumMethanolStatus.NEW.toString().equals(methanol.getStatus())) {
			// 标题
			String title = "安全评审单提交提醒";
			// 类容
			String content = "您本季度的安全评审单没有提交, 请及时提交。";
			// 发送提醒用户(ADMIN)
			UserDO sender = userDao.getByUsername("ADMIN");
			// 接收提醒用户
			UserDO receiver = methanol.getCreator();
			// enddate当前时间 + 一个月
			Calendar cal = Calendar.getInstance();
			cal.add(Calendar.MONTH, 1);
			JobUtils.createCron(scheduler, "sendMethanolCommitNoticeJob_" + methanol.getId(), GROUP, CronSendMethanolCommitNoticeJob.class, config.getCronExpForSendMethanolCommitNotice(), config.getCronExpForSendMethanolCommitNotice(), null, cal.getTime(), "title", title, "content", content, "sender", sender.getId().doubleValue(), "receiver", receiver.getId().doubleValue());
		}
	}
	
	public void sendMethanolCommitNotice(Scheduler scheduler) {
		// 查询出状态为新建的评审单
		@SuppressWarnings("unchecked")
		List<MethanolInstDO> methanolInsts = (List<MethanolInstDO>) this.query("from MethanolInstDO t where t.deleted = false and t.status = 'NEW'");
		for (MethanolInstDO methanolInst : methanolInsts) {
			this.sendMethanolCommitNotice(scheduler, methanolInst);
		}
	}
	
	/**
	 * 设置评审单延期标识
	 */
	public void startSetMethanolCommitDelayJob(MethanolInstDO methanol) {
		Scheduler scheduler;
		try {
			// 生成了评审单后，启动置评审单延期标识，直到提交了评审单
			scheduler = StdSchedulerFactory.getDefaultScheduler();
			this.setMethanolCommitDelay(scheduler, methanol);
		} catch (Exception e) {
			e.printStackTrace();
			log.warn("设置评审单延期标识失败！" + e.getMessage(), e);
		}
	}
	
	public void setMethanolCommitDelay(Scheduler scheduler, MethanolInstDO methanol) {
		if (StringUtils.isNotBlank(config.getCronExpForSetMethanolCommitDelay()) && EnumMethanolStatus.NEW.toString().equals(methanol.getStatus())) {
			// enddate当前时间 + 一个月
			Calendar cal = Calendar.getInstance();
			cal.add(Calendar.MONTH, 1);
			JobUtils.createCron(scheduler, "setMethanolCommitDelayJob_" + methanol.getId(), GROUP, CronSetMethanolCommitDelayJob.class, config.getCronExpForSetMethanolCommitDelay(), config.getCronExpForSetMethanolCommitDelay(), null, cal.getTime(), "id", methanol.getId());
		}
	}
	
	public void setMethanolCommitDelay(Scheduler scheduler) {
		// 查询出状态为新建的评审单
		@SuppressWarnings("unchecked")
		List<MethanolInstDO> methanolInsts = (List<MethanolInstDO>) this.query("from MethanolInstDO t where t.deleted = false and t.status = 'NEW'");
		for (MethanolInstDO methanolInst : methanolInsts) {
			this.setMethanolCommitDelay(scheduler, methanolInst);
		}
	}

	@Override
	public boolean hasPermission(Integer id, HttpServletRequest request) {
		MenuItem item = menuCache.getMenuItemById(id);
		String path = item.getPath();
		if("总览/146/安全绩效".equals(path)){
			String unit = request.getParameter("unit");
			if (unit == null) {
				return false;
			}
			int unitId = Integer.parseInt(unit);
			// 浏览安全评审
			return permissionSetDao.hasUnitPermission(unitId, PermissionSets.VIEW_SAFETY_REVIEW.getName(), PermissionSets.MANAGE_SAFETY_REVIEW.getName());
		}else if("安全绩效/安全评审审核".equals(path)){
			// 安全评审审核
			return permissionSetDao.hasPermission(PermissionSets.AUDIT_SAFETY_REVIEW.getName());
		}
		return true;
	}

	public void setUnitDao(UnitDao unitDao) {
		this.unitDao = unitDao;
	}

	public void setAssessmentProjectDao(AssessmentProjectDao assessmentProjectDao) {
		this.assessmentProjectDao = assessmentProjectDao;
	}

	public void setAssessmentProjectInstDao(AssessmentProjectInstDao assessmentProjectInstDao) {
		this.assessmentProjectInstDao = assessmentProjectInstDao;
	}

	public void setAssessmentCommentInstDao(AssessmentCommentInstDao assessmentCommentInstDao) {
		this.assessmentCommentInstDao = assessmentCommentInstDao;
	}

	public void setScoreStandardInstDao(ScoreStandardInstDao scoreStandardInstDao) {
		this.scoreStandardInstDao = scoreStandardInstDao;
	}

	public void setScoreStandardDetailInstDao(ScoreStandardDetailInstDao scoreStandardDetailInstDao) {
		this.scoreStandardDetailInstDao = scoreStandardDetailInstDao;
	}

	public void setScoreStandardDao(ScoreStandardDao scoreStandardDao) {
		this.scoreStandardDao = scoreStandardDao;
	}

	public void setCompletionInstDao(CompletionInstDao completionInstDao) {
		this.completionInstDao = completionInstDao;
	}

	public void setPermissionSetDao(PermissionSetDao permissionSetDao) {
		this.permissionSetDao = permissionSetDao;
	}

	public void setUserDao(UserDao userDao) {
		this.userDao = userDao;
	}

	public void setMethanolRoleDao(MethanolRoleDao methanolRoleDao) {
		this.methanolRoleDao = methanolRoleDao;
	}

	public void setAssessmentUnitDao(AssessmentUnitDao assessmentUnitDao) {
		this.assessmentUnitDao = assessmentUnitDao;
	}

	public void setMenuCache(MenuCache menuCache) {
		this.menuCache = menuCache;
	}

	public void setMessageDao(MessageDao messageDao) {
		this.messageDao = messageDao;
	}
}
