package com.usky.sms.losa.activity;

import java.text.ParseException;
import java.util.ArrayList;
import java.util.List;

import org.apache.commons.lang.StringUtils;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.google.gson.reflect.TypeToken;
import com.usky.sms.core.BaseDao;
import com.usky.sms.user.UserContext;

public class ObserveApproachDao extends BaseDao<ObserveApproachDO>{

	public ObserveApproachDao() {
		super(ObserveApproachDO.class);
	}
	//查询观察活动稳定进近参数主键ids
	public List<Object> queryApproachById(String id) throws ParseException{
		String sql="select t.id from ObserveApproachDO t where t.deleted = false and t.observeId="+id;
		@SuppressWarnings("unchecked")
		List<Object> list = this.getHibernateTemplate().find(sql);
		return list;
	}
	
	//查询观察活动下稳定进近参数信息
	@SuppressWarnings("unchecked")
	public List<ObserveApproachDO> queryObserveApproach(String id) throws Exception{
		List<ObserveApproachDO> list = new ArrayList<ObserveApproachDO>();
		try{
			if(StringUtils.isNotBlank(id)){
				String sql=" from ObserveApproachDO t where t.deleted = false and t.observeId='"+id
						+"' order by t.approachTime";
				list = this.getHibernateTemplate().find(sql);
			}else{
				ObserveApproachDO approach=new ObserveApproachDO();
				list.add(approach);
			}
		}catch(Exception e){
			e.printStackTrace();
		}
		return list;
	}
	
	//保存观察活动下稳定进行参数信息
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void saveObserveApproach(String observeApproach,String observeId) throws Exception{
		if (!StringUtils.isBlank(observeApproach)) {
			List<ObserveApproachDO> approachList = 
					gson.fromJson(observeApproach, new TypeToken<List<ObserveApproachDO>>(){}.getType());
			List<Object> approachIds = this.queryApproachById(observeId);
			for(ObserveApproachDO approach:approachList){
				if(approach.getId() != null){
					approach.setLastModifier(UserContext.getUserId());
					this.internalUpdate(approach);
					approachIds.remove(approach.getId());
				}else{
					approach.setLastModifier(UserContext.getUserId());
					approach.setCreator(UserContext.getUserId());
					approach.setObserveId(Integer.valueOf(observeId));
					this.internalSave(approach);
				}
			}
			if(approachIds.size() > 0){
				final int size = approachIds.size();
				String[] ids = new String[size];
				for (int i = 0; i < size; i++) {
					ids[i] = String.valueOf(approachIds.get(i));
				}
				this.delete(ids);
			}
		}
	}

}
