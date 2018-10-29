package com.usky.sms.eiosa;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.Reader;
import java.io.StringReader;
import java.io.StringWriter;
import java.math.BigDecimal;
import java.nio.charset.Charset;
import java.sql.Clob;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Set;
import java.util.Map.Entry;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.velocity.Template;
import org.apache.velocity.VelocityContext;
import org.apache.velocity.app.Velocity;
import org.apache.velocity.app.VelocityEngine;
import org.jsoup.Jsoup;
import org.jxls.area.Area;
import org.jxls.builder.AreaBuilder;
import org.jxls.builder.xls.XlsCommentAreaBuilder;
import org.jxls.common.CellRef;
import org.jxls.common.Context;
import org.jxls.transform.Transformer;
import org.jxls.util.TransformerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.xml.sax.InputSource;

import com.google.gson.reflect.TypeToken;
import com.itextpdf.text.Document;
import com.itextpdf.text.pdf.PdfWriter;
import com.itextpdf.tool.xml.XMLWorkerHelper;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.html.simpleparser.HTMLWorker;
import com.lowagie.text.html.simpleparser.StyleSheet;
import com.usky.sms.common.JasperHelper;
import com.usky.sms.common.PageHelper;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.SMSException;
import com.usky.sms.eiosa.report.AuditorRecord;
import com.usky.sms.eiosa.report.Conformance;
import com.usky.sms.eiosa.report.DocumentReferences;
import com.usky.sms.eiosa.user.EiosaUserGroupDao;
import com.usky.sms.losa.AttachmentDO;
import com.usky.sms.losa.AttachmentDao;
import net.sf.jasperreports.engine.JRDataSource;
import net.sf.jasperreports.engine.JasperFillManager;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.JasperReport;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import net.sf.jasperreports.engine.util.JRLoader;


public class ReportService extends AbstractService {

//  /** 导出文件名称 */
//  public static final String DOWNLOAD_FILE_NAME = "isarpCharpter.pdf";
//  
//  public static final String DOWNLOAD_FILE_NAMES = "isarpCharpter";
//  
//  /** 报表模板文件目录 */
//  public static final String FILE_PATH = "/uui/com/eiosa/export_template/";
//  
//  /** 报表模板文件路径 */
//  public static final String ISARPCHARPTERPDF_REPORT_TEMPLATE_FILE_PATH = FILE_PATH + "isarpCharpter_reportpdf.jasper";
//  
//  public static final String ISARPCHARPTEREXCEL_REPORT_TEMPLATE_FILE_PATH = FILE_PATH + "isarpCharpter_reportexcel.jasper";  
  public static final String WORD_TYPE="word";
  public static final String PDF_TYPE="pdf" ;

  @Autowired
  private ReportDao eiosaReportDao;
  @Autowired
  private IsarpDao isarpDao;
  @Autowired
  private SectionDao sectionDao;
  @Autowired
  private AssessmentsDao assessmentsDao;
  @Autowired
  private IsarpActionDao isarpActionDao;
  @Autowired
  private AttachmentDao attachementDao;
  @Autowired
  private DocumentsDao documentsDao;
  @Autowired
  private SectionDao iosaSectionDao;
  @Autowired
  private AuditorActionDao auditorActionDao;
  @Autowired
  private EiosaUserGroupDao eiosaUserGroupDao;

  
  public void queryReportDtatil(HttpServletRequest request, HttpServletResponse response) throws Exception {
    Map<String, Object> map = new HashMap<String, Object>();
    Map<String, Object> data = new HashMap<String, Object>();
    try {
      EiosaReportDO iosaReportDo = eiosaReportDao.get(Integer.valueOf(request.getParameter("id")) );   
      data.put("report", iosaReportDo);     
      map.put("data", data);
      map.put("success", true);
      ResponseHelper.output(response, map);
     
      }catch (Exception e) {
      e.printStackTrace();
    }
  }
  
  public void queryReport(HttpServletRequest request,HttpServletResponse response) throws Exception {
		
		try{
			// String reportId=request.getParameter("reportId");
			 String sortby=request.getParameter("sortby");
		     String sortorders = request.getParameter("sortorders");
			 String reportQueryFormstr = request.getParameter("reportQueryForm");			 
			 ReportQueryForm reportQueryForm=gson.fromJson(reportQueryFormstr,new TypeToken<ReportQueryForm>() {}.getType());
			 List<Map<String,Object>>list=eiosaReportDao.queryReport(reportQueryForm,sortby,sortorders);
				Map<String, Object> result = new HashMap<String, Object>();
				result.put("data", PageHelper.getPagedResult(list, request));
				result.put("success", true);
				ResponseHelper.output(response, result);
				
//				}	
			
		}catch(Exception e){
			e.printStackTrace();
		}
	
	}

  public void updateReport(HttpServletRequest request, HttpServletResponse response) throws Exception {
    Map<String, Object> map = new HashMap<String, Object>();
    try {
      String report = request.getParameter("report");
      EiosaReportDO reportDO = gson.fromJson(report, new TypeToken<EiosaReportDO>() {
      }.getType());
      boolean result = eiosaReportDao.internalUpdate(reportDO);
      if (result == true) {
        map.put("code", "success");
      } else {
        map.put("code", "fail");
      }
      ResponseHelper.output(response, map);
    } catch (Exception e) {
      e.printStackTrace();
    }
  }
  
