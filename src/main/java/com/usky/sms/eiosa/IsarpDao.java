package com.usky.sms.eiosa;

import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.beanutils.PropertyUtils;
import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang.ObjectUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.log4j.MDC;
import org.hibernate.Hibernate;
import org.hibernate.Query;
import org.hibernate.SQLQuery;
import org.hibernate.Session;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.hibernate.Session;
import org.hibernate.type.StandardBasicTypes;
import org.hibernate.type.Type;

import com.google.gson.reflect.TypeToken;
import com.usky.comm.JsonUtil;
import com.usky.sms.audit.log.operation.AuditActivityLoggingOperationRegister;
import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.core.BaseDao;
import com.usky.sms.eiosa.user.EiosaUserGroupDao;
import com.usky.sms.user.UserContext;


public class IsarpDao extends IsarpBaseDao<IsarpDO>{
	
    public IsarpDao(){
    	super(IsarpDO.class);
    }
    @Autowired
    private OperateLogDao operateLogDao;
    @Autowired
    private IosaCodeDao iosaCodeDao;
    @Autowired
    private AssessmentsDao assessmentsDao;
    @Autowired
    private SectionTaskDao sectionTaskDao;
    @Autowired
    private EiosaUserGroupDao eiosaUserGroupDao;
    @Autowired
    private SectionDao sectionDao;
  /** @Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		String fieldName = field.getName();
		IsarpDO isarp = (IsarpDO) obj;
		
		if ("lastUpdate".equals(fieldName)) {
			SimpleDateFormat dateformat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
			map.put("lastUpdate", dateformat.format(isarp.getLastUpdate()));
		} else {
			super.setField(map, obj, claz, multiple, field);
		}
	}*/
    /**
     * 提交
     * @param isarpId
     * @throws Exception
     */
    public void submitIsarp(Integer isarpId) throws Exception{
    	try{
    		Map<String,Object>map=new HashMap<String,Object>();
    		map.put("status",4);
    		map.put("last_modifier",UserContext.getUserId());
    		this.update(isarpId, map);
    		//修改改ISARP的一级二级父级的状态
			this.updateFatherStatusByIsarp(isarpId);
    		
    	}catch(Exception e){
    		e.printStackTrace();
    	}
    }
    /**
     * 审核通过
     * @param isarpId
     * @throws Exception
     */
    public void auditFinish(Integer isarpId) throws Exception{
    	try{
    		Map<String,Object>map=new HashMap<String,Object>();
    		map.put("status",5);
    		map.put("last_modifier",UserContext.getUserId());
    		this.update(isarpId, map);
    		//修改改ISARP的一级二级父级的状态
    		this.updateFatherStatusByIsarp(isarpId);
    	}catch(Exception e){
    		e.printStackTrace();
    	}
    }
    /**
     * 审核不通过
     * @param isarpId
     * @throws Exception
     */
    public void noAudited(Integer isarpId) throws Exception{
    	//查找该条isarp的最初始状态,如果isarpId在isarpHistory的curIsarpId里面则进行过重新审计，否则没有进行过重新审计，
    	//若进行过重新审计，则审核不通过时状态为重新审计即6，否则为审计中即3
    	String hql="select count(*) from IsarpHistoryDO t where t.curIsarpId.id=?";
    	List<Object>list=this.getHibernateTemplate().find(hql, isarpId);
    	if(list.size()>0){
    		Map<String,Object>map=new HashMap<String,Object>();
    		if(Integer.valueOf(String.valueOf(list.get(0)))==0){
    			map.put("status",3);
    		}else{
    			map.put("status",6);
    		}
    		map.put("last_modifier",UserContext.getUserId());
    	    this.update(isarpId, map);
    	  //修改改ISARP的一级二级父级的状态
			this.updateFatherStatusByIsarp(isarpId);
    	}
    	
    }
    /**
     * 更新Isarp状态
     * @param type
     * @param id
     * @return
     * @throws Exception
     */
    public boolean updateIsarpStatus(String type,String id) throws Exception{
    	int i=0;
    	try{
    		Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();
    		session.beginTransaction();
    		Integer userId=UserContext.getUserId();
    		Date date=new Date();
    		SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    		String dateString=format.format(date);
    		String sql="";
    		if(type.equals("submit")){
    			 sql="update IsarpDO t set t.status=4, t.last_modifier="+userId+" ,t.lastUpdate=to_date('"+dateString+"','YYYY/MM/DD HH24:MI:SS')  where t.id="+id;
    		}else if(type.equals("audit")){
    			 sql="update IsarpDO t set t.status=5,  t.last_modifier="+userId+" ,t.lastUpdate=to_date('"+dateString+"','YYYY/MM/DD HH24:MI:SS')  where t.id="+id;
    		}
    		
    		Query query = session.createQuery(sql);
    		 i=query.executeUpdate(); 
    		session.getTransaction().commit();
    		
    		
    	}catch(Exception e){
    		e.printStackTrace();
    	}
    	if(i>0){
			return true;
		}else{
			return false;
		}
    }
    public List<IsarpDO> queryIsarpNo(String no,Integer sectionId, boolean like) throws Exception{
  	StringBuilder sb = new StringBuilder("select isarp from IsarpDO isarp where isarp.deleted = false and isarp.id in(select max(t.id) from IsarpDO t where t.deleted=false and t.libType=2  ");
    	StringBuilder sbend = new StringBuilder(" group by t.no) order by isarp.no_sort ");
    	List<Object> params = new ArrayList<Object>();
    	if (!StringUtils.isBlank(no)) {
    		String likestr = like ? "like" : "=";
    		String matchendstr = like ? "%" : "";
    		sb.append(" and t.no "+likestr+" ? ");
    		params.add(no + matchendstr);
    	}
    	if (sectionId!=null) {
    		sb.append(" and t.sectionId.id= ? ");
    		params.add(sectionId);
    	}
    	String hql = sb.append(sbend).toString();
		List<IsarpDO>list = (List<IsarpDO>) this.query(hql, params.toArray());
		return list;
	}
//    public IsarpDO queryIsarp(String id) throws Exception{
//		IsarpDO this.getHibernateTemplate().get(IsarpDO.class, id);
//		IsarpDO isarpDO = null;
//		if(CollectionUtils.isNotEmpty(list)) isarpDO =  list.get(0);
//    	return isarpDO;
//    }
    
