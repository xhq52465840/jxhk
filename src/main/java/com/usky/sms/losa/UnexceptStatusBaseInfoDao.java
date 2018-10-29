package com.usky.sms.losa;

import java.util.List;

import org.hibernate.Session;

import com.usky.sms.core.BaseDao;

public class UnexceptStatusBaseInfoDao extends BaseDao<UnexceptStatusBaseInfoDO>{
	public UnexceptStatusBaseInfoDao(){
		super(UnexceptStatusBaseInfoDO.class);
	}
	public List<UnexceptStatusBaseInfoDao> query() throws Exception{
		String sql="from UnexceptStatusBaseInfoDO";
		@SuppressWarnings("unchecked")
		List<UnexceptStatusBaseInfoDao> list=this.getHibernateTemplate().find(sql);
		return list;
	}
	
	 public void saveUnexceptStatusEvent(UnexceptStatusBaseInfoDO  data) throws Exception{
	    if (data.getId() != null) {
	      UnexceptStatusBaseInfoDO objdo = this.getHibernateTemplate().get(UnexceptStatusBaseInfoDO.class, Integer.valueOf(data.getId()));
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
	  
	   public void deletedUnexceptStatusEvent(UnexceptStatusBaseInfoDO  data) throws Exception{
	     UnexceptStatusBaseInfoDO objdo = this.getHibernateTemplate().get(UnexceptStatusBaseInfoDO.class, Integer.valueOf(data.getId()));
	      this.internalMarkAsDeleted(objdo);
	    }
	   
	   public void addUnexceptStatusEvent(UnexceptStatusBaseInfoDO  data) throws Exception{
	     UnexceptStatusBaseInfoDO objdo = this.getHibernateTemplate().get(UnexceptStatusBaseInfoDO.class, Integer.valueOf(data.getId()));
	     this.internalUndelete(objdo);
	   }

}
