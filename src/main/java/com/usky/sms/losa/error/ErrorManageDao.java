package com.usky.sms.losa.error;

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
import com.usky.sms.losa.threat.ThreatManageDO;
import com.usky.sms.user.UserContext;

public class ErrorManageDao extends BaseDao<ErrorManageDO>{

	public ErrorManageDao(){
		super(ErrorManageDO.class);
	}
	
	public List<Object> queryErrorMangeById(String id) throws ParseException{
		String sql="select t.id from ErrorManageDO t where t.deleted=false and t.activityId="+id;
		@SuppressWarnings("unchecked")
		List<Object>list=this.getHibernateTemplate().find(sql);
		return list;
	}
	@SuppressWarnings("unchecked")
	public List<ErrorManageDO>pullErrorManage (String id) throws Exception{
		List<ErrorManageDO>list=new ArrayList<ErrorManageDO>();
		try{
			if(!StringUtils.isEmpty(id)){
				String sql="from ErrorManageDO t where t.deleted=false and t.activityId='"+id+"' order by t.errorCode";
				
				list=this.getHibernateTemplate().find(sql);
				
			}
		}catch(Exception e){
			e.printStackTrace();
		}
		
		return list;
		
		
	}
	
	//删除差错记录
	public void deleteErrorManage(Integer errorId) throws Exception {
		ErrorManageDO errorManageDO = getErrorManageDO(errorId);
		this.internalMarkAsDeleted(errorManageDO);
	}
	
	//根据主键获取差错记录
	public ErrorManageDO getErrorManageDO(Integer errorId){
		return this.getHibernateTemplate().get(ErrorManageDO.class, errorId);
	}
	/**
	 * 保存差错表
	 * 
	 * @param errorManage
	 * @param activityId
	 * @return
	 * @throws Exception
	 */
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public List<Map<String, Object>> saveError(String errorManage,
			String activityId) throws Exception {
		List<Map<String, Object>> errorBackIdList = new ArrayList<Map<String, Object>>();
		// 获取数据库中的差错表IDS
		List<Object> errorIds = this.queryErrorMangeById(activityId);
		if (!StringUtils.isBlank(errorManage)) {
			List<ErrorManageDO> erroList = gson.fromJson(errorManage,
					new TypeToken<List<ErrorManageDO>>() {
					}.getType());
			for (ErrorManageDO error : erroList) {
				// 前台有ID为更新
				if (error.getId() != null) {
					error.setLastModifier(UserContext.getUserId());
					this.internalUndelete(error);
					errorIds.remove(error.getId());
				} else {
					// 没有ID为新增
					Map<String, Object> errorBackId = new HashMap<String, Object>();
					error.setActivityId(Integer.valueOf(activityId));
					error.setLastModifier(UserContext.getUserId());
					error.setCreator(UserContext.getUserId());
					Integer backId = (Integer) this
							.internalSave(error);
					errorBackId.put("localId", error.getLocalId());
					errorBackId.put("serverId", backId);
					errorBackIdList.add(errorBackId);
				}
			}
			// 本地没有而数据库中有的数据进行删除
			if (errorIds.size() > 0) {
				final int size = errorIds.size();
				String[] ids = new String[size];
				for (int i = 0; i < size; i++) {
					ids[i] = String.valueOf(errorIds.get(i));
				}
				this.delete(ids);
			}

		}
		return errorBackIdList;

	}
	
}
