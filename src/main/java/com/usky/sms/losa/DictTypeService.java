package com.usky.sms.losa;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.common.ResponseHelper;
import com.usky.sms.config.Config;
import com.usky.sms.core.AbstractService;

public class DictTypeService extends AbstractService{
	private Config config;
	
	@Autowired
	private DictTypeDao dictTypeDao;
	
	public DictTypeService(){
		this.setConfig(Config.getInstance());
				
	}
	
	//查询业务字典
	public void queryDictNames(HttpServletRequest request,HttpServletResponse response) throws Exception {
				
		try{
			String dictType=request.getParameter("dictType");
			String filterDictCode=request.getParameter("filterDictCode");	
			String versionNo=request.getParameter("versionNo");
			List<Map<String,Object>> list = dictTypeDao.queryDictNames(dictType,filterDictCode,versionNo);
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			result.put("data", list);
			ResponseHelper.output(response, result);
					
		}catch(Exception e){
					e.printStackTrace();
		}
			
	}
	
	//根据权限查询用户职责
		public void queryDuty(HttpServletRequest request,HttpServletResponse response) throws Exception {
					
			try{
				String dictType=request.getParameter("dictType");
				String filterDictCode=request.getParameter("filterDictCode");	
				String versionNo=request.getParameter("versionNo");
				List<Map<String,Object>> list = dictTypeDao.queryDuty(dictType,filterDictCode,versionNo);
				Map<String, Object> result = new HashMap<String, Object>();
				result.put("success", true);
				result.put("data", list);
				ResponseHelper.output(response, result);
						
			}catch(Exception e){
						e.printStackTrace();
			}
				
		}


	public Config getConfig() {
		return config;
	}

	public void setConfig(Config config) {
		this.config = config;
	}
	
	public DictTypeDao getDictTypeDao() {
		return dictTypeDao;
	}

	public void setDictTypeDao(DictTypeDao dictTypeDao) {
		this.dictTypeDao = dictTypeDao;
	}

}
