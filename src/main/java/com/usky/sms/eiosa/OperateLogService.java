package com.usky.sms.eiosa;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;

import com.google.gson.reflect.TypeToken;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.core.AbstractService;
import com.usky.sms.eiosa.user.EiosaUserGroupDao;
import com.usky.sms.message.MessageDO;
import com.usky.sms.message.MessageDao;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;

public class OperateLogService extends AbstractService{
	
	@Autowired
	private OperateLogDao operateLogDao;
	@Autowired
	private IsarpDao isarpDao;
	@Autowired
	private MessageDao messageDao;
	@Autowired
	private EiosaUserGroupDao eiosaUserGroupDao;
	public void saveMessage(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try{
			String message=request.getParameter("message");
			String receiverStr=request.getParameter("receiver");
			String type=request.getParameter("type");
			String sendToNotice=request.getParameter("sendToNotice");
			String assessment=request.getParameter("assessment");
			String reason =request.getParameter("reason");
			String rootCause=request.getParameter("rootCause");
			String taken=request.getParameter("taken");
			String comments =request.getParameter("comments");
			OperateLogDO operate=gson.fromJson(message,new TypeToken<OperateLogDO>() {}.getType());
			if(type.equals("sendMessage")){//发送消息
				Integer receiver=Integer.valueOf(receiverStr);
				UserDO user=new UserDO();
				user.setId(receiver);
				operate.setReceiver(user);
				operateLogDao.saveMessage(operate);
				//发送消息到站内通知
				if(sendToNotice.equals("true")){
					operateLogDao.addNotice(operate.getDetail(), "协作消息", receiver, operate.getTargetId());
				}
				
				
			}else if(type.equals("addExplain")){//只添加说明
				//只保存message
				operateLogDao.saveMessage(operate);
			}else if(type.equals("submitIsarp")){//提交
				//先进行保存
				Map<String,Object>map=new HashMap<String,Object>();
				map.put("reason", reason);map.put("rootCause", rootCause);
				map.put("taken", taken);map.put("comments", comments);
				map.put("assessment", Integer.valueOf(assessment));
				isarpDao.update(operate.getTargetId(), map);
				
				String content=this.setContent(operate, "向您提交一条isarp,并附加说明：", "提交，并附加说明：", "提交一条ISARP,请即时审核", EiosaLogOperateTypeEnum.SUBMIT.getKey());
				//添加站内通知
				if(sendToNotice.equals("true")){
					Integer managerId=eiosaUserGroupDao.getManagerByIsarpId(operate.getTargetId());
					if(managerId!=null){
						operateLogDao.addNotice(content, "已提交，请审核", managerId, operate.getTargetId());
					}
				}
				
				isarpDao.submitIsarp(operate.getTargetId());
				
			}else if(type.equals("auditFinish")){//审核通过
				
				String content=this.setContent(operate, "您提交的isarp已审核通过,并附加说明：", "审核通过，并附加说明：", ":您提交的ISARP已审核通过", EiosaLogOperateTypeEnum.AUDIT.getKey());
               //添加站内通知
				if(sendToNotice.equals("true")){
					Integer submiterId=eiosaUserGroupDao.getSubmiterByIsarpId(operate.getTargetId());
					if(submiterId!=null){
						operateLogDao.addNotice(content, "审核通过", submiterId, operate.getTargetId());
					}	
				}
				isarpDao.auditFinish(operate.getTargetId());
			}else if(type.equals("noAudited")){//审核不通过
				
				String content=this.setContent(operate, "您提交的isarp审核不通过,并附加说明：", "审核不通过，并附加说明：", ":您提交的ISARP审核不通过", EiosaLogOperateTypeEnum.AUDIT.getKey());
				if(sendToNotice.equals("true")){
					Integer submiterId=eiosaUserGroupDao.getSubmiterByIsarpId(operate.getTargetId());
					if(submiterId!=null){
						operateLogDao.addNotice(content, "审核不通过", submiterId, operate.getTargetId());
					}
				}
				
				isarpDao.noAudited(operate.getTargetId());
			}
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			ResponseHelper.output(response, result);
			
		}catch(Exception e){
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	/**
	 * 设置通知与日志内容
	 * @param operate
	 * @param content
	 * @return
	 * @throws Exception
	 */
	private String setContent(OperateLogDO operate,String content1,String content2,String content3,String operType) throws Exception{
		//提交
		String result=null;
		try{
			
			if(!operate.getDetail().equals("") && operate.getDetail()!=null){
				result=UserContext.getUser().getFullname()+content1+operate.getDetail();
				operate.setDetail(content2+operate.getDetail());
				operateLogDao.addLog(operate.getTargetId(),EiosaLogTypeEnum.ISARP.getKey(),operType,operate.getDetail());
			}else{
				result=UserContext.getUser().getFullname()+content3;
				operateLogDao.addLog(operate.getTargetId(),EiosaLogTypeEnum.ISARP.getKey(),operType,result);
			}
			
		}catch(Exception e){
			e.printStackTrace();
		}
		return result;
	}
	
	public OperateLogDao getOperateLogDao() {
		return operateLogDao;
	}

	public void setOperateLogDao(OperateLogDao operateLogDao) {
		this.operateLogDao = operateLogDao;
	}


	public IsarpDao getIsarpDao() {
		return isarpDao;
	}


	public void setIsarpDao(IsarpDao isarpDao) {
		this.isarpDao = isarpDao;
	}


	public MessageDao getMessageDao() {
		return messageDao;
	}


	public void setMessageDao(MessageDao messageDao) {
		this.messageDao = messageDao;
	}

	public EiosaUserGroupDao getEiosaUserGroupDao() {
		return eiosaUserGroupDao;
	}

	public void setEiosaUserGroupDao(EiosaUserGroupDao eiosaUserGroupDao) {
		this.eiosaUserGroupDao = eiosaUserGroupDao;
	}

}
