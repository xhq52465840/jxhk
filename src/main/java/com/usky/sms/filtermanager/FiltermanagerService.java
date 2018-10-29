
package com.usky.sms.filtermanager;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.common.PageHelper;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.SMSException;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserDao;
import com.usky.sms.user.UserGroupDO;
import com.usky.sms.user.UserGroupDao;

public class FiltermanagerService extends AbstractService {
	
	@Autowired
	private FiltermanagerDao filtermanagerDao;	
	
	@Autowired
	private UserDao userDao;
	
	@Autowired
	private UserGroupDao userGroupDao;
	
	public void getFilter (HttpServletRequest request, HttpServletResponse response) throws Exception {
		String type = request.getParameter("type");
		String param = request.getParameter("param");
		List<FiltermanagerDO> list = new ArrayList<FiltermanagerDO>();
		list = filtermanagerDao.filterFiltermanager(type, param);
		try{
		   if("H".equals(type)){
				List<FiltermanagerDO> hotList = new ArrayList<FiltermanagerDO>();
				for (FiltermanagerDO filtermanagerDO : list) {
					String charnelThose = filtermanagerDO.getCharnelThose();
					if(charnelThose!=null&&charnelThose.split(",").length>10){
						hotList.add(filtermanagerDO);
					}
				}
				list = hotList;			
			}			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", PageHelper.getPagedResult(formatFiltermanager(list), request));
			ResponseHelper.output(response, map);
		}catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	//封装list
	private List<Map<String,Object>> formatFiltermanager(List<FiltermanagerDO> list) throws Exception{
		List<Map<String,Object>> filtermanagerlist = new ArrayList<Map<String,Object>>();
		List<Map<String,Object>> currList = filtermanagerDao.convert(list);
		for(int i=0;i<currList.size();i++){
			Map<String,Object> filtermanager = currList.get(i);
			String paladin = filtermanager.get("paladin")+"";
			String rules = "";
			if("ALL".equals(paladin)){
				rules = paladin;
			}else if(paladin==null||"".equals(paladin.trim())){
				rules = "";			
			}else{
				for(int j=0;j<paladin.split(",").length;j++){
					String currStr = paladin.split(",")[j];
					if(currStr.indexOf("U@#")>-1){
						Integer userId =Integer.parseInt(currStr.substring(3));
						UserDO user = userDao.internalGetById(userId);
						if(user==null) continue;
						String userFullName = user.getDisplayName();
						rules+="U@#"+userFullName+",";
					}else if(currStr.indexOf("G@#")>-1){
						Integer groupId =Integer.parseInt(currStr.substring(3));
						UserGroupDO group = userGroupDao.internalGetById(groupId);
						if(group==null) continue;
						String groupName = group.getName();
						rules+="G@#"+groupName+",";
					}else{
						//目前支持用户和用户组，若有其他逻辑继续田间
					}
				}
				rules = ","+rules;
			}			
			filtermanager.put("paladinDesc", rules);
			filtermanagerlist.add(filtermanager);
		}		
		return filtermanagerlist;
	}
	
	//收藏和取消收藏面板
	public void favorFiltermanager(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try{
			Integer filtermanagerId = request.getParameter("filtermanagerId")==null?null:Integer.parseInt(request.getParameter("filtermanagerId"));
			Integer charnelThose = request.getParameter("charnelThose")==null?null:Integer.parseInt(request.getParameter("charnelThose"));
			Map<String,Object> returnObject =  filtermanagerDao.favorFiltermanager(filtermanagerId, UserContext.getUserId(), charnelThose);
			Map<String, Object> map = new HashMap<String, Object>();
			List<Map<String,Object>> filtermanager = new ArrayList<Map<String,Object>>();
			filtermanager.add(returnObject);
			map.put("success", true);
			map.put("data", filtermanager);
			ResponseHelper.output(response, map);
		}catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	//复制
	public void copyFiltermanager(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try{
			Integer filtermanagerId = request.getParameter("filtermanagerId")==null?null:Integer.parseInt(request.getParameter("filtermanagerId"));
			String filtermanagerName = request.getParameter("filtermanagerName");
			Map<String,Object> returnObject =  filtermanagerDao.copyFiltermanager(filtermanagerId, filtermanagerName);
			Map<String, Object> map = new HashMap<String, Object>();
			List<Map<String,Object>> filtermanager = new ArrayList<Map<String,Object>>();
			filtermanager.add(returnObject);
			map.put("success", true);
			map.put("data", filtermanager);
			ResponseHelper.output(response, map);
		}catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}

	public void setFiltermanagerDao(FiltermanagerDao filtermanagerDao) {
		this.filtermanagerDao = filtermanagerDao;
	}

	public void setUserDao(UserDao userDao) {
		this.userDao = userDao;
	}

	public void setUserGroupDao(UserGroupDao userGroupDao) {
		this.userGroupDao = userGroupDao;
	}
	
}
