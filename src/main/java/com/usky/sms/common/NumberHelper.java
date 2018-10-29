package com.usky.sms.common;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.text.DecimalFormat;
import java.text.NumberFormat;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.apache.commons.codec.binary.Base64;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.math.NumberUtils;
import org.apache.log4j.Logger;

/**
 * Some helper methods ...
 */
public class NumberHelper {

	public static final String ALLOWED_PHONE_NUMBER_CHARS = "+-/().";

	public static final int KILO_BYTES = 1024;

	public static final BigDecimal KB_BD = new BigDecimal(KILO_BYTES);

	public static final int MEGA_BYTES = KILO_BYTES * 1024;

	public static final BigDecimal MB_BD = new BigDecimal(MEGA_BYTES);

	public static final int GIGA_BYTES = MEGA_BYTES * 1024;

	public static final BigDecimal GB_BD = new BigDecimal(GIGA_BYTES);

	public static final BigDecimal TWENTY = new BigDecimal(20);

	public static final BigDecimal HUNDRED = new BigDecimal(100);

	public static final BigDecimal THOUSAND = new BigDecimal(1000);

	public static final BigDecimal THREE_THOUSAND_SIX_HUNDRED = new BigDecimal(
			3600);

	public static final BigDecimal MINUS_TWENTY = new BigDecimal(-20);

	public static final BigDecimal MINUS_HUNDRED = new BigDecimal(-100);

	public static final BigDecimal BILLION = new BigDecimal(1000000000);

	private static final Logger log = Logger.getLogger(NumberHelper.class);

	public static NumberFormat getCurrencyFormat(final Locale locale) {
		return getNumberFraction2Format(locale);
	}

	public static NumberFormat getNumberFraction2Format(final Locale locale) {
		final NumberFormat format = NumberFormat.getNumberInstance(locale);
		format.setMaximumFractionDigits(2);
		format.setMinimumFractionDigits(2);
		return format;
	}

	public static NumberFormat getNumberFractionFormat(final Locale locale,
			final int fractionDigits) {
		final NumberFormat format = NumberFormat.getNumberInstance(locale);
		format.setMaximumFractionDigits(fractionDigits);
		format.setMinimumFractionDigits(fractionDigits);
		return format;
	}

	/**
	 * Pretty output of bytes, "1023 bytes", "1.1 kb", "523 kb", "1.7 Mb", "143
	 * Gb" etc.
	 * 
	 * @param bytes
	 * @return
	 */
	public static String formatBytes(final long bytes) {
		if (bytes < KILO_BYTES) {
			return String.valueOf(bytes) + " bytes";
		}
		if (bytes < MEGA_BYTES) {
			BigDecimal no = new BigDecimal(bytes).divide(KB_BD, 1,
					BigDecimal.ROUND_HALF_UP);
			if (no.longValue() >= 100) {
				no = no.setScale(0, BigDecimal.ROUND_HALF_UP);
			}
			return NumberFormat.getInstance(Locale.getDefault()).format(no)
					+ " kb";
		}
		if (bytes < GIGA_BYTES) {
			BigDecimal no = new BigDecimal(bytes).divide(MB_BD, 1,
					BigDecimal.ROUND_HALF_UP);
			if (no.longValue() >= 100) {
				no = no.setScale(0, BigDecimal.ROUND_HALF_UP);
			}
			return NumberFormat.getInstance(Locale.getDefault()).format(no)
					+ " Mb";
		}
		BigDecimal no = new BigDecimal(bytes).divide(GB_BD, 1,
				BigDecimal.ROUND_HALF_UP);
		if (no.longValue() >= 100) {
			no = no.setScale(0, BigDecimal.ROUND_HALF_UP);
		}
		return NumberFormat.getInstance(Locale.getDefault()).format(no) + " Gb";
	}

	/**
	 * @param value
	 * @return true, if value is not null and greater zero.
	 */
	public static boolean greaterZero(final Integer value) {
		return value != null && value.intValue() > 0;
	}

	/**
	 * @param value
	 * @return true, if value is not null and greater zero.
	 */
	public static boolean greaterZero(final Long value) {
		return value != null && value.intValue() > 0;
	}

	public static boolean isZeroOrNull(final Integer value) {
		return (value == null || value == 0);
	}

	public static boolean isGreaterZero(final BigDecimal value) {
		return (value != null && value.compareTo(BigDecimal.ZERO) > 0);
	}

