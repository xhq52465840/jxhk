package com.usky.sms.losa.report;

import java.io.FileInputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.Serializable;
import java.math.BigDecimal;
import java.net.InetAddress;
import java.text.DecimalFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringUtils;
import org.jxls.area.Area;
import org.jxls.builder.AreaBuilder;
import org.jxls.builder.xls.XlsCommentAreaBuilder;
import org.jxls.common.CellRef;
import org.jxls.common.Context;
import org.jxls.transform.Transformer;
import org.jxls.util.TransformerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.core.AbstractService;
import com.usky.sms.losa.ManageQueryForm;
import com.usky.sms.losa.activity.FlyStageNameEnum;
import com.usky.sms.losa.score.ScoreSelectContentDO;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;


public class ReportService extends AbstractService{
	
	@Autowired
	private ReportDao  reportDao;
	
	public void queryFullTimeCaptain (HttpServletRequest request,HttpServletResponse response)throws Exception {		
	  Map<String, Object> map = new HashMap<String, Object>();
	  try{
	    String manageQueryFormJson = request.getParameter("manageQueryForm");
	    ManageQueryForm manageQueryForm = gson.fromJson(manageQueryFormJson, ManageQueryForm.class);
	    Map resultmap = reportDao.queryFullTimeCaptain(manageQueryForm);
	    List<Object[]> list =  (List<Object[]>) resultmap.get("result");    
	    Object[] obj = list.get(0);
	    List resultList = Arrays.asList("<=1000小时","1000小时-3000小时","3000小时-10000小时",">10000小时","飞行小时数未填写");
	    List timeResultList = Arrays.asList(obj);
	    String json1 = gson.toJson(resultList);
	    String json2 = gson.toJson(timeResultList);
	    
	    map.put("success", "success");
	    map.put("data1", json1);
	    map.put("data2", json2);
	    map.put("data3", "[]");
	    ResponseHelper.output(response, map);
	  }catch(Exception e){
	    e.printStackTrace();
	    ResponseHelper.output(response,e);
	  }
	}
	 
	 public void queryThreatPercent (HttpServletRequest request,HttpServletResponse response)throws Exception {    
     Map<String, Object> map = new HashMap<String, Object>();
     try{
       String manageQueryFormJson = request.getParameter("manageQueryForm");
       ManageQueryForm manageQueryForm = gson.fromJson(manageQueryFormJson, ManageQueryForm.class);
       Map resultmap = reportDao.queryThreatPercent(manageQueryForm);
       List<Object[]> list =  (List<Object[]>) resultmap.get("result");    
       List resultList = new ArrayList<>();
       List countResultList = new ArrayList<>();
       for (Object[] obj : list) {
         resultList.add(obj[0]);
         countResultList.add(obj[1]);
       }
       String json1 = gson.toJson(resultList);
       String json2 = gson.toJson(countResultList);
       
       map.put("success", "success");
       map.put("data1", json1);
       map.put("data2", json2);
       map.put("data3", "[]");
       ResponseHelper.output(response, map);
     }catch(Exception e){
       e.printStackTrace();
       ResponseHelper.output(response,e);
     }
   }
	 
	 public void queryThreatTop5 (HttpServletRequest request,HttpServletResponse response)throws Exception {    
     Map<String, Object> map = new HashMap<String, Object>();
     try{
       String manageQueryFormJson = request.getParameter("manageQueryForm");
       ManageQueryForm manageQueryForm = gson.fromJson(manageQueryFormJson, ManageQueryForm.class);
       Map resultmap = reportDao.queryThreatTop5(manageQueryForm);
       List<Object[]> list =  (List<Object[]>) resultmap.get("result");    
       List resultList = new ArrayList<>();
       List countResultList = new ArrayList<>();
       for (Object[] obj : list) {
         resultList.add(obj[0]);
         countResultList.add(obj[1]);
       }
       String json1 = gson.toJson(resultList);
       String json2 = gson.toJson(countResultList);
       
       map.put("success", "success");
       map.put("data1", json1);
       map.put("data2", json2);
       map.put("data3", "[]");
       ResponseHelper.output(response, map);
     }catch(Exception e){
       e.printStackTrace();
       ResponseHelper.output(response,e);
     }
   }

