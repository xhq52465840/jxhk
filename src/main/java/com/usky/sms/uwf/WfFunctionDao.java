package com.usky.sms.uwf;

import java.util.List;

import com.usky.sms.core.BaseDao;

public class WfFunctionDao extends BaseDao<WfFunctionDO> {
	public WfFunctionDao() {
		super(WfFunctionDO.class);
	}
	
	public List<WfFunctionDO> getByType(String type) throws Exception {
		@SuppressWarnings("unchecked")
		List<WfFunctionDO> list = this.getHibernateTemplate().find("from WfFunctionDO where type = ?", type);
		return list;
	}
	
	public void save(String type, String name, String show_name, String call_func, String umodule){
		@SuppressWarnings("unchecked")
		List<WfFunctionDO> list = this.getHibernateTemplate().find("from WfFunctionDO where name = ? and type = ?", name, type);
		WfFunctionDO function;
		if (list == null || list.size() == 0) {
			function = new WfFunctionDO();			
			function.setName(name);
			function.setShowName(show_name);
			function.setUmodule(umodule);
			function.setCallFunc(call_func);
			function.setType(type);
			function.setActive("Y");
			this.internalSave(function);
		}
		else {
			function = list.get(0);
			function.setName(name);
			function.setShowName(show_name);
			function.setUmodule(umodule);
			function.setCallFunc(call_func);
			function.setType(type);
			function.setActive("Y");
			this.internalUndelete(function);
		}
	}
	
	public void Delete(String type, String name){
		@SuppressWarnings("unchecked")
		List<WfFunctionDO> list = this.getHibernateTemplate().find("from WfFunctionDO where name = ? and type = ?", name, type);
		
		if (list != null && list.size() > 0)
			this.getHibernateTemplate().deleteAll(list);
	}
}
