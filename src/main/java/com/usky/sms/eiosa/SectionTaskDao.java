package com.usky.sms.eiosa;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.List;

import org.apache.axis.utils.StringUtils;
import org.hibernate.Query;
import org.hibernate.SQLQuery;
import org.hibernate.Session;
import org.springframework.beans.factory.annotation.Autowired;

import com.usky.comm.JsonUtil;
import com.usky.sms.audit.auditor.AuditorDO;
import com.usky.sms.audit.auditor.AuditorDao;
import com.usky.sms.core.BaseDao;
import com.usky.sms.message.MessageDO;
import com.usky.sms.message.MessageDao;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserDao;

public class SectionTaskDao  extends BaseDao<SectionTaskDO>{
	public SectionTaskDao(){
		super(SectionTaskDO.class);
	}
	@Autowired
	private OperateLogDao operateLogDao;
	@Autowired
	private AuditorDao auditorDao;
	@Autowired
	private MessageDao messageDao;
	@Autowired
	private IsarpDao isarpDao;
	@Autowired
	private SectionDao sectionDao;
	public boolean addDealer(String sectionId,String dealerId,String isarpId,String level,String operateFlag,String isarpNo)   throws  Exception{

		boolean result=false;
	
		try{
			Collection<SectionTaskDO> collection=new ArrayList<SectionTaskDO>();
			//如果isarpId==null表示是添加section联络人，否则是给isarp添加联络人
			if(isarpId==null){
				
				//删除section以及section下面isarp的审计员
				this.deleteSectionDealer(Integer.valueOf(sectionId));
				//查找section以及section下面isarp的审计员
				List<Object[]>list=this.getAllIsarpIdInSection(Integer.valueOf(sectionId));
				//批量添加isarpDealer
				this.setIsarpDealer(list, collection, Integer.valueOf(dealerId));
				//添加sectionDealer
				this.setDealer(1,Integer.valueOf(sectionId), Integer.valueOf(dealerId), collection);
				
			}else{
				//给isarp添加审计员
				if(level.equals("3")){
					//先删除
					this.deleteIsarpDealer(Integer.valueOf(isarpId));
					//再插入
					this.setDealer(2,Integer.valueOf(isarpId), Integer.valueOf(dealerId), collection);
				}else{
					//先删除
					this.deleteFatherIsarpDealer(Integer.valueOf(sectionId), isarpNo);
					//查找父节点下的isarp
					List<Object[]>list=this.getAllIsarpIdInFatherIsarp(Integer.valueOf(sectionId), isarpNo);
					this.setIsarpDealer(list, collection, Integer.valueOf(dealerId));
				}
				
			}
			this.internalSave(collection);
			//添加站内通知
			this.addSectionTaskNotice(sectionId,isarpNo, Integer.parseInt(dealerId));
			result=true;
		}catch(Exception e){
			e.printStackTrace();
		}
		return result;
		
	}
	/**
	 * 添加isarpDealer
	 * @param list
	 * @param taskColl
	 * @param dealerId
	 * @return
	 * @throws Exception
	 */
	private Collection<SectionTaskDO> setIsarpDealer(List<Object[]>list,Collection<SectionTaskDO>taskColl,Integer dealerId) throws Exception{
		
		try{
			if(list.size()>0){
				for(int i=0;i<list.size();i++){
					SectionTaskDO auditor=new SectionTaskDO();
					auditor.setCreator(UserContext.getUserId());
					auditor.setLast_modifier(UserContext.getUserId());
					AuditorDO au=new AuditorDO();
					au.setId(dealerId);
					auditor.setDealerId(au);
					auditor.setTargetId(Integer.valueOf(String.valueOf(list.get(i))));
					auditor.setType(2);
					auditor.setValidity(1);
					taskColl.add(auditor);
					
				}
				//添加isarp日志
				this.addSectionTaskLog(taskColl,EiosaLogTypeEnum.ISARP.getKey());
			}
			
		}catch(Exception e){
			e.printStackTrace();
		}
		return taskColl;
	}
	/**
	 * 添加单条dealer
	 * @param sectionId
	 * @param dealerId
	 * @param taskColl
	 * @return
	 * @throws Exception
	 */
	private Collection<SectionTaskDO> setDealer(Integer type,Integer targertId,Integer dealerId,Collection<SectionTaskDO>taskColl)throws Exception{
		try{
			SectionTaskDO section=new SectionTaskDO();
			section.setCreator(UserContext.getUserId());
			section.setLast_modifier(UserContext.getUserId());
			AuditorDO aud=new AuditorDO();
			aud.setId(dealerId);
			section.setDealerId(aud);
			section.setTargetId(targertId);
			section.setType(1);
			section.setValidity(1);
			taskColl.add(section);
			//添加section日志
			Collection<SectionTaskDO>sectionColl=new ArrayList<SectionTaskDO>(); 
			sectionColl.add(section);
			this.addSectionTaskLog(sectionColl,EiosaLogTypeEnum.SECTION.getKey());
		}catch(Exception e){
			e.printStackTrace();
		}
		return taskColl;
	}
	/**
	 * 单条删除dealer
	 * @param isarpId
	 * @throws Exception
	 */
	private void deleteIsarpDealer(Integer isarpId) throws Exception{
		try{
			String sql=" delete SectionTaskDO t where t.targetId="+isarpId;
			Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();
			Query delete= session.createQuery(sql);
			delete.executeUpdate();
			session.beginTransaction().commit();
		}catch(Exception e){
			e.printStackTrace();
		}
	}
	/**
	 * 删除section及section下所有isarp的dealer
	 * @param sectionId
	 * @param isarpId
	 * @throws Exception
	 */
	private void deleteSectionDealer(Integer sectionId) throws Exception{
		try{
			String deleteAuditor="delete SectionTaskDO t where t.targetId in (select t1.id from IsarpDO  t1 where t1.deleted=false and t1.libType=2 and t1.sectionId="+sectionId+") or t.targetId="+sectionId;
			Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();
			Query delete= session.createQuery(deleteAuditor);
			delete.executeUpdate();
			session.beginTransaction().commit();
			
		}catch(Exception e){
			e.printStackTrace();
		}
	}
	/**
	 * 删除所有fatherIsarp下的dealer
	 * @param sectionId
	 * @param isarpNo
	 * @throws Exception
	 */
	private void deleteFatherIsarpDealer(Integer sectionId,String isarpNo) throws Exception{
		try{
			String deleteSql="delete  SectionTaskDO t1 where t1.targetId in( select t.id from IsarpDO t  where t.deleted=false and t.libType='2' and  t.sectionId="+sectionId+" and (t.no like '"+isarpNo+".%' or t.no ='"+isarpNo+"'))"; 
			Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();
			Query delete= session.createQuery(deleteSql);
			delete.executeUpdate();
			session.beginTransaction().commit();
			
		}catch(Exception e){
			e.printStackTrace();
		}
	}
	/**
	 * 查找section下面的所有isarp
	 * @param sectionId
	 * @return
	 * @throws Exception
	 */
	private List<Object[]> getAllIsarpIdInSection(Integer sectionId) throws Exception {
		List<Object[]>list=new ArrayList<Object[]>();
		try{
			Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();
			
			String sql=" select t.id from e_iosa_isarp t   where t.deleted=0 and t.libType=2 and t.sectionId="+sectionId;
			SQLQuery query=session.createSQLQuery((sql).toString());
			list=query.list();
		}catch(Exception e){
			e.printStackTrace();
		}
		if(list.size()>0){
			return list;
		}else{
			return null;
		}
	}
	/**
	 * 查找fatherIsarp下面的isarp
	 * @param sectionId
	 * @param isarpNo
	 * @return
	 * @throws Exception
	 */
	private List<Object[]> getAllIsarpIdInFatherIsarp(Integer sectionId,String isarpNo) throws Exception {
		List<Object[]>list=new ArrayList<Object[]>();
		try{
			Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();
			String sql="select t.id from e_iosa_isarp t  where t.deleted=0 and t.libType='2' and t.sectionId="+sectionId+" and (t.no like '"+isarpNo+".%' or t.no ='"+isarpNo+"')";
			SQLQuery query=session.createSQLQuery((sql).toString());
			list=query.list();
		}catch(Exception e){
			e.printStackTrace();
		}
		if(list.size()>0){
			return list;
		}else{
			return null;
		}
	} 

