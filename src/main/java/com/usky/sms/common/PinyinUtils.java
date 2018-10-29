package com.usky.sms.common;

import net.sourceforge.pinyin4j.PinyinHelper;
import net.sourceforge.pinyin4j.format.HanyuPinyinCaseType;
import net.sourceforge.pinyin4j.format.HanyuPinyinOutputFormat;
import net.sourceforge.pinyin4j.format.HanyuPinyinToneType;

import org.apache.log4j.Logger;

public class PinyinUtils {
	
	private static final Logger logger = Logger.getLogger(PinyinUtils.class);
	
	public static final HanyuPinyinOutputFormat FORMAT_UPPERCASE_WITHOUT_TONE = new HanyuPinyinOutputFormat(); 
	
	static {
		FORMAT_UPPERCASE_WITHOUT_TONE.setCaseType(HanyuPinyinCaseType.UPPERCASE);
		FORMAT_UPPERCASE_WITHOUT_TONE.setToneType(HanyuPinyinToneType.WITHOUT_TONE);
	}

	public static String toPinYin(String str) {
		return toPinYin(str, "", FORMAT_UPPERCASE_WITHOUT_TONE);
	}

	public static String toPinYin(String str, String spera) {
		return toPinYin(str, spera, FORMAT_UPPERCASE_WITHOUT_TONE);
	}

	/**
	 * 将str转换成拼音，如果不是汉字或者没有对应的拼音，则不作转换 如： 明天 转换成 MINGTIAN
	 * 
	 * @param str
	 * @param spera 分隔符
	 * @return
	 */
	public static String toPinYin(String str, String spera, HanyuPinyinOutputFormat format) {
		if (str == null || str.trim().length() == 0) {
			return "";
		}

		StringBuffer py = new StringBuffer();
		String temp = "";
		String[] t;
		for (int i = 0; i < str.length(); i++) {
			char c = str.charAt(i);
			if ((int) c <= 128) {
				py.append(c);
			} else {
				try {
					t = PinyinHelper.toHanyuPinyinStringArray(c, format);
					if (t == null) {
						py.append(c);
					} else {
						temp = t[0];
						py.append(temp + (i == str.length() - 1 ? "" : spera));
					}
				} catch (Exception e) {
					logger.error("转换字符[" + str + "]拼音失败。");
					return str;
				}
			}
		}
		return py.toString().trim();
	}
}
