package com.usky.sms.eiosa;

import java.lang.reflect.Field;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;

import com.google.gson.reflect.TypeToken;
import com.usky.sms.avatar.AvatarDO;
import com.usky.sms.common.DateHelper;
import com.usky.sms.config.Config;
import com.usky.sms.core.BaseDao;
import com.usky.sms.eiosa.user.EiosaUserGroupDao;
import com.usky.sms.message.MessageDO;
import com.usky.sms.message.MessageDao;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;

public class OperateLogDao extends BaseDao<OperateLogDO>{
	private Config config;
	@Autowired
	private IsarpDao isarpDao;
	@Autowired
	private MessageDao messageDao;
	@Autowired
	private EiosaUserGroupDao eiosaUserGroupDao;
	public OperateLogDao(){
		super(OperateLogDO.class);
		this.config = Config.getInstance();
		
	}
	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		map.put("creator",UserContext.getUserId());
		return super.beforeSave(map);
	}
	@Override
	protected Object getQueryParamValue(String key, Object value) {
		if ("targetId".equals(key)) return ((Number) value).intValue();
		return super.getQueryParamValue(key, value);
	}
	public List<Map<String,Object>> queryLog(String rule,String sort) throws Exception {
		Map<String, Object[]> ruleMap=new HashMap<String,Object[]>();
		Map<String, String> solrtMap = gson.fromJson(sort, new TypeToken<Map<String, String>>() {}.getType());
		if(rule.length()>3){
			ruleMap = gson.fromJson(rule, new TypeToken<Map<String,Object[]>>() {}.getType());
		}
		String startSendDate=null;
		String endSendDate=null;
		String receiver=null;
		String sender=null;
		Double isarp=null;
		String section=null;
		String param="";
		
        if(ruleMap.get("startSendDate")!=null){
				 startSendDate=(String)ruleMap.get("startSendDate")[0];
			}
	   if(ruleMap.get("endSendDate")!=null){
				endSendDate=(String)ruleMap.get("endSendDate")[0];
			}
	  if(ruleMap.get("receiver")!=null){
				receiver=(String)ruleMap.get("receiver")[0];
			}
	  if(ruleMap.get("sender")!=null){
				 sender=(String)ruleMap.get("sender")[0];
			}
	  if(ruleMap.get("isarp")!=null){
				isarp=(Double)ruleMap.get("isarp")[0];
			}
	  if(ruleMap.get("section")!=null){
				section=(String)ruleMap.get("section")[0];
			    
			}
	  
	  SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
	  List<Map<String,Object>>list=new ArrayList<Map<String,Object>>();
		String sql="select t3.sectionName, t2.no, t2.text, t1.descoperate ,t1.creator.fullname as receiver,rec.fullname as sender,t1.created as created,t1.detail"
				+ " from OperateLogDO t1 left join t1.receiver rec,IsarpDO t2,IosaSectionDO t3 where  "+
				"   t1.targetId = t2.id and t2.sectionId = t3.id";
		if(receiver!=null){
			param+=" and receiver='"+receiver+"'";
		}
		if(sender!=null){
			param+=" and sender='"+sender+"'";
		}
		if(isarp!=null){
			param+=" and t2.id='"+isarp+"'";
		}
		if(section!=null){
			param+=" and t3.sectionName='"+section+"'";
		}
		if (startSendDate!=null && endSendDate!=null){
			param+=" and t1.created> to_date('"+startSendDate+"','yyyy-mm-dd') and t1.created< to_date('"+endSendDate+"','yyyy-mm-dd')";
		}
		
		String sorltKey=(String)solrtMap.get("key");
		String sorltVlaue=(String)solrtMap.get("value");
		param+=" order by "+sorltKey+" "+sorltVlaue;
		List<?>result=this.getHibernateTemplate().find(sql+param);
		if(result!=null){
			for(int i=0;i<result.size();i++){
				Map<String,Object>map=new HashMap<String,Object>();
				Object[] obj = (Object[])result.get(i);
				map.put("sectionName", obj[0]);
				map.put("no", obj[1]);
				map.put("text", obj[2]);
				map.put("desc", obj[3]);
				map.put("sender", obj[4]);
				map.put("receiver", obj[5]);
				map.put("created", dateFormat.format((obj[6])));
				map.put("detail", obj[7]);
				list.add(map);
			}
		}
		return list;
	}
	@SuppressWarnings("unchecked")
	public List<Map<String,Object>> queryLogSender(){
		String sql="select distinct(t.creator) from OperateLogDO t";
		List<UserDO>list=this.getHibernateTemplate().find(sql);
		List<Map<String,Object>>result=new ArrayList<Map<String,Object>>();
		if(list!=null){
			for(int i=0;i<list.size();i++){
				UserDO user=list.get(i);
				Map<String,Object>map=new HashMap<String,Object>();
				map.put("id", user.getId());
				map.put("name",user.getFullname());
				result.add(map);
			}
		}
		
		return  result;
	}
	public List<Map<String,Object>> queryLogReceiver(){
		String sql="select distinct(t.receiver) from OperateLogDO t";
		@SuppressWarnings("unchecked")
		List<UserDO>list=this.getHibernateTemplate().find(sql);
		List<Map<String,Object>>result=new ArrayList<Map<String,Object>>();
		if(list!=null){
			for(int i=0;i<list.size();i++){
				UserDO user=list.get(i);
				Map<String,Object>map=new HashMap<String,Object>();
				map.put("id", user.getId());
				map.put("name",user.getFullname());
				result.add(map);
			}
		}
		
		return  result;
	}
	public void saveMessage(OperateLogDO log) throws Exception{
		try{
			
			log.setCreator(UserContext.getUser());
			log.setLast_modifier(UserContext.getUserId());
			log.setType("isarp");
			log.setOper_type("message");
			this.internalSave(log);
			
		}catch(Exception e){
			e.printStackTrace();
		}
	}
	public void addLog(int source, String type, String operType,String detail) throws Exception{
         try{
        	 OperateLogDO log=new OperateLogDO();
        	 log.setCreator(UserContext.getUser());
 			 log.setLast_modifier(UserContext.getUserId());
			 log.setDetail(detail);
			 log.setTargetId(source);
			 log.setType(type);
			 log.setOper_type(operType);
			 this.internalSave(log);
			
		}catch(Exception e){
			e.printStackTrace();
		}
	}
	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		String fieldName = field.getName();
		OperateLogDO log=(OperateLogDO)obj;
		if("creator".equals(fieldName)){
			UserDO user = log.getCreator();
			map.put("userId", user.getId());
			map.put("username", user.getUsername());
			map.put("fullname", user.getFullname());
			AvatarDO avatar = user.getAvatar();
			map.put("avatar", config.getUserAvatarWebPath() + "/" + (avatar == null ? config.getUnknownUserAvatar() : avatar.getFileName()));
		}else if("receiver".equals(fieldName)){
			UserDO receiver = log.getReceiver();
			if(receiver!=null){
				map.put("receiver", receiver.getFullname());
			}else{
				map.put("receiver", null);
			}
			
			
		}else if ("created".equals(fieldName)) {
			map.put("date", DateHelper.formatIsoSecond(log.getCreated()));
		}
		super.setField(map, obj, claz, multiple, field);
	}
	public void addNotice(String content,String title,Integer receiver,Integer isarpId ) throws Exception {
		try{
			MessageDO messageDO = new MessageDO();
			messageDO.setSender(UserContext.getUser());
			messageDO.setSendTime(new Date());
			messageDO.setContent(content);
			IsarpDO isarp=(IsarpDO)isarpDao.internalGetById(isarpId);
			messageDO.setTitle("(EIOSA)"+isarp.getSectionId().getSectionName()+"--"+isarp.getNo()+" "+title);
			messageDO.setLink(String.valueOf(isarpId));
			messageDO.setChecked(false);
			messageDO.setSourceType("ISARP");
			List<UserDO>receivers=new ArrayList<UserDO>();
			UserDO user=new UserDO();
			user.setId(receiver);
			receivers.add(user);
			messageDao.sendMessage(messageDO, receivers);
			
		}catch(Exception e){
			e.printStackTrace();
		}
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