	public IsarpDO get(Integer isarpId) {
		return this.getHibernateTemplate().get(IsarpDO.class, isarpId);
    }
	
    @Override
	protected void beforeUpdate(int id, Map<String, Object> map) {
    
		map.put("last_modifier", UserContext.getUserId());
		try {
			saveActLog(id, map);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
	}
    
	private void saveActLog(int id, Map<String, Object> map) throws Exception {
		IsarpDO isarp =(IsarpDO) this.internalGetById(id);
		List<String> details = new ArrayList<String>();
	
		String key;
		key = EiosaIsarpFieldEnum.STATUS.getName();
		if (map.containsKey(key)) {
			//修改状态
			Integer value =  new BigDecimal(String.valueOf(map.get(key))).intValue();
			if(isarp.getStatus()==null){
				IosaCodeDO status=iosaCodeDao.queryIosaCodeById(value);
				details.add("【"+EiosaIsarpFieldEnum.STATUS.getComment()+"】:由[]-->修改为："+ status.getCode_name());
			}else{
				Integer dbvalue = isarp.getStatus().getId();
				if (!ObjectUtils.equals(dbvalue, value) ){
					//根据状态ID获取状态的值
					//IosaCodeDO status=iosaCodeDao.getHibernateTemplate().get(IosaCodeDO.class, value);
					IosaCodeDO status=iosaCodeDao.queryIosaCodeById(value);
					details.add("【"+EiosaIsarpFieldEnum.STATUS.getComment()+"】:由'" +isarp.getStatus().getCode_name()+"'-->修改为："+ status.getCode_name());
				}
			}
		}
		key = EiosaIsarpFieldEnum.ASSESSMENT.getName();
		if (map.containsKey(key)) {
			//修改assessment
			    if(isarp.getAssessment()==null){
					Integer value = new BigDecimal(String.valueOf(map.get(key))).intValue();// BigDecimal.valueOf(();
				    AssessmentsDO assessment=assessmentsDao.queryAssessmentsById(value);
				    details.add("【"+EiosaIsarpFieldEnum.ASSESSMENT.getComment()+"】:由[]" +"-->修改为：" + assessment.getText());
					
			    }else{
			    	Integer dbvalue = isarp.getAssessment().getId();
					Integer value = new BigDecimal(String.valueOf(map.get(key))).intValue();// BigDecimal.valueOf(();
					if (!ObjectUtils.equals(dbvalue, value) ){
						AssessmentsDO assessment=assessmentsDao.queryAssessmentsById(value);
						details.add("【"+EiosaIsarpFieldEnum.ASSESSMENT.getComment()+"】:由'" +isarp.getAssessment().getText()+"'-->修改为：" + assessment.getText());
					}
			    }
				
			}
			
		
		key = EiosaIsarpFieldEnum.REASON.getName();
		if (map.containsKey(key)) {
			//修改reason
			String value =(String)map.get(key);
			String dbvalue = isarp.getReason();
			if(dbvalue==null){
				if (!ObjectUtils.equals(dbvalue, value) ){
					details.add("【"+EiosaIsarpFieldEnum.REASON.getComment()+"】:由[]-->修改为："+ value);
				}
				
			}else{
				if (!ObjectUtils.equals(dbvalue, value) ){
					details.add("【"+EiosaIsarpFieldEnum.REASON.getComment()+"】:由'" +dbvalue+"'-->修改为："+ value);
				}
			}
		}
		key = EiosaIsarpFieldEnum.ROOTCAUST.getName();
		if (map.containsKey(key)) {
			//修改rootCause
			String dbvalue = isarp.getRootCause();
			String value =(String)map.get(key);
			if(dbvalue==null){
				if (!ObjectUtils.equals(dbvalue, value) ){
				details.add("【"+EiosaIsarpFieldEnum.ROOTCAUST.getComment()+"】:由[]-->修改为：" + value);
				}
			}else{
				if (!ObjectUtils.equals(dbvalue, value) ){
					details.add("【"+EiosaIsarpFieldEnum.ROOTCAUST.getComment()+"】:由'" +dbvalue+"'-->修改为：" + value);
				}
			}
		}
		key = EiosaIsarpFieldEnum.TAKEN.getName();
		if (map.containsKey(key)) {
			//修改taken
			
			String dbvalue = isarp.getTaken();
			String value =(String)map.get(key);
			if(dbvalue==null){
				if (!ObjectUtils.equals(dbvalue, value) ){
				details.add("【"+EiosaIsarpFieldEnum.TAKEN.getComment()+"】:由[]-->修改为：" + value);
				}
			}else{
				if (!ObjectUtils.equals(dbvalue, value) ){
					details.add("【"+EiosaIsarpFieldEnum.TAKEN.getComment()+"】:由'" +dbvalue+"'-->修改为：" + value);
				}
			}
		}
		key = EiosaIsarpFieldEnum.COMMENTS.getName();
		if (map.containsKey(key)) {
			//修改comments
			String dbvalue = isarp.getComments();
		    String value =(String)map.get(key);
		    if(dbvalue==null){
		    	if (!ObjectUtils.equals(dbvalue, value) ){
		    	details.add("【"+EiosaIsarpFieldEnum.COMMENTS.getComment()+"】:由[]-->修改为：" + value);
		    	}
		    }else{
		    	if (!ObjectUtils.equals(dbvalue, value) ){
					details.add("【"+EiosaIsarpFieldEnum.COMMENTS.getComment()+"】:由'" +dbvalue+"'-->修改为：" + value);
				}
		    }		
		}
		if (!details.isEmpty()) {
			//MDC.put("details", details.toArray());
			operateLogDao.addLog(id,EiosaLogTypeEnum.ISARP.getKey(),EiosaLogOperateTypeEnum.COMFORMITY.getKey(), JsonUtil.toJson(details));
			//MDC.remove("details");
		}
	}
   public IsarpDO queryIsarpById(String id) throws Exception{
	   String hql="from IsarpDO t where t.id=? and t.deleted=false";
	   List<IsarpDO> list=this.getHibernateTemplate().find(hql,Integer.valueOf(id));
	   if(list.size()>0){
		   return list.get(0);
	   }else{
		   return null;
	   }
	   
   }
   @Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
	   
   }
  public List<Object> getIsarpCharpter(String rule,Map<String, Object> queryMap,Integer startNum,Integer length,String sortby,String sortorders) throws Exception{
	  List<IsarpDO>list=new ArrayList<IsarpDO>();
	  List<Object>result=new ArrayList<Object>();
	  try{  
		  String acronyms=(String) queryMap.get("acronyms");
		  String charpter=(String) queryMap.get("charpter");
		  Integer reportId=(Integer) queryMap.get("reportId");
		  String sectionIdstr=(String) queryMap.get("sectionId");
		  Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();
	  	  Query query =null;
	  	 StringBuilder sb0 = new StringBuilder("select  count(*) ");
		  StringBuilder sb = new StringBuilder("from IsarpDO isarp   where  isarp.deleted=false and isarp.libType='2' and isarp.levels=3 and isarp.sectionId.reportId=:reportId ");
		 // List<Object> params = new ArrayList<Object>();
		 // params.add(reportId);
			List<String> params = new ArrayList<String>();
			List<Object> values = new ArrayList<Object>();		  
			//query.setParameter("reportId", reportId);
			params.add("reportId");
			values.add(reportId);
		  if (!StringUtils.isBlank(sectionIdstr)) {
			  Integer sectionId=Integer.valueOf(sectionIdstr);
			  sb.append(" and  isarp.sectionId.id=:sectionId");
			  params.add("sectionId");
			  values.add(sectionId);
			//  params.add(sectionId);
			 // query.setParameter("sectionId", sectionId);
		  }
		  if(!StringUtils.isBlank(acronyms)){
			  
			  sb.append(" and :acronyms=any(select ch.documentid.acronyms from ChapterDO ch where ch.deleted=false and ch.isarpId=isarp.id and ch.documentid.reportId= :reportId)");
			  params.add("acronyms");
			  values.add(acronyms);
			  params.add("reportId");
			  values.add(reportId);
			  // params.add(acronyms);
			  //params.add(reportId);
			 // query.setParameter("acronyms", acronyms);
			 // query.setParameter("reportId", reportId);
		  }
		  if(!StringUtils.isBlank(charpter)){
			  //对章节进行拆分
			  
			  String[] charpterStrs=charpter.split(",");
			  for(int i=0;i<charpterStrs.length;i++){
				  String charpters= charpterStrs[i];
				  if(i==0 && charpterStrs.length==1){
					  sb.append(" and 0<any(select count(*) from ChapterDO ch where ch.deleted=false and ch.documentid.reportId=:reportId and ch.isarpId=isarp.id  and (regexp_like (ch.dec, :charpter"+i+")=1))");
					  params.add("reportId");
					  values.add(reportId);
					  params.add("charpter"+i);
					  values.add("([^.0-9]|[[:alpha:]][.])"+charpters+"([^0-9]|$)");
				  }else if(i==0 && charpterStrs.length>1){
					  sb.append(" and 0<any(select count(*) from ChapterDO ch where ch.deleted=false and ch.documentid.reportId=:reportId and ch.isarpId=isarp.id  and (regexp_like (ch.dec, :charpter"+i+")=1");
					  params.add("reportId");
					  values.add(reportId);
					  params.add("charpter"+i);
					  values.add("([^.0-9]|[[:alpha:]][.])"+charpters+"([^0-9]|$)");
				  }else if(i>0 && i!=(charpterStrs.length-1)){
					  sb.append(" or regexp_like (ch.dec, :charpter"+i+")=1");
					  params.add("charpter"+i);
					  values.add("([^.0-9]|[[:alpha:]][.])"+charpters+"([^0-9]|$)");
				  }else if(i>0 && i==(charpterStrs.length-1)){
					  sb.append(" or regexp_like (ch.dec, :charpter"+i+")=1))");
					  params.add("charpter"+i);
					  values.add("([^.0-9]|[[:alpha:]][.])"+charpters+"([^0-9]|$)");
				  }
			  }
			 
			  
		  }
		  if(!StringUtils.isBlank(sortby)&&!StringUtils.isBlank(sortorders)){
			  sb.append(" order by "+sortby+" "+sortorders+"");
         }else{
        	 sb.append("  order by isarp.sectionId,isarp.no_sort ");		
         }
		  
		  //获取总数
		  query=session.createQuery(sb0.append(sb).toString());
		  this.setNamedParameterToQuery(query, params, values);
		  int length0 = ((Long)query.list().get(0)).intValue();
		  
		  //resultMap.put("totalLength", length0);
		  result.add(length0);
		  query=session.createQuery(sb.toString());
		  query.setFirstResult(startNum);
		  query.setMaxResults(length);
		  this.setNamedParameterToQuery(query, params, values);
		  
		  list=query.list();
		  List<Map<String,Object>>resultList=new ArrayList<Map<String,Object>>();
		  for(IsarpDO isarp:list){
			  Map<String,Object>resultMap=new HashMap<String,Object>();
			  resultMap.put("isarpId", isarp.getId());
			  resultMap.put("sectionId", isarp.getSectionId().getId());
			  resultMap.put("sectionName", isarp.getSectionId().getSectionName());
			  resultMap.put("no", isarp.getNo());
			  resultMap.put("text", isarp.getText());
			  String charp="";
			  if(isarp.getCharpter().size()>0){
				  for(ChapterDO ch:isarp.getCharpter()){
					  if(ch.getDec()!=null && !"".equals(ch.getDec())){
						  charp+="("+ch.getDocumentid().getAcronyms()+")"+ch.getDec()+";";
					  }
				  }
			  }
			  resultMap.put("chapter", charp);
			  if(isarp.getStatus()!=null){
				  resultMap.put("status", isarp.getStatus().getCode_name());
			  }else{
				  resultMap.put("status", "");
			  }
			 
			  if(isarp.getAssessment()!=null){
				  resultMap.put("conformity", isarp.getAssessment().getText());
			  }else{
				  resultMap.put("conformity", "");
			  }
			 
			  resultList.add(resultMap);
		  }
		  result.add(resultList);
		  
	  }catch(Exception e){
		  e.printStackTrace();
	  }
	  return result;
  }
  /**
   * 重新审计
   * @param isarpId
   * @return
   * @throws Exception
   */
  public Integer reauditIasrp(String isarpId) throws Exception{
	  Integer newIsarpId=null;
	  try{
		//修改isarp为历史状态
		Map<String,Object>isarpLibType=new HashMap<String,Object>();
		isarpLibType.put("libType",3);
  		this.update(Integer.valueOf(isarpId), isarpLibType);
  		//查询isarp
  		IsarpDO isarp=this.queryIsarpById(isarpId);
  		IsarpDO newIsarp=this.creatIsarp(isarp);
  		newIsarpId=(Integer)this.internalSave(newIsarp);
  		//添加协调人
  		sectionTaskDao.addReauditDealer(Integer.valueOf(isarpId), newIsarpId);
		//修改父级isarp的状态
  		this.updateFatherStatusByIsarp(newIsarpId);
  		//添加Log
  		operateLogDao.addLog(newIsarpId,"isarp","reaudit", "开始重新审计");
  		//添加站内通知
  		Integer isarpDealerId=eiosaUserGroupDao.getDealerByIsarpId(newIsarpId);
  		if(isarpDealerId!=null){
  			operateLogDao.addNotice("您的isarp需要重新审计", "重新审计", isarpDealerId, newIsarpId);
  		}
  		
	  }catch(Exception e){
		  e.printStackTrace();
	  }
	  return newIsarpId;
	  
  }
  private  IsarpDO creatIsarp(IsarpDO isarpDO){
		IsarpDO newIsarp=new IsarpDO();
		newIsarp.setBaseId(isarpDO.getBaseId());
		newIsarp.setCreator(UserContext.getUserId());
		newIsarp.setLast_modifier(UserContext.getUser());
		newIsarp.setGuidance(isarpDO.getGuidance());
		newIsarp.setLevels(isarpDO.getLevels());
		newIsarp.setLibType(2);
		newIsarp.setNo(isarpDO.getNo());
		newIsarp.setNo_sort(isarpDO.getNo_sort());
		newIsarp.setSectionId(isarpDO.getSectionId());
		IosaCodeDO code=new IosaCodeDO();
		code.setId(6);
		newIsarp.setStatus(code);
		newIsarp.setText(isarpDO.getText());
		return newIsarp;
	}
  /**
   * 修改Isarp的父级的一级二级状态
   * @param isarpId
   * @throws Exception
   */