	 public void queryErrorPercent (HttpServletRequest request,HttpServletResponse response)throws Exception {    
     Map<String, Object> map = new HashMap<String, Object>();
     try{
       String manageQueryFormJson = request.getParameter("manageQueryForm");
       ManageQueryForm manageQueryForm = gson.fromJson(manageQueryFormJson, ManageQueryForm.class);
       Map resultmap = reportDao.queryErrorPercent(manageQueryForm);
       List<Object[]> list =  (List<Object[]>) resultmap.get("result");    
       List resultList = new ArrayList<>();
       List countResultList = new ArrayList<>();
       for (Object[] obj : list) {
         resultList.add(obj[0]);
         countResultList.add(obj[1]);
       }
       String json1 = gson.toJson(resultList);
       String json2 = gson.toJson(countResultList);
       resultmap = reportDao.queryErrorNameCount(manageQueryForm);
       list =  (List<Object[]>) resultmap.get("result");    
       resultList = new ArrayList<>();
       countResultList = new ArrayList<>();
       List countResponseResultList = new ArrayList<>();
       for (int i=0; i<list.size(); i++) {
        Object[] obj = list.get(i);
        resultList.add(obj[0]);
        countResultList.add(obj[1]);
        countResponseResultList.add(obj[2]);
       }
       String json4 = gson.toJson(resultList);
       String json5 = gson.toJson(countResultList);
       String json6 = gson.toJson(countResponseResultList);
       
       map.put("success", "success");
       map.put("data1", json1);
       map.put("data2", json2);
       map.put("data3", "[]");
       map.put("data4", json4);
       map.put("data5", json5);
       map.put("data6", json6);
       ResponseHelper.output(response, map);
     }catch(Exception e){
       e.printStackTrace();
       ResponseHelper.output(response,e);
     }
   }
	 
	 public void queryErrorNamePercent10 (HttpServletRequest request,HttpServletResponse response)throws Exception {    
     Map<String, Object> map = new HashMap<String, Object>();
     try{
       String manageQueryFormJson = request.getParameter("manageQueryForm");
       ManageQueryForm manageQueryForm = gson.fromJson(manageQueryFormJson, ManageQueryForm.class);
       Map resultmap = reportDao.queryErrorNameCount(manageQueryForm);
       List<Object[]> list =  (List<Object[]>) resultmap.get("result");    
       List resultList = new ArrayList<>();
       List countResultList = new ArrayList<>();
       List countResponseResultList = new ArrayList<>();
       BigDecimal allCount = BigDecimal.ZERO;
       for (Object[] obj : list) {
         allCount = allCount.add((BigDecimal) obj[1]);
       }
       BigDecimal percent10 = new BigDecimal(0.1);
       for (Object[] obj : list) {
         BigDecimal count = (BigDecimal) obj[1];
         count = count.divide(allCount, 2, BigDecimal.ROUND_HALF_EVEN);
         if(count.compareTo(percent10)>0){
           resultList.add(obj[0]);
           countResultList.add(obj[1]);
           countResponseResultList.add(obj[2]);
         } 
       }
       String json1 = gson.toJson(resultList);
       String json2 = gson.toJson(countResultList);
       String json3 = gson.toJson(countResponseResultList);
       
       map.put("success", "success");
       map.put("data1", json1);
       map.put("data2", json2);
       map.put("data3", json3);
       ResponseHelper.output(response, map);
     }catch(Exception e){
       e.printStackTrace();
       ResponseHelper.output(response,e);
     }
   }
	 
