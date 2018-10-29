package com.usky.sms.audit.sheet;

import java.awt.Color;
import java.io.PrintWriter;
import java.net.URLEncoder;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;

import com.google.gson.reflect.TypeToken;
import com.lowagie.text.BadElementException;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.Image;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.BaseFont;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.pdf.draw.LineSeparator;
import com.usky.sms.audit.check.CheckDO;
import com.usky.sms.audit.check.CheckDao;
import com.usky.sms.audit.check.CheckListDO;
import com.usky.sms.audit.improve.ImproveDO;
import com.usky.sms.audit.improve.ImproveDao;
import com.usky.sms.audit.improve.TransactorDO;
import com.usky.sms.common.NumberHelper;
import com.usky.sms.common.PageHelper;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.SMSException;
import com.usky.sms.organization.OrganizationDO;
import com.usky.sms.organization.OrganizationDao;
import com.usky.sms.unit.UnitDO;
import com.usky.sms.unit.UnitDao;
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserDao;

public class SheetService extends AbstractService {

	private static final String AUDITLOGO = "/uui/com/audit/checklist";
	
	@Autowired
	private SheetDao sheetDao;

	@Autowired
	private CheckDao checkDao;
	
	@Autowired
	private ImproveDao improveDao;
	
	@Autowired
	private UnitDao unitDao;
	
	@Autowired
	private OrganizationDao organizationDao;

	@Autowired
	private UserDao userDao;
	
	
	public void getCheckSheet(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			String rule = request.getParameter("rule");
			String sort = request.getParameter("sort");
			Map<String, Object> ruleMap = gson.fromJson(rule, new TypeToken<Map<String, Object>>() {}.getType());
			List<CheckDO> list = sheetDao.getCheckSheet(ruleMap,sort);
			List<Map<String, Object>> dataList = new ArrayList<Map<String,Object>>();
			for (CheckDO check : list) {
				dataList.add(checkDao.convert(check, Arrays.asList(new String[]{"id", "target", "checkName", "checkNo", "checkType", "startDate", "endDate", "address", "flowStatus", "flowStep", "status", "record", "result", "remark", "remark2", "lastUpdate"}), true, false));
			}
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			result.put("data",PageHelper.getPagedResult(dataList, request));
			ResponseHelper.output(response, result);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}

	public void exportTraceToPDF(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			String improveId = request.getParameter("improveId");
			if (improveId == null || "".equals(improveId)) throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "未指定实体对象或指定的实体对象无效！");
			ImproveDO improve = improveDao.internalGetById(NumberHelper.toInteger(improveId));
			Document document = new Document();
			response.setContentType("application/pdf");
			response.setHeader("content-disposition", "inline;filename=" + URLEncoder.encode("审计跟踪表.pdf", "UTF-8"));
			PdfWriter writer = PdfWriter.getInstance(document, response.getOutputStream());
			BaseFont bfChinese = BaseFont.createFont("STSongStd-Light", "UniGB-UCS2-H", BaseFont.NOT_EMBEDDED);
			document.open(); 
			//添加logo
			String inputpath = request.getSession().getServletContext().getRealPath("/");
			if (inputpath == null) inputpath = SheetService.class.getResource("/").getPath() + "/../..";
			Image logo = Image.getInstance(inputpath + AUDITLOGO + "/auditlogo-2.png");
			logo.scalePercent(40f);
			logo.setAlignment(Image.TEXTWRAP);
			logo.setAbsolutePosition(50f, 755f);
			document.add(logo);
			//添加标题
			Paragraph title1 = new Paragraph("上海吉祥航空股份有限公司", new Font(bfChinese, 16, Font.BOLD));// 宋体 三号
			title1.setAlignment(Element.ALIGN_CENTER);
			document.add(title1);
			Paragraph title2 = new Paragraph("安全审计验证记录表", new Font(bfChinese, 20, Font.BOLD));// 宋体 三号
			title2.setAlignment(Element.ALIGN_CENTER);
			document.add(title2);
			//空白
			Paragraph blank = new Paragraph(" ");// 抬头
			blank.setLeading(20f);
			document.add(blank);
			// 表头
			Map<String, Object> titleData = this.getTitleData(improve);
			Font zhengWen = new Font(bfChinese, 11f, Font.NORMAL);//宋体 5号 加粗
			PdfPTable table1 = new PdfPTable(4);//表头4列3行
			int width[] = {20,30,20,30};
			table1.setWidths(width);
			table1.setWidthPercentage(90);
			