  public void ismCeaWord(HttpServletRequest request, HttpServletResponse response)throws Exception {
    InputStream in = null;
    OutputStream out = null;
    try {
      String section = request.getParameter("section");
      String reportId = request.getParameter("reportId");
      String tmpType = request.getParameter("tmpType");

      List queryList = eiosaReportDao.queryIsmWordList(section, reportId);
      List listAll = new ArrayList();
      Map<String,Object> sectionMap = new HashMap();
      
      listAll.add(section);
      Date nowDate = new Date();
      SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
      String nowDateStr = sdf.format(nowDate);
      listAll.add(nowDateStr);
      List list=iosaSectionDao.querySection(reportId);
      for(Object obj : list){
        if(section.equals(((Map)obj).get("sectionName"))){
          sectionMap = (Map) obj;
          break;
        }
      }
      listAll.add(sectionMap.get("startDate"));
      Date endDate = sdf.parse( (String) sectionMap.get("endDate"));
      if(endDate.before(nowDate)){
        listAll.add(sdf.format(endDate));
      }else{
        listAll.add(nowDateStr);
      }
      list = eiosaReportDao.queryIsarpText(reportId,section);
      Object[] textObj = (Object[]) list.get(0);
      listAll.add(textObj[1]);
      listAll.add(textObj[1]);
      listAll.add(section);
      listAll.add(section);
      listAll.add(sectionMap.get("isarpCount"));
      String IsarpTextStr = (String)textObj[0];
      listAll.add(IsarpTextStr.replaceAll(",", "，"));
      listAll.add(sectionMap.get("isarpFinish"));
      listAll.add(sectionMap.get("isarpPercent"));
      listAll.add(sectionMap.get("aaCount"));
      listAll.add(sectionMap.get("aaFinish"));
      listAll.add(sectionMap.get("aaPercent"));
      listAll.add(sectionMap.get("finding"));
      listAll.add(sectionMap.get("observation"));
      listAll.add(sectionMap.get("na"));
      
      list = eiosaReportDao.queryIsarpAssessmentList(reportId,section);
      List isarpAssessments = new ArrayList();
      if(list!=null){
        for(int i=0;i<list.size();i++){
          Object[] obj=(Object[]) list.get(i);
          List isarpAssessment = Arrays.asList((String) obj[0], (BigDecimal) obj[1], (BigDecimal) obj[2], (BigDecimal) obj[3]);
          isarpAssessments.add(isarpAssessment);
        }
      }
      listAll.add(isarpAssessments);
      
      list = eiosaReportDao.queryDocumentReferencesList(reportId,section);
      List documentReferencess = new ArrayList();
      if(list!=null){
        for(int i=0;i<list.size();i++){
          Object[] obj=(Object[]) list.get(i);
          List documentReferences = Arrays.asList((String)obj[2],(String)obj[3],(String)obj[4],(String)obj[5],
              sdf.format((Timestamp)obj[6]),((BigDecimal)obj[7]).intValue()==1?"√":"",
              ((BigDecimal)obj[8]).intValue()==1?"√":"",((BigDecimal)obj[9]).intValue()==1?"√":"",((BigDecimal)obj[10]).intValue()==1?"√":"",((BigDecimal)obj[11]).intValue()==1?"√":"",
              ((BigDecimal)obj[12]).intValue()==1?"√":"",((BigDecimal)obj[13]).intValue()==1?"√":"",((BigDecimal)obj[14]).intValue()==1?"√":"");
          documentReferencess.add(documentReferences);
        }
      }
      listAll.add(documentReferencess);
      
      list = auditorActionDao.queryAuditors(reportId,"audited","","");
      List auditorRecords = new ArrayList();
      if(list!=null){
        for(int i=0;i<list.size();i++){
          Map<String,Object> obj=(Map<String,Object>) list.get(i);
          String sectionname = (String)obj.get("disciplines");
          if(sectionname.matches("(.*)"+section+"(.*)")){
            List auditorRecord = Arrays.asList((String)obj.get("name"), "Auditor", (String)obj.get("disciplines"));
            auditorRecords.add(auditorRecord);
          }
        }
      }   
      listAll.add(auditorRecords);
     
      list = eiosaReportDao.queryConformanceReportList(reportId);
      Map map = new HashMap();
      if(list!=null){
        for (int i = 0; i < list.size(); i++) {
          Object[] obj = (Object[]) list.get(i);
          if (section.equals((String) obj[11])) {
            BigDecimal id = (BigDecimal) obj[0];
            if (!map.containsKey(id)) {           
              String text = (String) obj[2];
              String comments = (String) obj[18]!=null?(String) obj[18]:"";       
              if("pdf".equals(tmpType)){
                text = wordToString(formatWord(text));
                comments = wordToString(formatWord(comments));
              }              
              List conformanceTemp = Arrays.asList((String) obj[11], (String) obj[1], text, !"()".equals((String) obj[6]) ? (String) obj[6] : "", comments, (String) obj[5], (String) obj[15], new ArrayList(), new ArrayList());
              List conformance = new ArrayList(conformanceTemp);
              map.put(id, conformance);
            }
          }
        }
        for (int j = 0; j < list.size(); j++) {
          Object[] obj = (Object[]) list.get(j);
          if (section.equals((String) obj[11])) {
            BigDecimal id = (BigDecimal) obj[0];
            String record = (String) obj[12]!=null?(String) obj[12]:"";
            if("pdf".equals(tmpType)){
              record = wordToString(formatWord(record));
            }                
            List auditorAction = Arrays.asList((String) obj[13], (String) obj[19], sdf.format((Timestamp) obj[10]), (String) obj[17]!=null?(String) obj[17]:"", record);
            ((List) ((List) map.get(id)).get(7)).add(auditorAction);
          }
        }
      }    
      list = eiosaReportDao.queryIsarpDocument(reportId);
      if(list!=null){
        for (int j = 0; j < list.size(); j++) {
          Object[] obj = (Object[]) list.get(j);
          BigDecimal id = (BigDecimal) obj[0];
          List document = Arrays.asList((String) obj[1], (String) obj[2], (String) obj[3], (String) obj[4]);
          if(map.containsKey(id)){
            ((List) ((List) map.get(id)).get(8)).add(document);
          }
        }
      }
      List conformances = new ArrayList();
      Iterator iter = map.entrySet().iterator();
      while (iter.hasNext()) {
        Map.Entry entry = (Map.Entry) iter.next();
        conformances.add(entry.getValue());
      }
      Comparator<List> comparator = new Comparator<List>(){  
        public int compare(List c1, List c2) {  
          if(c1.get(0).equals(c2.get(0))){
            return ((String) c1.get(6)).compareTo((String) c2.get(6));
          }else{
            return ((String) c1.get(0)).compareTo((String) c2.get(0));
          }         
        }  
      };
      Collections.sort(conformances,comparator); 
      listAll.add(conformances);
//      System.out.println(listAll);
    
      String filePath = request.getSession().getServletContext().getRealPath("/") + "/uui/com/eiosa/xls/";
      // System.out.println("filePath:" + filePath);
      String tplPath = filePath;

      // 初始化并取得Velocity引擎
      VelocityEngine ve = new VelocityEngine();
      // 取得velocity的模版
      Properties p = new Properties();
      p.put(Velocity.FILE_RESOURCE_LOADER_PATH, tplPath);
      ve.init(p);  
      Template t = ve.getTemplate("ism-CEA.vm", "utf-8");
      if("pdf".equals(tmpType)){
        t = ve.getTemplate("ism-CEA-pdf.vm", "utf-8");
      }
      VelocityContext context = new VelocityContext();

      context.put("listAll", listAll);
      StringWriter writer = new StringWriter();
      t.merge(context, writer);
//      System.out.println(writer.toString());
      // 输出到文件
      if("pdf".equals(tmpType)){
        Document document = new Document();
        PdfWriter pdfwriter = PdfWriter.getInstance(document, response.getOutputStream());
        document.open();
        XMLWorkerHelper.getInstance().parseXHtml(pdfwriter, document, new ByteArrayInputStream(writer.toString().getBytes("utf-8")), Charset.forName("UTF-8"));
        document.close();
      } else {
        try {
//          response.setContentType("application/x-msdownload");
          response.setContentType("application/octet-stream");
          response.setHeader("content-disposition", "attachment;filename=" + new String(("ism-" + section.toLowerCase() + "-cea.doc").getBytes("UTF-8"), "ISO-8859-1"));
          out = response.getOutputStream();
          out.write(writer.toString().getBytes("utf-8"));
          out.flush();
        } catch (Exception e) {
          e.printStackTrace();
        } finally {
          out.close();
        }
      } 
    } catch (Exception e) {
      e.printStackTrace();
      ResponseHelper.output(response, e);
    }
  }
  