   public void queryErrorNameTop5 (HttpServletRequest request,HttpServletResponse response)throws Exception {    
     Map<String, Object> map = new HashMap<String, Object>();
     try{
       String manageQueryFormJson = request.getParameter("manageQueryForm");
       ManageQueryForm manageQueryForm = gson.fromJson(manageQueryFormJson, ManageQueryForm.class);
       Map resultmap = reportDao.queryErrorNameCount(manageQueryForm);
       List<Object[]> list =  (List<Object[]>) resultmap.get("result");    
       List resultList = new ArrayList<>();
       List countResultList = new ArrayList<>();
       List countResponseResultList = new ArrayList<>();
       for (int i=0; i<5&&i<list.size(); i++) {
        Object[] obj = list.get(i);
        resultList.add(obj[0]);
        countResultList.add(obj[1]);
        countResponseResultList.add(obj[2]);
       }
       String json1 = gson.toJson(resultList);
       String json2 = gson.toJson(countResultList);
       String json3 = gson.toJson(countResponseResultList);
       
       map.put("success", "success");
       map.put("data1", json1);
       map.put("data2", json2);
       map.put("data3", json3);
       ResponseHelper.output(response, map);
     }catch(Exception e){
       e.printStackTrace();
       ResponseHelper.output(response,e);
     }
   }

  
	//威胁差错统计信息公共方法
	public List getResultList(ManageQueryForm manageQueryForm) throws Exception{
		List resultList = new ArrayList<>();
		Map resultmap = reportDao.queryThreatErrorCount(manageQueryForm);
		List<Object[]> list =  (List<Object[]>) resultmap.get("result");
		for (Object[] obj : list) {
	        Map tempMap = new HashMap();
	        tempMap.put("count", obj[0]);
	        tempMap.put("threatcount", obj[1]);
	        tempMap.put("errorcount", obj[2]);
	        tempMap.put("responsethreat", obj[3]);
	        tempMap.put("responseerror", obj[4]);
	        String threatcounts="0";
       		String errorcounts="0";
       		String threatPercent="0";
		    String errorPercent="0";
		    String unitErrorPercent="0";
		    String unitPercent="0";
		    DecimalFormat df1 = new DecimalFormat("0.00%");
		    DecimalFormat df2 = new DecimalFormat("0.00");
		    DecimalFormat df3 = new DecimalFormat("#");
		    if(obj[0]!=null && obj[1]!=null){
		    	threatcounts=df2.format(Double.valueOf(String.valueOf(obj[1]))/Double.valueOf(String.valueOf(obj[0]).equals("0")?"1":String.valueOf(obj[0])));
			}
		    if(obj[0]!=null && obj[2]!=null){
		    	errorcounts=df2.format(Double.valueOf(String.valueOf(obj[2]))/Double.valueOf(String.valueOf(obj[0]).equals("0")?"1":String.valueOf(obj[0])));
			}
		    if(obj[3]!=null && obj[1]!=null){
		    	threatPercent=df1.format(Double.valueOf(String.valueOf(obj[3]))/Double.valueOf(String.valueOf(obj[1]).equals("0")?"1":String.valueOf(obj[1])));
			}
		    if(obj[2]!=null && obj[4]!=null){
		    	errorPercent=df1.format(Double.valueOf(String.valueOf(obj[4]))/Double.valueOf(String.valueOf(obj[2]).equals("0")?"1":String.valueOf(obj[2])));
		    	unitErrorPercent=df3.format(Double.valueOf(String.valueOf(obj[2]))-Double.valueOf(String.valueOf(obj[4])));
		    	unitPercent=df1.format((Double.valueOf(String.valueOf(obj[2]))-Double.valueOf(String.valueOf(obj[4])))/Double.valueOf(String.valueOf(obj[2]).equals("0")?"1":String.valueOf(obj[2])));

			}
		    tempMap.put("threatcounts", threatcounts);
		    tempMap.put("errorcounts", errorcounts);
		    tempMap.put("threatPercent", threatPercent);
		    tempMap.put("errorPercent", errorPercent);
		    tempMap.put("unitErrorPercent", unitErrorPercent);
		    tempMap.put("unitPercent", unitPercent);
	        resultList.add(tempMap);
      }
		return resultList;
	}
	//查询威胁差错统计信息
	public void queryThreatErrorCount (HttpServletRequest request,HttpServletResponse response)throws Exception {		
		Map<String, Object> map = new HashMap<String, Object>();
		try{		    
		  String manageQueryFormJson = request.getParameter("manageQueryForm");
      ManageQueryForm manageQueryForm = gson.fromJson(manageQueryFormJson, ManageQueryForm.class);
		    map.put("success", "success");
		    map.put("data", this.getResultList(manageQueryForm));
		    ResponseHelper.output(response, map);
		}catch(Exception e){
			e.printStackTrace();
			 ResponseHelper.output(response,e);
		}
	}
	//威胁差错统计信息导出exl
	public void ExportangerCount (HttpServletRequest request,HttpServletResponse response)throws Exception {		
		OutputStream out = null;
		try{		    
		  String manageQueryFormJson = request.getParameter("manageQueryForm");
      ManageQueryForm manageQueryForm = gson.fromJson(manageQueryFormJson, ManageQueryForm.class);
	         String filePath = request.getSession().getServletContext().getRealPath("/")+"/uui/com/losa/xls/";
	         String tplPath = "manageCount.xls";
	         tplPath = filePath + tplPath;               
	         response.setContentType("application/octet-stream");
	         response.setHeader("content-disposition", "attachment;filename=" + new String("manageCount.xls".getBytes("UTF-8"), "ISO-8859-1"));
	         out = response.getOutputStream();
	         try (InputStream is = new FileInputStream(tplPath)) {
	           try{
	             Transformer transformer = TransformerFactory.createTransformer(is, out);
	             AreaBuilder areaBuilder = new XlsCommentAreaBuilder(transformer);
	             List<Area> xlsAreaList = areaBuilder.build();
	             Area xlsArea = xlsAreaList.get(0);    
	             Context context = transformer.createInitialContext();
	             context.putVar("manageCount", this.getResultList(manageQueryForm));
	             xlsArea.applyAt(new CellRef("Sheet1!A1"), context);
	             xlsArea.processFormulas();	             
	             transformer.write();
	           }catch (Exception e) {
	             e.printStackTrace();
	           }finally {
	             close(is, out);
	          }
	         }     
	      }catch(Exception e){
	        e.printStackTrace();
	        ResponseHelper.output(response, e);      
	      }
	    }
	//查询威胁明细
	public void queryThreatDetail (HttpServletRequest request,HttpServletResponse response)throws Exception {		
		  Map<String, Object> map = new HashMap<String, Object>();
		  try{
			String sortby = request.getParameter("sortby");
			String sortorders = request.getParameter("sortorders");
		    String manageQueryFormJson = request.getParameter("manageQueryForm");
		    ManageQueryForm manageQueryForm = gson.fromJson(manageQueryFormJson, ManageQueryForm.class);
		    Integer start = StringUtils.isBlank(request.getParameter("start")) ? null : Integer.parseInt(request.getParameter("start"));
			Integer length = StringUtils.isBlank(request.getParameter("length")) ? null : Integer.parseInt(request.getParameter("length"));
			Map resultmap = reportDao.queryThreatDetail(manageQueryForm,sortby,sortorders,start,length);
			map.put("success", "success");
		    map.put("data", resultmap.get("result"));
		    map.put("all", resultmap.get("all"));
		    ResponseHelper.output(response, map);
		  }catch(Exception e){
		    e.printStackTrace();
		    ResponseHelper.output(response,e);
		  }
		}
	//导出威胁明细
	public void exportThreatDetail (HttpServletRequest request,HttpServletResponse response)throws Exception {	
		  OutputStream out = null;
		  List resultList = new ArrayList<>();
		  Map<String, Object> map = new HashMap<String, Object>();
		  try{
			String sortby = request.getParameter("sortby");
			String sortorders = request.getParameter("sortorders");
		    String manageQueryFormJson = request.getParameter("manageQueryForm");
		    ManageQueryForm manageQueryForm = gson.fromJson(manageQueryFormJson, ManageQueryForm.class);
		    Integer start = StringUtils.isBlank(request.getParameter("start")) ? null : Integer.parseInt(request.getParameter("start"));
			 Integer length = StringUtils.isBlank(request.getParameter("length")) ? null : Integer.parseInt(request.getParameter("length"));
		    Map resultmap = reportDao.queryThreatDetail(manageQueryForm,sortby,sortorders,start,length);
//		    List<?> list =  (List<?>) resultmap.get("result");
//	        List<Map<String, Object>> threatDetails = new ArrayList<Map<String, Object>>();
//		    if (list != null) {
//		          for (int f = 0; f < list.size(); f++) {
//		            Map<String, Object> threatDetail =(Map<String, Object>) list.get(f);
//		            threatDetails.add(threatDetail);
//		          }
//		    }
			String filePath = request.getSession().getServletContext().getRealPath("/")+"/uui/com/losa/xls/";
	         String tplPath = "threatDetail.xls";
	         tplPath = filePath + tplPath;               
	         response.setContentType("application/octet-stream");
	         response.setHeader("content-disposition", "attachment;filename=" + new String("threatDetail.xls".getBytes("UTF-8"), "ISO-8859-1"));
	         out = response.getOutputStream();
	         try (InputStream is = new FileInputStream(tplPath)) {
	           try{
	             Transformer transformer = TransformerFactory.createTransformer(is, out);
	             AreaBuilder areaBuilder = new XlsCommentAreaBuilder(transformer);
	             List<Area> xlsAreaList = areaBuilder.build();
	             Area xlsArea = xlsAreaList.get(0);    
	             Context context = transformer.createInitialContext();
 	             context.putVar("threatDetail", resultmap);
	             xlsArea.applyAt(new CellRef("Sheet1!A1"), context);
	             xlsArea.processFormulas();	             
	             transformer.write();
	           }catch (Exception e) {
	             e.printStackTrace();
	           }finally {
	             close(is, out);
	          }
	         }     
		  }catch(Exception e){
		    e.printStackTrace();
		    ResponseHelper.output(response,e);
		  }
		}
	