			addCellContent(table1, "审计日期", zhengWen);
			addCellContent(table1, (String)titleData.get("date") , zhengWen);
			addCellContent(table1, "审计地点", zhengWen);
			addCellContent(table1, (String)titleData.get("address"), zhengWen);
			addCellContent(table1, "审计单位/部门", zhengWen);
			addCellContent(table1, (String)titleData.get("operator"), zhengWen);
			addCellContent(table1, "被审计单位/部门", zhengWen);
			addCellContent(table1, (String)titleData.get("target"), zhengWen);
			addCellContent(table1, "审计编号", zhengWen);
			addCallColpan3(table1, (String)titleData.get("traceNo"), zhengWen);
			document.add(table1);
			LineSeparator line1 = new LineSeparator(2f, 90f, Color.BLACK, 5, 0);
			document.add(line1);
			//问题列表
			List<Map<String, Object>> contentData = this.getContentData(improve);
			for (Map<String, Object> m : contentData) {
				PdfPTable table2 = new PdfPTable(4);
				int width2[] = {20,30,20,30};
				table2.setWidths(width2);
				table2.setWidthPercentage(90);
				addCellContent(table2, "问题描述", zhengWen);
				addCallColpan3(table2, (String)m.get("itemPoint"), zhengWen);
				addCellContent(table2, "原因分析", zhengWen);
				addCallColpan3(table2, (String)m.get("improveReason"), zhengWen);
				addCellContent(table2, "整改措施", zhengWen);
				addCallColpan3(table2, (String)m.get("improveMeasure"), zhengWen);
				addCellContent(table2, "完成情况", zhengWen);
				addCallColpan3(table2, (String)m.get("improveRemark"), zhengWen);
				addCellContent(table2, "验证情况", zhengWen);
				addCellContent(table2, " □通过     □不通过", zhengWen);
				addCellContent(table2, "验证时间", zhengWen);
				addCellContent(table2, "", zhengWen);
				addCellContent(table2, "说明", zhengWen);
				addCallColpan3(table2, "", zhengWen);
				document.add(table2);
				LineSeparator line = new LineSeparator(2f, 90f, Color.BLACK, 5, 0);
				document.add(line);
			}
			//经办人
			PdfPTable table3 = new PdfPTable(2);
			int width3[] = {30,70};
			table3.setWidths(width3);
			table3.setWidthPercentage(90);
			addCellContent(table3, "经办人/联系方式", zhengWen);
			addCellContent(table3, this.getTransactor(improve), zhengWen);
			document.add(table3);
			
			if (document.isOpen()) {
				document.close();
				writer.close();
			}
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			response.reset();
			response.setContentType("text/html");
			response.setCharacterEncoding("UTF-8");
			response.setHeader("Pragma", "no-cache");
			response.setHeader("Cache-Control", "no-cache");
			PrintWriter writer = response.getWriter();
			request.getServletPath();
			StringBuilder sb = new StringBuilder().append("<script language='javascript'>alert('下载失败！");
			sb.append("');");
			sb.append("</script>");
			writer.print(sb.toString());
			writer.flush();
			writer.close();
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	private void addCallColpan3(PdfPTable table, String str, Font font) {
		PdfPCell cell = new PdfPCell(new Paragraph(str, font));
		cell.setHorizontalAlignment(Element.ALIGN_LEFT);// 设置内容水平居中显示
		cell.setVerticalAlignment(Element.ALIGN_MIDDLE); // 设置垂直居中
		cell.setColspan(3);
		table.addCell(cell);
	}
	