	private void updateFatherStatusByIsarp(Integer isarpId) throws Exception{
  	//根据isarpId查出isarp
  	IsarpDO isarp=this.getHibernateTemplate().get(IsarpDO.class, isarpId);
  	
  		String isarpNoSort=isarp.getNo_sort();
  		Integer sectionId=isarp.getSectionId().getId();
  		//直接父级NO
  		String firstFatherNo=isarpNoSort.substring(0, 6);
  		IsarpDO firstFatherIsarp=this.queryFatherIsarp(sectionId, firstFatherNo);
  	    this.updateAllFatherStatus(isarp, firstFatherIsarp, "1");
  		//第二父级NO
  		String sencondFatherNo=isarpNoSort.substring(0,3);
  		IsarpDO sencondFatherIsarp=this.queryFatherIsarp(sectionId, sencondFatherNo);
  		 this.updateAllFatherStatus(isarp, sencondFatherIsarp, "1");
  	}
  
	private void updateAllFatherStatus(IsarpDO currentIsarp,IsarpDO firstFatherIsarp,String level) throws Exception{
		if(currentIsarp.getStatus().getId().equals(6)){
  			//表示修改为重新审计，重新审计时，只要直接父级的状态不是审计中，就修改，6表示重新审计，3审计中
  			if(!firstFatherIsarp.getStatus().getId().equals(3)){
  				this.updateFatherStatus(firstFatherIsarp.getId(), 3);
  			}else {
  			
  			if(!firstFatherIsarp.getStatus().getId().equals(currentIsarp.getStatus().getId())){
  		  	  		}
  		  		}
  		}else if(currentIsarp.getStatus().getId().equals(5)){
  		  		//审核通过或者审核中
  				   Integer firstStatus=null;
  				    if(level.equals("1")){//直接父节点
  				    	 firstStatus=this.checkFatherAllchildIsarpStatus(currentIsarp.getSectionId().getId(), currentIsarp.getStatus().getId(), firstFatherIsarp.getNo_sort(), firstFatherIsarp.getNo_sort()+"999");
  				    }else if(level.equals("2")){//第二父节点
  				    	 firstStatus=this.checkFatherAllchildIsarpStatus(currentIsarp.getSectionId().getId(), currentIsarp.getStatus().getId(), firstFatherIsarp.getNo_sort(), firstFatherIsarp.getNo_sort()+"999999");
  				    }
  		  	  		
  		  	  		if(firstStatus!=null && firstStatus==0){
  		  	  			this.updateFatherStatus(firstFatherIsarp.getId(), currentIsarp.getStatus().getId());
  		  	  		}
  		  }else if(currentIsarp.getStatus().getId().equals(4)){
  			//审核中
  			  Integer firstStatus=null;
  			  if(level.equals("1")){
  				firstStatus=this.checkAuditReauditNum(currentIsarp.getSectionId().getId(), firstFatherIsarp.getNo_sort(), firstFatherIsarp.getNo_sort()+"999");
  			  }else if(level.equals("2")){
  				firstStatus=this.checkAuditReauditNum(currentIsarp.getSectionId().getId(), firstFatherIsarp.getNo_sort(), firstFatherIsarp.getNo_sort()+"999999");
  			  }
  			if(firstStatus!=null && firstStatus==0){
	  	  		this.updateFatherStatus(firstFatherIsarp.getId(), currentIsarp.getStatus().getId());
	  	  	}
  		}
	}
  		
	
	//查找父级节点的状态
	private IsarpDO queryFatherIsarp(Integer sectionId, String fatherNoSort){
		String firstHql="from IsarpDO t where t.sectionId.id=? and t.libType=2 and t.no_sort=? and t.deleted=false";
		List<IsarpDO>father=this.getHibernateTemplate().find(firstHql,sectionId,fatherNoSort);
		
		if(father.size()>0){
			return father.get(0);
		}else{
			return null;	
		}
		
	}
	//查找父级下属所有isarp非checkStatus的个数
	private Integer checkFatherAllchildIsarpStatus(Integer sectionId,Integer checkStatus,String startNoSort,String endNoSort){
		
		String checkHql="select count(*) from IsarpDO t where t.sectionId.id=? and  t.status.id!=? and t.no_sort>? and t.no_sort<? and t.libType=2 and  t.deleted=false";
  		List<Object>checkResult=this.getHibernateTemplate().find(checkHql,sectionId, checkStatus,startNoSort,endNoSort);
  		if(checkResult.size()>0){
  			
  			return Integer.valueOf(String.valueOf(checkResult.get(0)));
  		}else{
  			
  			return null;
  		}
	}
	//查找父级下属审计中或重新审计状态的个数
		private Integer checkAuditReauditNum(Integer sectionId,String startNoSort,String endNoSort){
			
			String checkHql="select count(*) from IsarpDO t where t.sectionId.id=? and  (t.status.id='3' or t.status.id='6') and t.no_sort>? and t.no_sort<? and t.libType=2 and  t.deleted=false";
	  		List<Object>checkResult=this.getHibernateTemplate().find(checkHql,sectionId, startNoSort,endNoSort);
	  		if(checkResult.size()>0){
	  			
  			return Integer.valueOf(String.valueOf(checkResult.get(0)));
  		}else{
  			
  			return null;
  		}
	}
	//修改父级节点的状态
	private void updateFatherStatus(Integer fatherIsarpId,Integer changeStatus){
		Map<String,Object>map=new HashMap<String,Object>();
		map.put("status", changeStatus);
		this.update(fatherIsarpId, map);
	}
	public OperateLogDao getOperateLogDao() {
		return operateLogDao;
	}
	public void setOperateLogDao(OperateLogDao operateLogDao) {
		this.operateLogDao = operateLogDao;
	}
	public IosaCodeDao getIosaCodeDao() {
		return iosaCodeDao;
	}
	public void setIosaCodeDao(IosaCodeDao iosaCodeDao) {
		this.iosaCodeDao = iosaCodeDao;
	}
	public AssessmentsDao getAssessmentsDao() {
		return assessmentsDao;
	}
	public void setAssessmentsDao(AssessmentsDao assessmentsDao) {
		this.assessmentsDao = assessmentsDao;
	}
	public SectionTaskDao getSectionTaskDao() {
		return sectionTaskDao;
	}
	public void setSectionTaskDao(SectionTaskDao sectionTaskDao) {
		this.sectionTaskDao = sectionTaskDao;
	}
	public EiosaUserGroupDao getEiosaUserGroupDao() {
		return eiosaUserGroupDao;
	}
	public void setEiosaUserGroupDao(EiosaUserGroupDao eiosaUserGroupDao) {
		this.eiosaUserGroupDao = eiosaUserGroupDao;
	}
	
	
}