	public void addReauditDealer(Integer targerId, Integer isarpId) throws Exception{
		try{
			String hql="from SectionTaskDO t where t.deleted=false and t.targetId=?";
			List<SectionTaskDO>list=this.getHibernateTemplate().find(hql,targerId);
			if(list.size()>0){
				SectionTaskDO task=new SectionTaskDO();
				task.setTargetId(isarpId);
				task.setCreator(UserContext.getUserId());
				task.setLast_modifier(UserContext.getUserId());
				task.setDealerId(list.get(0).getDealerId());
				task.setType(2);
				this.internalSave(task);
			}
			
		}catch(Exception e){
			e.printStackTrace();
		}
	}
	
	/**
	 * 添加日志
	 * @param task
	 * @throws Exception
	 */
  private void addSectionTaskLog(Collection<SectionTaskDO> task,String type) throws Exception{
	 
		  for(SectionTaskDO secTa:task){
			  IosaSectionDO iosa=sectionDao.querySectionNameById(secTa.getTargetId());
			  List<String> details=new ArrayList<String>();
			  AuditorDO auditor=auditorDao.internalGetById(secTa.getDealerId().getId());
			  details.add(SectionTaskFieldEnum.ADDDEALER.getValue()+":"+auditor.getUser().getFullname());
			 
			  operateLogDao.addLog(secTa.getTargetId(), type, EiosaLogOperateTypeEnum.CHANGEDEALER.getKey(), JsonUtil.toJson(details));
			  operateLogDao.addLog(iosa.getReportId(), EiosaLogTypeEnum.REPORT.getKey(), EiosaLogOperateTypeEnum.SECTION.getKey(), JsonUtil.toJson(details));
		  }
		  
	  
  }
  /**
   * 添加分配站内通知
   * @param title
   * @param dealerId
   * @throws Exception
   */
  private void addSectionTaskNotice(String sectionId,String isarpNo, Integer dealerId) throws Exception{
	  try{
		  IosaSectionDO section=sectionDao.internalGetById(Integer.valueOf(sectionId));
		  String title="您分配到任务：(EIOSA)"+section.getSectionName();
		    if(!StringUtils.isEmpty(isarpNo)){
		    	title+="--"+isarpNo+"";
		    }
			MessageDO messageDO = new MessageDO();
			messageDO.setSender(UserContext.getUser());
			messageDO.setSendTime(new Date());
			messageDO.setContent(title+"，请尽快审计");
			messageDO.setTitle(title);
			messageDO.setLink(String.valueOf(section.getReportId()));
			messageDO.setChecked(false);
			messageDO.setSourceType("EIOSA_REAUDIT");
			AuditorDO auditor=auditorDao.internalGetById(dealerId);
			List<UserDO>receivers=new ArrayList<UserDO>();
			receivers.add(auditor.getUser());
			messageDao.sendMessage(messageDO, receivers);
			
		}catch(Exception e){
			e.printStackTrace();
		}
  }
	public OperateLogDao getOperateLogDao() {
		return operateLogDao;
	}
	public void setOperateLogDao(OperateLogDao operateLogDao) {
		this.operateLogDao = operateLogDao;
	}
	public AuditorDao getAuditorDao() {
		return auditorDao;
	}
	public void setAuditorDao(AuditorDao auditorDao) {
		this.auditorDao = auditorDao;
	}
	public MessageDao getMessageDao() {
		return messageDao;
	}
	public void setMessageDao(MessageDao messageDao) {
		this.messageDao = messageDao;
	}
	public IsarpDao getIsarpDao() {
		return isarpDao;
	}
	public void setIsarpDao(IsarpDao isarpDao) {
		this.isarpDao = isarpDao;
	}
	public SectionDao getSectionDao() {
		return sectionDao;
	}
	public void setSectionDao(SectionDao sectionDao) {
		this.sectionDao = sectionDao;
	}
	
  

}
