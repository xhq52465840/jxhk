package com.usky.sms.file;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.text.DecimalFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.commons.lang.StringUtils;
import org.apache.poi.hssf.usermodel.HSSFDateUtil;
import org.apache.poi.hssf.util.HSSFColor;
import org.apache.poi.openxml4j.exceptions.InvalidFormatException;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.ClientAnchor;
import org.apache.poi.ss.usermodel.Drawing;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.RichTextString;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFClientAnchor;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFRichTextString;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import com.usky.sms.common.DateHelper;

public class ExcelUtil {

	public static List<String[]> getDataListFromInputStream(InputStream in) throws IOException, InvalidFormatException {
		// 打开Workbook
		Workbook wb = WorkbookFactory.create(in);

		// 获取当前sheet
		Sheet sheet = wb.getSheetAt(wb.getActiveSheetIndex());
		return getDataListFromSheet(sheet);
	}
	
	public static List<String[]> getDataListFromExcel(File file) throws FileNotFoundException, IOException, InvalidFormatException {
		return getDataListFromInputStream(new BufferedInputStream(new FileInputStream(file)));
	}

	/**
	 * 
	 * 读取Excel的worksheet的内容，返回行数据的list（行以数组形式存储）
	 * 
	 * @param sheet
	 *            读取数据的源sheet
	 * 
	 * @return 返回行数据的list（行以数组形式存储）
	 */
	public static List<String[]> getDataListFromSheet(Sheet sheet) {

		List<String[]> result = new ArrayList<String[]>();
		Cell cell;
		int columnNum = 0;
		// 从第一行开始读取所有行，index从0开始
		for (int rowIndex = 0; rowIndex <= sheet.getLastRowNum(); rowIndex++) {
			Row row = sheet.getRow(rowIndex);

			if (row != null) {
				if(rowIndex == 0){
					// 表头的列数(从1开始)
					columnNum = row.getLastCellNum();
				}
	
				String[] values = new String[columnNum];
	
				// 读取一行中的每列
				for (int columnIndex = 0; columnIndex < columnNum; columnIndex++) {
					cell = row.getCell(columnIndex);
					if (null == cell) {
						values[columnIndex] = "";
					} else {
						values[columnIndex] = getCellValue(cell);
					}
				}
	
				result.add(values);
			}
		}
		return result;
	}
	
	/**
	 * 获取单元格的值
	 * @param cell
	 * @return 获取单元格值的字符串
	 */
	private static String getCellValue(Cell cell) {
		String value = null;
		switch (cell.getCellType()) {
		case Cell.CELL_TYPE_STRING:
			value = cell.getStringCellValue();
			break;
		case Cell.CELL_TYPE_NUMERIC:
			if (HSSFDateUtil.isCellDateFormatted(cell)) {
				Date date = cell.getDateCellValue();
				if (date != null) {
					value = DateHelper.formatIsoSecond(date);
				} else {
					value = "";
				}
			} else {
				value = new DecimalFormat("0").format(cell.getNumericCellValue());
			}
			break;
		case Cell.CELL_TYPE_FORMULA:
			// 导入时如果为公式生成的数据则无值
			if (!cell.getStringCellValue().equals("")) {
				value = cell.getStringCellValue();
			} else {
				value = cell.getNumericCellValue() + "";
			}
			break;
		case Cell.CELL_TYPE_BLANK:
			value = "";
			break;
		case Cell.CELL_TYPE_ERROR:
			value = "";
			break;
		case Cell.CELL_TYPE_BOOLEAN:
			value = (cell.getBooleanCellValue() == true ? "Y" : "N");
			break;
		default:
			value = "";
		}
		return value;
	}
	
	public static void exportExcel(Collection<Object[]> dataset, OutputStream out) {
		exportExcel(null, null, dataset, out, "yyyy-MM-dd");
	}

	public static void exportExcel(List<String> headers, Collection<Object[]> dataset,
			OutputStream out) {
		exportExcel(null, headers, dataset, out, "yyyy-MM-dd");
	}

	public static void exportExcel(List<String> headers, Collection<Object[]> dataset,
			OutputStream out, String pattern) {
		exportExcel(null, headers, dataset, out, pattern);
	}

