
package com.usky.sms.tem;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import com.usky.sms.core.BaseDao;

public class ActionItemOperationDao extends BaseDao<ActionItemOperationDO> {
	
	public ActionItemOperationDao() {
		super(ActionItemOperationDO.class);
	}
	
	@SuppressWarnings("unchecked")
	public List<ActionItemOperationDO> getAllByActionItem(ActionItemDO actionItem) {
		return (List<ActionItemOperationDO>) this.query("from ActionItemOperationDO t where t.actionItem = ?", actionItem);
	}
	
	@SuppressWarnings("unchecked")
	public List<ActionItemOperationDO> getAllByActionItems(List<ActionItemDO> actionItems) {
		if (actionItems == null || actionItems.isEmpty()) {
			return Collections.emptyList();
		}
		return (List<ActionItemOperationDO>) this.query("from ActionItemOperationDO t where t.actionItem in (:actionItems)", Arrays.asList(new String[]{"actionItems"}), actionItems);
	}
	
}
