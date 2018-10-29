
package com.usky.sms.permission;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;

import org.hibernate.HibernateException;
import org.hibernate.Session;
import org.springframework.orm.hibernate3.HibernateCallback;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.common.DataFormat;
import com.usky.sms.core.BaseDao;

public class PermissionSchemeItemDao extends BaseDao<PermissionSchemeItemDO> {
	
	public PermissionSchemeItemDao() {
		super(PermissionSchemeItemDO.class);
	}
	
	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		Integer schemeId = ((Number) map.get("scheme")).intValue();
		Integer permissionSetId = ((Number) map.get("permissionSet")).intValue();
		String type = (String) map.get("type");
		String parameter = (String) map.get("parameter");
		if (parameter == null || parameter.isEmpty()) {
			@SuppressWarnings("unchecked")
			List<PermissionSchemeItemDO> list = this.getHibernateTemplate().find("from PermissionSchemeItemDO where scheme.id = ? and permissionSet.id = ? and type = ? and parameter is null", schemeId, permissionSetId, type);
			if (list.size() > 0) return false;
		} else {
			@SuppressWarnings("unchecked")
			List<PermissionSchemeItemDO> list = this.getHibernateTemplate().find("from PermissionSchemeItemDO where scheme.id = ? and permissionSet.id = ? and type = ? and parameter = ?", schemeId, permissionSetId, type, parameter);
			if (list.size() > 0) return false;
		}
		return true;
	}
	
	public List<PermissionSchemeItemDO> getByPermissionSchemeId(Integer schemeId) {
		@SuppressWarnings("unchecked")
		List<PermissionSchemeItemDO> list = this.getHibernateTemplate().find("from PermissionSchemeItemDO where scheme.id = ?", schemeId);
		return list;
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void copyByPermissionScheme(PermissionSchemeDO schemeSrc, PermissionSchemeDO schemeDest) throws Exception {
		List<PermissionSchemeItemDO> srcs = this.getByPermissionScheme(schemeSrc);
		for (PermissionSchemeItemDO src : srcs) {
			PermissionSchemeItemDO dest = new PermissionSchemeItemDO();
			this.copyValues(src, dest);
			dest.setScheme(schemeDest);
			this.internalSave(dest);
		}
	}
	
	public List<PermissionSchemeItemDO> getByPermissionScheme(PermissionSchemeDO scheme) {
		@SuppressWarnings("unchecked")
		List<PermissionSchemeItemDO> list = this.getHibernateTemplate().find("from PermissionSchemeItemDO where scheme = ?", scheme);
		return list;
	}
	
	public List<PermissionSchemeItemDO> getByType(String type) {
		@SuppressWarnings("unchecked")
		List<PermissionSchemeItemDO> list = this.getHibernateTemplate().find("from PermissionSchemeItemDO where type = ?", type);
		return list;
	}
	
	public List<Map<String, Object>> getURGP(final String name,final String pname,final String type){
		@SuppressWarnings("unchecked")
		List<Map<String, Object>> list = (List<Map<String, Object>>) this.getHibernateTemplate().execute(new HibernateCallback<Object>() {
			@Override
			public Object doInHibernate(Session session) throws HibernateException, SQLException {	
				DataFormat dataFormat = new DataFormat();	
				String sql ="select * from (";
				if("USER_GROUP".equals(type)){
					sql+="select g.id,g.name,p.id as pid,p.name as pname,'机构权限' as scope "+
						"from  T_PERMISSION_SCHEME_ITEM s "+
						",t_permission_set p "+
						",t_user_group g "+
						"where s.type='USER_GROUP'  "+
						"and s.parameter=g.id "+
						"and s.permission_set=p.id "+
						"and g.deleted=0 and p.deleted=0 "+
						"union "+
						"select g.id,g.name,p.id as pid,p.name as pname,'全局权限' as scope  "+
						"from t_perm_set_user_group ps "+
						",t_permission_set p "+
						",t_user_group g "+
						"where ps.perm_set_id=p.id "+
						"and ps.user_group_id=g.id "+
						"and g.deleted=0 and p.deleted=0 and p.type='global'";					
				} else if ("ROLE".equals(type)) {
					sql += "select r.id,r.name,p.id as pid,p.name as pname ,'机构权限' as scope "
							+ " from t_role r "
							+ " left join T_PERMISSION_SCHEME_ITEM s "
							+ " on s.parameter=r.id "
							+ " left join t_permission_set p "
							+ " on s.permission_set=p.id"
							+ " where r.deleted=0 and (s.type='ROLE' or s.type is null)"
							+ " and (p.deleted=0 or p.deleted is null)";
				}else if("USER".equals(type)){
					sql+="select u.id,u.fullname as name ,p.id as pid,p.name as pname,'机构权限' as scope "+ 
						"from  T_PERMISSION_SCHEME_ITEM s "+
						",t_permission_set p "+
						",t_user u "+
						"where s.type='USER'  "+
						"and s.parameter=u.id "+
						"and s.permission_set=p.id "+
						"and u.deleted=0 and p.deleted=0 ";
					
				}else if("OTHER".equals(type)){
					sql+="select 0 as id,(case s.type when 'PROCESSOR' then '处理人' when 'UNIT_RESPONSIBLE_USER' then '机构负责人' when 'REPORTER' then '报告人' else '任何人' end) as name,p.id as pid,p.name as pname，'机构权限' as scope "+ 
						"from T_PERMISSION_SCHEME_ITEM s,t_permission_set p "+
						"where (s.type='PROCESSOR' or  s.type='UNIT_RESPONSIBLE_USER' or s.type='REPORTER' or (s.type='USER_GROUP' and s.parameter is null) ) "+
						"and s.permission_set=p.id and p.deleted=0 ";
				}
				sql+=") where 1 = 1";
				if (!"".equals(name)) {
					sql += " and upper(name) like upper('%"+name+"%')";
				}
				if (!"".equals(pname)) {
					sql += " and upper(pname) like upper('%"+pname+"%')";
				}
				sql += " order by name,scope";
				@SuppressWarnings("deprecation")
				List<Map<String, Object>> list = dataFormat.executeQueryNoConn(sql,session.connection());
				return list;
			}
		});	
		return list;
	}
	
}