	//查询差错明细
		public void queryErrorDetail (HttpServletRequest request,HttpServletResponse response)throws Exception {		
			  Map<String, Object> map = new HashMap<String, Object>();
			  try{
				String sortby = request.getParameter("sortby");
				String sortorders = request.getParameter("sortorders");
			    String manageQueryFormJson = request.getParameter("manageQueryForm");
			    ManageQueryForm manageQueryForm = gson.fromJson(manageQueryFormJson, ManageQueryForm.class);
			    Integer start = StringUtils.isBlank(request.getParameter("start")) ? null : Integer.parseInt(request.getParameter("start"));
				Integer length = StringUtils.isBlank(request.getParameter("length")) ? null : Integer.parseInt(request.getParameter("length"));
				Map resultmap = reportDao.queryErrorDetail(manageQueryForm,sortby,sortorders,start,length);
				map.put("success", "success");
			    map.put("data", resultmap.get("result"));
			    map.put("all", resultmap.get("all"));
			    ResponseHelper.output(response, map);
			  }catch(Exception e){
			    e.printStackTrace();
			    ResponseHelper.output(response,e);
			  }
			}
		//导出差错明细
		public void exportErrorDetail (HttpServletRequest request,HttpServletResponse response)throws Exception {	
			  OutputStream out = null;
			  List resultList = new ArrayList<>();
			  Map<String, Object> map = new HashMap<String, Object>();
			  try{
				String sortby = request.getParameter("sortby");
				String sortorders = request.getParameter("sortorders");
			    String manageQueryFormJson = request.getParameter("manageQueryForm");
			    ManageQueryForm manageQueryForm = gson.fromJson(manageQueryFormJson, ManageQueryForm.class);
			    Integer start = StringUtils.isBlank(request.getParameter("start")) ? null : Integer.parseInt(request.getParameter("start"));
				 Integer length = StringUtils.isBlank(request.getParameter("length")) ? null : Integer.parseInt(request.getParameter("length"));
			    Map resultmap = reportDao.queryErrorDetail(manageQueryForm,sortby,sortorders,start,length);
//			    List<?> list =  (List<?>) resultmap.get("result");
//		        List<Map<String, Object>> errorDetails = new ArrayList<Map<String, Object>>();
//			    if (list != null) {
//			          for (int f = 0; f < list.size(); f++) {
//			            Map<String, Object> errorDetail =(Map<String, Object>) list.get(f);
//			            errorDetails.add(errorDetail);
//			          }
//			    }
				String filePath = request.getSession().getServletContext().getRealPath("/")+"/uui/com/losa/xls/";
		         String tplPath = "errorDetail.xls";
		         tplPath = filePath + tplPath;               
		         response.setContentType("application/octet-stream");
		         response.setHeader("content-disposition", "attachment;filename=" + new String("errorDetail.xls".getBytes("UTF-8"), "ISO-8859-1"));
		         out = response.getOutputStream();
		         try (InputStream is = new FileInputStream(tplPath)) {
		           try{
		        	 Transformer transformer = TransformerFactory.createTransformer(is, out);
		             AreaBuilder areaBuilder = new XlsCommentAreaBuilder(transformer);
		             List<Area> xlsAreaList = areaBuilder.build();
		             Area xlsArea = xlsAreaList.get(0);    
		             Context context = transformer.createInitialContext();
	 	             context.putVar("errorDetail", resultmap);
		             xlsArea.applyAt(new CellRef("Sheet1!A1"), context);
		             xlsArea.processFormulas();	             
		             transformer.write();
		           }catch (Exception e) {
		             e.printStackTrace();
		           }finally {
		             close(is, out);
		          }
		         }     
			  }catch(Exception e){
			    e.printStackTrace();
			    ResponseHelper.output(response,e);
			  }
			}
	
