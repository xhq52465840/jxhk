package com.usky.sms.audit.sheet;

import java.io.InputStream;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.math.NumberUtils;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate3.support.HibernateDaoSupport;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.audit.auditReport.AuditReportDao;
import com.usky.sms.audit.base.ItemDO;
import com.usky.sms.audit.base.ItemDao;
import com.usky.sms.audit.base.ProfessionUserDao;
import com.usky.sms.audit.check.CheckDO;
import com.usky.sms.audit.plan.EnumPlanType;
import com.usky.sms.audit.task.TaskDao;
import com.usky.sms.common.NumberHelper;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.SMSException;
import com.usky.sms.dictionary.DictionaryDO;
import com.usky.sms.dictionary.DictionaryDao;
import com.usky.sms.organization.OrganizationDO;
import com.usky.sms.unit.UnitDO;
import com.usky.sms.unit.UnitRoleActorDao;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;

public class SheetDao extends HibernateDaoSupport{
	
	@Autowired
	private DictionaryDao dictionaryDao;
	
	@Autowired
	private ItemDao itemDao;
	
	@Autowired
	private UnitRoleActorDao unitRoleActorDao;
	
	@Autowired
	private ProfessionUserDao professionUserDao;
	
	@Autowired
	private TaskDao taskDao;
	
	@Autowired
	private AuditReportDao auditReportDao;

	@SuppressWarnings("unchecked")
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public List<CheckDO> getCheckSheet(Map<String, Object> ruleMap,String sort) throws ParseException {
		List<Integer> professions = new ArrayList<Integer>();
		if (ruleMap.get("checkType") != null && !"".equals(ruleMap.get("checkType"))){
			professions.addAll((List<Integer>) ruleMap.get("checkType"));
		}
		String checkName = (String) ruleMap.get("checkName");
		String checkNo = (String) ruleMap.get("checkNo");
		String startDate = (String) ruleMap.get("startDate");
		String endDate = (String) ruleMap.get("endDate");
		List<Object> target = (List<Object>) ruleMap.get("target");
		String address = (String) ruleMap.get("address");
		String remark = (String) ruleMap.get("remark");
		String record = (String) ruleMap.get("record");
		String result = (String) ruleMap.get("result");
		String flowStatus = (String) ruleMap.get("flowStatus");
		List<String> planType = (List<String>) ruleMap.get("planType");
		// 现场检查和专项检查对应的检查类别(SYS,SUB2)
		List<String> checkGrade = (List<String>) ruleMap.get("checkGrade");
		List<Integer> operatorIds = auditReportDao.getViewableOperatorIdsForImproveIssue(null, null);
		StringBuffer sql = new StringBuffer("from CheckDO  t where t.deleted = false and t.task.deleted = false and t.task.plan.deleted = false");
		List<Object> param = new ArrayList<Object>();
		sql.append(" and (");
		if (planType == null || !planType.contains(EnumPlanType.SPOT.toString()) || planType.size() > 1) {
			sql.append(" (t.task.planType <> '" + EnumPlanType.SPOT.toString() + "' and t.task.id in (" + taskDao.getPermittedTaskBaseHql(planType) + "))");
		}
		if (planType == null || planType.contains(EnumPlanType.SPOT.toString())) {
			if (operatorIds != null && !operatorIds.isEmpty()) {
				if (planType == null || planType.size() > 1) {
					sql.append(" or");
				}
				sql.append(" (t.task.planType = '" + EnumPlanType.SPOT.toString() + "' and t.task.operator in ('" + StringUtils.join(operatorIds, "','") + "'))");
			}
		}
		sql.append(" )");
		if (planType != null && planType.size() > 0){
			sql.append(" and t.task.planType in ('"+StringUtils.join(planType, "','")+"')");
		}
		if (checkGrade != null && !checkGrade.isEmpty()){
			sql.append(" and t.task.checkType in ('" + StringUtils.join(checkGrade, "','") + "')");
		}
		if (professions.size() > 0) {
			sql.append(" and t.checkType.id in (" + StringUtils.join(professions, ",") + ")");
		}
		if (checkName != null && !"".equals(checkName)) {
			sql.append(" and upper(t.checkName) like upper(?)");
			param.add("%" + checkName + "%");
		}
		if (checkNo != null && !"".equals(checkNo)) {
			sql.append(" and upper(t.checkNo) like upper(?)");
			param.add("%" + checkNo + "%");
		}
		if (startDate != null && endDate != null && !"".equals(startDate) && !"".equals(endDate)) {
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
			sql.append(" and t.startDate >= ?");
			param.add(sdf.parse(startDate));
			sql.append(" and t.endDate <= ?");
			param.add(sdf.parse(endDate));
		}
		if (target != null && !target.isEmpty()) {
			List targetList = null;
			if (target.get(0) instanceof String) {
				targetList = auditReportDao.stripImproveUnitPrefix((List) target);
			} else {
				targetList = NumberHelper.convertToIntegerList((List) target);
			}
			if (targetList.size() > 0){
				sql.append(" and t.target in ('"+StringUtils.join(targetList, "','")+"')");
			}
		}
		if (address != null && !"".equals(address)) {
			sql.append(" and upper(t.address) like upper(?)");
			param.add("%" + address + "%");
		}
		if (remark != null && !"".equals(remark)) {
			sql.append(" and upper(t.remark) like upper(?)");
			param.add("%" + remark + "%");
		}
		if (record != null && !"".equals(record)) {
			sql.append(" and upper(t.record) like upper(?)");
			param.add("%" + record + "%");
		}
		if (result != null && !"".equals(result)) {
			sql.append(" and upper(t.result) like upper(?)");
			param.add("%" + result + "%");
		}
		if (flowStatus != null && !"".equals(flowStatus)) {
			sql.append(" and upper(t.flowStatus) like upper(?)");
			param.add("%" + flowStatus + "%");
		}
		if (sort != null &&  !"".equals(sort) && sort.indexOf("planTime") == -1){
			sql.append(" order by " + sort);
		}
		List<CheckDO> list = this.getHibernateTemplate().find(sql.toString(),param.toArray());
		return list;
	}
	
