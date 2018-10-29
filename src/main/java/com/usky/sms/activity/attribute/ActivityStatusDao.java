
package com.usky.sms.activity.attribute;

import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.core.BaseDao;
import com.usky.sms.core.TransactionHelper;
import com.usky.sms.uwf.WfSetup;

public class ActivityStatusDao extends BaseDao<ActivityStatusDO> {
	
	@Autowired
	private TransactionHelper transactionHelper;
	
	public ActivityStatusDao() {
		super(ActivityStatusDO.class);
	}
	
	@Override
	protected void afterGetList(List<Map<String, Object>> list, Map<String, Object> paramMap, Map<String, Object> searchMap, List<String> orders) {
		if (list.size() > 0) {
			StringBuilder sb = new StringBuilder();
			for (Object obj : list) {
				@SuppressWarnings("unchecked")
				Map<String, Object> map = (Map<String, Object>) obj;
				sb.append(map.get("id")).append(",");
			}
			@SuppressWarnings("unchecked")
			Map<String, Object> idWorkflowsMap = (Map<String, Object>) transactionHelper.doInTransaction(new WfSetup(), "GetActivityStatusList", sb.substring(0, sb.length() - 1));
			for (Object obj : list) {
				@SuppressWarnings("unchecked")
				Map<String, Object> map = (Map<String, Object>) obj;
				map.put("workflows", idWorkflowsMap.get(map.get("id").toString()));
			}
		}
	}
	
	/**
	 * 通过类别和名称查找activity的状态，如果没有返回null，否则返回第一条数据
	 */
	public ActivityStatusDO getByCategoryAndName(String category, String name){
		if(StringUtils.isBlank(category) && StringUtils.isBlank(name)){
			return null;
		}
		@SuppressWarnings("unchecked")
		List<ActivityStatusDO> list = (List<ActivityStatusDO>) this.query("from ActivityStatusDO t where t.deleted = false and t.name = ? and t.category = ?", name, category);
		if(list.isEmpty()){
			return null;
		}
		return list.get(0);
		
	}
	
	public void setTransactionHelper(TransactionHelper transactionHelper) {
		this.transactionHelper = transactionHelper;
	}
	
}
