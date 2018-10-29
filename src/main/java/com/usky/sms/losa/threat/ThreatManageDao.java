package com.usky.sms.losa.threat;

import java.text.ParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.google.gson.reflect.TypeToken;
import com.usky.sms.core.BaseDao;
import com.usky.sms.losa.plan.TaskPlanDO;
import com.usky.sms.user.UserContext;

public class ThreatManageDao extends BaseDao<ThreatManageDO>{
	public ThreatManageDao(){
		super(ThreatManageDO.class);
	}
	public List<Object> queryThreatMangeById(String id) throws ParseException{
		String sql="select t.id from ThreatManageDO t where t.deleted=false and t.activityId="+id;
		@SuppressWarnings("unchecked")
		List<Object>list=this.getHibernateTemplate().find(sql);
		return list;
	}
	@SuppressWarnings("unchecked")
	public List<ThreatManageDO>pullThreatMnanage (String id) throws Exception{
		List<ThreatManageDO>list=new ArrayList<ThreatManageDO>();
		try{
			if(!StringUtils.isEmpty(id)){
				String sql="from ThreatManageDO t where t.deleted=false and t.activityId='"+id+"' order by t.threatCode";
				
				list=this.getHibernateTemplate().find(sql);
				
			}
		}catch(Exception e){
			e.printStackTrace();
		}
		
		return list;
		
	}
	
   //删除威胁记录
	public void deleteThreatManage(Integer threatId) throws Exception {
		ThreatManageDO threatManageDO = getThreatManageDO(threatId);
		this.internalMarkAsDeleted(threatManageDO);
	}
	
	//根据主键获取威胁记录
	public ThreatManageDO getThreatManageDO(Integer threatId){
		return this.getHibernateTemplate().get(ThreatManageDO.class, threatId);
	}
	/**
	 * 保存威胁表
	 * 
	 * @param threatManage
	 * @param activityId
	 * @return
	 * @throws Exception
	 */
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public List<Map<String, Object>> saveThreat(String threatManage,
			String activityId) throws Exception {
		List<Map<String, Object>> threatBackIdList = new ArrayList<Map<String, Object>>();
		if (!StringUtils.isBlank(threatManage)) {
			List<ThreatManageDO> threatList = gson.fromJson(threatManage,
					new TypeToken<List<ThreatManageDO>>() {
					}.getType());
			List<Object> threatIds = this
					.queryThreatMangeById(activityId);
			for (ThreatManageDO threat : threatList) {
				if (threat.getId() != null) {
					threat.setLastModifier(UserContext.getUserId());
					this.internalUpdate(threat);
					threatIds.remove(threat.getId());
				} else {
					threat.setActivityId(Integer.valueOf(activityId));
					threat.setLastModifier(UserContext.getUserId());
					threat.setCreator(UserContext.getUserId());
					Integer backId = (Integer) this
							.internalSave(threat);
					Map<String, Object> threatBackId = new HashMap<String, Object>();
					threatBackId.put("localId", threat.getLocalId());
					threatBackId.put("serverId", backId);
					threatBackIdList.add(threatBackId);
				}
			}
			if (threatIds.size() > 0) {
				final int size = threatIds.size();
				String[] ids = new String[size];
				for (int i = 0; i < size; i++) {
					ids[i] = String.valueOf(threatIds.get(i));
				}
				this.delete(ids);
			}

		}
		return threatBackIdList;
	}
}