  public void ismItemReport(HttpServletRequest request, HttpServletResponse response)throws Exception {
    InputStream in = null;
    OutputStream out = null;
    try {
      String isarpId = request.getParameter("isarpId");
      String type=request.getParameter("type");
      List ismItem = new ArrayList<>();
      
      IsarpDO isarpDO = isarpDao.get(Integer.valueOf(isarpId) );
      if(isarpDO!=null){
        ismItem.add("<w:p>" +  formatWord(isarpDO.getText()) + "</w:p>");
        ismItem.add("<w:p>" +  formatWord(isarpDO.getGuidance()) + "</w:p>");
        if(isarpDO.getStatus()!=null){
          ismItem.add(isarpDO.getStatus().getCode_name());
        }else{
          ismItem.add("");
        }
      }
        
      List<Map<String,Object>>list=isarpActionDao.queryActions(isarpId,type);
      List auditorActions = new ArrayList<>();
      if(list!=null){
        for(Map<String,Object> map : list){
          List auditorAction = new ArrayList<>();
          auditorAction.add(formatWord("<strong>"+map.get("type")+"</strong>"+map.get("title")));
          auditorAction.add(map.get("auditDate")!=null?map.get("auditDate"):"");
          auditorAction.add(map.get("auditingAuditors")!=null?map.get("auditingAuditors"):"");
          auditorAction.add(map.get("reports")!=null?map.get("reports"):"");
          String id=String.valueOf(map.get("id"));
            //根据ID查找附件
            //TODO 附件需改成批量查询
            List<AttachmentDO> attachs=attachementDao.pullAttachment(id);
            String str = "";
            if(attachs!=null){
              for(AttachmentDO attach : attachs){
                str+=attach.getAttachShowName()+",";
              }
            }  
            str = str.substring(0,str.length());
            auditorAction.add(str);
            auditorAction.add(map.get("status")!=null?map.get("status"):"");
            auditorActions.add(auditorAction);
        }
      }      
      ismItem.add(auditorActions);
      
      List documents = new ArrayList<>();
      Map<String,Object>  map = documentsDao.queryDocumentsByIsarp(isarpId);
      List<ChapterDO> cdoList = (List<ChapterDO>) map.get("chapters");
      if(cdoList!=null){
        for(ChapterDO chapterDO : cdoList){
          List document = new ArrayList<>();
          if(chapterDO.getDocumentid()!=null){
            document.add(chapterDO.getDocumentid().getReviewed());
            document.add(chapterDO.getDocumentid().getAcronyms());
            document.add(chapterDO.getDocumentid().getVersionno());
          }else{
            document.add("");
            document.add("");
            document.add("");
          }        
          if(chapterDO.getDec()!=null){
            document.add(chapterDO.getDec());
          }else{
            document.add("");
          }          
          documents.add(document);
        }
      }     
      ismItem.add(documents);
      
      if(isarpDO!=null&&isarpDO.getAssessment()!=null){
        ismItem.add(isarpDO.getAssessment().getType()+"("+isarpDO.getAssessment().getText()+")");
        ismItem.add(isarpDO.getComments());
        ismItem.add(isarpDO.getReason());
        ismItem.add(isarpDO.getRootCause());
        ismItem.add(isarpDO.getTaken());
        ismItem.add(isarpDO.getAssessment().getId());
      }else{
        ismItem.add("");
        ismItem.add("");
        ismItem.add("");
        ismItem.add("");
        ismItem.add("");
        ismItem.add(false);
      }
    
      String filePath = request.getSession().getServletContext().getRealPath("/") + "/uui/com/eiosa/xls/";
      // System.out.println("filePath:" + filePath);
      String tplPath = filePath;

      // 初始化并取得Velocity引擎
      VelocityEngine ve = new VelocityEngine();
      // 取得velocity的模版
      Properties p = new Properties();
      p.put(Velocity.FILE_RESOURCE_LOADER_PATH, tplPath);
      ve.init(p);
      Template t = ve.getTemplate("ismItem.vm", "utf-8");
      VelocityContext context = new VelocityContext();

      context.put("ismItem", ismItem);
      StringWriter writer = new StringWriter();
      t.merge(context, writer);
      // System.out.println(writer.toString());
      // 输出到文件
      try {
//        response.setContentType("application/x-msdownload");
        response.setContentType("application/octet-stream");
        response.setHeader("content-disposition", "attachment;filename=" + new String("ismItem.doc".getBytes("UTF-8"), "ISO-8859-1"));
        out = response.getOutputStream();
        out.write(writer.toString().getBytes("utf-8"));
        out.flush();
      } catch (Exception e) {
        e.printStackTrace();
      } finally {
        out.close();
      }

    } catch (Exception e) {
      e.printStackTrace();
      ResponseHelper.output(response, e);
    }
  }
  
