package com.usky.sms.losa.threatEvent;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.hibernate.SQLQuery;
import org.hibernate.Session;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.core.BaseDao;
import com.usky.sms.losa.threat.ThreatBaseInfoDO;

public class ThreatEventDao extends BaseDao<ThreatBaseInfoDO>{

	public ThreatEventDao(){
		super(ThreatBaseInfoDO.class);
	}
	
	public List<ThreatBaseInfoDO> query() throws Exception{
		String sql="from ThreatBaseInfoDO";
		@SuppressWarnings("unchecked")
		List<ThreatBaseInfoDO> list=this.getHibernateTemplate().find(sql);
		return list;
	}
	
	public List<Object[]>queryThreatEvent(String eventType) throws Exception{
		String sql="select level, t.num, CASE  WHEN t.deleted = 1  THEN t.name||'(失效)' ELSE t.name END as name,  t.parent_node, t.id, t.deleted from "+eventType+" t  "
		    + "start with t.parent_node is null connect by prior t.id = t.parent_node order siblings by t.num asc ";
		Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();
    session.beginTransaction().commit();
    SQLQuery query = null;
    query = session.createSQLQuery((sql).toString());
    List<Object[]> list = query.list();

		return list;
	}
	
	public void saveThreatEvent(ThreatBaseInfoDO  data) throws Exception{
	  if (data.getId() != null) {
	    ThreatBaseInfoDO objdo = this.getHibernateTemplate().get(ThreatBaseInfoDO.class, Integer.valueOf(data.getId()));
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
	
	 public void deletedThreatEvent(ThreatBaseInfoDO  data) throws Exception{
     ThreatBaseInfoDO objdo = this.getHibernateTemplate().get(ThreatBaseInfoDO.class, Integer.valueOf(data.getId()));
	    this.internalMarkAsDeleted(objdo);
	  }
	 
	 public void addThreatEvent(ThreatBaseInfoDO  data) throws Exception{
     ThreatBaseInfoDO objdo = this.getHibernateTemplate().get(ThreatBaseInfoDO.class, Integer.valueOf(data.getId()));
     this.internalUndelete(objdo);
   }
	 
	 public boolean isNameRepeat(String eventType, Integer  parentNode, String  name ,String number) throws Exception{
	    String sql="select 1 from "+eventType+" t where t.parent_node = ? and t.name = ? and t.num != ? ";
	    Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();
	    session.beginTransaction().commit();
	    SQLQuery query = null;
	    query = session.createSQLQuery((sql).toString());
	    query.setInteger(0, parentNode);
	    query.setString(1, name);
	    query.setString(2, number);
	    List<Object[]> list = query.list();
	    if(list!=null&&list.size()!=0)
	      return true;
	    else
	      return false;
	  }
}