	/**
	 * 
	 * @param sheetName
	 *            sheet的名称
	 * @param headers
	 *            表格属性列名列表
	 * @param dataset
	 *            需要显示的数据集合,一条集合记录对应一行数据
	 *            数据类型有基本数据类型及String,Date,byte[](图片数据)
	 * @param out
	 *            与输出设备关联的流对象，可以将EXCEL文档导出到本地文件或者网络中
	 * @param pattern
	 *            如果有时间数据，设定输出格式。默认为"yyy-MM-dd"
	 */
	@SuppressWarnings("unchecked")
	public static void exportExcel(String sheetName, List<String> headers, Collection<Object[]> dataset, OutputStream out, String pattern) {
		// 声明一个工作薄
		Workbook workbook = new XSSFWorkbook();
		// 生成一个表格
		Sheet sheet = null;
		if (null == sheetName) {
			sheet = workbook.createSheet();
		} else {
			sheet = workbook.createSheet(sheetName);
		}
		// 设置表格默认列宽度为15个字节
		sheet.setDefaultColumnWidth(15);
		// 生成一个样式
		CellStyle style = workbook.createCellStyle();
		// 设置这些样式
		style.setFillForegroundColor(HSSFColor.SKY_BLUE.index);
		style.setFillPattern(XSSFCellStyle.SOLID_FOREGROUND);
		style.setBorderBottom(XSSFCellStyle.BORDER_THIN);
		style.setBorderLeft(XSSFCellStyle.BORDER_THIN);
		style.setBorderRight(XSSFCellStyle.BORDER_THIN);
		style.setBorderTop(XSSFCellStyle.BORDER_THIN);
		style.setAlignment(XSSFCellStyle.ALIGN_CENTER);
		// 生成一个字体
		Font font = workbook.createFont();
		font.setColor(HSSFColor.VIOLET.index);
		font.setFontHeightInPoints((short) 12);
		font.setBoldweight(XSSFFont.BOLDWEIGHT_BOLD);
		// 把字体应用到当前的样式
		style.setFont(font);
		// 生成并设置另一个样式
		CellStyle style2 = workbook.createCellStyle();
		style2.setFillForegroundColor(HSSFColor.LIGHT_YELLOW.index);
		style2.setFillPattern(XSSFCellStyle.SOLID_FOREGROUND);
		style2.setBorderBottom(XSSFCellStyle.BORDER_THIN);
		style2.setBorderLeft(XSSFCellStyle.BORDER_THIN);
		style2.setBorderRight(XSSFCellStyle.BORDER_THIN);
		style2.setBorderTop(XSSFCellStyle.BORDER_THIN);
		style2.setAlignment(XSSFCellStyle.ALIGN_CENTER);
		style2.setVerticalAlignment(XSSFCellStyle.VERTICAL_CENTER);
		// 生成另一个字体
		Font font2 = workbook.createFont();
		font2.setBoldweight(XSSFFont.BOLDWEIGHT_NORMAL);
		// 把字体应用到当前的样式
		style2.setFont(font2);
		// 声明一个画图的顶级管理器
		Drawing patriarch = sheet.createDrawingPatriarch();
		int rowNum = 0;
		Row row = null;
		if (null != headers) {
			// 产生表格标题行
			row = sheet.createRow(rowNum++);
			for (short i = 0; i < headers.size(); i++) {
				Cell cell = row.createCell(i);
				cell.setCellStyle(style);
				XSSFRichTextString text = new XSSFRichTextString(headers.get(i));
				cell.setCellValue(text);
			}
		}
		// 遍历集合数据，产生数据行
		int index = 0;
		for(Object[] rowdata : dataset) {
			index++;
			row = sheet.createRow(rowNum++);
			for (int i =0; i < rowdata.length; i++) {
				Object celldata = rowdata[i];
				Cell cell = row.createCell(i);
				cell.setCellStyle(style2);
				try {
					// 判断值的类型后进行强制类型转换
					String textValue = null;
					if (celldata instanceof Date) {
						Date date = (Date) celldata;
						SimpleDateFormat sdf = new SimpleDateFormat(pattern);
						textValue = sdf.format(date);
					} else if (celldata instanceof byte[]) {
						// 有图片时，设置行高为60px;
						row.setHeightInPoints(60);
						// 设置图片所在列宽度为80px,注意这里单位的一个换算
						sheet.setColumnWidth(i, (short) (35.7 * 80));
						// sheet.autoSizeColumn(i);
						byte[] bsValue = (byte[]) celldata;
						ClientAnchor anchor = new XSSFClientAnchor(0, 0, 1023, 255, (short) 6, index, (short) 6, index);
						anchor.setAnchorType(2);
						patriarch.createPicture(anchor, workbook.addPicture(bsValue, XSSFWorkbook.PICTURE_TYPE_JPEG));
					} else if (celldata instanceof String[]) {
						// 如果是字符串的数组,用逗号连接起来
						textValue = StringUtils.join((Object[]) celldata, ",");
					} else if (celldata instanceof Collection) {
						// 如果是集合类型,用逗号连接起来
						textValue = StringUtils.join(((Collection<Object>) celldata).toArray(), ",");
					} else if (celldata instanceof Boolean) {
						textValue = (Boolean) celldata ? "是" : "否";
					}else {
						// 其它数据类型都当作字符串简单处理
						textValue = celldata == null ? "" : celldata.toString();
					}
					// 如果不是图片数据，就利用正则表达式判断textValue是否全部由数字组成
					if (textValue != null) {
						Pattern p = Pattern.compile("^//d+(//.//d+)?$");
						Matcher matcher = p.matcher(textValue);
						if (matcher.matches()) {
							// 是数字当作double处理
							cell.setCellValue(Double.parseDouble(textValue));
						} else {
							RichTextString richString = new XSSFRichTextString(textValue);
							Font font3 = workbook.createFont();
							font3.setColor(HSSFColor.BLUE.index);
							richString.applyFont(font3);
							cell.setCellValue(richString);
						}
					}
				} catch (SecurityException e) {
					e.printStackTrace();
				} catch (IllegalArgumentException e) {
					e.printStackTrace();
				} finally {
					// 清理资源
				}
			}
		}
		try {
			workbook.write(out);
		} catch (IOException e) {
			e.printStackTrace();
		}finally{
			try {
				workbook.close();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
	}
	 
}