  public void ismWord(HttpServletRequest request, HttpServletResponse response) throws Exception {
    InputStream in = null;
    OutputStream out = null;
    try {
      String section = request.getParameter("section");
      String reportId = request.getParameter("reportId");
      List AssessmentsOptionAll = assessmentsDao.getAssessmentsOptions();

      List queryList = eiosaReportDao.queryIsmWordList(section, reportId);
      List sectionHeader = new ArrayList();
      List listAll = new ArrayList();
      if(queryList!=null&&queryList.size()>0){
        String tit = (String) ((Object[]) queryList.get(0))[9];
        tit = tit.replaceAll("&mdash;", "-");  
        tit = tit.replaceAll("&nbsp;", " ");
        tit = tit.replaceAll("nbsp;", " ");
        sectionHeader.add(tit);
        sectionHeader.add(formatWord(ClobToString((Clob) ((Object[]) queryList.get(0))[10])));
        sectionHeader.add(formatWord(ClobToString((Clob) ((Object[]) queryList.get(0))[11])));
        String noSortTemp = "";
        List actionListTemp = new ArrayList();
        for (int i = 0; i < queryList.size(); i++) {
//          System.out.println(i);
          Object[] obj = (Object[]) queryList.get(i);
          if (obj[0] == null)
            continue;
          String no_sort = (String) obj[0];
          if (no_sort.length() == 3) {
            List list1 = new ArrayList();
            list1.add("" + obj[8] + " " + obj[1]);
            list1.add(new ArrayList());
            listAll.add(list1);
          } else if (no_sort.length() == 6) {
            List list1 = (List) listAll.get(listAll.size() - 1);
            List list2All = (List) list1.get(1);
            List list2 = new ArrayList();
            String ppr = "<w:br/><w:p><w:pPr><w:outlineLvl w:val='2'/></w:pPr><w:r><w:rPr><w:rFonts w:ascii='Arial' w:fareast='Arial Unicode MS' w:h-ansi='Arial' w:cs='Arial'/><wx:font wx:val='Arial'/><w:sz w:val='27.5'/><w:b/></w:rPr><w:t>    ";
            list2.add(ppr + obj[8] + " " + obj[1] + "</w:t></w:r></w:p>");
            list2.add(new ArrayList());
            list2All.add(list2);
          } else if (no_sort.length() >= 9) {
            List list1 = (List) listAll.get(listAll.size() - 1);
            List list2All = (List) list1.get(1);
            List list2 = (List) list2All.get(list2All.size() - 1);
            List list3All = (List) list2.get(1);
            if (!noSortTemp.equals(no_sort)) {
              noSortTemp = no_sort;
              List list3 = new ArrayList();
              String strTemp = "";
              strTemp = formatWord(patternSectionNo((String) obj[1],section));
              strTemp = "<w:p>" + strTemp + "</w:p>";
              list3.add(strTemp);
              List assessmentlist = new ArrayList();
              List<Map<String, Object>> assessmentsOptionslist = getAssessmentsOptionsByType(AssessmentsOptionAll, (String) obj[1]);
              if(assessmentsOptionslist!=null){
                for (int j = 0; j < assessmentsOptionslist.size(); j++) {
                  Map map = assessmentsOptionslist.get(j);
                  if (((BigDecimal) obj[2]).toString().equals(((Integer) map.get("value")).toString())) {
                    if (j == 0) {
                      strTemp = " ☒ " + map.get("text") + "<w:br/>";
                    } else {
                      strTemp = "☒ " + map.get("text") + "<w:br/>";
                    }
                  } else {
                    if (j == 0) {
                      strTemp = " ☐ " + map.get("text") + "<w:br/>";
                    } else {
                      strTemp = "☐ " + map.get("text") + "<w:br/>";
                    }
                  }
                  assessmentlist.add(strTemp);
                }
              }             
              list3.add(assessmentlist);
              list3.add("<w:p>"+formatWord((String) obj[3])+"</w:p>");
              List actionList = new ArrayList();
              if (BigDecimal.ONE.compareTo((BigDecimal) obj[4]) == 0) {
                strTemp = formatWord(" ☒ " + "<strong> " + obj[5] + "</strong>" + obj[6]);
              } else {
                strTemp = formatWord(" ☐ " + "<strong> " + obj[5] + "</strong>" + obj[6]);
              }
              actionList.add(strTemp);
              if (i != 1) {
                actionListTemp.add(formatWord("<w:br/>  ☐ " + "<strong> Other Actions</strong>(Specify)"));
              }
              list3.add(actionList);
              strTemp = ClobToString((Clob) obj[7]);
              strTemp = formatWord(strTemp);
              strTemp = "<w:p>" + strTemp + "</w:p>";
              list3.add(strTemp);
              list3All.add(list3);
            } else {
              List list3 = (List) list3All.get(list3All.size() - 1);
              List actionList = (List) list3.get(3);
              String strTemp = "";
              if (BigDecimal.ONE.compareTo((BigDecimal) obj[4]) == 0) {
                strTemp = formatWord("<w:br/>" + "  ☒ " + "<strong> " + obj[5] + "</strong>" + obj[6]);
              } else {
                strTemp = formatWord("<w:br/>" + "  ☐ " + "<strong> " + obj[5] + "</strong>" + obj[6]);
              }
              actionList.add(strTemp);
              actionListTemp = actionList;
            }
          }
        }
      }
      
      String filePath = request.getSession().getServletContext().getRealPath("/") + "/uui/com/eiosa/xls/";
      // System.out.println("filePath:" + filePath);
      String tplPath = filePath;

      // 初始化并取得Velocity引擎
      VelocityEngine ve = new VelocityEngine();
      // 取得velocity的模版
      Properties p = new Properties();
      p.put(Velocity.FILE_RESOURCE_LOADER_PATH, tplPath);
      ve.init(p);
      Template t = ve.getTemplate("ism.vm", "utf-8");
      VelocityContext context = new VelocityContext();

      context.put("sectionHeader", sectionHeader);
      context.put("list", listAll);
      StringWriter writer = new StringWriter();
      t.merge(context, writer);
      // System.out.println(writer.toString());
      // 输出到文件
      try {
//        response.setContentType("application/x-msdownload");
        response.setContentType("application/octet-stream");
        response.setHeader("content-disposition", "attachment;filename=" + new String(("ism-" + section.toLowerCase() + "-en.doc").getBytes("UTF-8"), "ISO-8859-1"));
        out = response.getOutputStream();
        out.write(writer.toString().getBytes("utf-8"));
        out.flush();
      } catch (Exception e) {
        e.printStackTrace();
      } finally {
        out.close();
      }

    } catch (Exception e) {
      e.printStackTrace();
      ResponseHelper.output(response, e);
    }
  }
  /**
   * isarpCharpter导出到excel
   * @param request
   * @param response
   */
//  public void isarpCharpterReports(HttpServletRequest request, HttpServletResponse response) throws Exception {
//    InputStream in = null;
//    OutputStream out = null;
//    try {
//      List<Map<String, Object>> result = new ArrayList<Map<String, Object>>();
//      List<Map<String, Object>> tmp = new ArrayList<Map<String, Object>>();
//      String rule = request.getParameter("rule");
//
//      List<Map<String, String>> param = gson.fromJson(rule, new TypeToken<List<Map<String, String>>>() {}.getType());
//      Integer reportId = Integer.valueOf(param.get(0).get("reportId"));
//      String sectionId = param.get(0).get("sectionId");
//      String acronyms = param.get(0).get("acronyms");
//      String charpterstr = param.get(0).get("charpter");
//      String[] charp = charpterstr.split(",");
//      for (int i = 0; i < charp.length; i++) {
//        Map<String, Object> queryMap = new HashMap<String, Object>();
//        Map<String, Object> isarps = new HashMap<String, Object>();
//        queryMap.put("acronyms", acronyms);
//        queryMap.put("reportId", reportId);
//        queryMap.put("sectionId", sectionId);
//        if (!StringUtils.isBlank(sectionId)) {
//          queryMap.put("sectionIds", sectionDao.querySectionNameById(Integer.parseInt(sectionId)).getSectionName());
//        } else {
//          queryMap.put("sectionIds", "全部");
//        }
//        String charpter = charp[i];
//        queryMap.put("charpter", charpter);
//        List<Object> queryResultList = isarpDao.getIsarpCharpter(rule, queryMap, 0, 99999);
//        List<?> list = (List<?>) queryResultList.get(1);
//        isarps.put("queryMap", queryMap);
//
//        if (list != null) {
//          List<Map<String, Object>> isarpCharpters = new ArrayList<Map<String, Object>>();
//          for (int f = 0; f < list.size(); f++) {
//            Map<String, Object> isarpCharpter = (Map<String, Object>) list.get(f);
//            isarpCharpter.put("text", stringToEscape(wordToString(formatWord((String) isarpCharpter.get("text")))));
//            isarpCharpters.add(isarpCharpter);
//          }
//          isarps.put("isarpCharpters", isarpCharpters);
//        }
//        result.add(isarps);
//      }
//
//      String filePath = request.getSession().getServletContext().getRealPath("/") + "/uui/com/eiosa/xls/";
//      String tplPath = "isarpCharpterReports.xls";
//      tplPath = filePath + tplPath;
//      // response.setContentType("application/x-msdownload");
//      response.setContentType("application/octet-stream");
//      response.setHeader("content-disposition", "attachment;filename=" + new String("isarpCharpterReports_out.xls".getBytes("UTF-8"), "ISO-8859-1"));
//      out = response.getOutputStream();
//      try (InputStream is = new FileInputStream(tplPath)) {
//        try {
//          Transformer transformer = TransformerFactory.createTransformer(is, out);
//          AreaBuilder areaBuilder = new XlsCommentAreaBuilder(transformer);
//          List<Area> xlsAreaList = areaBuilder.build();
//          // System.out.println("xlsAreaList.size: "+xlsAreaList.size());
//          Area xlsArea = xlsAreaList.get(0);
//          Context context = transformer.createInitialContext();
//          context.putVar("result", result);
//          xlsArea.applyAt(new CellRef("Sheet1!A0"), context);
//          xlsArea.processFormulas();
//
//          transformer.write();
//        } catch (Exception e) {
//          e.printStackTrace();
//        } finally {
//          close(is, out);
//        }
//      }
//    } catch (Exception e) {
//      e.printStackTrace();
//      ResponseHelper.output(response, e);
//    }
//  }
  /**
   * isarpCharpter导出到pdf和exl格式(第二版)
   * @param request
   * @param response
   */
  public void exportisarpCharpterToPdf(HttpServletRequest request, HttpServletResponse response) throws Exception {
	    InputStream in = null;
	    OutputStream out = null;
	    try {
	      List<Map<String, Object>> result = new ArrayList<Map<String, Object>>();
	      List<Map<String, Object>> tmp = new ArrayList<Map<String, Object>>();
	      String rule = request.getParameter("rule");
	      String type = request.getParameter("tmpType");
	      String sortby = request.getParameter("sortby");
	      String sortorders = request.getParameter("sortorders");
	      List<Map<String, String>> param = gson.fromJson(rule, new TypeToken<List<Map<String, String>>>() {}.getType());
	      Integer reportId = Integer.valueOf(param.get(0).get("reportId"));
	      String sectionId = param.get(0).get("sectionId");
	      String acronyms = param.get(0).get("acronyms");
	      String charpterstr = param.get(0).get("charpter");
	      String[] charp = charpterstr.split(",");
	      for (int i = 0; i < charp.length; i++) {
	        Map<String, Object> queryMap = new HashMap<String, Object>();
	        Map<String, Object> isarps = new HashMap<String, Object>();
	        queryMap.put("acronyms", acronyms);
	        queryMap.put("reportId", reportId);
	        queryMap.put("sectionId", sectionId);
	        if (!StringUtils.isBlank(sectionId)) {
	          queryMap.put("sectionIds", sectionDao.querySectionNameById(Integer.parseInt(sectionId)).getSectionName());
	        } else {
	          queryMap.put("sectionIds", "全部");
	        }
	        String charpter = charp[i];
	        queryMap.put("charpter", charpter);
	        List<Object> queryResultList = isarpDao.getIsarpCharpter(rule, queryMap, 0, 99999,sortby,sortorders);
	        List<?> list = (List<?>) queryResultList.get(1);
	        isarps.put("queryMap", queryMap);
	        if (list != null) {
	          List<Map<String, Object>> isarpCharpters = new ArrayList<Map<String, Object>>();
	          for (int f = 0; f < list.size(); f++) {
	            Map<String, Object> isarpCharpter = (Map<String, Object>) list.get(f);
	            //isarpCharpter.put("text", Jsoup.parse((String) isarpCharpter.get("text")));	            
	            //isarpCharpter.put("text", wordToString(formatWord((String) isarpCharpter.get("text"))));
	            isarpCharpters.add(isarpCharpter);
	          }
	          isarps.put("isarpCharpters", isarpCharpters);
	        }
	        result.add(isarps);
	      }

	      String filePath = request.getSession().getServletContext().getRealPath("/") + "/uui/com/eiosa/xls/";
	      String tplPath = filePath;
	      // 初始化并取得Velocity引擎
	      VelocityEngine ve = new VelocityEngine();
	      // 取得velocity的模版
	      Properties p = new Properties();
	      p.put(Velocity.FILE_RESOURCE_LOADER_PATH, tplPath);
	      ve.init(p);  
	      Template t = ve.getTemplate("isarpCharpterReports-pdf.vm", "utf-8");
	      
	      VelocityContext context = new VelocityContext();

	      context.put("result", result);
	      StringWriter writer = new StringWriter();
	      t.merge(context, writer);
	       //输出到文件	 
	      if (PDF_TYPE.equals(type)) {
	    	  Document document = new Document();
		        PdfWriter pdfwriter = PdfWriter.getInstance(document, response.getOutputStream());
		        document.open();
		        XMLWorkerHelper.getInstance().parseXHtml(pdfwriter, document, new ByteArrayInputStream(Jsoup.parse(writer.toString()).toString().getBytes("utf-8")), Charset.forName("UTF-8"));
		        document.close();
	        }else if (WORD_TYPE.equals(type)) {
	        	response.setContentType("application/octet-stream");
	            response.setHeader("content-disposition", "attachment;filename=" + new String(("isarpCharpter.doc").getBytes("gbk"), "ISO-8859-1"));
	            out = response.getOutputStream();
	            out.write(Jsoup.parse(writer.toString()).toString().getBytes("gbk"));
	            out.flush();
	            }    
	      	        
	    } catch (Exception e) {
	      e.printStackTrace();
	      ResponseHelper.output(response, e);
	    }
	    
	  }
  
