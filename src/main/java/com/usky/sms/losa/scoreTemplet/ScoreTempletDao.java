package com.usky.sms.losa.scoreTemplet;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.hibernate.SQLQuery;
import org.hibernate.Session;
import org.springframework.beans.factory.annotation.Autowired;



import com.usky.sms.core.BaseDao;
import com.usky.sms.losa.plan.TaskPlanDao;
import com.usky.sms.losa.score.ScoreSelectContentDO;
import com.usky.sms.losa.score.ScoreSelectContentDao;


public class ScoreTempletDao extends BaseDao<ScoreTempletDO>{

	public ScoreTempletDao(){
		super(ScoreTempletDO.class);
	}
	@Autowired
	private ScoreSelectContentDao scoreSelectContentDao;
	private TaskPlanDao taskPlanDao;
	
	public List<Map<String,Object>>queryScoreTemp(String observeId,String flyStageName) throws Exception{
		List<Map<String,Object>>list=new ArrayList<Map<String,Object>>();
		
		try{
			List<ScoreSelectContentDO>scoreSelcectList=scoreSelectContentDao.getAllList();
			//根据观察活动ID获取计划状态
			String planStatus=null;
			if(StringUtils.isNotBlank(observeId)){
				planStatus=taskPlanDao.getStatusByObserveId(Integer.valueOf(observeId));
			}
			String sql=null;
			//如果计划状态是已完成时，获取的评分模板不区分是否有效，且评分值为空时不返回，如果计划状态不是已完成时，返回的有效的评分模板
			 if(planStatus.equals("done")){
				 sql=" select t.score_standard,t.score_items,t.score_items_explain,t.score_item_content,t.score_select_type,s.score_select_key,t.fly_stage_name,"
				    		+ " s.id as scoreId, s.OBSERVE_ID,t.id as scoreTempId"
		                       + " from l_score_templet t left join (select ls.id, ls.OBSERVE_ID,ls.score_select_key,ls.score_temp_id  from l_score ls "
		                       + " where ls.deleted=0 and ls.observe_id="+observeId+")s" 
		                       + " on t.id = s.score_temp_id where s.score_select_key is not null"
		                       + "  order by t.score_items_sort";
			 }else{
				 sql=" select t.score_standard,t.score_items,t.score_items_explain,t.score_item_content,t.score_select_type,s.score_select_key,t.fly_stage_name,"
				    		+ " s.id as scoreId, s.OBSERVE_ID,t.id as scoreTempId"
		                       + " from l_score_templet t left join (select ls.id, ls.OBSERVE_ID,ls.score_select_key,ls.score_temp_id from l_score ls "
		                       + " where ls.deleted=0 and ls.observe_id="+observeId+")s" 
		                       + " on t.id = s.score_temp_id where t.deleted=0 "
		                       + "  order by t.score_items_sort";
			 }       
		    Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();
		    SQLQuery query = session.createSQLQuery((sql).toString());
			List<?> scoreTemp=query.list();
			if(scoreTemp.size()>0){
				for(int i=0;i<scoreTemp.size();i++){
					Map<String,Object>map=new HashMap<String,Object>();
					
					Object[] obj=(Object[])scoreTemp.get(i);
							map.put("scoreStandard", obj[0]);
							map.put("scoreItems", obj[1]);
							map.put("scoreItemsExplan", obj[2]);
							map.put("scoreItemContent", obj[3]);
							map.put("scoreSelectKey", obj[5]);
							map.put("selectType", obj[4]);
							//PC段查询的时候，需要查询对应评分结果
							if(StringUtils.isNotBlank(flyStageName)){
								List<ScoreSelectContentDO>select=scoreSelectContentDao.queryByType(Integer.valueOf(String.valueOf(obj[4])), scoreSelcectList);
								map.put("scoreSelect", select);
							}
							map.put("flyStageName", obj[6]);
							map.put("scoreId", obj[7]);
							map.put("scoreTempId", obj[9]);
							list.add(map);
						}
					 }
					
		}catch(Exception e){
			e.printStackTrace();
		}
		return list;
	}
    public List<Map<String,Object>> getFlyStageScore(String flyStageName,List<Map<String,Object>> scoreList) throws Exception{
    	List<Map<String,Object>>list=new ArrayList<Map<String,Object>>();
    	try{
    		for(Map<String,Object> score:scoreList){
    			if(score.get("flyStageName").equals(flyStageName)){
    				list.add(score);
    			}
    		}
    	}catch(Exception e){
    		e.printStackTrace();
    	}
    	return list;
    }
    public Date queryLastUpdateTime() throws Exception{
    	Date date=null;
    	try{
    		String sql="select max(LAST_UPDATE) from L_SCORE_TEMPLET t where t.deleted=0";
    		 Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();
 		    SQLQuery query = session.createSQLQuery((sql).toString());
 			List<?> list=query.list();
 			if(list.size()>0){
 				date=(Date)list.get(0);
 			}
    	}catch(Exception e){
    		e.printStackTrace();
    	}
    	return date;
    }
	