	/**
	 * @param value
	 * @return true, if the given value is not null and not zero.
	 */
	public static boolean isNotZero(final Integer value) {
		return !isZeroOrNull(value);
	}

	/**
	 * Parses the given string as integer value.
	 * 
	 * @param value
	 *            The string representation of the integer value to parse.
	 * @return Integer value or null if an empty string was given or a syntax
	 *         error occurs.
	 */
	public static Integer parseInteger(String value) {
		if (value == null) {
			return null;
		}
		value = value.trim();
		if (value.length() == 0) {
			return null;
		}
		Integer result = null;
		try {
			result = new Integer(value);
		} catch (final NumberFormatException ex) {
			log.debug(ex.getMessage(), ex);
		}
		return result;
	}

	/**
	 * Parses the given string as short value.
	 * 
	 * @param value
	 *            The string representation of the short value to parse.
	 * @return Short value or null if an empty string was given or a syntax
	 *         error occurs.
	 */
	public static Short parseShort(String value) {
		if (value == null) {
			return null;
		}
		value = value.trim();
		if (value.length() == 0) {
			return null;
		}
		Short result = null;
		try {
			result = new Short(value);
		} catch (final NumberFormatException ex) {
			log.debug(ex.getMessage(), ex);
		}
		return result;
	}

	/**
	 * Catches any NumberFormatException and returns 0, otherwise the long value
	 * represented by the given value is returned.
	 */
	public static long parseLong(String value) {
		if (value == null) {
			return 0;
		}
		value = value.trim();
		if (value.length() == 0) {
			return 0;
		}
		Long result = null;
		try {
			result = new Long(value);
		} catch (final NumberFormatException ex) {
			log.debug(ex.getMessage(), ex);
		}
		return result;
	}

	/**
	 */
	public static BigDecimal parseBigDecimal(String value) {
		if (value == null) {
			return null;
		}
		value = value.trim();
		if (value.length() == 0) {
			return null;
		}
		BigDecimal result = null;
		try {
			if (value.indexOf(',') > 0) {
				// Replace the german decimal character by '.':
				value = value.replace(',', '.');
			}
			result = new BigDecimal(value);
		} catch (final NumberFormatException ex) {
			log.debug(ex.getMessage(), ex);
		}
		return result;
	}

	/**
	 */
	public static BigDecimal parseCurrency(String value, final Locale locale) {
		if (value == null) {
			return null;
		}
		value = value.trim();
		if (value.length() == 0) {
			return null;
		}
		final NumberFormat format = getCurrencyFormat(locale);
		BigDecimal result = null;
		try {
			final Number number = format.parse(value);
			if (number != null) {
				result = new BigDecimal(number.toString());
				result = result.setScale(2, BigDecimal.ROUND_HALF_UP);
			}
		} catch (final ParseException ex) {
			log.debug(ex.getMessage(), ex);
		}
		return result;
	}

	/**
	 * @param v1
	 *            null is supported.
	 * @param v2
	 *            null is supported.
	 * @return
	 */
	public static BigDecimal add(final BigDecimal v1, final BigDecimal v2) {
		if (v1 == null) {
			if (v2 == null) {
				return BigDecimal.ZERO;
			} else {
				return v2;
			}
		} else {
			if (v2 == null) {
				return v1;
			} else {
				return v1.add(v2);
			}
		}
	}

	/**
	 * Returns the given integer value as String representation.
	 * 
	 * @param value
	 *            The integer value to convert.
	 * @return The String representation or empty String, if value is null.
	 */
	public static String getAsString(final Number value) {
		if (value == null) {
			return "";
		} else {
			return String.valueOf(value);
		}
	}

	/**
	 * Returns the given number value as String representation.
	 * 
	 * @param value
	 *            The number value to convert.
	 * @param format
	 *            The format to use.
	 * @return The String representation or empty String, if value is null.
	 */
	public static String getAsString(final Number value,
			final NumberFormat format) {
		if (value == null) {
			return "";
		} else {
			return format.format(value);
		}
	}

	public static String formatFraction2(final Number value) {
		final Locale locale = Locale.getDefault();
		final NumberFormat format = getNumberFraction2Format(locale);
		return format.format(value);
	}

