
package com.usky.sms.common;

/**
 * Date formats. All the formats base on the given defaultDateFormat. Default
 * date formats are e. g. "dd.MM.yyyy", "dd.MM.yy", "dd/MM/yyyy", "dd/MM/yy",
 * "MM/dd/yyyy", "MM/dd/yy".
 * 
 * @author Kai Reinhard (k.reinhard@micromata.de)
 */
public class DateFormats {
	
	public static final String ISO_DATE = "yyyy-MM-dd";
	
	public static final String ISO_TIMESTAMP_MINUTES = "yyyy-MM-dd HH:mm";
	
	public static final String ISO_TIMESTAMP_SECONDS = "yyyy-MM-dd HH:mm:ss";
	
	public static final String ISO_TIMESTAMP_MILLIS = "yyyy-MM-dd HH:mm:ss.SSS";
	
	public static final String EXCEL_ISO_DATE = "YYYY-MM-DD";
	
	public static final String STANDARD_DATE = "yyyy-MM-dd'T'HH:mm:ss";
	
	/**
	 * Check weather the given dateString has month or day first. If not
	 * analyzable then true is returned as default value.
	 * 
	 * @param dateString
	 * @return true if month is used before day of month.
	 */
	public static boolean isFormatMonthFirst(final String dateString) {
		if (dateString == null) {
			return true;
		}
		final int monthPos = dateString.indexOf('M');
		final int dayPos = dateString.indexOf('d');
		return monthPos <= dayPos; // '=': if none of both found, true is the default.
	}
	
	/**
	 * Tries to get the separator char in dates ('/' is the default if nothing
	 * found). <br/> Example: "dd.MM.yyyy ..." results in '.', "MM/dd/yyy ..."
	 * results in '/'. <br/> Only '/', '-' and '.' are supported for now.
	 * 
	 * @param dateString
	 * @return the separator char.
	 */
	public static char getDateSeparatorChar(final String dateString) {
		if (dateString == null) {
			return '/';
		}
		if (dateString.indexOf('/') > 0) {
			return '/';
		} else if (dateString.indexOf('.') > 0) {
			return '.';
		} else if (dateString.indexOf('-') > 0) {
			return '-';
		}
		return '/';
	}
	
	/**
	 * @param dateString
	 * @return true if the dateString starts with "yyyy-MM-dd", otherwise false.
	 */
	public static boolean isIsoFormat(final String dateString) {
		if (dateString == null) {
			return false;
		}
		return dateString.startsWith("yyyy-MM-dd");
	}
	
	/**
	 * Uses default format of the logged-in user.
	 */
	public static String[] getDateParseFormats() {
		return getDateParseFormats("yyyy-MM-dd");
	}
	
	/**
	 * DefaultDateFormat with yyyy and yy and ISO format yyyy-MM-dd.
	 * 
	 * @param defaultDateFormat
	 */
	public static String[] getDateParseFormats(final String defaultDateFormat) {
		// # Date/time formats (important: don't use spaces after separator char, e. g. correct is dd.MMM yyyy instead of dd. MMM yyyy):
		final String[] sa = new String[4];
		if (defaultDateFormat.contains("yyyy") == true) {
			sa[0] = defaultDateFormat.replace("yyyy", "yy"); // First, try "yy"
			sa[1] = defaultDateFormat;
		} else {
			sa[0] = defaultDateFormat;
			sa[1] = defaultDateFormat.replace("yy", "yyyy");
		}
		sa[2] = getFormatString(defaultDateFormat, null, DateFormatType.DATE_WITHOUT_YEAR);
		sa[3] = ISO_DATE;
		return sa;
	}
	
	/**
	 * Gets the format string for the logged-in user. Uses the date format of
	 * the logged in user and if not given, it'll be set.
	 * 
	 * @param format
	 */
	public static String getFormatString(final DateFormatType format) {
		return getFormatString("yyyy-MM-dd", TimeNotation.H24, format);
	}
	
	/**
	 * Gets the format string for the logged-in user. Uses the date format of
	 * the logged in user and if not given, a default format is returned.
	 * 
	 * @param format
	 */
	public static String getExcelFormatString(final DateFormatType format) {
		return getExcelFormatString("yyyy-MM-dd", format);
	}
	
	public static String getExcelFormatString(final String defaultExcelDateFormat, final DateFormatType format) {
		switch (format) {
			case DATE:
				return defaultExcelDateFormat;
			case TIMESTAMP_MINUTES:
				return defaultExcelDateFormat + " hh:mm";
			case TIMESTAMP_SECONDS:
				return defaultExcelDateFormat + " hh:mm:ss";
			case TIMESTAMP_MILLIS:
				return defaultExcelDateFormat + " hh:mm:ss.000";
			default:
				return defaultExcelDateFormat + " hh:mm:ss";
		}
	}
	
	public static String getFormatString(final String defaultDateFormat, final TimeNotation timeNotation, final DateFormatType format) {
		switch (format) {
			case DATE:
				return defaultDateFormat;
			case DATE_WITH_DAY_NAME:
				return "E, " + getFormatString(defaultDateFormat, timeNotation, DateFormatType.DATE);
			case DATE_WITHOUT_YEAR:
				String pattern;
				if (defaultDateFormat.contains("yyyy") == true) {
					pattern = defaultDateFormat.replace("yyyy", "");
				} else {
					pattern = defaultDateFormat.replace("yy", "");
				}
				if (pattern.endsWith("/") == true) {
					return pattern.substring(0, pattern.length() - 1);
				} else if (pattern.startsWith("-") == true) {
					return pattern.substring(1);
				} else {
					return pattern;
				}
			case DATE_SHORT:
				if (defaultDateFormat.contains("yyyy") == false) {
					return defaultDateFormat;
				}
				return defaultDateFormat.replace("yyyy", "yy");
			case ISO_DATE:
				return "yyyy-MM-dd";
			case ISO_TIMESTAMP_MINUTES:
				return "yyyy-MM-dd HH:mm";
			case ISO_TIMESTAMP_SECONDS:
				return "yyyy-MM-dd HH:mm:ss";
			case ISO_TIMESTAMP_MILLIS:
				return "yyyy-MM-dd HH:mm:ss.SSS";
			case DAY_OF_WEEK_SHORT:
				return "EE";
			case TIMESTAMP_MINUTES:
				return getFormatString(defaultDateFormat, timeNotation, DateFormatType.DATE) + (timeNotation == TimeNotation.H24 ? " HH:mm" : " hh:mm aa");
			case TIMESTAMP_SECONDS:
				return getFormatString(defaultDateFormat, timeNotation, DateFormatType.DATE) + (timeNotation == TimeNotation.H24 ? " HH:mm:ss" : " hh:mm:ss aa");
			case TIMESTAMP_SHORT_MINUTES:
				return getFormatString(defaultDateFormat, timeNotation, DateFormatType.DATE_SHORT) + (timeNotation == TimeNotation.H24 ? " HH:mm" : " hh:mm aa");
			case TIMESTAMP_SHORT_SECONDS:
				return getFormatString(defaultDateFormat, timeNotation, DateFormatType.DATE_SHORT) + (timeNotation == TimeNotation.H24 ? " HH:mm:ss" : " hh:mm:ss aa");
			case TIME_OF_DAY_MINUTES:
				return (timeNotation == TimeNotation.H24 ? " HH:mm" : " hh:mm aa");
			case TIME_OF_DAY_SECONDS:
				return (timeNotation == TimeNotation.H24 ? " HH:mm:ss" : " hh:mm:ss aa");
			default:
				return defaultDateFormat;
		}
	}
	
}
