
package com.usky.sms.matrix;

import java.util.List;
import java.util.Map;

import com.usky.sms.common.DateHelper;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;
import com.usky.sms.user.UserContext;

public class MatrixDao extends BaseDao<MatrixDO> {
	
	public static final SMSException MARTRIX_STATUS_ERROR = new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "禁用状态下不能发布！");
	
	public static final SMSException MARTRIX_PUBLISH_ERROR = new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "未发布状态下不能禁用！");
	
	public MatrixDao() {
		super(MatrixDO.class);
	}
	
	@Override
	protected void setFields(Map<String, Object> map, Object obj, Class<?> claz, List<String> fields, boolean multiple, boolean showExtendFields) {
		MatrixDO matrix = (MatrixDO) obj;
		map.put("lastUpdate", DateHelper.formatIsoSecond(matrix.getLastUpdate()));
		map.put("created", DateHelper.formatIsoSecond(matrix.getCreated()));
		super.setFields(map, obj, claz, fields, multiple, showExtendFields);
	}
	
	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		map.put("creator", UserContext.getUserId());
		map.put("lastUpdater", UserContext.getUserId());
		map.put("publish", "N");
		map.put("status", "Y");
		return true;
	}
	
	@Override
	protected void beforeUpdate(int id, Map<String, Object> map) {
		map.put("lastUpdater", UserContext.getUserId());
		MatrixDO matrixDO = this.internalGetById(id);
		//禁用的不能发布
		if ("Y".equals(map.get("publish")) && "N".equals(matrixDO.getStatus())) throw MARTRIX_STATUS_ERROR;
		
		//未发布的不能禁用
		if ("N".equals(map.get("status")) && "N".equals(matrixDO.getPublish())) throw MARTRIX_PUBLISH_ERROR;
		
		if (map.get("publish") == null && map.get("status") == null) {
			map.put("publish", "N");
		}
	}
}