	/**
	 * Extracts the phone number of the given string. All characters of the set
	 * "+-/()." and white spaces will be deleted and +## will be replaced by
	 * 00##. Example: +49 561 / 316793-0 -> 00495613167930 <br/>
	 * Ignores any characters after the first occurence of ':' or any letter.
	 * 
	 * @param str
	 * @param countryPrefix
	 *            If country prefix is given, for all numbers beginning with the
	 *            country prefix the country prefix will be replaced by 0.
	 *            Example: ("+49 561 / 316793-0", "+49") -> 05613167930;
	 *            ("+39 123456", "+49") -> 0039123456.
	 * @return
	 */
	public static String extractPhonenumber(String str,
			final String countryPrefix) {
		if (str == null) {
			return null;
		}
		str = str.trim();
		final StringBuffer buf = new StringBuffer();
		if (StringUtils.isNotEmpty(countryPrefix) == true
				&& str.startsWith(countryPrefix) == true) {
			buf.append('0');
			str = str.substring(countryPrefix.length());
		} else if (str.length() > 3 && str.charAt(0) == '+'
				&& Character.isDigit(str.charAt(1)) == true
				&& Character.isDigit(str.charAt(2)) == true) {
			buf.append("00");
			buf.append(str.charAt(1));
			buf.append(str.charAt(2));
			str = str.substring(3);
		}
		for (int i = 0; i < str.length(); i++) {
			final char ch = str.charAt(i);
			if (Character.isDigit(str.charAt(i)) == true) {
				buf.append(ch);
			} else if (Character.isWhitespace(ch) == true) {
				// continue.
			} else if (ALLOWED_PHONE_NUMBER_CHARS.indexOf(ch) < 0) {
				break;
			}
		}
		return buf.toString();
	}

	/**
	 * Compares two given BigDecimals. They are equal if the value is equal
	 * independent of the scale (5.70 is equals to 5.7 and null is equals null,
	 * but null is not equals to 0).
	 * 
	 * @param value1
	 * @param value2
	 * @return
	 * @see BigDecimal#compareTo(BigDecimal)
	 */
	public static boolean isEqual(final BigDecimal value1,
			final BigDecimal value2) {
		if (value1 == null) {
			return (value2 == null) ? true : false;
		}
		if (value2 == null) {
			return false;
		}
		return value1.compareTo(value2) == 0;
	}

	/**
	 * @param value
	 * @return true, if the given value is not null and not zero.
	 */
	public static boolean isNotZero(final BigDecimal value) {
		return !isZeroOrNull(value);
	}

	public static boolean isZeroOrNull(final BigDecimal value) {
		return (value == null || value.compareTo(BigDecimal.ZERO) == 0);
	}

	/**
	 * Compares two given Integers using compareTo method.
	 * 
	 * @param value1
	 * @param value
	 * @return
	 * @see Integer#compareTo(Integer)
	 */
	public static boolean isEqual(final Integer value1, final Integer value) {
		if (value1 == null) {
			return (value == null) ? true : false;
		}
		if (value == null) {
			return false;
		}
		return value1.compareTo(value) == 0;
	}

	/**
	 * Splits string representation of the given number into digits. Examples:<br/>
	 * NumberHelper.splitToInts(11110511, 1, 3, 2, 2) = {1, 111, 5, 11}<br/>
	 * NumberHelper.splitToInts(10000511, 1, 3, 2, 2) = { 1, 0, 5, 11}<br/>
	 * NumberHelper.splitToInts(511, 1, 3, 2, 2) = { 0, 0, 5, 11}
	 * 
	 * @param value
	 * @param split
	 * @return
	 */
	public static int[] splitToInts(final Number value, final int... split) {
		int numberOfDigits = 0;
		for (final int n : split) {
			numberOfDigits += n;
		}
		final String str = StringUtils.leftPad(
				String.valueOf(value.intValue()), numberOfDigits, '0');
		final int[] result = new int[split.length];
		int pos = 0;
		int i = 0;
		for (final int n : split) {
			result[i++] = parseInteger(str.substring(pos, pos + n));
			pos += n;
		}
		return result;
	}

	/**
	 * If given string is an number (NumberUtils.isNumber(String)) then it will
	 * be converted to a plain string via BigDecimal.toPlainString(). Any
	 * exponent such as 1E7 will be avoided.
	 * 
	 * @param str
	 * @return Converted string if number, otherwise the origin string.
	 * @see NumberUtils#isNumber(String)
	 * @see NumberUtils#createBigDecimal(String)
	 * @see BigDecimal#toPlainString()
	 */
	public static String toPlainString(final String str) {
		if (NumberUtils.isNumber(str) == true) {
			final BigDecimal bd = NumberUtils.createBigDecimal(str);
			return bd.toPlainString();
		} else {
			return str;
		}
	}

