package com.usky.sms.eiosa;



import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import net.sf.jasperreports.engine.util.ObjectUtils;

import org.springframework.beans.factory.annotation.Autowired;

import com.usky.comm.JsonUtil;
import com.usky.sms.core.BaseDao;

public class ChapterDao extends BaseDao<ChapterDO>{
	public ChapterDao(){
		super(ChapterDO.class);
	}
	@Autowired
	private DocumentsDao documentsDao;
	@Autowired
	private OperateLogDao operateLogDao;
	public ChapterDO queryById(Integer id) throws Exception{
		String hql="from ChapterDO t where t.id=?";
		List<ChapterDO> list=this.getHibernateTemplate().find(hql,id);
		if(list.size()>0){
			return list.get(0);
		}else{
			return null;
		}
				
	}
    @Override
    protected void beforeDelete(Collection<ChapterDO> collection) {
    	try {
			//添加日志
    		for(ChapterDO chapter:collection){
    			List<String>details=new ArrayList<String>();
    			details.add("【"+DocumentsFieldEnum.DELETEISARPDOCUMENT.getValue()+"】:("+chapter.getDocumentid().getAcronyms()+")"+chapter.getDocumentid().getReviewed()+"--"+chapter.getDocumentid().getVersionno());
    			operateLogDao.addLog(chapter.getIsarpId(),"isarp","document", JsonUtil.toJson(details));
    		}
    		
		} catch (Exception e) {
			
			e.printStackTrace();
		}
		
	}
    public void addChapterLog(ChapterDO chapter) throws Exception{
 	   List<String>details=new ArrayList<String>();
 	   if(chapter.getId()==null){
 		   //isarp新增一本书
 		   DocumentsDO documentInDataBase=(DocumentsDO)documentsDao.internalGetById(chapter.getDocumentid().getId());
 		   details.add("【"+DocumentsFieldEnum.ISARPADDNEWCUMENT.getValue()+"】:("+documentInDataBase.getAcronyms()+")"+documentInDataBase.getReviewed()+"--"+documentInDataBase.getVersionno());
 	       if(chapter.getDec()!=null ){
 	    	   details.add(DocumentsFieldEnum.ISARPADDCHAPTER.getValue()+":"+chapter.getDec());
 	       }
 	   }else{
 		  ChapterDO chapterInDataBase=this.queryById(chapter.getId());
 		  DocumentsDO documentInDataBase=(DocumentsDO)documentsDao.internalGetById(chapter.getDocumentid().getId());
 		  if(!ObjectUtils.equals(chapter.getDec(), chapterInDataBase.getDec())){
 			  details.add("("+documentInDataBase.getAcronyms()+")"+documentInDataBase.getReviewed()+"--"+documentInDataBase.getVersionno()+"【"+DocumentsFieldEnum.ISARPUPDATECHAPTER.getValue()+"】:由【"+chapterInDataBase.getDec()+"】修改为：【"+chapter.getDec()+"】");
 		  }
 	   }
 	   
 	   operateLogDao.addLog(chapter.getIsarpId(),EiosaLogTypeEnum.ISARP.getKey(),EiosaLogOperateTypeEnum.DOCUMENT.getKey(), JsonUtil.toJson(details));
    }
    
	public DocumentsDao getDocumentsDao() {
		return documentsDao;
	}
	public void setDocumentsDao(DocumentsDao documentsDao) {
		this.documentsDao = documentsDao;
	}
	public OperateLogDao getOperateLogDao() {
		return operateLogDao;
	}
	public void setOperateLogDao(OperateLogDao operateLogDao) {
		this.operateLogDao = operateLogDao;
	}
	 
    
  
	
}