  /**
   * isarpCharpter导出到pdf和exl格式(第一版)
   * @param request
   * @param response
   */
//  public void exportisarpCharpterToPdf(HttpServletRequest request, HttpServletResponse response) {  
//    
//    InputStream content = null;   
//    try {                
//         List<TableList> tempDataList = new ArrayList<TableList>();     
//           String rule=request.getParameter("rule");
//           String type = request.getParameter("tmpType");
//           String userRole=eiosaUserGroupDao.getUserEiosaRole();
//         List<Map<String,String>>param=gson.fromJson(rule, new TypeToken<List<Map<String,String>>>() {}.getType());
//         Integer reportId=Integer.valueOf(param.get(0).get("reportId"));
//         String sectionId=param.get(0).get("sectionId");
//           String acronyms=param.get(0).get("acronyms");
//         String charpterstr=param.get(0).get("charpter");
//         String[] charp=charpterstr.split(",");          
//         for(int i=0;i<charp.length;i++){         
//           Map<String, Object> queryMap = new HashMap<String, Object>();
//           Map<String,Object> isarps  = new HashMap<String,Object>();
//           queryMap.put("acronyms", acronyms);
//           queryMap.put("reportId", reportId);
//           queryMap.put("sectionId", sectionId);
//           String charpter= charp[i];
//           queryMap.put("charpter", charpter);             
//           List<Object> queryResultList=isarpDao.getIsarpCharpter(rule,queryMap,0,99999);
//           List<?> list = (List<?>) queryResultList.get(1);  
//           TableList tabelList = new TableList();
//           String sectionna=!StringUtils.isBlank(sectionId) ? sectionDao.querySectionNameById(Integer.parseInt(sectionId)).getSectionName() : "全部";   
//          if(list!=null){
//            List<IsarpReport> tempData = new ArrayList<IsarpReport>();
//                  for(int f=0;f<list.size();f++){
//                   Map<String,Object> isarpCharpter=(Map<String, Object>) list.get(f);
//   	               isarpCharpter.put("text", Jsoup.parse((String) isarpCharpter.get("text")).text());	            
//                  //isarpCharpter.put("text", wordToString(formatWord((String)isarpCharpter.get("text"))));
//                   IsarpReport isarpReport = new IsarpReport();                  
//                   isarpReport.setSectionName(sectionna);                        
//                   isarpReport.setCharpter(charpter);
//                   isarpReport.setAcronyms(acronyms);
//                   isarpReport.setSection(isarpCharpter.get("sectionName").toString());
//                   isarpReport.setIsarp(isarpCharpter.get("no").toString());
//                   isarpReport.setText(isarpCharpter.get("text").toString());
//                   isarpReport.setChapter(isarpCharpter.get("chapter").toString());
//                   isarpReport.setFlowStatus(isarpCharpter.get("status").toString());
//                   isarpReport.setConformity(isarpCharpter.get("conformity").toString());
//                   tempData.add(isarpReport);                  
//                 }  
//                  tabelList.setRole(userRole);
//                  tabelList.setType(type);
//                  tabelList.setTableList(new JRBeanCollectionDataSource(tempData));
//               }        
//                 tempDataList.add(tabelList);                  
//         }
//         
//          if(!userRole.equals("auditor")){
//           
//          }else{
//            
//          }
//      // 文件根路径 
//      String root = request.getSession().getServletContext().getRealPath("/");
//      if (root == null) {
//        root = ReportService.class.getResource("/").getPath() + "/../..";
//      }
//      List<JasperPrint> jasperPrintList = new ArrayList<JasperPrint>();
//      String contentUrl="";
//      if (PDF_TYPE.equals(type)) {
//    	   contentUrl = root + ISARPCHARPTERPDF_REPORT_TEMPLATE_FILE_PATH;
//        } else if (EXCEL_TYPE.equals(type)) {
//        	contentUrl = root + ISARPCHARPTEREXCEL_REPORT_TEMPLATE_FILE_PATH;
//      }    
//         
//      content = new FileInputStream(new File(contentUrl));
//      JasperReport contentReport = (JasperReport) JRLoader.loadObject(content);
//      JRDataSource contentData = new JRBeanCollectionDataSource(tempDataList, false);     
//      // 参数
//      Map<String, Object> parameter = new HashMap<String, Object>();
//      parameter.put("filePath", root + FILE_PATH);
//      JasperPrint contentPrint = JasperFillManager.fillReport(contentReport, parameter, contentData);
//      jasperPrintList.add(contentPrint);
//      
//      if (PDF_TYPE.equals(type)) {
//        JasperHelper.exportToPdf(jasperPrintList, DOWNLOAD_FILE_NAME, response);
//      } else if (EXCEL_TYPE.equals(type)) {
//        JasperHelper.exportExcel(contentPrint, DOWNLOAD_FILE_NAMES, response);
//    }     
//      
//    } catch (Exception e) {
//      e.printStackTrace();
//      if (!response.isCommitted()) {
//        response.reset();
//        throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "导出失败！" + e.getMessage());
//      }
//    } finally {
//      IOUtils.closeQuietly(content);
//    }
//  }
  public void sectionStatusReports(HttpServletRequest request, HttpServletResponse response)throws Exception {
      InputStream in = null;
      OutputStream out = null;
      try{
        Map<String, Object> result = new HashMap<String, Object>();
      
          // String reportId=request.getParameter("reportId");
           String rule=request.getParameter("rule");
           List<Map<String,String>>param=gson.fromJson(rule, new TypeToken<List<Map<String,String>>>() {}.getType());
           String reportId=param.get(0).get("reportId");
           String type=request.getParameter("type");

           List<Map<String,Object>> queryResultList=sectionDao.querySection(reportId);  
           
           List<Map<String, Object>> sectionStatus = new ArrayList<Map<String, Object>>();
           
           
           for (Map<String, Object> m : queryResultList)  
           {   Map sectionStatuss  = new HashMap();
             for (String k : m.keySet())  
             {    System.out.println(k + " : " + m.get(k));
                  sectionStatuss.put(k, m.get(k));               
             }   
             sectionStatus.add(sectionStatuss);       
           }
           
         String filePath = request.getSession().getServletContext().getRealPath("/")+"/uui/com/eiosa/xls/";
         
         String tplPath = "sectionStatusReports.xls";
         tplPath = filePath + tplPath;               
//         response.setContentType("application/x-msdownload");   
         response.setContentType("application/octet-stream");
         response.setHeader("content-disposition", "attachment;filename=" + new String("sectionStatusReports.xls".getBytes("UTF-8"), "ISO-8859-1"));
         out = response.getOutputStream();
         try (InputStream is = new FileInputStream(tplPath)) {
           try{
             Transformer transformer = TransformerFactory.createTransformer(is, out);
             AreaBuilder areaBuilder = new XlsCommentAreaBuilder(transformer);
             List<Area> xlsAreaList = areaBuilder.build();
             Area xlsArea = xlsAreaList.get(0);    
             Context context = transformer.createInitialContext();
             context.putVar("sectionStatus", sectionStatus);
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
  
  public void conformanceReports(HttpServletRequest request, HttpServletResponse response) throws Exception {
    InputStream in = null;
    OutputStream out = null;
    try {
      Map<String, Object> result = new HashMap<String, Object>();
      String reportId=request.getParameter("reportId");

      String filePath = request.getSession().getServletContext().getRealPath("/")+"/uui/com/eiosa/xls/";
      //System.out.println("filePath:" + filePath);
      String tplPath = "Conformance Reports.xls";
      tplPath = filePath + tplPath;
      
      List list = auditorActionDao.queryAuditors(reportId,"audited","","");
      List auditorRecords = new ArrayList();
      if(list!=null){
        for(int i=0;i<list.size();i++){
          Map<String,Object> obj=(Map<String,Object>) list.get(i);
//          System.out.println((String)obj[1]);
          AuditorRecord auditorRecord = new AuditorRecord((String)obj.get("name"), "Auditor", "Internal Auditor", (String)obj.get("disciplines"));
          auditorRecords.add(auditorRecord);
        }
      }   
      
      list = eiosaReportDao.queryDocumentReferencesList(reportId,"");
      List documentReferencess = new ArrayList();
      if(list!=null){
        for(int i=0;i<list.size();i++){
          Object[] obj=(Object[]) list.get(i);
          DocumentReferences documentReferences = new DocumentReferences((String)obj[2],(String)obj[3],(String)obj[4],(String)obj[5],
              (Timestamp)obj[6],((BigDecimal)obj[7]).intValue()==1?"√":"",
              ((BigDecimal)obj[8]).intValue()==1?"√":"",((BigDecimal)obj[9]).intValue()==1?"√":"",((BigDecimal)obj[10]).intValue()==1?"√":"",((BigDecimal)obj[11]).intValue()==1?"√":"",
              ((BigDecimal)obj[12]).intValue()==1?"√":"",((BigDecimal)obj[13]).intValue()==1?"√":"",((BigDecimal)obj[14]).intValue()==1?"√":"");
          documentReferencess.add(documentReferences);
        }
      }
      
      list = eiosaReportDao.queryConformanceReportList(reportId);
      long startTime = System.nanoTime();
      Map<BigDecimal, Conformance> map = new HashMap<BigDecimal, Conformance>();
      if(list!=null){
        for (int i = 0; i < list.size(); i++) {
          Object[] obj = (Object[]) list.get(i);
          BigDecimal id = (BigDecimal) obj[0];
          Conformance conformance = null;
          if (!map.containsKey(id)) {
//            String str = obj[5] != null ? ((String) obj[5]).replaceAll(",", "/r/n") : (String) obj[5];
            conformance = new Conformance((String) obj[11], (String) obj[1], stringToEscape(wordToString(formatWord((String) obj[2]))), (Timestamp) obj[3], (String) obj[4], (String) obj[5], !"()".equals((String) obj[6])?(String) obj[6]:"", (String) obj[7], (String) obj[8], (String) obj[9], (String) obj[15]);
            map.put(id, conformance);
          }
        }
        for (int j = 0; j < list.size(); j++) {
          Object[] obj = (Object[]) list.get(j);
          BigDecimal id = (BigDecimal) obj[0];
          BigDecimal flag = obj[14] == null ? BigDecimal.ZERO : (BigDecimal) obj[14];
          String status = flag.compareTo(BigDecimal.ONE) == 0 ? "√" : "";
          map.get(id).addAuditorAction(status);
        }
      }    
      List conformances = new ArrayList();
      Iterator iter = map.entrySet().iterator();
      while (iter.hasNext()) {
        Map.Entry entry = (Map.Entry) iter.next();
        conformances.add(entry.getValue());
      }
      Comparator<Conformance> comparator = new Comparator<Conformance>(){  
        public int compare(Conformance c1, Conformance c2) {  
          if(c1.getSection().equals(c2.getSection())){
            return c1.getNo_sort().compareTo(c2.getNo_sort());
          }else{
            return c1.getSection().compareTo(c2.getSection());
          }         
        }  
      };
      Collections.sort(conformances,comparator); 
      long endTime = System.nanoTime();
      System.out.println("Stress demo 1 time (s): " + (endTime - startTime) / 1000000000);
      
//      response.setContentType("application/x-msdownload");     
      response.setContentType("application/octet-stream");
      response.setHeader("content-disposition", "attachment;filename=" + new String("Conformance Reports_out.xls".getBytes("UTF-8"), "ISO-8859-1"));
      out = response.getOutputStream();
      try (InputStream is = new FileInputStream(tplPath)) {
        try {
          Transformer transformer = TransformerFactory.createTransformer(is, out);
          AreaBuilder areaBuilder = new XlsCommentAreaBuilder(transformer);
          List<Area> xlsAreaList = areaBuilder.build();
          Area xlsArea = xlsAreaList.get(0);
          Context context = transformer.createInitialContext();
          context.putVar("auditorRecords", auditorRecords);
          xlsArea.applyAt(new CellRef("Auditor Record!A5"), context);

          xlsArea = xlsAreaList.get(2);
          context.putVar("documentReferencess", documentReferencess);
          xlsArea.applyAt(new CellRef("List of Document References!A4"), context);

          xlsArea = xlsAreaList.get(1);
          context.putVar("conformances", conformances);
          xlsArea.applyAt(new CellRef("Conformance Report!A1"), context);

          xlsArea.processFormulas();
          transformer.write();
        } catch (Exception e) {
          e.printStackTrace();
        } finally {
          close(is, out);
        }
      }

   }catch(Exception e){
     e.printStackTrace();
     ResponseHelper.output(response, e);      
   }
  }

  
  //根据isarps text首行是否包含shall/should决定assessment下拉选项内容
  private List<Map<String, Object>> getAssessmentsOptionsByType(List<Map<String, Object>> list, String isarpDO) {
    List<Map<String, Object>> result = new ArrayList<Map<String,Object>>();
    String[] r = isarpDO.split("</p>");
    boolean shall = (r!=null && r.length>0 && r[0].contains("shall")) ? true : false;
    if(list!=null){
      for (Map<String, Object> pair : list) {
        int value = ((Integer) pair.get("value")).intValue();
        if (shall) {
          if ( (value>=1 && value<=4)  || value==8) {
            result.add(pair);
          }
        } else {
          if ( (value>=5 && value<=8) || value==1) {
            result.add(pair);
          }
        }
      }
    } 
    return result;
  }
  
//word转String
  public String stringToEscape(String str) throws SQLException, IOException { 
    str = str.replaceAll("&lt;", "<");
    str = str.replaceAll("&gt;", ">");
    str = str.replaceAll("&amp;", "&");
    return str; 
    }
  
  //word转String
  public String wordToString(String str) throws SQLException, IOException { 
    str = str.replaceAll("<w:r><w:rPr><w:rFonts w:ascii='Arial' w:fareast='Arial Unicode MS' w:h-ansi='Arial' w:cs='Arial'/><wx:font wx:val='Arial'/><w:sz w:val='18'/><w:b/></w:rPr><w:t>", " "); 
    str = str.replaceAll("<w:r><w:rPr><w:rFonts w:ascii='Arial' w:fareast='Arial Unicode MS' w:h-ansi='Arial' w:cs='Arial'/><wx:font wx:val='Arial'/><w:sz w:val='18'/><w:i/></w:rPr><w:t>", " "); 
    str = str.replaceAll("<w:r><w:rPr><w:rFonts w:ascii='Arial' w:fareast='Arial Unicode MS' w:h-ansi='Arial' w:cs='Arial'/><wx:font wx:val='Arial'/><w:sz w:val='18'/></w:rPr><w:t>", " "); 
    str = str.replaceAll("</w:t></w:r>", " "); 
    str = str.replaceAll("<w:br/>", " "); 
    return str; 
    }

  //clob转String
  public String ClobToString(Clob clob) throws SQLException, IOException { 
    String reString = ""; 
    Reader is = clob.getCharacterStream();// 得到流 
    BufferedReader br = new BufferedReader(is); 
    String s = br.readLine(); 
    StringBuffer sb = new StringBuffer(); 
    while (s != null) {// 执行循环将字符串全部取出付值给 StringBuffer由StringBuffer转成STRING 
    sb.append(s); 
    s = br.readLine(); 
    } 
    reString = sb.toString(); 
    return reString; 
    }

  //html转word
  public String formatWord(String str) {

    str = str.replaceAll("&lt;AC&gt;</strong>", "<strong>&lt;AC&gt;</strong>"); 
    str = str.replaceAll("<strong><strong>&lt;AC&gt;</strong>", "<strong>&lt;AC&gt;</strong>"); 
    str = str.replaceAll("&nbsp;", " "); 
    str = str.replaceAll("<<", "<");
    str = str.replaceAll("><<", "><");
    str = str.replaceAll("<p>", "");
    str = str.replaceAll("</p>", "</flag>");
    str = str.replaceAll("<td>", "");
    str = str.replaceAll("</td>", "");    
    str = str.replaceAll("<tr>", "");    
    str = str.replaceAll("</tr>", "");    
    str = str.replaceAll("<table width=\"100%\">", "");    
    str = str.replaceAll("</table>", "");    
    str = str.replaceAll("<thead>", "");     
    str = str.replaceAll("</thead>", "");     
    str = str.replaceAll("<tbody>", "");    
    str = str.replaceAll("</tbody>", "");    
    str = str.replaceAll("<table>", "");    
    str = str.replaceAll("</table>", "");    
    str = str.replaceAll("&ldquo;", "'");    
    str = str.replaceAll("&rdquo;", "'");    
    str = str.replaceAll("&eacute;", "é");  
    str = str.replaceAll("&ndash;", "-");  
    str = str.replaceAll("&mdash;", "-");  
    str = str.replaceAll("&times;", "×");  
    str = str.replaceAll("&hellip;", "...");  
    str = str.replaceAll("&lt;", "{");  
    str = str.replaceAll("&gt;", "}");  
    str = str.replaceAll("&rsquo;", "’");      
//    str = str.replaceAll("nbsp;", " ");
    str = str.replaceAll("<br/>", "</flag>");
    str = str.replaceAll("<br />", "</flag>");
    str = str.replaceAll("<", "{");
    str = str.replaceAll(">", "}");
    str = str.replaceAll("\\{flag\\}", "<flag>");
    str = str.replaceAll("\\{/flag\\}", "</flag>");
    str = str.replaceAll("\\{ul[^>]*?\\}", "<ul>");
    str = str.replaceAll("\\{/ul\\}", "</ul>");
    str = str.replaceAll("\\{ol[^>]*?\\}", "<ol>");
    str = str.replaceAll("\\{/ol\\}", "</ol>");
    str = str.replaceAll("\\{li\\}", "<li>");
    str = str.replaceAll("\\{/li\\}", "</li>");
    str = str.replaceAll("\\{w:br/\\}", "<w:br/>");
    str = str.replaceAll("\\{strong\\}", "<strong>");
    str = str.replaceAll("\\{/strong\\}", "</strong>");
    str = str.replaceAll("\\{em\\}", "<em>");
    str = str.replaceAll("\\{/em\\}", "</em>");
//    System.out.println("start: " + str);
    
    str = patternOLUL(str);

    str = str.replaceAll("<strong>", "<w:r><w:rPr><w:rFonts w:ascii='Arial' w:fareast='Arial Unicode MS' w:h-ansi='Arial' w:cs='Arial'/><wx:font wx:val='Arial'/><w:sz w:val='18'/><w:b/></w:rPr><w:t>");
    str = str.replaceAll("</strong>", "</w:t></w:r>");
    str = str.replaceAll("<em>", "<w:r><w:rPr><w:rFonts w:ascii='Arial' w:fareast='Arial Unicode MS' w:h-ansi='Arial' w:cs='Arial'/><wx:font wx:val='Arial'/><w:sz w:val='18'/><w:i/></w:rPr><w:t>");
    str = str.replaceAll("</em>", "</w:t></w:r>");

    StringBuffer sbf = new StringBuffer();
    Pattern pattern = Pattern.compile("(/[^>]+?>|^|flag2>)([^<>]+?)(<|$)",Pattern.CASE_INSENSITIVE | Pattern.DOTALL);
    Matcher matcher = pattern.matcher(str);
    while (matcher.find()) {
      String tempStr = matcher.group(1) + "<w:r><w:rPr><w:rFonts w:ascii='Arial' w:fareast='Arial Unicode MS' w:h-ansi='Arial' w:cs='Arial'/><wx:font wx:val='Arial'/><w:sz w:val='18'/></w:rPr><w:t>" + matcher.group(2) + "</w:t></w:r>" + matcher.group(3);
      matcher.appendReplacement(sbf, tempStr);
    }
    matcher.appendTail(sbf);
    str = sbf.toString();

    str = str.replaceAll("</flag>", "<w:br/>");
    str = str.replaceAll("</flag2>", "");
    str = str.replaceAll("<flag2>", "");
    str = str.replaceAll("&amp;", "&");  
    str = str.replaceAll("&", "&amp;");
    str = str.replaceAll("\\{", "&lt;");
    str = str.replaceAll("\\}", "&gt;");
//    System.out.println("end: " + str);
    return str;
  }
  
  private String patternOLUL(String str) {
    String pstr = "(?<=<(ul|ol)[^>]*?>)(<(ul|ol)[^>]*?>(<(ul|ol)[^>]*?>(?:<li>.*?</li>)*?</\\5>|(?:<li>[^<>]*?</li>)|.)*?</\\3>|(?:<li>[^<>]*?</li>)|.)*?(?=</\\1>)";
    Pattern p = Pattern.compile(pstr,Pattern.CASE_INSENSITIVE | Pattern.DOTALL);
    Matcher m1 = p.matcher(str);
    StringBuffer sbf1 = new StringBuffer();
    while (m1.find()) {
      Matcher m2 = p.matcher(m1.group());
      StringBuffer sbf2 = new StringBuffer();
      boolean f2 = false;
      while (m2.find()) {
        f2 = true;
        Matcher m3 = p.matcher(m2.group());
        StringBuffer sbf3 = new StringBuffer();
        boolean f3 = false;
        while (m3.find()) {
          f3 = true;
          m3.appendReplacement(sbf3, patternLi(m3.group(), m3.group(1), 3));
        }
        m3.appendTail(sbf3);
        if(f3){
          m2.appendReplacement(sbf2, patternLi(sbf3.toString(), m2.group(1), 2));
        }else{
          m2.appendReplacement(sbf2, patternLi(m2.group(), m2.group(1), 2));
        }
      }
      m2.appendTail(sbf2);
      if(f2){
        m1.appendReplacement(sbf1, patternLi(sbf2.toString(), m1.group(1), 1));
      }else{
        m1.appendReplacement(sbf1, patternLi(m1.group(), m1.group(1), 1));
      }
    }
    m1.appendTail(sbf1);
    String strTemp = sbf1.toString();
    strTemp = strTemp.replaceAll("<(ul|ol)[^>]*?>", "");
    strTemp = strTemp.replaceAll("</(ul|ol)>", "");
    return strTemp;
  }

  private String patternLi(String str, String flag, int i) {
    String s = "●      ";
    String[] ss = {};
    String sq[] = { "i.      ", "ii.      ", "iii.      ", "iv.      ", "v.      ", "vi.      ", "vii.      ", "viii.      ", "ix.      ", "x.      ", "xi.      ", "xii.      ", "xiii.      ", "xiv.      ", "xv.      " };
    String sq2[] = {"a).      ","b).      ","c).      ","d).      ","e).      ","f).      ","g).      ","h).      ","i).      ","j).      ","k).      ","l).      ","m).      ","o).      ","p).      "};
    String sq3[] = {"1.      ","2.      ","3.      ","4.      ","5.      ","6.      ","7.      ","8.      ","9.      ","10.      ","11.      ","12.      ","13.      ","14.      ","15.      "};
    String strTemp = "";
    switch (i) {
    case 1:
      ss = sq;
      strTemp = "      ";
      break;
    case 2:
      ss = sq2;
      strTemp = "                    ";
      break;
    case 3:
      ss = sq3;
      strTemp = "                              ";
      break;
    }

    Pattern p = Pattern.compile("(?<=<li>).*?(?=</li>)",Pattern.CASE_INSENSITIVE | Pattern.DOTALL);
    Matcher m = p.matcher(str);
    StringBuffer sbf = new StringBuffer();
    int count = 0;
    while (m.find()) {
      str = "";
      if (flag.equals("ol")) {
        count = count>14?14:count;
        str = strTemp + ss[count++];
      } else {
        str = strTemp + s;
      }
      m.appendReplacement(sbf, str + m.group());
    }
    m.appendTail(sbf);
    strTemp = sbf.toString();
    strTemp = strTemp.replaceAll("<li>", "<w:br/></flag2>");
    strTemp = strTemp.replaceAll("</li>", "<flag2>");
    return strTemp;
  }
  
  private static String patternSectionNo(String str,String sectionNo) {
    String pstr = sectionNo+"\\s*\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}";
    Pattern p = Pattern.compile(pstr,Pattern.CASE_INSENSITIVE | Pattern.DOTALL);
    Matcher m = p.matcher(str);
    StringBuffer sbf = new StringBuffer();
    while (m.find()) {
      m.appendReplacement(sbf, "<strong>"+m.group()+"</strong>");
    }
    m.appendTail(sbf);
    String strTemp = sbf.toString();
    return strTemp;
  }
  
  
  public SectionDao getSectionDao() {
  return sectionDao;
}

public void setSectionDao(SectionDao sectionDao) {
  this.sectionDao = sectionDao;
}

//将输入流写入输出流中
  private void write(InputStream in, OutputStream out) {
    byte[] bytes = new byte[64];
    int rc = 0;
    try {
      while ((rc = in.read(bytes, 0, 64)) > 0) {
        out.write(bytes, 0, rc);
      }
    } catch (IOException e) {
      e.printStackTrace();
    }
  }
  //关闭输入输出流
  private void close(InputStream in, OutputStream out) {
    IOUtils.closeQuietly(in);
    IOUtils.closeQuietly(out);
  }
  
  public ReportDao getEiosaReportDao() {
    return eiosaReportDao;
  }

  public void setEiosaReportDao(ReportDao eiosaReportDao) {
    //System.out.println("java_class_path:" + System.getProperty("java.class.path"));
    this.eiosaReportDao = eiosaReportDao;
  }
  
  public IsarpDao getIsarpDao() {
    return isarpDao;
  }

  public void setIsarpDao(IsarpDao isarpDao) {
    this.isarpDao = isarpDao;
  }
 
  public AssessmentsDao getAssessmentsDao() {
    return assessmentsDao;
  }

  public void setAssessmentsDao(AssessmentsDao assessmentsDao) {
    this.assessmentsDao = assessmentsDao;
  }
  
  public IsarpActionDao getIsarpActionDao() {
    return isarpActionDao;
  }

  public void setIsarpActionDao(IsarpActionDao isarpActionDao) {
    this.isarpActionDao = isarpActionDao;
  }

  public AttachmentDao getAttachementDao() {
    return attachementDao;
  }

  public void setAttachementDao(AttachmentDao attachementDao) {
    this.attachementDao = attachementDao;
  }

  public DocumentsDao getDocumentsDao() {
    return documentsDao;
  }

  public void setDocumentsDao(DocumentsDao documentsDao) {
    this.documentsDao = documentsDao;
  }

  public SectionDao getIosaSectionDao() {
    return iosaSectionDao;
  }

  public void setIosaSectionDao(SectionDao iosaSectionDao) {
    this.iosaSectionDao = iosaSectionDao;
  }

  public AuditorActionDao getAuditorActionDao() {
    return auditorActionDao;
  }

  public void setAuditorActionDao(AuditorActionDao auditorActionDao) {
    this.auditorActionDao = auditorActionDao;
  }
  
  
  public EiosaUserGroupDao getEiosaUserGroupDao() {
  return eiosaUserGroupDao;
}

public void setEiosaUserGroupDao(EiosaUserGroupDao eiosaUserGroupDao) {
  this.eiosaUserGroupDao = eiosaUserGroupDao;
}

public static void main(String[] args) throws Exception {
    String str = "1.1.1 CAB 1.1.1  <ol><li>aaa1;</li><li>aaa2;</li><li>aaa3;</li></ol><br/>zyzyzy<br/><ul><li>uuu1</li><li>uuu2.&nbsp;<strong>(GM)</strong>?</li></ul></td> outcomes.&nbsp;<strong>(GM)</strong>&nbsp;?</p></td><ol><li>bbb1;</li><li>bbb2;</li></ol>";
    patternSectionNo(str,"CAB");
    }
  
}