	@SuppressWarnings("unchecked")
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void importItem(HttpServletRequest request, Integer versionId, String type_) throws Exception{
		String sql = "from ItemDO item where item.deleted = false and item.type = '" + type_ + "' and item.parent is null";
		ItemDO sysItem = (ItemDO) this.getHibernateTemplate().find(sql).get(0);
		DictionaryDO version = dictionaryDao.internalGetById(versionId);
		List<DictionaryDO> dics = dictionaryDao.getListByType("系统分类");
		Map<String, DictionaryDO> sysMap = new HashMap<String, DictionaryDO>();
		for (DictionaryDO dic : dics) {
			sysMap.put(dic.getName(), dic);
		}
		
		DiskFileItemFactory fac = new DiskFileItemFactory();
		ServletFileUpload upload = new ServletFileUpload(fac);
		upload.setHeaderEncoding("utf-8");
		List<FileItem> list = upload.parseRequest(request);
		for (FileItem item : list) {
			if (!item.isFormField()) {
				InputStream in = item.getInputStream();
				Workbook workbook = null;
				try {
					workbook = WorkbookFactory.create(in);
				} catch (Exception e) {
					throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, item.getName() + "不是有效的Excel文件!");
				}
				Sheet sheet = workbook.getSheetAt(0);
				int rows = sheet.getLastRowNum();
				Set<String> chapters = new HashSet<String>();
				ItemDO itemChapter = null;
				List<ItemDO> items = new ArrayList<ItemDO>();
				for (int i = 1; i <= rows; i++){
					Row row = sheet.getRow(i);
					int column = row.getLastCellNum();
					if (column <= 2) {
						continue;
					}
					String[] values = new String[column + 7];
					for (int j = 0; j < column; j++){
						Cell cell = row.getCell(j);
						if (cell != null){
							values[j] = cell.toString().trim();
						} else {
							values[j] = "";
						}
					}
					// 编号和审计要点为空时不插入
					if (StringUtils.isBlank(values[3]) || StringUtils.isBlank(values[4])) {
						continue;
					}
					// 序号列校验
					if (StringUtils.isNotBlank(values[0]) && !NumberUtils.isNumber(values[0])) {
						throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "第" + (i + 1) + "行数据的序号不是有效的数字");
					}
					// 分数列校验
					if (StringUtils.isNotBlank(values[7]) && !NumberUtils.isNumber(values[7])) {
						throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "第" + (i + 1) + "行数据的分数不是有效的数字");
					}
					// 序号
					Integer orderNo = NumberHelper.toInteger(values[0].toString());
					// 专业
					DictionaryDO profession = sysMap.get(values[1]);
					// 章节
					String chapter = values[2];
					//类型
					String type = type_;
					// 要点编号 + 审计要点
					String point = values[3] + values[4];
					// 审计依据
					String according = values[5];
					// 审计提示
					String prompt = values[6];
					// 分数
					Integer value = StringUtils.isBlank(values[7]) ? null : NumberHelper.toInteger(values[7]);
					if (!chapters.contains(chapter)){
						itemChapter = new ItemDO(sysItem, "chapter", type, orderNo, profession, version, chapter, null, null, null, UserContext.getUser());
						itemDao.internalSave(itemChapter);
						chapters.add(chapter);
					}
					ItemDO itemPoint = new ItemDO(itemChapter, "point", type, orderNo, profession, version, point, according, prompt, value, UserContext.getUser());
					items.add(itemPoint);
				}
				itemDao.internalSave(items);
			}
		}
	}
	
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public List<OrganizationDO> getOrganizationUseSheet(String type, String term) {
		UserDO user = UserContext.getUser();
		List<UnitDO> units = unitRoleActorDao.getByUser(user.getId().toString());
		if (units.size() == 0) return new ArrayList<OrganizationDO>();
		List<Integer> unitIds = this.getInteger(units);
		StringBuffer sql = new StringBuffer("from OrganizationDO t where t.deleted = false and t.unit.id in (" + StringUtils.join(unitIds, ",") + ")");
		if ("SUB2".equals(type)){
			sql.append(" and t.olevel = '3'");
		} else if ("SUB3".equals(type)){
			sql.append(" and t.olevel = '4'");
		}
		if (term != null && !"".equals(term)){
			sql.append(" and upper(t.name) like upper('%" + term +"%')");
		}
		@SuppressWarnings("unchecked")
		List<OrganizationDO> list = this.getHibernateTemplate().find(sql.toString());
		return list;
	}
	
	private List<Integer> getInteger(List<UnitDO> units) {
		List<Integer> list = new ArrayList<Integer>();
		for (UnitDO unit : units) {
			list.add(unit.getId());
		}
		return list;
	}
	
	public void setDictionaryDao(DictionaryDao dictionaryDao) {
		this.dictionaryDao = dictionaryDao;
	}

	public void setItemDao(ItemDao itemDao) {
		this.itemDao = itemDao;
	}

	public void setUnitRoleActorDao(UnitRoleActorDao unitRoleActorDao) {
		this.unitRoleActorDao = unitRoleActorDao;
	}



	public void setProfessionUserDao(ProfessionUserDao professionUserDao) {
		this.professionUserDao = professionUserDao;
	}



	public void setTaskDao(TaskDao taskDao) {
		this.taskDao = taskDao;
	}


	public void setAuditReportDao(AuditReportDao auditReportDao) {
		this.auditReportDao = auditReportDao;
	}

}
