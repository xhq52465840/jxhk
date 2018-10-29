package com.usky.sms.losa;

import java.lang.reflect.Field;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.hibernate.Session;

import com.usky.sms.core.BaseDao;
import com.usky.sms.file.FileDO;

public class AttachmentDao extends BaseDao<AttachmentDO>{

	public AttachmentDao(){
		super(AttachmentDO.class);
	}
	
	public AttachmentDO get(Integer attachId) throws Exception{
		return this.getHibernateTemplate().get(AttachmentDO.class, attachId);
	}
	
	public List<Object> queryAttachementById(String id) throws ParseException{
		String sql="select t.id from AttachmentDO t where t.activityId="+id;
		@SuppressWarnings("unchecked")
		List<Object>list=this.getHibernateTemplate().find(sql);
		return list;
		
	}
	public void saveAttach(AttachmentDO attach) throws ParseException{
		final Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();
		session.save(attach);
		session.flush();
		
	}
	public List<AttachmentDO>pullAttachment (String id,String serverIp,String serverPort) throws Exception{
		List<AttachmentDO>list=new ArrayList<AttachmentDO>();
		try{
			if(StringUtils.isNotBlank(id)){
				String sql="from AttachmentDO t  where  t.activityId="+id;
				list=this.getHibernateTemplate().find(sql);
			}
			if(list!=null && list.size()>0){
				for (int i = 0; i < list.size(); i++) {
					StringBuffer url = new StringBuffer("http://");
					url.append(serverIp + ":" + serverPort + "/sms/query.do?");
					url.append("nologin=Y&method=downloadLosaFiles&fileId="
							+ list.get(i).getId());
					list.get(i).setAttachUrl(String.valueOf(url));
				  }
				
			}
		}catch(Exception e){
			e.printStackTrace();
		}
		
	  return list;
	}
	public List<AttachmentDO>pullAttachment (String id) throws Exception{
		String sql="from AttachmentDO t  where  t.activityId='"+id+"'";
		@SuppressWarnings("unchecked")
		List<AttachmentDO>list=this.getHibernateTemplate().find(sql);
		if(list.size()>0){
			return list;
		}else{
			return null;
		}
	
	}
	public List<AttachmentDO>queryById (String id) throws Exception{
		String sql="from AttachmentDO t where t.id='"+id+"'";
		@SuppressWarnings("unchecked")
		List<AttachmentDO>list=this.getHibernateTemplate().find(sql);
		if(list.size()>0){
			return list;
		}else{
			return null;
		}
	}
}
