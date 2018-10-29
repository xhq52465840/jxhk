
package com.usky.sms.accessinformation;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;

import org.apache.log4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;
import com.usky.sms.log.ActivityLoggingDao;
import com.usky.sms.log.operation.ActivityLoggingOperationRegister;
import com.usky.sms.organization.OrganizationDO;
import com.usky.sms.organization.OrganizationDao;

public class OrganizationEntityDao extends BaseDao<OrganizationEntityDO> {
	
	public static final SMSException EXIST_SAME_ORGANIZATION = new SMSException(MessageCodeConstant.MSG_CODE_109000002);
	
	@Autowired
	private ActivityLoggingDao activityLoggingDao;
	
	@Autowired
	private OrganizationDao organizationDao;
	
	public OrganizationEntityDao() {
		super(OrganizationEntityDO.class);
	}
	
	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		checkConstraints(map);
		return true;
	}
	
	private void checkConstraints(Map<String, Object> map) {
		int activityId = ((Double) map.get("activity")).intValue();
		int organizationId = ((Double) map.get("organization")).intValue();
		if (this.hasOrganizationEntity(activityId, organizationId)) throw EXIST_SAME_ORGANIZATION;
	}
	
	@Override
	protected void afterSave(OrganizationEntityDO obj) {
		// 添加活动日志
		List<String> details = new ArrayList<String>();
		OrganizationDO organization = organizationDao.internalGetById(obj.getOrganization().getId());
		if (null != organization) {
			Map<String, Object> organizationMap = organizationDao.convert(organization);
			details.add("添加单位为:" + (organization == null ? "" : organizationMap.get("path") + "/" + organizationMap.get("name")));
		}
		if (!details.isEmpty()) {
			MDC.put("details", details.toArray());
			activityLoggingDao.addLogging(obj.getActivity().getId(), ActivityLoggingOperationRegister.getOperation("UPDATE_ACCESSINFO"));
			MDC.remove("details");
		}
	}
	
	@Override
	protected void afterDelete(Collection<OrganizationEntityDO> collection) {
		for (OrganizationEntityDO organizationEntity : collection) {
			if (null != organizationEntity.getOrganization()) {
				// 添加活动日志
				List<String> details = new ArrayList<String>();
				Map<String, Object> organizationMap = organizationDao.convert(organizationEntity.getOrganization());
				details.add("删除了单位:" + organizationMap.get("path") + "/" + organizationMap.get("name"));
				MDC.put("details", details.toArray());
				activityLoggingDao.addLogging(organizationEntity.getActivity().getId(), ActivityLoggingOperationRegister.getOperation("UPDATE_ACCESSINFO"));
				MDC.remove("details");
			}
		}
	}
	
	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		String fieldName = field.getName();
		OrganizationEntityDO entity = (OrganizationEntityDO) obj;
		if ("organization".equals(fieldName)) {
			map.put(fieldName, organizationDao.convert(entity.getOrganization()));
		} else {
			super.setField(map, obj, claz, multiple, field);
		}
	}
	
	public List<OrganizationEntityDO> getByActivityId(int activityId) {
		@SuppressWarnings("unchecked")
		List<OrganizationEntityDO> list = this.getHibernateTemplate().find("from OrganizationEntityDO where deleted = ? and activity.id = ? order by id", false, activityId);
		return list;
	}
	
	public boolean hasOrganizationEntity(int activityId, int organizationId) {
		@SuppressWarnings("unchecked")
		List<OrganizationEntityDO> list = this.getHibernateTemplate().find("from OrganizationEntityDO where deleted = ? and activity.id = ? and organization.id = ?", false, activityId, organizationId);
		return !list.isEmpty();
	}
	
	public void setOrganizationDao(OrganizationDao organizationDao) {
		this.organizationDao = organizationDao;
	}
	
	/**
	 * @param activityLoggingDao the activityLoggingDao to set
	 */
	public void setActivityLoggingDao(ActivityLoggingDao activityLoggingDao) {
		this.activityLoggingDao = activityLoggingDao;
	}
	
}