	/**
	 * Sets scale 0 for numbers greater 100, 1 for numbers greater 20 and 2 as
	 * default.
	 * 
	 * @param number
	 * @return
	 */
	public static BigDecimal setDefaultScale(final BigDecimal number) {
		if (number == null) {
			return null;
		}
		if (number.compareTo(NumberHelper.HUNDRED) >= 0
				|| number.compareTo(NumberHelper.MINUS_HUNDRED) <= 0) {
			return number.setScale(0, BigDecimal.ROUND_HALF_UP);
		} else if (number.compareTo(NumberHelper.TWENTY) >= 0
				|| number.compareTo(NumberHelper.MINUS_TWENTY) <= 0) {
			return number.setScale(1, BigDecimal.ROUND_HALF_UP);
		}
		return number.setScale(2, BigDecimal.ROUND_HALF_UP);
	}

	/**
	 * Generates secure random bytes of the given length and return base 64
	 * encoded bytes as url safe String. This is not the length of the resulting
	 * string!
	 * 
	 * @param numberOfBytes
	 * @return
	 */
	public static String getSecureRandomUrlSaveString(final int numberOfBytes) {
		final SecureRandom random = new SecureRandom();
		final byte[] bytes = new byte[numberOfBytes];
		random.nextBytes(bytes);
		return Base64.encodeBase64URLSafeString(bytes);
	}

	public static boolean isIn(final int value, final int... numbers) {
		if (numbers == null) {
			return false;
		}
		for (final int number : numbers) {
			if (value == number) {
				return true;
			}
		}
		return false;
	}

	public static Integer toInteger(String s) {
		Integer i;
		if (NumberUtils.isDigits(s)) {
			i = Integer.parseInt(s);
		} else {
			i = (new Double(s)).intValue();
		}
		return i;
	}
	
	/**
	 * 数字转换成汉字
	 * 
	 * @param number
	 *            要转换的数字
	 * @return the string
	 */
	public static String convertToChineseNum(Double decimal) {
		String num[] = { "零", "一", "二", "三", "四", "五", "六", "七", "八", "九" };
		String xx[] = { "十", "百", "千" };
		String yy[] = { "万", "亿", "兆", "京" };
		StringBuffer chineseNum = new StringBuffer();
		if (decimal < 0) {
			chineseNum.append("负");
			decimal = - decimal;
		}
		DecimalFormat decimalFormat = new DecimalFormat("#.############");//格式化设置 
		String decimals = decimalFormat.format(decimal);
		int decIndex = decimals.indexOf(".");
		Long numberPart = decimal.longValue();
		String fractionalPart = null;
		if (decIndex > 0) {
			fractionalPart = decimals.substring(decIndex + 1);
		}
		// 整数部分
		// 位数
		int i;
		int temp;
		boolean first = true;
		boolean zero = false;
		for (i = 0; (int) (numberPart / (long) Math.pow(10, i)) != 0; i++) {
			;// 计算位数
		}
		if (i == 0) {
			return num[0];
		}
		for (int k = (i - 1) / 4; k >= 0; k--) {
			temp = (int) ((numberPart / (long) Math.pow(10, 4 * k)) % (int) Math.pow(10, 4));
			if (temp == 0) {
				zero = true;
				continue;
			}
			for (int x = 3; x >= 0; x--) {
				if (first) {
					x = (i - 1) % 4;
					first = false;
				}
				if (temp / (int) Math.pow(10, x) % 10 == 0) {
					zero = true;
				} else {
					if (zero) {
						chineseNum.append(num[0]);
						zero = false;
					}
					chineseNum.append(num[temp / (int) Math.pow(10, x) % 10]);
					if (x > 0) {
						chineseNum.append(xx[x - 1]);
					}
				}
			}
			if (k > 0) {
				chineseNum .append(yy[k - 1]);
			}
		}
		// 小数部分
		if (null != fractionalPart && fractionalPart.length() > 0) {
			chineseNum.append("点");
			char[] val = fractionalPart.toCharArray();
			for (char c : val) {
				int n = Integer.valueOf(c + "");
				chineseNum.append(num[n]);
			}
		}
		return chineseNum.toString();
	}
	
	public static List<Integer> convertToIntegerList(List<Number> numberList){
		if(null == numberList){
			return null;
		}
		List<Integer> integerList = new ArrayList<Integer>();
		for(Number numberValue : numberList){
			Integer integerValue = null;
			if(null != numberValue){
				integerValue = numberValue.intValue();
			}
			integerList.add(integerValue);
		}
		return integerList;
	}
}
