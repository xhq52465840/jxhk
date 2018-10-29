package com.usky.sms.eiosa;

import java.util.List;

import com.usky.sms.core.BaseDao;

public class IosaCodeDao extends BaseDao<IosaCodeDO>{

	public IosaCodeDao(){
		super(IosaCodeDO.class);
	}
	
	public IosaCodeDO queryIosaCodeById(Integer id) throws Exception{
		String hql="from IosaCodeDO t where t.id=?";
		List<IosaCodeDO>list=this.getHibernateTemplate().find(hql,id);
		if(list.size()>0){
			return list.get(0);
		}else{
			return null;
		}
	}

	
	
	
}
