
package com.usky.sms.dashboard;

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
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserDao;
import com.usky.sms.user.UserGroupDO;
import com.usky.sms.user.UserGroupDao;

public class DashboardService extends AbstractService {
	
	@Autowired
	private DashboardDao dashboardDao;	
	
	@Autowired
	private GadgetsinstanceDao gadgetsinstanceDao;
	
	@Autowired
	private UserDao userDao;
	
	@Autowired
	private UserGroupDao userGroupDao;
	
	//获取当前用户收藏的看板
	public void getFavorDashboard(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try{
			String homePage = request.getParameter("homePage")+"";
			List<DashboardDO> favorList = new ArrayList<DashboardDO>();
			if("HOME".equals(homePage)){
				List<DashboardDO> list = dashboardDao.getSysDashboard();
				favorList.addAll(list);
			}
			favorList.addAll(dashboardDao.filterDashBoard("F",null));
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", PageHelper.getPagedResult(formatDashBoard(favorList), request));
			ResponseHelper.output(response, map);
		}catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	//获取热门的看板
	public void getHotDashboard(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try{
			List<DashboardDO> hotList = new ArrayList<DashboardDO>();
			List<DashboardDO> list = dashboardDao.filterDashBoard("H",null);
			for (DashboardDO dashboardDO : list) {
				String charnelThose = dashboardDO.getCharnelThose();
				if(charnelThose!=null&&!"".equals(charnelThose)&&charnelThose.split(",").length>10){
					hotList.add(dashboardDO);
				}
			}
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", PageHelper.getPagedResult(formatDashBoard(hotList), request));
			ResponseHelper.output(response, map);
		}catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	//获取我的看板
	public void getMyDashboard(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try{
			List<DashboardDO> myList = dashboardDao.filterDashBoard("M",null);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", PageHelper.getPagedResult(formatDashBoard(myList), request));
			ResponseHelper.output(response, map);
		}catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	//获取共享面板
	public void getShareDashboard(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try{
			String param = request.getParameter("param");
			String type = request.getParameter("type")==null?"S":request.getParameter("type");
			List<DashboardDO> shareList = dashboardDao.filterDashBoard(type,param);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", PageHelper.getPagedResult(formatDashBoard(shareList), request));
			ResponseHelper.output(response, map);
		}catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	//根据看板主键查询看板明细
	public void getDashboardDetail(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try{
			Integer dashboardId = request.getParameter("objId")==null?null:Integer.parseInt(request.getParameter("objId"));
			List<Map<String, Object>> dashboardDetail = gadgetsinstanceDao.convert(gadgetsinstanceDao.getGadgetsinstanceBydashboard(dashboardId));
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);			
			map.put("data", dashboardDetail);
			ResponseHelper.output(response, map);
		}catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
		
	}
	
	//封装dashboard
	private List<Map<String,Object>> formatDashBoard(List<DashboardDO> list) throws Exception{
		List<Map<String,Object>> dashboardlist = new ArrayList<Map<String,Object>>();
		List<Map<String,Object>> currList = dashboardDao.convert(list);
		for(int i=0;i<currList.size();i++){
			Map<String,Object> dashboard = currList.get(i);
			String paladin = dashboard.get("paladin")+"";
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
			dashboard.put("paladinDesc", rules);
			dashboardlist.add(dashboard);
		}		
		return dashboardlist;
	}
	
	//收藏和取消收藏面板
	public void favorDashBoard(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try{
			Integer dashBoardId = request.getParameter("dashBoardId")==null?null:Integer.parseInt(request.getParameter("dashBoardId"));
			Integer charnelThose = request.getParameter("charnelThose")==null?null:Integer.parseInt(request.getParameter("charnelThose"));
			Map<String,Object> returnObject =  dashboardDao.favorDashBoard(dashBoardId, UserContext.getUserId(), charnelThose);
			Map<String, Object> map = new HashMap<String, Object>();
			List<Map<String,Object>> dashBoard = new ArrayList<Map<String,Object>>();
			dashBoard.add(returnObject);
			map.put("success", true);
			map.put("data", dashBoard);
			ResponseHelper.output(response, map);
		}catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void setDashboardDao(DashboardDao dashboardDao) {
		this.dashboardDao = dashboardDao;
	}

	public void setGadgetsinstanceDao(GadgetsinstanceDao gadgetsinstanceDao) {
		this.gadgetsinstanceDao = gadgetsinstanceDao;
	}

	public void setUserDao(UserDao userDao) {
		this.userDao = userDao;
	}

	public void setUserGroupDao(UserGroupDao userGroupDao) {
		this.userGroupDao = userGroupDao;
	}
	
}
