package com.usky.sms.losa;

import java.util.List;




import org.apache.commons.lang.StringUtils;

import com.google.gson.reflect.TypeToken;
import com.usky.sms.core.BaseDao;
import com.usky.sms.user.UserContext;

public class CrewInterviewDao extends BaseDao<CrewInterviewDO>{
	public CrewInterviewDao(){
		super(CrewInterviewDO.class);
	}

	@SuppressWarnings("unchecked")
	public CrewInterviewDO pullCrewInterview (String id) throws Exception{
		List<CrewInterviewDO>list=null;
		if(!StringUtils.isBlank(id)){
			String sql="from CrewInterviewDO t where t.deleted=false and t.activityId=?";
			
			list=this.getHibernateTemplate().find(sql,Integer.valueOf(id));
		}
		if(list!=null && list.size()>0){
			return list.get(0);
		}else{
			CrewInterviewDO cw=new CrewInterviewDO();
			return cw;
		}
	}
	public void pushCrewInterview(String crewInterview,String activityId) throws Exception{
		try{
			CrewInterviewDO cw = gson.fromJson(crewInterview,
					new TypeToken<CrewInterviewDO>() {
					}.getType());
			cw.setActivityId(Integer.valueOf(activityId));
			if (cw.getId() != null) {
				cw.setLastModifier(UserContext.getUserId());
				this.internalUpdate(cw);
			} else {
				cw.setActivityId(Integer.valueOf(activityId));
				cw.setCreator(UserContext.getUserId());
				cw.setLastModifier(UserContext.getUserId());
				Integer crewInterviewId = (Integer) this.internalSave(cw);
				//backSaveIds.put("crewInterBackId", crewInterviewId);
			}
			
		}catch(Exception e){
			e.printStackTrace();
		}
	}
}
