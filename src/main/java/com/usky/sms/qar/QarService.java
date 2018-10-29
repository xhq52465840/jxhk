package com.usky.sms.qar;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringUtils;

import com.ceair.smsws.dto.BoResultDto;
import com.ceair.smsws.webservice.BoUrlService;
import com.ceair.smsws.webservice.BoUrlServiceLocator;
import com.ceair.smsws.webservice.BoUrlServicePortType;
import com.google.gson.reflect.TypeToken;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.SMSException;

public class QarService extends AbstractService {

	public void getBoUrl(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			String obj = request.getParameter("obj");
			Map<String, Object> paramMap = gson.fromJson(obj,new TypeToken<Map<String, Object>>() {}.getType());
			// 是否显示工具栏
			String tool = (String) paramMap.get("tool");
			String boId = (String) paramMap.get("boId");
			String lsMYear = (String) paramMap.get("lsMYear");
			String lsMMonth = (String) paramMap.get("lsMMonth");
			String lsMShow = (String) paramMap.get("lsMShow");
			
			if(StringUtils.isBlank(tool)){
				// 默认NO
				tool = "NO";
			}
			if(StringUtils.isBlank(boId)){
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "报表不存在！");
			}
			// 拼接链接参数
			StringBuffer linkParam = new StringBuffer();;
			if(StringUtils.isNotBlank(lsMYear)){
				linkParam.append("&lsMYear=");
				linkParam.append(lsMYear);
			}
			if(StringUtils.isNotBlank(lsMMonth)){
				linkParam.append("&lsMMonth=");
				linkParam.append(lsMMonth);
			}
			if(StringUtils.isNotBlank(lsMShow)){
				linkParam.append("&lsMShow=");
				linkParam.append(lsMShow);
			}
			
			// 调用BoUrlService的方法,获取报表的url
			BoUrlService service = new BoUrlServiceLocator();
			BoUrlServicePortType boUrlServicePortType = service.getBoUrlServicePort();
			BoResultDto boResultDto = boUrlServicePortType.getBoUrl(tool, boId, linkParam.toString());
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("data", boResultDto.getUrl());
			map.put("success", boResultDto.getFlag());
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}

}
