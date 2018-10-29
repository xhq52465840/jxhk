package com.usky.sms.losa.error;

import java.util.List;

import org.hibernate.Session;

import com.usky.sms.core.BaseDao;

public class ErrorBaseInfoDao extends BaseDao<ErrorBaseInfoDO>{

	public ErrorBaseInfoDao(){
		super(ErrorBaseInfoDO.class);
	}
	public List<ErrorBaseInfoDO> query() throws Exception{
		String sql="from ErrorBaseInfoDO t where t.deleted=false ";
		@SuppressWarnings("unchecked")
		List<ErrorBaseInfoDO> list=this.getHibernateTemplate().find(sql);
		return list;
	}
	
	 public void saveErrorEvent(ErrorBaseInfoDO  data) throws Exception{
	    if (data.getId() != null) {
	      ErrorBaseInfoDO objdo = this.getHibernateTemplate().get(ErrorBaseInfoDO.class, Integer.valueOf(data.getId()));
	      data.setCreated(objdo.getCreated());
	      Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();
	      session.clear();
	      data.setLastUpdate();
	      session.update(data);
	      session.flush();
	    } else {
	      this.internalSave(data);
	    }
	  }
	  
	   public void deletedErrorEvent(ErrorBaseInfoDO  data) throws Exception{
	     ErrorBaseInfoDO objdo = this.getHibernateTemplate().get(ErrorBaseInfoDO.class, Integer.valueOf(data.getId()));
	      this.internalMarkAsDeleted(objdo);
	    }
	   
	   public void addErrorEvent(ErrorBaseInfoDO  data) throws Exception{
	     ErrorBaseInfoDO objdo = this.getHibernateTemplate().get(ErrorBaseInfoDO.class, Integer.valueOf(data.getId()));
	     this.internalUndelete(objdo);
	   }
}
