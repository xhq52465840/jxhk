package com.usky.sms.eiosa.user;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringUtils;

import com.usky.sms.audit.auditor.AuditorDao;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.core.BaseDao;
import com.usky.sms.dictionary.DictionaryDO;
import com.usky.sms.dictionary.DictionaryDao;
import com.usky.sms.eiosa.OperateLogDO;
import com.usky.sms.eiosa.SectionTaskDO;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserDao;
import com.usky.sms.user.UserGroupDO;

public class EiosaUserGroupDao extends BaseDao<UserGroupDO>{
	public EiosaUserGroupDao(){
		super(UserGroupDO.class);
	}
	private UserDao userDao;
	private AuditorDao auditorDao;
	private DictionaryDao dictionaryDao;
	public List<UserDO> getEiosaUsers(String userName) {
		StringBuffer hql = new StringBuffer("select distinct u from UserGroupDO g inner join g.users u where u.deleted = false and (g.name = 'EIOSA审计员' or g.name = 'EIOSA审计主管' or g.name = 'EIOSA审计管理员')");
		List<Object> values = new ArrayList<Object>();
		if (null != userName) {
			userName = userName.replaceAll("/", "//").replaceAll("%", "/%").replaceAll("_", "/_");
			userName = "%" + userName + "%";
			hql.append(" and (upper(u.username) like upper(?) or upper(u.fullname) like upper(?))");
			values.add(userName);
			values.add(userName);
		}
		@SuppressWarnings("unchecked")
		List<UserDO> users = (List<UserDO>) this.query(hql.toString(), values.toArray());
		return users;
	}
	
	   public String getUserEiosaRole() {
				boolean hasrole = false;
				
				hasrole = getUserEiosaRoleByKey("EIOSA审计角色", "E3"); //eiosa审计模块管理员
				if ( hasrole ) return "administrator";
				hasrole = getUserEiosaRoleByKey("EIOSA审计角色", "E2"); //eiosa审计经理
				if ( hasrole ) return "manager";
				return "auditor"; //其他情况都是审计员
			}
	    private boolean getUserEiosaRoleByKey(String type, String key) {
				UserDO user=UserContext.getUser();
				DictionaryDO ddo = dictionaryDao.getByTypeAndKey(type, key);
				if(!StringUtils.isBlank(ddo.getName())) {
					UserGroupDO udo = auditorDao.getUserGroupByName(ddo.getName());
					if(udo!=null && udo.getUsers().contains(user)) return true;
				}
				return false;
			}
	    public void checkUserRole(HttpServletRequest request,HttpServletResponse response) throws Exception {
			try{
				Map<String, Object> result = new HashMap<String, Object>();
				boolean role=false;
				String rolename = getUserEiosaRole();
				role = rolename.equals("manager") || rolename.equals("administrator");
						
				if(role==true){
					result.put("manager", true);
				}else{
					result.put("auditor", true);
				}
				ResponseHelper.output(response, result);
			}catch(Exception e){
				e.printStackTrace();
			}
		}
	    /**
	     * 根据isarpId查找专业组长
	     * @param isarpId
	     * @return
	     * @throws Exception
	     */
        public Integer getManagerByIsarpId(Integer isarpId) throws Exception{
        	Integer managerId=null;
        	try{
        		String hql="from SectionTaskDO task where task.targetId=(select isarp.sectionId.id from IsarpDO isarp where isarp.id=?)";
        		List<SectionTaskDO>list=this.getHibernateTemplate().find(hql,isarpId);
        		if(list.size()>0){
        			managerId=list.get(0).getDealerId().getUser().getId();
        		}
        	}catch(Exception e){
        		e.printStackTrace();
        	}
        	return managerId;
        }
        /**
         * 查找isarp提交者
         * @param isarpId
         * @return
         * @throws Exception
         */
        public Integer getSubmiterByIsarpId(Integer isarpId) throws Exception{
        	Integer submiterId=null;
        	try{
        		String hql="from OperateLogDO log where log.type='isarp'  and log.deleted=false and log.oper_type='submit'and log.targetId=? order by log.created desc";
        		List<OperateLogDO>list=this.getHibernateTemplate().find(hql,isarpId);
        		if(list.size()>0){
        			submiterId=list.get(0).getCreator().getId();
        		}
        	}catch(Exception e){
        		e.printStackTrace();
        	}
        	return submiterId;
        }
        /**
         * 查找isarp的协调人
         * @param isarpId
         * @return
         * @throws Exception
         */
        public Integer getDealerByIsarpId(Integer isarpId) throws Exception{
        	Integer dealerId=null;
        	try{
        		String hql="from SectionTaskDO task where task.targetId=? and task.deleted=false";
        		List<SectionTaskDO>list=this.getHibernateTemplate().find(hql,isarpId);
        		if(list.size()>0){
        			dealerId=list.get(0).getDealerId().getUser().getId();
        		}
        	}catch(Exception e){
        		e.printStackTrace();
        	}
        	return dealerId;
        }
		public UserDao getUserDao() {
			return userDao;
		}

		public void setUserDao(UserDao userDao) {
			this.userDao = userDao;
		}

		public AuditorDao getAuditorDao() {
			return auditorDao;
		}

		public void setAuditorDao(AuditorDao auditorDao) {
			this.auditorDao = auditorDao;
		}

		public DictionaryDao getDictionaryDao() {
			return dictionaryDao;
		}

		public void setDictionaryDao(DictionaryDao dictionaryDao) {
			this.dictionaryDao = dictionaryDao;
		}
	 

}