		//查询用户职责和所属公司
		public void getUserAuths(HttpServletRequest request,HttpServletResponse response) throws Exception{
			try{
				UserDO user = UserContext.getUser();
				String userAuth = reportDao.getUserAuths(user.getId());
				Map<String, Object> result = new HashMap<String, Object>();
				result.put("success", true);
				result.put("data", userAuth);
				ResponseHelper.output(response, result);
			}catch(Exception e){
				e.printStackTrace();
			}
		}
		
	//查询被实施单位
	public void querySchemeOrgcode(HttpServletRequest request,HttpServletResponse response) throws Exception{
		
		try{
			String unitName=request.getParameter("unitName");
			Map<String,Object> paramMap= new HashMap<String,Object>();
			paramMap.put("unitName", unitName);
			List<Map<String,Object>> list = reportDao.querySchemeOrgcode(paramMap);
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			result.put("data", list);
			ResponseHelper.output(response, result);
			
		}catch(Exception e){
			e.printStackTrace();
		}
		
	}
	//关闭输入输出流
	  private void close(InputStream in, OutputStream out) {
	    IOUtils.closeQuietly(in);
	    IOUtils.closeQuietly(out);
	  }

	public ReportDao getReportDao() {
		return reportDao;
	}

	public void setReportDao(ReportDao reportDao) {
		this.reportDao = reportDao;
	}

   
}
