package com.usky.sms.eiosa;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.usky.sms.core.BaseDao;

public class AssessmentsDao extends BaseDao<AssessmentsDO>{

	public AssessmentsDao(){
		super(AssessmentsDO.class);
	}
	
	public List<Map<String, Object>> getAssessmentsOptions() {
		List<Map<String, Object>> result = new ArrayList<Map<String,Object>>();
		
		String hql="from AssessmentsDO t order by t.id";
		List<AssessmentsDO> assessments = this.getHibernateTemplate().find(hql);
		for(AssessmentsDO ado : assessments) {
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("text", ado.getType()+"("+ado.getText()+")");
			map.put("value", ado.getId());
			result.add(map);
		}
		
		return result;
	}
	public AssessmentsDO queryAssessmentsById(Integer id) throws Exception{
		String hql="from AssessmentsDO t where t.id=?";
		List<AssessmentsDO>list=this.getHibernateTemplate().find(hql,id);
		if(list.size()>0){
			return list.get(0);
		}else{
			return null;
		}
	}
}
