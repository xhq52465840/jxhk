package com.usky.sms.audit.check;

import java.awt.Color;
import java.io.IOException;
import java.net.URLEncoder;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;

import com.google.gson.reflect.TypeToken;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.Image;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.BaseFont;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.pdf.draw.LineSeparator;
import com.usky.sms.audit.EnumAuditRole;
import com.usky.sms.audit.base.EnumItemType;
import com.usky.sms.audit.base.ItemDO;
import com.usky.sms.audit.base.ItemDao;
import com.usky.sms.audit.plan.EnumCheckGrade;
import com.usky.sms.audit.plan.EnumPlanType;
import com.usky.sms.audit.sheet.SheetService;
import com.usky.sms.audit.task.TaskDO;
import com.usky.sms.common.NumberHelper;
import com.usky.sms.common.PageHelper;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.SMSException;
import com.usky.sms.dictionary.DictionaryDO;
import com.usky.sms.dictionary.DictionaryDao;
import com.usky.sms.unit.UnitDao;
import com.usky.sms.unit.UnitRoleActorDao;
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserDao;
import com.usky.sms.user.UserGroupDao;



public class CheckService extends AbstractService {
	
	@Autowired
	private CheckListDao checkListDao;
	
	@Autowired
	private CheckDao checkDao;
	
	@Autowired
	private UnitDao unitDao;
	
	@Autowired
	private ItemDao itemDao;
	
	@Autowired
	private DictionaryDao dictionaryDao;
	
	@Autowired
	private UserGroupDao userGroupDao;
	
	@Autowired
	private UnitRoleActorDao unitRoleActorDao;
	
	@Autowired
	private UserDao userDao;
	
	private static final String AUDITLOGO = "/uui/com/audit/checklist";

