package com.test;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.filefilter.SuffixFileFilter;
import org.apache.commons.io.filefilter.TrueFileFilter;
import org.apache.commons.lang.StringUtils;

public class AddCommentAnotation {
	
	private static String PROJECT_PATH = "D:\\Administrator\\Documents\\workspace_eclipse\\smsmain\\sms\\src\\main\\java\\com\\usky\\sms\\";
	
	public static void main(String[] args) throws IOException {
		File configDirectory = new File(PROJECT_PATH);
		Collection<File> files = FileUtils.listFiles(configDirectory, new SuffixFileFilter("DO.java"), TrueFileFilter.INSTANCE);
		for (File file : files) {
			addComment(file);
		}
	}
	
	public static void addJoinColumnName(File file) throws IOException {
		List<String> fileLines = FileUtils.readLines(file, "UTF-8");
		List<String> newFileLines = new ArrayList<String>();
		newFileLines.addAll(fileLines);
		int i = 0;
		boolean fileChanged = false;
		for (String fileLine : fileLines) {
			if ("@JoinColumn".equals(StringUtils.strip(fileLine))) {
				for (int j = i + 1; j <= i + 3; j++) {
					if (fileLines.get(j).contains("get") && fileLines.get(j + 1).contains("return")) {
						// (name = "UNIT_ID")
						fileLine = fileLine + "(name = \"" + getJoinColumnName(fileLines.get(j + 1)) + "\")";
						fileLines.set(i, fileLine);
						fileChanged = true;
					}
				}
			}
			i++;
		}
		if (fileChanged) {
			FileUtils.writeLines(file, "UTF-8", fileLines, "\r\n", false);
		}
	}
	
	public static String getJoinColumnName(String returnStament) {
		return StringUtils.strip(StringUtils.substringAfter(returnStament, "return"), ";").trim().toUpperCase() + "_ID";
	}
	
	public static void addComment(File file) throws IOException {
		List<String> fileLines = FileUtils.readLines(file, "UTF-8");
		List<String> newFileLines = new ArrayList<String>();
		newFileLines.addAll(fileLines);
		Map<Integer, String> fieldComment = getFieldComment(fileLines);
		boolean insertedAnyComments = false;
		for (Entry<Integer, String> entry : fieldComment.entrySet()) {
			Integer lineNumber = entry.getKey();
			String comment = entry.getValue();
			String fieldName = getFieldName(fileLines.get(lineNumber));
			Integer getMethodLineNumber = findGetMethodLineNumber(fieldName, newFileLines);
			boolean inserted = insertComment(comment, getMethodLineNumber, newFileLines);
			if (!insertedAnyComments && inserted) {
				insertedAnyComments = true;
			}
		}
		if (insertedAnyComments) {
			String importStr = "import org.hibernate.cfg.Comment;";
			if (!newFileLines.contains(importStr)) {
				newFileLines.add(2, importStr);
			}
		}
		FileUtils.writeLines(file, "UTF-8", newFileLines, "\r\n", false);
	}
	
	public static boolean insertComment(String comment, Integer lineNumber, List<String> lines) {
		if (lineNumber != null) {
			comment = comment.replaceAll("\"", "'");
			comment = "	@Comment(\"" + StringUtils.trimToEmpty(comment) + "\")";
			if (StringUtils.trimToEmpty(lines.get(lineNumber)).startsWith("//")) {
				comment = "//" + comment;
			}
			if (StringUtils.trimToEmpty(lines.get(lineNumber - 1)).contains("@Comment")) {
				lines.set(lineNumber - 1, comment);
			} else {
				lines.add(lineNumber, comment);
			}
			return true;
		}
		return false;
	}
	
	public static Integer findGetMethodLineNumber(String fieldName, List<String> lines) {
		int i = 0;
		for (String line : lines) {
			if (StringUtils.containsIgnoreCase(line, fieldName + "()")) {
				return i; 
			}
			i++;
		}
		return null;
	}
	
	public static String getFieldName(String line) {
		line = StringUtils.trimToEmpty(line);
		return StringUtils.trimToEmpty(StringUtils.substringAfterLast(StringUtils.substringBefore(line, ";"), " "));
	}
	
	public static Map<Integer, String> getFieldComment(List<String> fileLines) {
		Map<Integer, String> result = new HashMap<Integer, String>();
		List<Integer> fieldLineNumbers = getFieldLineNumbers(fileLines);
		for (Integer lineNumber : fieldLineNumbers) {
			String comment = null;
			for (int tmepLineNumber = lineNumber; tmepLineNumber >= 0; tmepLineNumber--) {
				String line = StringUtils.trimToEmpty(fileLines.get(tmepLineNumber));
				comment = getCommentContent(line);
				if (StringUtils.isNotBlank(comment) ) {
					break;
				}
				if (StringUtils.isBlank(line) || (tmepLineNumber < lineNumber && StringUtils.startsWith(line, "private"))) {
					break;
				}
			}
			result.put(lineNumber, comment);
		}
		return result;
	}
	
	public static String getCommentContent(String line) {
		line = StringUtils.trimToEmpty(line);
		// 一行中包含 // 注释的
		if (StringUtils.contains(line, "//")) {
			return StringUtils.trimToEmpty(StringUtils.substringAfterLast(line, "//"));
		}
		// 一整行为java doc注释 /**  */
		Pattern p = Pattern.compile("(\\/\\*\\*).*(\\*\\/)");
		Matcher matcher = p.matcher(line);
		if (matcher.find()) {
			return StringUtils.trimToEmpty(StringUtils.stripEnd(line.substring(matcher.end(1),matcher.start(2)),"*"));
		}
		
		// java doc跨多行的注释
		if (!StringUtils.startsWith(line, "*/") && StringUtils.startsWith(line, "*")) {
			line = StringUtils.trimToEmpty(StringUtils.substringAfter(line, "*"));
			if (!StringUtils.startsWith(line, "@")) {
				return line;
			}
		}
		return "";
	}

	public static List<Integer> getFieldLineNumbers(List<String> fileLines) {
		return searchString(".*private.*;.*", fileLines);
	}
	
	private static List<Integer> searchString(String searchedString, List<String> fileLines) {
		if (StringUtils.isBlank(searchedString) || fileLines == null || fileLines.isEmpty()) {
			return Collections.emptyList();
		}
		List<Integer> result = new ArrayList<Integer>();
		int i = 0;
		for (String line : fileLines) {
			if (line.matches(searchedString)) {
				result.add(i);
			}
			i++;
		}
		return result;
	}
}
