
package com.usky.sms.audit.workflow;

import java.text.Collator;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.common.ResponseHelper;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.SMSException;

public class AuditWorkflowSchemeService extends AbstractService {
	
	@Autowired
	private AuditWorkflowSchemeDao auditWorkflowSchemeDao;
	
	/**
	 * 获取审计信息的类别
	 * @param request
	 * @param response
	 */
	public void getAuditInfoType(HttpServletRequest request, HttpServletResponse response) {
		String name = request.getParameter("name");
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		for (EnumAuditInfoType audtInfoType : EnumAuditInfoType.values()) {
			if (!StringUtils.isBlank(name) && !StringUtils.containsIgnoreCase(audtInfoType.getName(), name)) {
				continue;
			}
			Map<String, Object> audtInfoTypeMap = new HashMap<String, Object>();
			audtInfoTypeMap.put("id", audtInfoType.toString());
			audtInfoTypeMap.put("name", audtInfoType.getName());
			list.add(audtInfoTypeMap);
		}
		// 按名称排序
		Collections.sort(list, new Comparator<Map<String, Object>>() {
			Collator collator = Collator.getInstance();
			@Override
			public int compare(Map<String, Object> o1, Map<String, Object> o2) {
				String name1 = (String) o1.get("name");
				String name2 = (String) o2.get("name");
				return collator.compare(name1, name2);
			}
		});
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("success", true);
		map.put("data", list);
		ResponseHelper.output(response, map);
	}
	
	/**
	 * 添加审计工作流
	 * @param request
	 * @param response
	 */
	public void addAuditWorkflowScheme(HttpServletRequest request, HttpServletResponse response) {
		String auditInfoType = request.getParameter("auditInfoType");
		String workflowTemplate = request.getParameter("workflowTemplate");
		if (StringUtils.isBlank(auditInfoType) || StringUtils.isBlank(workflowTemplate)) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "审计信息类型和工作流模板为必选项!");
		}
		int id = auditWorkflowSchemeDao.addAuditWorkflowScheme(auditInfoType, workflowTemplate);
		
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("success", true);
		map.put("data", id);
		ResponseHelper.output(response, map);
	}

	public void setAuditWorkflowSchemeDao(AuditWorkflowSchemeDao auditWorkflowSchemeDao) {
		this.auditWorkflowSchemeDao = auditWorkflowSchemeDao;
	}
}