	public void updateCheckList(HttpServletRequest request, HttpServletResponse response) {
		try {
			String obj = request.getParameter("obj");
			String checkId = request.getParameter("checkId");
			List<Map<String, Object>> dataMap = gson.fromJson(obj, new TypeToken<List<Map<String, Object>>>() {}.getType());
			List<CheckListDO> list = checkListDao.updateCheckList(dataMap,NumberHelper.toInteger(checkId));
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", PageHelper.getPagedResult(checkListDao.convert(list), request));
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void saveCheckList(HttpServletRequest request, HttpServletResponse response) {
		try {
			String obj = request.getParameter("obj");
			Map<String, Object> dataMap = gson.fromJson(obj, new TypeToken<Map<String, Object>>() {}.getType());
			checkListDao.saveCheckList(dataMap);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getResponsibilityUnits(HttpServletRequest request, HttpServletResponse response) {
		try {
			String checkId = request.getParameter("checkId");
			String unit = request.getParameter("unitId");
			Integer unitId = null;
			if (unit != null) {
				unitId = NumberHelper.toInteger(unit);
			}
			String term = request.getParameter("term");
			List<Map<String, Object>> list = checkListDao.getResponsibilityUnits(unitId, term, checkId);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", PageHelper.getPagedResult(list, request));
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	// 对齐方式
	enum Alignment {
		left, right, up, down, middle, none
	}

	
	BaseFont bfChinese = null;
	{
		try {
			bfChinese = BaseFont.createFont("STSongStd-Light", "UniGB-UCS2-H",
					BaseFont.NOT_EMBEDDED);
		} catch (DocumentException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	Font headerFont = new Font(bfChinese, 14, Font.NORMAL, Color.black); // 四号 正常
	Font prefessonFont = new Font(bfChinese, 18, Font.BOLD, Color.black); //小二 黑体
	Font titleChinese = new Font(bfChinese, 24, Font.BOLD, Color.red); // 模板抬头的字体
	Font itemHeaderFont = new Font(bfChinese, 12, Font.BOLD, Color.black);// 小四 黑体
	Font songTiXiaoSi = new Font(bfChinese, 12, Font.NORMAL, Color.black);// 小四  正常
	Font pinkFont = new Font(bfChinese, 14, Font.BOLD, Color.pink);
	Font littleChinese = new Font(bfChinese, 12, Font.COURIER, Color.black);
	Font sanHaoBlack = new Font(bfChinese, 16, Font.BOLD, Color.black);// 三号 黑体
	Color backColor = new Color(230, 230, 230);

	// 表格的大标题
	public void addTitleTable(Document doc, String title)
			throws DocumentException {
		PdfPTable table = new PdfPTable(1);
		table.setSpacingBefore(20f);
		table.setWidthPercentage(100);
		PdfPCell cell = null;
		cell = new PdfPCell(new Paragraph(title, sanHaoBlack));// 描述
		cell.setFixedHeight(30);
		cell.setHorizontalAlignment(Element.ALIGN_CENTER);// 设置内容水平居中显示
		cell.setVerticalAlignment(Element.ALIGN_MIDDLE); // 设置垂直居中
		cell.setBackgroundColor(backColor);
		table.addCell(cell);
		doc.add(table);

	}

	public void addItemTable(Document doc, String header, Font headerFont, String[] content, Font contentFont, boolean haveSplitLine,
			float[] scale, Alignment value, float spaceBefore, float spaceAfter, float rowHeight) throws DocumentException
	{
		PdfPTable table = new PdfPTable(scale.length);
		table.setWidths(scale);
		table.setSplitRows(false);
		table.setWidthPercentage(100);// 设置表格宽度为%100
		table.setSpacingBefore(spaceBefore);
		table.setSpacingAfter(spaceAfter);
		PdfPCell cell = new PdfPCell(new Paragraph(header, headerFont));
		cell.setColspan(scale.length);
		cell.setBackgroundColor(backColor);
		table.addCell(cell);
		for (int i = 0; i < content.length; i++) {
			if (!haveSplitLine) {
				if (i==3) {
					cell = new PdfPCell(new Paragraph(content[i], contentFont));
					table.addCell(cell);
				} 
				else if(i==2)
				{
					cell = new PdfPCell(new Paragraph(content[i], contentFont));
					cell.setBorderWidthBottom(0f);
					cell.setBorderWidthTop(0f);
					cell.setFixedHeight(50);
					table.addCell(cell);
				}
				else
				{
					cell = new PdfPCell(new Paragraph(content[i], contentFont));
					cell.setBorderWidthBottom(0f);
					cell.setBorderWidthTop(0f);
					table.addCell(cell);
				}
			} 
		}
		doc.add(table);
	}

	// 增加表格行数据
	public void addRowTable(Document doc, String header, Font headerFont,
			String[] content, Font contentFont, boolean haveSplitLine,
			float[] scale, Alignment value, float spaceBefore,
			float spaceAfter, float rowHeight) throws DocumentException {
		PdfPTable table = new PdfPTable(scale.length);
		table.setWidths(scale);
		table.setSplitRows(false);
		table.setWidthPercentage(100);// 设置表格宽度为%100
		table.setSpacingBefore(spaceBefore);
		table.setSpacingAfter(spaceAfter);
		PdfPCell cell=null;
		if(header!=null)
		{
		cell = new PdfPCell(new Paragraph(header, headerFont));
		cell.setColspan(scale.length);
		cell.setBackgroundColor(backColor);
		table.addCell(cell);
		}
		for (int i = 0; i < content.length; i++) {
			if (!haveSplitLine) {
				if (i == 0) {
					cell = new PdfPCell(new Paragraph(content[i], contentFont));
					table.addCell(cell);
				} else if (i == content.length - 1) {
					cell = new PdfPCell(new Paragraph(content[i], contentFont));
					cell.setBorderWidthTop(0f);
					table.addCell(cell);

				} else {
					cell = new PdfPCell(new Paragraph(content[i], contentFont));
					cell.setBorderWidthBottom(0f);
					cell.setBorderWidthTop(0f);
					table.addCell(cell);
				}
			} else {
				cell = new PdfPCell(new Paragraph(content[i], contentFont));
				if (rowHeight != 0) {
					cell.setFixedHeight(rowHeight);
				}
				if (value == Alignment.left) {
					cell.setHorizontalAlignment(Element.ALIGN_LEFT);// 设置内容水平居中显示
					cell.setVerticalAlignment(Element.ALIGN_MIDDLE); // 设置垂直居中
				} else if (value == Alignment.middle) {
					cell.setHorizontalAlignment(Element.ALIGN_CENTER);// 设置内容水平居中显示
					cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
				}
				table.addCell(cell);
			}
		}
		doc.add(table);
	}
	
	
	public void addResultRow(Document doc, String[] content, Font contentFont) throws DocumentException
	{
		PdfPTable table = new PdfPTable(1);
		table.setSpacingBefore(10);
		table.setWidthPercentage(100);
		table.setSplitRows(false);
		PdfPCell cell=null;
		for (int i = 0; i < content.length; i++) {
			if(i==0)
			{
				cell = new PdfPCell(new Paragraph(content[i], itemHeaderFont));
				cell.setFixedHeight(300);
				cell.setHorizontalAlignment(Element.ALIGN_LEFT);// 设置内容水平居中显示
				//cell.setVerticalAlignment(Element.ALIGN_MIDDLE); // 设置垂直居中
				cell.setBorderWidthBottom(0f);
				table.addCell(cell);
			}
			else if(i==1||i==2)
			{
				cell = new PdfPCell(new Paragraph(content[i], contentFont));
				cell.setFixedHeight(30);
				cell.setHorizontalAlignment(Element.ALIGN_RIGHT);// 设置内容水平居中显示
				cell.setVerticalAlignment(Element.ALIGN_MIDDLE); // 设置垂直居中
				cell.setBorderWidthBottom(0f);
				cell.setBorderWidthTop(0f);
				table.addCell(cell);
			}
			else if(i==3 || i==4)
			{
				cell = new PdfPCell(new Paragraph(content[i], contentFont));
				cell.setFixedHeight(30);
				cell.setHorizontalAlignment(Element.ALIGN_RIGHT);// 设置内容水平居中显示
				cell.setVerticalAlignment(Element.ALIGN_MIDDLE); // 设置垂直居中
				cell.setBorderWidthBottom(0f);
				cell.setBorderWidthTop(0f);
				table.addCell(cell);
			}
			else if(i==5)
			{
				cell = new PdfPCell(new Paragraph(content[i], contentFont));
				cell.setFixedHeight(100);
				cell.setHorizontalAlignment(Element.ALIGN_RIGHT);// 设置内容水平居中显示
				cell.setVerticalAlignment(Element.ALIGN_TOP); // 设置垂直居中
				cell.setBorderWidthTop(0f);
				table.addCell(cell);
			}
		}
		doc.add(table);
	}
	

	// 增加一个段落
	public void addParagraph(Document doc, String line)
			throws DocumentException {
		doc.add(new Paragraph(line, headerFont));
	}

	public void addNewPage(Document document) throws DocumentException {
		document.newPage();
		//Paragraph blank = new Paragraph(" ");// 抬头
		//blank.setLeading(10f);
		//document.add(blank);
	}
	
	public void exportCheckToWord(HttpServletRequest request, HttpServletResponse response) {
	try{
		String checkId = request.getParameter("checkId");
		if (checkId == null || "".equals(checkId))
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "未指定实体对象或指定的实体对象无效！");
		CheckDO check = checkDao.internalGetById(NumberHelper
				.toInteger(checkId));
		TaskDO task = check.getTask();
		String professionName = check.getCheckType().getName();
		String profession = professionName.replaceAll("[\u4e00-\u9fa5]", "")
				.trim();
		Document document = new Document();
//		Document document = new Document(PageSize.A4, 80, 79, 0, 45);
		response.setContentType("application/pdf");
		response.setHeader("content-disposition", "inline;filename=" + URLEncoder.encode(professionName + "检查单.pdf", "UTF-8"));
		PdfWriter writer = PdfWriter.getInstance(document, response.getOutputStream());
		document.open(); 
		String inputpath = request.getSession().getServletContext().getRealPath("/");
		if (inputpath == null) inputpath = SheetService.class.getResource("/").getPath() + "/../..";
		Image logo = Image.getInstance(inputpath + AUDITLOGO + "/auditlogo-2.png");
		logo.scalePercent(100f);
		logo.setAlignment(Image.TEXTWRAP);
		logo.setAbsolutePosition(50f, 775f);
		document.add(logo);
		// ------------开始写数据-------------------
		Paragraph title = new Paragraph("上海吉祥航空股份有限公司", titleChinese);// 抬头
		title.setAlignment(Element.ALIGN_CENTER); // 居中设置
		title.setLeading(20f);
		document.add(title);
		String str1 = "安全审计/评估检查工作单";
		if (task != null) {
			if (EnumPlanType.SPEC.toString().equals(task.getPlanType())) {
				str1 = "专项检查单";
			} else if (EnumPlanType.SPOT.toString().equals(task.getPlanType())) {
				str1 = "现场检查单";
			}
		}
		title = new Paragraph(str1, pinkFont);
		title.setAlignment(Element.ALIGN_CENTER); // 居中设置
		title.setSpacingBefore(0f);// 设置上面空白宽度
		title.setSpacingAfter(10f);
		document.add(title);
		LineSeparator line = new LineSeparator(1.0f, 100.0f, Color.black, 20,
				2.0f);
		document.add(line);
		title = new Paragraph(professionName + " " +str1, prefessonFont);
		title.setLeading(20f);
		title.setAlignment(Element.ALIGN_CENTER);
		document.add(title);
		PdfPTable table = new PdfPTable(1);
		table.setSpacingBefore(20f);// 设置表格上面空白宽度
		table.setTotalWidth(700);// 设置表格的宽度
		table.setWidthPercentage(100);// 设置表格宽度为%100
		PdfPCell cell = null;
		cell = new PdfPCell(new Paragraph(profession + "I    目 录",
				sanHaoBlack));
		cell.setFixedHeight(30);
		cell.setHorizontalAlignment(Element.ALIGN_CENTER);// 设置内容水平居中显示
		cell.setVerticalAlignment(Element.ALIGN_MIDDLE); // 设置垂直居中
		cell.setBackgroundColor(backColor);
		table.addCell(cell);
		document.add(table);
		ArrayList<String> list = new ArrayList<String>();
		list.add("  审计项目                                           标题");
		list.add("  " + profession + "I    目录");
		if (task != null) {
			if (EnumPlanType.SPEC.toString().equals(task.getPlanType()) || EnumPlanType.SPOT.toString().equals(task.getPlanType())) {
				list.add("  " + profession + "II   检查情况记录");
			} else {
				list.add("  " + profession + "II   审计情况记录");
				list.add("  " + profession + "III  被审计单位/部门谈话人员情况记录");
				list.add("  " + profession + "IV   被审计单位基本情况和反馈情况记录");
			}
		} 
		List<CheckListDO> checklists = checkListDao.getByCheck(check.getId());
		List<ItemDO> items = new ArrayList<ItemDO>();
		List<ItemDO> sysItems = new LinkedList<ItemDO>();
		List<ItemDO> tempItems = new LinkedList<ItemDO>();
		List<ItemDO> addItems = new LinkedList<ItemDO>();
		Map<ItemDO, String> catagray = new LinkedHashMap<ItemDO, String>();
		for (CheckListDO one : checklists) {
			if (one != null) {
				ItemDO i = one.getItem();
				if (i != null) {
					items.add(i);
					if (EnumItemType.SYS_STD.toString().equals(i.getType()) || EnumItemType.SPOT_STD.toString().equals(i.getType()) || EnumItemType.SPEC_STD.toString().equals(i.getType()) || EnumItemType.TERM_STD.toString().equals(i.getType())) {
						sysItems.add(i);
					} else if (EnumItemType.TEMP.toString().equals(i.getType())) {
						tempItems.add(i);
					} else if (EnumItemType.SYS_ADD.toString().equals(i.getType()) || EnumItemType.SPOT_ADD.toString().equals(i.getType()) || EnumItemType.SPEC_ADD.toString().equals(i.getType()) || EnumItemType.TERM_ADD.toString().equals(i.getType()) || EnumItemType.SUB_ADD.toString().equals(i.getType())) {
						addItems.add(i);
					}
				}
			}
		}

		for (ItemDO item : sysItems) {
			if (item.getParent() != null && item.getParent().getParent() != null) {
				String point = item.getParent().getPoint();
				if (!list.contains("  " + point)) {
					list.add("  " + point);
					catagray.put(item.getParent(), "sys");
				}

			}
		}

		for (ItemDO item : tempItems) {
			ItemDO i = item.getParent();
			if (i != null) {
				String point = i.getPoint();
				if (!list.contains("  " + point)) {
					list.add("  " + point);
					catagray.put(item.getParent(), "temp");
				}

			}
		}

		for (ItemDO item : addItems) {
			ItemDO i = item.getParent();
			if (i != null) {
				String point = i.getPoint();
				if (!list.contains("  " + point)) {
					list.add("  " + point);
					catagray.put(item.getParent(), "add");
				}

			}
		}
		if (task != null) {
			if (EnumPlanType.SPEC.toString().equals(task.getPlanType()) || EnumPlanType.SPOT.toString().equals(task.getPlanType())) {
				list.add("  " + profession + "III  检查小结");
			} else {
				list.add("  " + profession + "V    审计小结");
			}
		} 
		String[] content = list.toArray(new String[list.size()]);
		addRowTable(document, "   ●  目录", headerFont, content, headerFont,
				false, new float[] { 1f }, Alignment.left, 10f, 0f, 0f);
		addNewPage(document);//新建页面且设置上边距
		addTitleTable(document, profession + " II  审计检查情况记录");
		content = new String[] { "1.审计日期:", new SimpleDateFormat("yyyy-MM-dd").format(check.getStartDate()) + "至 " + new SimpleDateFormat("yyyy-MM-dd").format(check.getEndDate()), "2.被审计单位：",
				(String) checkDao.getObjByCheck(check), "3.审计地点:" , check.getAddress(), "4.其它:", " " };
		addRowTable(document, "   ●  情况记录", headerFont, content, littleChinese,
				true, new float[] { 0.3f, 0.7f }, Alignment.left, 10f, 0f, 0f);
		
		// 现场检查和专项检查不需要这一块
		if (task != null && !EnumPlanType.SPEC.toString().equals(task.getPlanType()) && !EnumPlanType.SPOT.toString().equals(task.getPlanType())) {
			addTitleTable(document, profession + " III    被审计检查单位谈话人员情况记录");
			content = new String[] { "日期", "单位/部门", "姓名", "职别", " ", " ", " ", " ",
					" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ",
					" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", };
			addRowTable(document, "   ●    谈话人员情况记录", headerFont, content,
					littleChinese, true, new float[] { 0.2f, 0.4f, 0.2f, 0.2f },
					Alignment.middle, 10f, 0f, 0f);
			addNewPage(document);//新建页面且设置上边距
			addTitleTable(document, profession + " IV    被审计单位基本情况和反馈情况记录");
			content = new String[] { "主管领导", " ", "运行质量主管领导", " ", "运行质量管理人员", " ",
					"运行类手册管理员", " ", "其他人员", " ", " ", " "
					
			};
			addRowTable(document, "   ●    运行管理人员数量", headerFont, content,
					littleChinese, true, new float[] { 0.3f, 0.7f },
					Alignment.left, 0f, 0f, 0f);
			content = new String[] { "部门名称", "主要职责", " ", " ", " ", " ", " ", " ",
					" ", " ", };
			addRowTable(document, "   ●    组织机构设置", headerFont, content,
					littleChinese, true, new float[] { 0.3f, 0.7f },
					Alignment.middle, 0f, 0f, 0f);
			content = new String[] { "手册名称", "主要职责", "配发地点", "1 ", " ", " ", "2 ",
					" ", " ", "3 ", " ", " ", "4 ", " ", " ", "5 ", " ", " ", "6 ",
					" ", " ", "7 ", " ", " ", "8 ", " ", " ", "9 ", " ", " ",
					"10 ", " ", " ", };
			addRowTable(document, "   ●    运行类手册配发种类、数量和手册配发地点", headerFont,
					content, littleChinese, true, new float[] { 0.3f, 0.4f, 0.3f },
					Alignment.left, 0f, 0f, 0f);
			content = new String[] { "", };
			addRowTable(document, "   ●    被审计检查单位/部门的反馈信息、意见或建议记录:", headerFont,
					content, littleChinese, true, new float[] { 1f },
					Alignment.middle, 0f, 0f, 150f);
		}
		
		addParagraph(document, "备注:");
		String remark = check.getRemark();
		addParagraph(document, remark);
		addNewPage(document);//新建页面且设置上边距
		Iterator<Map.Entry<ItemDO,String>> iter = catagray.entrySet().iterator();
		List<String> data=new LinkedList<String>();
		while (iter.hasNext()) {
			Map.Entry<ItemDO,String> entry = (Map.Entry<ItemDO,String>) iter.next();
			String key = entry.getKey().getPoint();
			Integer itemId = entry.getKey().getId();
			addTitleTable(document, key);
			String value = entry.getValue();
			switch(value)
			{
			   case "add":
				  for(ItemDO i:addItems) {
					  if (i.getParent().getId().equals(itemId)) {
					  data.add(" ●  审计依据:"+i.getAccording().replaceAll("\n", "").replaceAll(" ", ""));
					  data.add(" ●  审计提示:\n"+i.getPrompt());
					  data.add(" ●  审计记录:");
					  data.add("审计结论:□符合(文文相符,文实相符)□不符合(□无文无实□有文无实□无文有实)"+'\n'+
					  "                    □建议                                            □不适用");
					  addItemTable(document, i.getPoint().replaceAll("\n", "").replaceAll(" ", ""), itemHeaderFont, data.toArray(new String[data.size()] ), songTiXiaoSi,
								false, new float[] { 1f }, Alignment.left, 10f, 0f, 0f);
					  data.clear();
					  }
				  }
				  addNewPage(document);//新建页面且设置上边距
				  break;
			   case "sys":
				   for(ItemDO i:sysItems)
					  {
					   if (i.getParent().getId().equals(itemId)) {
						  String according = i.getAccording() == null ? "" : i.getAccording().replaceAll("\n", "").replaceAll(" ", "");
						  String prompt = i.getPrompt() == null ? "" : i.getPrompt();
						  data.add(" ●  审计依据:"+ according);
						  data.add(" ●  审计提示:\n"+prompt);
						  data.add(" ●  审计记录:");
						  data.add("审计结论:□符合(文文相符,文实相符)□不符合(□无文无实□有文无实□无文有实)"+'\n'+
								  "                    □建议                                            □不适用");
						  addItemTable(document, i.getPoint().replaceAll("\n", "").replaceAll(" ", ""), itemHeaderFont, data.toArray(new String[data.size()] ), songTiXiaoSi,
									false, new float[] { 1f }, Alignment.left, 10f, 0f, 0f);
						  data.clear();
					   }
					  }
				   addNewPage(document);//新建页面且设置上边距
				   break;
			   case "temp":
				   for(ItemDO i:tempItems)
					  {
					   if (i.getParent().getId().equals(itemId)) {
						  data.add(" ●  审计依据:"+i.getAccording().replaceAll("\n", "").replaceAll(" ", ""));
						  data.add(" ●  审计提示:\n"+i.getPrompt());
						  data.add(" ●  审计记录:");
						  data.add("审计结论:□符合(文文相符,文实相符)□不符合(□无文无实□有文无实□无文有实)"+'\n'+
								  "                    □建议                                            □不适用");
						  addItemTable(document, i.getPoint().replaceAll("\n", "").replaceAll(" ", ""), itemHeaderFont, data.toArray(new String[data.size()] ), songTiXiaoSi,
									false, new float[] { 1f }, Alignment.left, 10f, 0f, 0f);
						 data.clear();
					  }
					  }
				   addNewPage(document);//新建页面且设置上边距
				 break;
			
			}
			
		}
		if (task != null) {
			if (EnumPlanType.SPEC.toString().equals(task.getPlanType()) || EnumPlanType.SPOT.toString().equals(task.getPlanType())) {
				addTitleTable(document, profession + " V    检查小结");
				content=new String[]{ "1. 检查小结","审计员:＿＿＿＿＿＿＿＿","日     期:＿＿＿＿＿＿＿＿","领导签字:＿＿＿＿＿＿＿＿","复核人:＿＿＿＿＿＿＿＿","日     期:＿＿＿＿＿＿＿＿" };
			} else {
				addTitleTable(document, profession + " V    审计小结");
				content=new String[]{ "1. 审计小结","审计员:＿＿＿＿＿＿＿＿","日     期:＿＿＿＿＿＿＿＿","领导签字:＿＿＿＿＿＿＿＿","复核人:＿＿＿＿＿＿＿＿","日     期:＿＿＿＿＿＿＿＿" };
			}
		} 
        addResultRow(document, content, littleChinese);
//        response.setContentType("application/pdf");
//		response.setHeader("content-disposition", "attachment;filename=" + new String((professionName + "检查单.pdf").getBytes("UTF-8"), "ISO-8859-1"));
		if (document.isOpen()) {
			document.close();
			writer.close();
		}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	/**
	 * 获取检查组员
	 * @param request
	 * @param response
	 */
	public void getCheckMembers(HttpServletRequest request, HttpServletResponse response) {
		try {
//			String planType = request.getParameter("planType");
			String checkType = request.getParameter("checkType");
			String userName = request.getParameter("userName");
			List<UserDO> users = new ArrayList<UserDO>();
			// 公司级 一级检查员 
			if (EnumCheckGrade.SYS.toString().equals(checkType)) {
				DictionaryDO dic = dictionaryDao.getByTypeAndKey("审计角色", EnumAuditRole.FIRST_GRADE_CHECKER.getKey());
				if (null != dic) {
					users = userGroupDao.getUserIdNameByGroupName(dic.getName(), userName);
				}
			} else if (EnumCheckGrade.SUB2.toString().equals(checkType)) { //分子公司级 二级检查员
				Integer unitId = request.getParameter("unitId") == null ? null : Integer.parseInt(request.getParameter("unitId"));
				DictionaryDO dic = dictionaryDao.getByTypeAndKey("审计角色", EnumAuditRole.FIRST_GRADE_CHECKER.getKey());
				if (null != dic && null != unitId) {
					users = unitRoleActorDao.getUsersByUnitIdAndRoleName(unitId, dic.getName(), userName);
				}
			}
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", PageHelper.getPagedResult(userDao.convert(users, Arrays.asList(new String[]{"id", "username", "fullname", "avatar"}), false), request));
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void setCheckListDao(CheckListDao checkListDao) {
		this.checkListDao = checkListDao;
	}

	public void setCheckDao(CheckDao checkDao) {
		this.checkDao = checkDao;
	}


	public void setUnitDao(UnitDao unitDao) {
		this.unitDao = unitDao;
	}


	public void setItemDao(ItemDao itemDao) {
		this.itemDao = itemDao;
	}


	public void setDictionaryDao(DictionaryDao dictionaryDao) {
		this.dictionaryDao = dictionaryDao;
	}


	public void setUserGroupDao(UserGroupDao userGroupDao) {
		this.userGroupDao = userGroupDao;
	}


	public void setUnitRoleActorDao(UnitRoleActorDao unitRoleActorDao) {
		this.unitRoleActorDao = unitRoleActorDao;
	}


	public void setUserDao(UserDao userDao) {
		this.userDao = userDao;
	}
	
	

}
