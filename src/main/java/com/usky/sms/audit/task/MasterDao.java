package com.usky.sms.audit.task;

import org.hibernate.SQLQuery;
import org.hibernate.classic.Session;

import com.usky.sms.core.BaseDao;

public class MasterDao extends BaseDao<MasterDO> {

	protected MasterDao() {
		super(MasterDO.class);
	}

	public void setDeleted(Integer taskId) {
		String sql = "update a_master set deleted = '1' where task_id = " + taskId + "";
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
		SQLQuery query = session.createSQLQuery(sql);
		query.executeUpdate();
	}

	public void deleteByTaskId(Integer taskId) {
		String sql = "delete from a_master where task_id = " + taskId + "";
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
		SQLQuery query = session.createSQLQuery(sql);
		query.executeUpdate();
	}
}
