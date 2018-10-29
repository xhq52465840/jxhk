
package com.usky.sms.dashboard;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.usky.sms.core.BaseDao;
import com.usky.sms.http.service.GsonBuilder4SMS;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserGroupDO;
import com.usky.sms.user.UserGroupDao;

public class DashboardDao extends BaseDao<DashboardDO> {
	
	public DashboardDao() {
		super(DashboardDO.class);
	}
	
	@Autowired
	private UserGroupDao userGroupDao;
	
	protected static Gson gson = GsonBuilder4SMS.getInstance();
	
	private Integer fromDashBoardId;
	
	@Autowired
	private GadgetsinstanceDao gadgetsinstanceDao;
	
	@Override
	public Integer save(Map<String, Object> map) {
		if (fromDashBoardId != null) {
			synchronized (fromDashBoardId) {
				return super.save(map);
			}
		} else {
			return super.save(map);
		}
	}
	
	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		if (map.get("copyFrom") != null && !"".equals(map.get("copyFrom").toString())) {
			fromDashBoardId = Integer.parseInt(map.get("copyFrom").toString());
		}
		map.remove("copyFrom");
		String charnelThose = map.get("charnelThose").toString();
		map.put("layout", "layout-a");
		map.put("creator", UserContext.getUserId());
		if ("1".equals(charnelThose)) {
			charnelThose = "," + UserContext.getUserId() + ",";
			map.put("charnelThose", charnelThose);
		} else {
			map.put("charnelThose", "");
		}
		return true;
	}
	
	@Override
	protected void afterSave(DashboardDO obj) {
		if (this.fromDashBoardId != null) {
			// 获取复制的dashboard
			DashboardDO fromDashBord = this.internalGetById(this.fromDashBoardId);
			// 把复制的dashboard布局复制只当前的dashboard
			obj.setLayout(fromDashBord.getLayout());
			// 查找复制的dashboard对应的组件实例
			List<GadgetsinstanceDO> fromGadgetinsList = gadgetsinstanceDao.getGadgetsinstanceBydashboard(this.fromDashBoardId);
			List<GadgetsinstanceDO> list = new ArrayList<GadgetsinstanceDO>();
			// 从复制的dashboard中取出组建实例保存至当前dashboard
			for (GadgetsinstanceDO fromGadgetsinstance : fromGadgetinsList) {
				GadgetsinstanceDO newgi = new GadgetsinstanceDO();
				newgi.setDashboard(obj);
				newgi.setGadgets(fromGadgetsinstance.getGadgets());
				newgi.setPosition(fromGadgetsinstance.getPosition());
				newgi.setUrlparam(fromGadgetsinstance.getUrlparam());
				newgi.setCreator(UserContext.getUser());
				list.add(newgi);
			}
			gadgetsinstanceDao.internalSave(list);
			// 成员变量用完后需要重置为NULL
			this.fromDashBoardId = null;
		}
	}
	
	@Override
	protected void beforeUpdate(int id, Map<String, Object> map) {
		DashboardDO dashBoard = this.internalGetById(id);
		if (map.get("charnelThose") != null) {
			Integer charnelThose = Integer.parseInt(map.get("charnelThose").toString());
			map.remove("charnelThose");
			String currCharnelThose = dashBoard.getCharnelThose()==null?"":dashBoard.getCharnelThose();
			if (charnelThose == 0) {
				if (currCharnelThose.indexOf("," + UserContext.getUserId() + ",") > -1) {
					currCharnelThose = currCharnelThose.replaceAll("," + UserContext.getUserId() + ",", ",");
					if (",".equals(currCharnelThose)) {
						currCharnelThose = "";
					}
					map.put("charnelThose", currCharnelThose);
				}
			} else if (charnelThose == 1) {
				if (currCharnelThose.indexOf("," + UserContext.getUserId() + ",") < 0) {
					if ("".equals(currCharnelThose)) {
						currCharnelThose = "," + UserContext.getUserId() + ",";
					} else {
						currCharnelThose += UserContext.getUserId() + ",";
					}
					map.put("charnelThose", currCharnelThose);
				}
			}
		}
	}
	
	@Override
	protected void beforeDelete(Collection<DashboardDO> collection) {
		// 删除面板前需要删除dashboard 对应的实例表中的数据
		for (DashboardDO dashboardDO : collection) {
			List<GadgetsinstanceDO> list = gadgetsinstanceDao.getGadgetsinstanceBydashboard(dashboardDO.getId());
			gadgetsinstanceDao.delete(list);
		}
	}
	
	public Map<String, Object> favorDashBoard(Integer dashBoardId, Integer userId, Integer charnelThose) throws Exception {
		DashboardDO dashBoard = this.internalGetById(dashBoardId);
		String currCharnelThose = dashBoard.getCharnelThose()==null?"":dashBoard.getCharnelThose();
		if (charnelThose == 0) {
			if (currCharnelThose.indexOf("," + userId + ",") > -1) {
				currCharnelThose = currCharnelThose.replaceAll("," + userId + ",", ",");
				if (",".equals(currCharnelThose)) {
					currCharnelThose = "";
				}
				dashBoard.setCharnelThose(currCharnelThose);
			}
		} else if (charnelThose == 1) {
			if (currCharnelThose.indexOf("," + userId + ",") < 0) {
				if ("".equals(currCharnelThose)) {
					currCharnelThose = "," + userId + ",";
				} else {
					currCharnelThose += userId + ",";
				}
				dashBoard.setCharnelThose(currCharnelThose);
			}
		}
		this.internalSave(dashBoard);
		return convert(dashBoard);
	}
	
	public List<DashboardDO> filterDashBoard(String method, String param) throws Exception {
		List<DashboardDO> list = new ArrayList<DashboardDO>();
		StringBuffer sqlstr = new StringBuffer();
		// 当前用户
		Integer userId = UserContext.getUserId();
		// 当前用户所属用户组
		List<UserGroupDO> userGroup = userGroupDao.getUserGroupByUserId(UserContext.getUserId());
		if ("F".equals(method)) {//获取收藏的面板
			sqlstr.append("charnelThose like '%," + userId + ",%' ");
			sqlstr.append("and (creator.id=" + userId + " or paladin='ALL' or paladin like '%,U@#" + userId + ",%' ");
			for (UserGroupDO userGroupDO : userGroup) {
				String group = ",G@#" + userGroupDO.getId() + ",";
				sqlstr.append("or paladin like '%" + group + "%'");
			}
			sqlstr.append(")");
		} else if ("H".equals(method)) {//获取热门的面板
			sqlstr.append("paladin='ALL' or paladin like '%,U@#" + userId + ",%' ");
			for (UserGroupDO userGroupDO : userGroup) {
				String group = ",G@#" + userGroupDO.getId() + ",";
				sqlstr.append("or paladin like '%" + group + "%'");
			}
		} else if ("M".equals(method)) {//获取我的面板
			sqlstr.append("creator.id=" + userId);
		} else if ("S".equals(method)) {//获取所有人共享的面板（包含我的）
			sqlstr.append("(creator.id=" + userId + " or paladin='ALL' or paladin like '%,U@#" + userId + ",%' ");
			for (UserGroupDO userGroupDO : userGroup) {
				String group = ",G@#" + userGroupDO.getId() + ",";
				sqlstr.append("or paladin like '%" + group + "%'");
			}
			sqlstr.append(") ");
			// 查询参数
			Map<String, Object> paramMap = gson.fromJson(param, new TypeToken<Map<String, Object>>() {}.getType());
			if (paramMap != null) {
				String content = paramMap.get("content") == null ? "" : paramMap.get("content").toString();
				sqlstr.append("and upper(name) like upper('%" + content + "%') ");
				String creator = paramMap.get("creator") == null ? null : paramMap.get("creator").toString();
				if (creator != null) {
					sqlstr.append("and creator.id=" + creator + " ");
				}
				String paladin = paramMap.get("paladin") == null ? "" : paramMap.get("paladin").toString();
				sqlstr.append("and paladin like '%" + paladin + "%' ");
			}
		} else if ("MS".equals(method)) {//获取我共享的面板
			sqlstr.append("(paladin='ALL' or paladin like '%,U@#" + userId + ",%' ");
			for (UserGroupDO userGroupDO : userGroup) {
				String group = ",G@#" + userGroupDO.getId() + ",";
				sqlstr.append("or paladin like '%" + group + "%'");
			}
			sqlstr.append(") ");
			// 查询参数
			Map<String, Object> paramMap = gson.fromJson(param, new TypeToken<Map<String, Object>>() {}.getType());
			if (paramMap != null) {
				String content = paramMap.get("content") == null ? "" : paramMap.get("content").toString();
				sqlstr.append("and upper(name) like upper('%" + content + "%') ");
				String creator = paramMap.get("creator") == null ? null : paramMap.get("creator").toString();
				if (creator != null) {
					sqlstr.append("and creator.id=" + creator + " ");
				}
				String paladin = paramMap.get("paladin") == null ? "" : paramMap.get("paladin").toString();
				sqlstr.append("and paladin like '%" + paladin + "%' ");
			}
		}
		list = this.getHibernateTemplate().find("from DashboardDO where " + sqlstr.toString() +" and (smsdefault <> 'Y' or smsdefault is null) order by id asc");		
		return list;
	}
	
	public List<DashboardDO> getSysDashboard() throws Exception {
		List<DashboardDO> list = this.getHibernateTemplate().find("from DashboardDO where smsdefault = 'Y' order by id asc");	
		return list;
	}
	
	public void setGadgetsinstanceDao(GadgetsinstanceDao gadgetsinstanceDao) {
		this.gadgetsinstanceDao = gadgetsinstanceDao;
	}
	
	public void setUserGroupDao(UserGroupDao userGroupDao) {
		this.userGroupDao = userGroupDao;
	}
}