	private void addCellContent(PdfPTable table, String str, Font font) throws BadElementException{
		PdfPCell cell = new PdfPCell(new Paragraph(str, font));
		cell.setHorizontalAlignment(Element.ALIGN_LEFT);// 设置内容水平居中显示
		cell.setVerticalAlignment(Element.ALIGN_MIDDLE); // 设置垂直居中
		cell.setFixedHeight(30);
		table.addCell(cell);
	}
	
	private Map<String, Object> getTitleData(ImproveDO improve) {
		Map<String, Object> map = new HashMap<String, Object>();
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
		if (improve.getStartDate() != null && improve.getEndDate() != null) {
			map.put("date", sdf.format(improve.getStartDate()) + "至" + sdf.format(improve.getEndDate()));
		}
		map.put("address", improve.getAddress());
		if (improve.getOperator() != null) {
			UnitDO unit = unitDao.internalGetById(NumberHelper.toInteger(improve.getOperator()));
			if (unit != null) {
				map.put("operator", unit.getName());
			}
		}
		if (improve.getTarget() != null) {
			UnitDO unit = unitDao.internalGetById(NumberHelper.toInteger(improve.getTarget()));
			if (unit != null) {
				map.put("target", unit.getName());
			}
		}
		map.put("traceNo", improve.getTraceNo());
		return map;
	}
	
	private List<Map<String, Object>> getContentData(ImproveDO improve) {
		Set<CheckListDO> checkLists = improve.getCheckLists();
		List<Map<String, Object>> list = new ArrayList<Map<String,Object>>();
		for (CheckListDO checklist : checkLists) {
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("itemPoint", checklist.getItemPoint());
			map.put("improveReason", checklist.getImproveReason());
			map.put("improveMeasure", checklist.getImproveMeasure());
			map.put("improveRemark", checklist.getImproveRemark());
			list.add(map);
		}
		return list;
	}
	
	private String getTransactor(ImproveDO improve) {
		String s = "";
		Set<TransactorDO> transactor = improve.getTransactor();
		if (transactor!= null&&transactor.size() > 0) {
			for (TransactorDO t : transactor) {
				UserDO u = t.getUser();
				if (u != null) {
					s += u.getFullname() + "、";
				}
			}
		}
		if (!"".equals(s)) {
			s = s.substring(0, s.length() -1).toString() + "/" + improve.getTransactorTel();
		}
		return s;
	}
	
	/**
	 * 导入检查单项
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	public void importItem(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			// 导入Excel的列(序号	 审计类别	审计项目	编号	审计要点	审计依据	审计提示	分数)
			// 数据从第二行开始读取 excel需按审计项目排序
			Integer version = NumberHelper.toInteger(request.getParameter("versionId"));
			String type = request.getParameter("type");
			sheetDao.importItem(request, version, type);
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			result.put("data","");
			ResponseHelper.output(response, result);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e){
			e.printStackTrace();
			ResponseHelper.output(response, new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "导入数据模板不正确！"));
		}
	}
	
	public void getOrganizationUseSheet(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			String type = request.getParameter("type");
			String term = request.getParameter("term");
			List<OrganizationDO> list = sheetDao.getOrganizationUseSheet(type, term);
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			result.put("data",PageHelper.getPagedResult(organizationDao.convert(list), request));
			ResponseHelper.output(response, result);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	
	public void setSheetDao(SheetDao sheetDao) {
		this.sheetDao = sheetDao;
	}

	public void setCheckDao(CheckDao checkDao) {
		this.checkDao = checkDao;
	}

	public void setImproveDao(ImproveDao improveDao) {
		this.improveDao = improveDao;
	}

	public void setUnitDao(UnitDao unitDao) {
		this.unitDao = unitDao;
	}

	public void setOrganizationDao(OrganizationDao organizationDao) {
		this.organizationDao = organizationDao;
	}

	public void setUserDao(UserDao userDao) {
		this.userDao = userDao;
	}

	
}
