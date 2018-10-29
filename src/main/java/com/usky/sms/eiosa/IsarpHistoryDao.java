package com.usky.sms.eiosa;

import java.util.ArrayList;
import java.util.List;

import com.usky.sms.core.BaseDao;

public class IsarpHistoryDao extends BaseDao<IsarpHistoryDO>{

	public IsarpHistoryDao(){
		super(IsarpHistoryDO.class);
	}
	@SuppressWarnings("unchecked")
	public List<IsarpHistoryDO> queryHistoryByFirst(Integer baseId) throws Exception{
		List<IsarpHistoryDO> list=new ArrayList<IsarpHistoryDO>();
		try{
			list=this.getHibernateTemplate().find("from IsarpHistoryDO t where t.firstIsarpId=? and t.deleted=false order by t.created desc",baseId);
		}catch(Exception e){
			e.printStackTrace();
		}
		return list;
	}
	public IsarpHistoryDO queryHistoryCurrentById(Integer id) throws Exception{
		IsarpHistoryDO hitstory=new IsarpHistoryDO();
		List<IsarpHistoryDO>list=new ArrayList<IsarpHistoryDO>();
		try{
			list=this.getHibernateTemplate().find("from IsarpHistoryDO t where t.curIsarpId.id=? and t.deleted=false",id);
		}catch(Exception e){
			e.printStackTrace();
		}
		if(list.size()>0){
			return list.get(0);
		}else{
			return null;
		}
	}
		public IsarpHistoryDO queryFirstId(Integer id) throws Exception{
			
			List<IsarpHistoryDO>list=new ArrayList<IsarpHistoryDO>();
			try{
				list=this.getHibernateTemplate().find("from IsarpHistoryDO t where t.preIsarpId=? or t.curIsarpId.id=? and t.deleted=false",id,id);
			}catch(Exception e){
				e.printStackTrace();
			}
			if(list.size()>0){
				return list.get(0);
			}else{
				return null;
			}
		
	}
}
