package com.usky.sms.losa.threat;

import java.util.ArrayList;
import java.util.List;

import com.usky.sms.core.BaseDao;

public class ThreatBaseInfoDao extends BaseDao<ThreatBaseInfoDO>{

	public ThreatBaseInfoDao(){
		super(ThreatBaseInfoDO.class);
	}
	public List<ThreatBaseInfoDO> query() throws Exception{
		String sql="from ThreatBaseInfoDO t where t.deleted=false";
		@SuppressWarnings("unchecked")
		List<ThreatBaseInfoDO> list=this.getHibernateTemplate().find(sql);
		return list;
	}
	public List<ThreatBaseInfoDO>queryThreatType() throws Exception{
		String hql="from ThreatBaseInfoDO t where t.deleted=false and t.parentNode is null";
		@SuppressWarnings("unchecked")
		List<ThreatBaseInfoDO>list=this.getHibernateTemplate().find(hql);
		return list;
	}
	public List<ThreatBaseInfoDO>queryThreatNo(String parentCode) throws Exception{
		List<ThreatBaseInfoDO>list=new ArrayList<ThreatBaseInfoDO>();
		if(parentCode.equals("")){
			String hql="from ThreatBaseInfoDO t where t.deleted=false and t.parentNode is not null";

			list=this.getHibernateTemplate().find(hql);
		}else{
			String hql="from ThreatBaseInfoDO t where t.deleted=false and t.parentNode in(select t1.id from ThreatBaseInfoDO t1 where t1.number=?)";

			list=this.getHibernateTemplate().find(hql,parentCode);
		}
		
		return list;
	}
}
