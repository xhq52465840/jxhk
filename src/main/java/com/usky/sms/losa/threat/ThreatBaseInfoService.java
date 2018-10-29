package com.usky.sms.losa.threat;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.common.ResponseHelper;
import com.usky.sms.core.AbstractService;

public class ThreatBaseInfoService extends AbstractService{
	
	@Autowired
	private ThreatBaseInfoDao  threatBaseInfoDao;
    /**
     * 查找威胁类型
     * @param request
     * @param response
     * @throws Exception
     */
	public void queryThreadType (HttpServletRequest request,HttpServletResponse response)throws Exception {
		
		Map<String, Object> map = new HashMap<String, Object>();
		try{
			List<ThreatBaseInfoDO> list=threatBaseInfoDao.queryThreatType();
			 map.put("code", "success");
			 map.put("data", list);
			 ResponseHelper.output(response, map);
		}catch(Exception e){
			e.printStackTrace();
			 ResponseHelper.output(response,e);
		}
	}
	public void queryThreadNo(HttpServletRequest request,HttpServletResponse response)throws Exception {
		Map<String, Object> map = new HashMap<String, Object>();
		String parentCode=request.getParameter("parentCode");
		try{
			List<ThreatBaseInfoDO> list=threatBaseInfoDao.queryThreatNo(parentCode);
			 map.put("code", "success");
			 map.put("data", list);
			 ResponseHelper.output(response, map);
		}catch(Exception e){
			e.printStackTrace();
			 ResponseHelper.output(response,e);
		}
	}
	
	public ThreatBaseInfoDao getThreatBaseInfoDao() {
		return threatBaseInfoDao;
	}

	public void setThreatBaseInfoDao(ThreatBaseInfoDao threatBaseInfoDao) {
		this.threatBaseInfoDao = threatBaseInfoDao;
	}
	
	

}
