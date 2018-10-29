package com.usky.sms.losa;

import java.util.List;

import com.usky.sms.core.BaseDao;

public class CauseFindPersonTypeDao extends BaseDao<CauseFindPersonTypeDO>{
	public CauseFindPersonTypeDao(){
		super(CauseFindPersonTypeDO.class);
	}
	public List<CauseFindPersonTypeDO> query() throws Exception{
		String sql="from CauseFindPersonTypeDO";
		@SuppressWarnings("unchecked")
		List<CauseFindPersonTypeDO> list=this.getHibernateTemplate().find(sql);
		return list;
	}

}