	public Map query(String id, String flyStage, Integer start, Integer length) throws Exception{
	  String sql = "";
	  Map resultmap = new HashMap<>();
	  if(StringUtils.isBlank(id)){
	    sql="select * from L_SCORE_TEMPLET where fly_stage_name ='"+flyStage+"' order by deleted, score_items_sort, id";
	  }else{
	    sql="select * from L_SCORE_TEMPLET where id = "+id+" ";
	  }
		Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();
    SQLQuery query = session.createSQLQuery(sql);
    int count = query.list().size(); 
    query.setFirstResult(start);
    query.setMaxResults(length);
		List<Object[]> list= query.list();
		resultmap.put("all", count);
    resultmap.put("result", list);
		return resultmap;
	}

	 public List<ScoreSelectContentDO> queryScoreSelectContent() throws Exception{
	    String sql="from ScoreSelectContentDO";
	    @SuppressWarnings("unchecked")
	    List<ScoreSelectContentDO> list=this.getHibernateTemplate().find(sql);
	    return list;
	  }
	
	public Serializable saveScoreTemplet(ScoreTempletDO  data) throws Exception{
	  if (data.getId() != null) {
		    ScoreTempletDO objdo = this.getHibernateTemplate().get(ScoreTempletDO.class, Integer.valueOf(data.getId()));
		    data.setCreated(objdo.getCreated());
		    Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();
		    session.clear();
		    data.setLastUpdate();
		    session.update(data);
		    session.flush();
		    return data.getId();
    } else {
      final Serializable id = this.internalSave(data);
      return id;
    }
  }
	public boolean querySort(ScoreTempletDO  scoreTempletDo) throws Exception{
		boolean flag=false;
		  try{			
		    String sql ="select score_items_sort,id from L_SCORE_TEMPLET where fly_stage_name ='"+scoreTempletDo.getFlyStageName()+"' and score_items_sort='"+scoreTempletDo.getScoreItemsSort()+"'and deleted=0";
			Session session0 = getHibernateTemplate().getSessionFactory().getCurrentSession();
		    SQLQuery query = session0.createSQLQuery(sql);
		    List<Object[]> list= query.list();
		    if(list.size()>0){
		    	if(scoreTempletDo.getId()!=null){
		    		int oldId=scoreTempletDo.getId();
		    	for(int i=0;i<list.size();i++){
					Object[] obj=(Object[]) list.get(i);
					BigDecimal id = (BigDecimal) obj[1];
					if(id.equals((BigDecimal.valueOf(oldId)))){
						flag=true;
					}
		    	}
		     }
		    }else{
		    	flag=true;
		    }}catch(Exception e){
	    		e.printStackTrace();
	    	}
    	return flag;
        }
    	
	 public void deletedScoreTemplet(ScoreTempletDO  data) throws Exception{
     ScoreTempletDO objdo = this.getHibernateTemplate().get(ScoreTempletDO.class, Integer.valueOf(data.getId()));
	    this.internalMarkAsDeleted(objdo);
	  }
	 
	 public void addScoreTemplet(ScoreTempletDO  data) throws Exception{
     ScoreTempletDO objdo = this.getHibernateTemplate().get(ScoreTempletDO.class, Integer.valueOf(data.getId()));
     this.internalUndelete(objdo);
   }
	public ScoreSelectContentDao getScoreSelectContentDao() {
		return scoreSelectContentDao;
	}
	public void setScoreSelectContentDao(ScoreSelectContentDao scoreSelectContentDao) {
		this.scoreSelectContentDao = scoreSelectContentDao;
	}
	public TaskPlanDao getTaskPlanDao() {
		return taskPlanDao;
	}
	public void setTaskPlanDao(TaskPlanDao taskPlanDao) {
		this.taskPlanDao = taskPlanDao;
	}
	 
}
