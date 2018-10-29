
package com.usky.sms.common;

import java.io.Serializable;
import java.math.BigDecimal;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.TimeZone;

import org.joda.time.DateTime;
import org.joda.time.DateTimeConstants;

import com.usky.sms.calendar.DateTimeFormatter;
import com.usky.sms.calendar.TimePeriod;

/**
 * Parse and formats dates.
 * 
 * @author Kai Reinhard (k.reinhard@micromata.de)
 */
public class DateHelper implements Serializable {
	
	private static final org.apache.log4j.Logger log = org.apache.log4j.Logger.getLogger(DateHelper.class);
	
	private static final long serialVersionUID = -94010735614402146L;
	
	/**
	 * Number of milliseconds of one minute. DO NOT USE FOR exact date
	 * calculations (summer and winter time etc.)!
	 */
	public static final long MILLIS_MINUTE = 60 * 1000;
	
	/**
	 * Number of milliseconds of one hour. DO NOT USE FOR exact date
	 * calculations (summer and winter time etc.)!
	 */
	public static final long MILLIS_HOUR = 60 * MILLIS_MINUTE;
	
	/**
	 * Number of milliseconds of one day. DO NOT USE FOR exact date calculations
	 * (summer and winter time etc.)!
	 */
	public static final long MILLIS_DAY = 24 * MILLIS_HOUR;
	
	/**
	 * Europe/Berlin
	 */
	public final static TimeZone EUROPE_BERLIN = TimeZone.getTimeZone("Europe/Berlin");
	
	public static final BigDecimal MILLIS_PER_HOUR = new BigDecimal(MILLIS_HOUR);
	
	public static final BigDecimal HOURS_PER_WORKING_DAY = new BigDecimal(DateTimeFormatter.DEFAULT_HOURS_OF_DAY);
	
	public static final BigDecimal MILLIS_PER_WORKING_DAY = new BigDecimal(MILLIS_HOUR * DateTimeFormatter.DEFAULT_HOURS_OF_DAY);
	
	public static final BigDecimal SECONDS_PER_WORKING_DAY = new BigDecimal(60 * 60 * DateTimeFormatter.DEFAULT_HOURS_OF_DAY);
	
	/**
	 * UTC
	 */
	public final static TimeZone UTC = TimeZone.getTimeZone("UTC");
	
	private static final DateFormat FORMAT_ISO_DATE = new SimpleDateFormat(DateFormats.ISO_DATE);
	
	private static final DateFormat FORMAT_ISO_SECOND = new SimpleDateFormat(DateFormats.ISO_TIMESTAMP_SECONDS);
	
	private static final DateFormat FORMAT_ISO_TIMESTAMP = new SimpleDateFormat(DateFormats.ISO_TIMESTAMP_MILLIS);
	
	private static final DateFormat FORMAT_STANDARD_DATE = new SimpleDateFormat(DateFormats.STANDARD_DATE);
	
	private static final DateFormat FILENAME_FORMAT_TIMESTAMP = new SimpleDateFormat(DateFormats.ISO_DATE + "_HH-mm-ss");
	
	private static final DateFormat FILENAME_FORMAT_DATE = new SimpleDateFormat(DateFormats.ISO_DATE);
	
	/**
	 * Compares millis. If both dates are null then they're equal.
	 * 
	 * @param d1
	 * @param d2
	 * @see Date#getTime()
	 */
	public static boolean equals(final Date d1, final Date d2) {
		if (d1 == null) {
			return d2 == null;
		}
		if (d2 == null) {
			return false;
		}
		return d1.getTime() == d2.getTime();
	}
	
	/**
	 * thread safe
	 * 
	 * @param timezone
	 */
	public static DateFormat getIsoDateFormat(final TimeZone timezone) {
		final DateFormat df = (DateFormat) FORMAT_ISO_DATE.clone();
		if (timezone != null) {
			df.setTimeZone(timezone);
		}
		return df;
	}
	
	/**
	 * thread safe
	 * 
	 * @param timezone If null then time zone is ignored.
	 */
	public static DateFormat getIsoSecondFormat(final TimeZone timezone) {
		final DateFormat df = (DateFormat) FORMAT_ISO_SECOND.clone();
		if (timezone != null) {
			df.setTimeZone(timezone);
		}
		return df;
	}
	
	/**
	 * thread safe
	 * 
	 * @param timezone If null then time zone is ignored.
	 */
	public static DateFormat getIsoTimestampFormat(final TimeZone timezone) {
		final DateFormat df = (DateFormat) FORMAT_ISO_TIMESTAMP.clone();
		if (timezone != null) {
			df.setTimeZone(timezone);
		}
		return df;
	}
	
	/**
	 * thread safe
	 * 
	 * @param timezone If null then time zone is ignored.
	 */
	public static DateFormat getStandardDateFormat(final TimeZone timezone) {
		final DateFormat df = (DateFormat) FORMAT_STANDARD_DATE.clone();
		if (timezone != null) {
			df.setTimeZone(timezone);
		}
		return df;
	}
	
	/**
	 * thread safe
	 * 
	 * @param timezone
	 */
	public static DateFormat getFilenameFormatTimestamp(final TimeZone timezone) {
		final DateFormat df = (DateFormat) FILENAME_FORMAT_TIMESTAMP.clone();
		if (timezone != null) {
			df.setTimeZone(timezone);
		}
		return df;
	}
	
	/**
	 * thread safe
	 * 
	 * @param timezone
	 */
	public static DateFormat getFilenameFormatDate(final TimeZone timezone) {
		final DateFormat df = (DateFormat) FILENAME_FORMAT_DATE.clone();
		if (timezone != null) {
			df.setTimeZone(timezone);
		}
		return df;
	}
	
	/**
	 * yyyy-MM-dd HH:mm:ss.S in UTC. Thread safe usage:
	 * FOR_TESTCASE_OUTPUT_FORMATTER.get().format(date)
	 */
	public static final ThreadLocal<DateFormat> FOR_TESTCASE_OUTPUT_FORMATTER = new ThreadLocal<DateFormat>() {
		
		@Override
		protected DateFormat initialValue() {
			final DateFormat df = new SimpleDateFormat(DateFormats.ISO_TIMESTAMP_MILLIS);
			df.setTimeZone(UTC);
			return df;
		}
	};
	
	/**
	 * Thread safe usage: FOR_TESTCASE_OUTPUT_FORMATTER.get().format(date)
	 */
	public static final ThreadLocal<DateFormat> TECHNICAL_ISO_UTC = new ThreadLocal<DateFormat>() {
		
		@Override
		protected DateFormat initialValue() {
			final DateFormat dateFormat = new SimpleDateFormat(DateFormats.ISO_TIMESTAMP_MILLIS + " z");
			dateFormat.setTimeZone(UTC);
			return dateFormat;
		}
	};
	
	/**
	 * @return Short name of day represented by the giving day. The context
	 *         user's locale and time zone is considered.
	 */
	public static final String formatShortNameOfDay(final Date date) {
		final DateFormat df = new SimpleDateFormat("EE", Locale.getDefault());
		df.setTimeZone(TimeZone.getDefault());
		return df.format(date);
	}
	
	/**
	 * Formats the given date as UTC date in ISO format attached TimeZone (UTC).
	 * 
	 * @param date
	 * @return
	 */
	public static final String formatAsUTC(final Date date) {
		if (date == null) {
			return "";
		}
		return UTC_ISO_DATE.get().format(date);
	}
	
	/**
	 * Thread safe usage: UTC_ISO_DATE.get().format(date)
	 */
	public static final ThreadLocal<DateFormat> UTC_ISO_DATE = new ThreadLocal<DateFormat>() {
		
		@Override
		protected DateFormat initialValue() {
			final DateFormat df = new SimpleDateFormat(DateFormats.ISO_TIMESTAMP_MILLIS + " Z");
			df.setTimeZone(UTC);
			return df;
		}
	};
	
	/**
	 * Takes time zone of context user if exist.
	 * 
	 * @param date
	 */
	public static String formatIsoDate(final Date date) {
		//为了防止界面的日期时间�?�传过来为null值时，代码报错，在此处做个判断，返回个空字符串�??
		if (date == null || date.equals("")) {
			return "";
		} else {
			return getIsoDateFormat(TimeZone.getDefault()).format(date);
		}
	}
	
	/**
	 * Takes time zone of context user if exist.
	 * 
	 * @param date
	 */
	public static String formatIsoDate(final Date date, final TimeZone timeZone) {
		return getIsoDateFormat(timeZone).format(date);
	}
	
	/**
	 * logError = true
	 * 
	 * @param str
	 * @return
	 * @see #parseMillis(String, boolean)
	 */
	public static Date parseMillis(final String str) {
		return parseMillis(str, true);
	}
	
	/**
	 * @param str
	 * @param logError If true, any ParseException error will be logged if
	 *            occured.
	 * @return The parsed date or null, if not parseable.
	 */
	public static Date parseMillis(final String str, final boolean logError) {
		Date date = null;
		try {
			final long millis = Long.parseLong(str);
			date = new Date(millis);
		} catch (final NumberFormatException ex) {
			if (logError == true) {
				log.error("Could not parse date string (millis expected): " + str, ex);
			}
		}
		return date;
	}
	
	public static String formatIsoSecond(final Date date) {
		return formatIsoSecond(date, TimeZone.getDefault());
	}
	
	public static String formatIsoSecond(final Date date, TimeZone timeZone) {
		return getIsoSecondFormat(timeZone).format(date);
	}
	
	public static String formatIsoTimestamp(final Date date) {
		return getIsoTimestampFormat(TimeZone.getDefault()).format(date);
	}
	
	public static String formatStandardDate(final Date date) {
		return getStandardDateFormat(TimeZone.getDefault()).format(date);
	}
	
	/**
	 * Format yyyy-mm-dd
	 * 
	 * @param isoDateString
	 * @return Parsed date or null if a parse error occurs.
	 */
	public static Date parseIsoDate(final String isoDateString) {
		return parseIsoDate(isoDateString, TimeZone.getDefault());
	}
	
	/**
	 * Format yyyy-mm-dd
	 * 
	 * @param isoDateString
	 * @return Parsed date or null if a parse error occurs.
	 */
	public static Date parseIsoDate(final String isoDateString, final TimeZone timeZone) {
		final DateFormat df = new SimpleDateFormat("yyyy-MM-dd");
		df.setTimeZone(timeZone);
		Date date;
		try {
			date = df.parse(isoDateString);
		} catch (final ParseException ex) {
			return null;
		}
		return date;
	}
	
	/**
	 * Format: {@link DateFormats#ISO_TIMESTAMP_SECONDS}
	 * 
	 * @param isoDateString
	 * @return Parsed date or null if a parse error occurs.
	 */
	public static Date parseIsoSecond(final String isoDateString) {
		return parseIsoSecond(isoDateString, TimeZone.getDefault());
	}
	
	/**
	 * Format: {@link DateFormats#ISO_TIMESTAMP_SECONDS}
	 * 
	 * @param isoDateString
	 * @return Parsed date or null if a parse error occurs.
	 */
	public static Date parseIsoSecond(final String isoDateString, final TimeZone timeZone) {
		final DateFormat df = new SimpleDateFormat(DateFormats.ISO_TIMESTAMP_SECONDS);
		df.setTimeZone(timeZone);
		Date date;
		try {
			date = df.parse(isoDateString);
		} catch (final ParseException ex) {
			return null;
		}
		return date;
	}
	
	/**
	 * Format: {@link DateFormats#ISO_TIMESTAMP_MILLIS}
	 * 
	 * @param isoDateString
	 * @return Parsed date or null if a parse error occurs.
	 */
	public static Date parseIsoTimestamp(final String isoDateString, final TimeZone timeZone) {
		final DateFormat df = new SimpleDateFormat(DateFormats.ISO_TIMESTAMP_MILLIS);
		df.setTimeZone(timeZone);
		Date date;
		try {
			date = df.parse(isoDateString);
		} catch (final ParseException ex) {
			return null;
		}
		return date;
	}
	
	/**
	 * Format: {@link DateFormats#ISO_TIMESTAMP_MILLIS}
	 * 
	 * @param isoDateString
	 * @return Parsed date or null if a parse error occurs.
	 */
	public static Date parseIsoTimestamp(final String isoDateString) {
		return parseIsoTimestamp(isoDateString, TimeZone.getDefault());
	}
	
	/**
	 * Format: {@link DateFormats#STANDARD_DATE}
	 * 
	 * @param isoDateString
	 * @return Parsed date or null if a parse error occurs.
	 */
	public static Date parseStandardDate(final String isoDateString) {
		return parseStandardDate(isoDateString, TimeZone.getDefault());
	}
	
	/**
	 * Format: {@link DateFormats#STANDARD_DATE}
	 * 
	 * @param isoDateString
	 * @return Parsed date or null if a parse error occurs.
	 */
	public static Date parseStandardDate(final String isoDateString, final TimeZone timeZone) {
		final DateFormat df = new SimpleDateFormat(DateFormats.STANDARD_DATE);
		df.setTimeZone(timeZone);
		Date date;
		try {
			date = df.parse(isoDateString);
		} catch (final ParseException ex) {
			return null;
		}
		return date;
	}
	
	public static String formatIsoTimePeriod(final Date fromDate, final Date toDate) {
		return formatIsoDate(fromDate) + ":" + formatIsoDate(toDate);
	}
	
	/**
	 * Format yyyy-mm-dd:yyyy-mm-dd
	 * 
	 * @param isoTimePeriodString
	 * @return Parsed time period or null if a parse error occurs.
	 */
	public static TimePeriod parseIsoTimePeriod(final String isoTimePeriodString, final TimeZone timeZone) {
		final DateFormat df = new SimpleDateFormat("yyyy-MM-dd");
		df.setTimeZone(timeZone);
		final String[] sa = isoTimePeriodString.split(":");
		if (sa.length != 2) {
			return null;
		}
		final Date fromDate = DateHelper.parseIsoDate(sa[0], DateHelper.UTC);
		final Date toDate = DateHelper.parseIsoDate(sa[1], DateHelper.UTC);
		if (fromDate == null || toDate == null) {
			return null;
		}
		return new TimePeriod(fromDate, toDate);
	}
	
	/**
	 * Output via FOR_TESTCASE_OUTPUT_FORMATTER for test cases.<br/>
	 * 
	 * @param dateHolder
	 * @return
	 */
	public static final String getForTestCase(final DateHolder dateHolder) {
		return FOR_TESTCASE_OUTPUT_FORMATTER.get().format(dateHolder.getDate());
	}
	
	/**
	 * Output via FOR_TESTCASE_OUTPUT_FORMATTER for test cases.
	 * 
	 * @param dateHolder
	 * @return
	 */
	public static final String getForTestCase(final Date date) {
		return FOR_TESTCASE_OUTPUT_FORMATTER.get().format(date);
	}
	
	public static final String getTimestampAsFilenameSuffix(final Date date) {
		if (date == null) {
			return "--";
		}
		return getFilenameFormatTimestamp(TimeZone.getDefault()).format(date);
	}
	
	public static final String getDateAsFilenameSuffix(final Date date) {
		if (date == null) {
			return "--";
		}
		return getFilenameFormatDate(TimeZone.getDefault()).format(date);
	}
	
	/**
	 * Returns a calendar instance. If a context user is given then the user's
	 * time zone and locale will be used if given.
	 */
	public static Calendar getCalendar() {
		return getCalendar(null, null);
	}
	
	/**
	 * Returns a calendar instance. If a context user is given then the user's
	 * time zone and locale will be used if given.
	 * 
	 * @param locale if given this locale will overwrite any the context user's
	 *            locale.
	 */
	public static Calendar getCalendar(final Locale locale) {
		return getCalendar(null, locale);
	}
	
	public static Calendar getCalendar(TimeZone timeZone, Locale locale) {
		if (locale == null) {
			locale = Locale.getDefault();
		}
		if (timeZone == null) {
			timeZone = TimeZone.getDefault();
		}
		return Calendar.getInstance(timeZone, locale);
	}
	
	public static Calendar getUTCCalendar() {
		return getCalendar(UTC, null);
	}
	
	/**
	 * If stopTime is before startTime a negative value will be returned.
	 * 
	 * @param startTime
	 * @param stopTime
	 * @return Duration in minutes or 0, if not computable (if start or stop
	 *         time is null or stopTime is before startTime).
	 */
	public static long getDuration(final Date startTime, final Date stopTime) {
		if (startTime == null || stopTime == null || stopTime.before(startTime) == true) {
			return 0;
		}
		final long millis = stopTime.getTime() - startTime.getTime();
		return millis / 60000;
	}
	
	/**
	 * @return Formatted string without seconds, such as 5:45.
	 * @param time in millis
	 */
	public static String formatDuration(final long milliSeconds) {
		final long duration = milliSeconds / 60000;
		final long durationHours = duration / 60;
		final long durationMinutes = (duration % 60);
		final StringBuffer buf = new StringBuffer(10);
		buf.append(durationHours);
		if (durationMinutes < 10)
			buf.append(":0");
		else
			buf.append(':');
		buf.append(durationMinutes);
		return buf.toString();
	}
	
	/**
	 * Initializes a new ArrayList with -1 ("--") and all 12 month with labels
	 * "01", ..., "12".
	 */
	public static List<LabelValueBean<String, Integer>> getMonthList() {
		final List<LabelValueBean<String, Integer>> list = new ArrayList<LabelValueBean<String, Integer>>();
		list.add(new LabelValueBean<String, Integer>("--", -1));
		for (int month = 0; month < 12; month++) {
			list.add(new LabelValueBean<String, Integer>(StringHelper.format2DigitNumber(month + 1), month));
		}
		return list;
	}
	
	/**
	 * @param year
	 * @param month 0-11
	 * @return "yyyy-mm"
	 */
	public static String formatMonth(final int year, final int month) {
		final StringBuffer buf = new StringBuffer();
		buf.append(year);
		if (month >= 0) {
			buf.append('-');
			final int m = month + 1;
			if (m <= 9) {
				buf.append('0');
			}
			buf.append(m);
		}
		return buf.toString();
	}
	
	/**
	 * Should be used application wide for getting and/or displaying the week of
	 * year!
	 * 
	 * @param date
	 * @return Return the week of year. The week of year depends on the Locale
	 *         set in the Configuration (config.xml). If given date is null then
	 *         -1 is returned. For "de" the first week of year is the first week
	 *         with a minimum of 4 days in the new year. For "en" the first week
	 *         of the year is the first week with a minimum of 1 days in the new
	 *         year.
	 * @see java.util.Calendar#getMinimalDaysInFirstWeek()
	 */
	public static int getWeekOfYear(final Date date) {
		if (date == null) {
			return -1;
		}
		final Calendar cal = Calendar.getInstance();
		cal.setTime(date);
		return cal.get(Calendar.WEEK_OF_YEAR);
	}
	
	/**
	 * Should be used application wide for getting and/or displaying the week of
	 * year!
	 * 
	 * @param calendar (this methods uses the year, month and day of the given
	 *            Calendar)
	 * @return Return the week of year. The week of year depends on the Locale
	 *         set in the Configuration (config.xml). If given date is null then
	 *         -1 is returned. For "de" the first week of year is the first week
	 *         with a minimum of 4 days in the new year. For "en" the first week
	 *         of the year is the first week with a minimum of 1 days in the new
	 *         year.
	 * @see java.util.Calendar#getMinimalDaysInFirstWeek()
	 */
	public static int getWeekOfYear(final Calendar calendar) {
		if (calendar == null) {
			return -1;
		}
		final Calendar cal = Calendar.getInstance();
		cal.set(Calendar.YEAR, calendar.get(Calendar.YEAR));
		cal.set(Calendar.MONTH, calendar.get(Calendar.MONDAY));
		cal.set(Calendar.DAY_OF_MONTH, calendar.get(Calendar.DAY_OF_MONTH));
		return cal.get(Calendar.WEEK_OF_YEAR);
	}
	
	/**
	 * Should be used application wide for getting and/or displaying the week of
	 * year!
	 * 
	 * @param date
	 * @return Return the week of year. The week of year depends on the Locale
	 *         set in the Configuration (config.xml). If given date is null then
	 *         -1 is returned. For "de" the first week of year is the first week
	 *         with a minimum of 4 days in the new year. For "en" the first week
	 *         of the year is the first week with a minimum of 1 days in the new
	 *         year.
	 * @see java.util.Calendar#getMinimalDaysInFirstWeek()
	 */
	public static int getWeekOfYear(final DateTime date) {
		if (date == null) {
			return -1;
		}
		return getWeekOfYear(date.toDate());
	}
	
	/**
	 * @param d1
	 * @param d2
	 * @return True if the dates are both null or both represents the same day
	 *         (year, month, day) independant of the hours, minutes etc.
	 * @see DateHolder#isSameDay(Date)
	 */
	public static boolean isSameDay(final Date d1, final Date d2) {
		if (d1 == null) {
			if (d2 == null) {
				return true;
			} else {
				return false;
			}
		} else if (d2 == null) {
			return false;
		}
		final DateHolder dh = new DateHolder(d1);
		return dh.isSameDay(d2);
	}
	
	/**
	 * @param d1
	 * @param d2
	 * @return True if the dates are both null or both represents the same day
	 *         (year, month, day) independant of the hours, minutes etc.
	 * @see DateHolder#isSameDay(Date)
	 */
	public static boolean isSameDay(final DateTime d1, final DateTime d2) {
		if (d1 == null) {
			if (d2 == null) {
				return true;
			} else {
				return false;
			}
		} else if (d2 == null) {
			return false;
		}
		return d1.getYear() == d2.getYear() && d1.getDayOfYear() == d2.getDayOfYear();
	}
	
	public static boolean dateOfYearBetween(final int month, final int dayOfMonth, final int fromMonth, final int fromDayOfMonth, final int toMonth, final int toDayOfMonth) {
		if (fromMonth == toMonth) {
			if (month != fromMonth) {
				return false;
			}
			if (dayOfMonth < fromDayOfMonth || dayOfMonth > toDayOfMonth) {
				return false;
			}
		} else if (fromMonth < toMonth) {
			// e. g. APR - JUN
			if (month < fromMonth || month > toMonth) {
				// e. g. FEB or JUL
				return false;
			} else if (month == fromMonth && dayOfMonth < fromDayOfMonth) {
				return false;
			} else if (month == toMonth && dayOfMonth > toDayOfMonth) {
				return false;
			}
		} else if (fromMonth > toMonth) {
			// e. g. NOV - FEB
			if (month > toMonth && month < fromMonth) {
				// e. g. MAR
				return false;
			} else if (month == fromMonth && dayOfMonth < fromDayOfMonth) {
				return false;
			} else if (month == toMonth && dayOfMonth > toDayOfMonth) {
				return false;
			}
		}
		return true;
	}
	
	/**
	 * Sets given DateTime (UTC) as local time, meaning e. g. 08:00 UTC will be
	 * 08:00 local time.
	 * 
	 * @param dateTime
	 * @return
	 * @see DateTime#toString(String)
	 * @see DateHelper#parseIsoDate(String, TimeZone)
	 */
	public static long getDateTimeAsMillis(final DateTime dateTime) {
		final String isDateString = dateTime.toString(DateFormats.ISO_TIMESTAMP_MILLIS);
		final Date date = DateHelper.parseIsoTimestamp(isDateString, TimeZone.getDefault());
		return date.getTime();
	}
	
	public final static int convertCalendarDayOfWeekToJoda(final int calendarDayOfWeek) {
		if (calendarDayOfWeek == Calendar.SUNDAY) {
			return DateTimeConstants.SUNDAY;
		}
		return calendarDayOfWeek - 1;
	}
	
	/**
	 * 获取给定时间的前n个月的月首日(不包含给定时间的所在月)
	 * @param date
	 * @return
	 * @throws ParseException 
	 */
	public static Date getFirstDayOfPreviousMonth(Date date, int num) throws ParseException {
		if (null == date) {
			date = new Date();
		}
		SimpleDateFormat myFormat = new SimpleDateFormat("yyyy-MM");
		String temp = myFormat.format(date);
		Date tempDate = myFormat.parse(temp);
		Calendar cal = DateHelper.getCalendar();
		cal.setTime(tempDate);;
		cal.add(Calendar.MONTH, -num);
		return getFirstDayOfMonth(cal.getTime());
	}
	
	/**
	 * 获取给定时间的月首日
	 * @param date
	 * @return
	 * @throws ParseException 
	 */
	public static Date getFirstDayOfMonth(Date date) throws ParseException {
		if (null == date) {
			date = new Date();
		}
		SimpleDateFormat myFormat = new SimpleDateFormat("yyyy-MM-dd");
		String temp = myFormat.format(date);
		Date tempDate = new Date();
		tempDate = myFormat.parse(temp);
		Calendar cal = DateHelper.getCalendar();
		cal.setTime(tempDate);
		cal.set(Calendar.DAY_OF_MONTH, 1);
		return cal.getTime();
	}
	
	/**
	 * 获取当前月的月首日
	 * @return
	 * @throws ParseException
	 */
	public static Date getFirstDayOfCurrentMonth() throws ParseException{
		return getFirstDayOfMonth(new Date());
	}
	
	/**
	 * 获取下个月的月首日
	 * @return
	 * @throws ParseException
	 */
	public static Date getFirstDayOfNextMonth() throws ParseException{
		Calendar cal = DateHelper.getCalendar();
		cal.add(Calendar.MONTH, 1);
		return getFirstDayOfMonth(cal.getTime());
	}
	

	/**
	 * 获取给定时间的前n个月的月末日(不包含给定时间的所在月)
	 * @param date
	 * @return
	 * @throws ParseException 
	 */
	public static Date getLastDayOfPreviousMonth(Date date, int num) throws ParseException {
		if (null == date) {
			date = new Date();
		}
		SimpleDateFormat myFormat = new SimpleDateFormat("yyyy-MM");
		String temp = myFormat.format(date);
		Date tempDate = myFormat.parse(temp);
		Calendar cal = DateHelper.getCalendar();
		cal.setTime(tempDate);;
		cal.add(Calendar.MONTH, -num);;
		return getLastDayOfMonth(cal.getTime());
	}

	/**
	 * 获取给定时间的月末日
	 * @param date
	 * @return
	 * @throws ParseException 
	 */
	public static Date getLastDayOfMonth(Date date) throws ParseException{
		if (null == date) {
			date = new Date();
		}
		Calendar cal = DateHelper.getCalendar();
		cal.setTime(date);
		cal.add(Calendar.MONTH, 1);
		Date newDate = DateHelper.getFirstDayOfMonth(cal.getTime());
		cal.setTime(newDate);
		cal.add(Calendar.MILLISECOND, -1);
		return cal.getTime();
	}

	/**
	 * 获取当前月的月末日
	 * @return
	 * @throws ParseException 
	 */
	public static Date getLastDayOfCurrentMonth() throws ParseException{
		return getLastDayOfMonth(new Date());
	}
	
	/**
	 * 判断两个日期是否是同一个月,如果都是null返回true
	 */
	public static boolean isSameMonth(Date date0, Date date1){
		if (date0 == null || date1 == null) {
			return date0 == date1;
		}
		Calendar calendar1 = getCalendar();
		Calendar calendar2 = getCalendar();
		calendar1.setTime(date0);
		calendar2.setTime(date0);
		if (calendar1.get(Calendar.YEAR) != calendar2.get(Calendar.YEAR)) {
			return false;
		}
		return calendar1.get(Calendar.MONTH) != calendar2.get(Calendar.MONTH);
	}
	
	/**
	 * 当前季度的开始时间，即2012-01-01 00:00:00
	 * 
	 * @return
	 * @throws ParseException 
	 */
	public static Date getCurrentSeasonStartTime() throws ParseException {
		return getSeasonStartTime(new Date());
	}

	/**
	 * 当前季度的结束时间，即2012-03-31 23:59:59
	 * 
	 * @return
	 * @throws ParseException 
	 */
	public static Date getCurrentSeasonEndTime() throws ParseException {
		return getSeasonEndTime(new Date());
	}
	

	/**
	 * 下个季度的开始时间，即2012-01-01 00:00:00
	 * 
	 * @return
	 * @throws ParseException 
	 */
	public static Date getNextSeasonStartTime() throws ParseException {
		// 当前季度的时间
		Calendar cal = DateHelper.getCalendar();
		// 加3个月就是下个季度
		cal.add(Calendar.MONTH, 3);
		return getSeasonStartTime(cal.getTime());
	}

	/**
	 * 下个季度的结束时间，即2012-03-31 23:59:59
	 * 
	 * @return
	 * @throws ParseException 
	 */
	public static Date getNextSeasonEndTime() throws ParseException {
		// 当前季度的时间
		Calendar cal = DateHelper.getCalendar();
		// 加3个月就是下个季度
		cal.add(Calendar.MONTH, 3);
		return getSeasonEndTime(cal.getTime());
	}
	
	/**
	 * 指定时间所在季度的开始时间，即2012-01-01 00:00:00
	 * 
	 * @return
	 * @throws ParseException 
	 */
	public static Date getSeasonStartTime(Date date) throws ParseException {
		if (null == date) {
			date = new Date();
		}
		Calendar c = getCalendar();
		c.setTime(date);
		int month = c.get(Calendar.MONTH);
		if (month >= 0 && month <= 2) {
			c.set(Calendar.MONTH, 0);
		} else if (month >= 3 && month <= 5) {
			c.set(Calendar.MONTH, 3);
		} else if (month >= 6 && month <= 8) {
			c.set(Calendar.MONTH, 6);
		} else if (month >= 9 && month <= 11) {
			c.set(Calendar.MONTH, 9);
		}
		return getFirstDayOfMonth(c.getTime());
	}
	
	/**
	 * 指定时间所在季度的开始时间，即2012-01-01 00:00:00
	 * 
	 * @return
	 * @throws ParseException 
	 */
	public static Date getSeasonStartTime(Integer year, Integer season) throws ParseException {
		Calendar c = getCalendar();
		c.set(Calendar.YEAR, year);
		int month = 0;
		// 根据季度设置季度的开始月
		switch (season) {
		case 1:
			month = 0;
			break;
		case 2:
			month = 3;
			break;
		case 3:
			month = 6;
			break;
		case 4:
			month = 9;
			break;
		default:
			break;
		}
		c.set(Calendar.MONTH, month);
		return getFirstDayOfMonth(c.getTime());
	}
	
	/**
	 * 指定时间所在季度的结束时间，即2012-03-31 23:59:59
	 * 
	 * @return
	 * @throws ParseException 
	 */
	public static Date getSeasonEndTime(Date date) throws ParseException {
		if (null == date) {
			date = new Date();
		}
		Calendar c = getCalendar();
		c.setTime(date);
		int month = c.get(Calendar.MONTH);
		if (month >= 0 && month <= 2) {
			c.set(Calendar.MONTH, 2);
		} else if (month >= 3 && month <= 5) {
			c.set(Calendar.MONTH, 5);
		} else if (month >= 6 && month <= 8) {
			c.set(Calendar.MONTH, 8);
		} else if (month >= 9 && month <= 11) {
			c.set(Calendar.MONTH, 11);
		}
		return getLastDayOfMonth(c.getTime());
	}
	
	/**
	 * 指定时间所在季度的开始时间，即2012-03-31 23:59:59
	 * 
	 * @return
	 * @throws ParseException 
	 */
	public static Date getSeasonEndTime(Integer year, Integer season) throws ParseException {
		Calendar c = getCalendar();
		c.set(Calendar.YEAR, year);
		int month = 0;
		// 根据季度设置季度的开始月
		switch (season) {
		case 1:
			month = 2;
			break;
		case 2:
			month = 5;
			break;
		case 3:
			month = 8;
			break;
		case 4:
			month = 11;
			break;
		default:
			break;
		}
		c.set(Calendar.MONTH, month);
		return getFirstDayOfMonth(c.getTime());
	}
	
	/**
	 * 获取指定时间的前num个季度的开始和结束时间(不包含指定时间所在季度)
	 * @param date
	 * @return
	 * @throws Exception 
	 */
	public static List<Date[]> getPreviousSeasonsStartAndEndTime(Date date, int num) throws Exception{
		if (null == date) {
			date = new Date();
		}
		List<Date[]> list = new ArrayList<Date[]>();
		Calendar c = getCalendar();
		for (int i = num; i > 0; i--) {
			c.setTime(date);
			c.add(Calendar.MONTH, - i * 3);
			Date[] dates = new Date[2];
			// 季度的开始时间
			dates[0] = getSeasonStartTime(c.getTime());
			// 季度的结束时间
			dates[1] = getSeasonEndTime(c.getTime());
			list.add(dates);
		}
		return list;
	}
	
	/** 
	 * 获取给定时间的所在季度
	 * @param date
	 * @return int[0] 年份, int[1] 季度(1,2,3,4)
	 */
	public static int[] getSeasonNumOfDate(Date date){
		if (null == date) {
			date = new Date();
		}
		int[] season = new int[2];
		Calendar c = DateHelper.getCalendar();
		c.setTime(date);
		int year = c.get(Calendar.YEAR);
		season[0] = year;
		int month = c.get(Calendar.MONTH);
		switch(month){
		case 0: 
		case 1:
		case 2:
			season[1] = 1;
			break;
		case 3: 
		case 4:
		case 5:
			season[1] = 2;
			break;
		case 6: 
		case 7:
		case 8:
			season[1] = 3;
			break;	
		case 9: 
		case 10:
		case 11:
			season[1] = 4;
			break;
		}
		return season;
	}
	

	/**
	 * 获取指定时间的前num个季度的年份和季度数(不包含指定时间所在季度)
	 * @param date
	 * @return
	 * @throws Exception 
	 */
	public static List<int[]> getPreviousSeasonsNum(Date date, int num) throws Exception{
		if (null == date) {
			date = new Date();
		}
		List<int[]> list = new ArrayList<int[]>();
		Calendar c = getCalendar();
		for (int i = num; i > 0; i--) {
			c.setTime(date);
			c.add(Calendar.MONTH, - i * 3);
			int[] seasons = getSeasonNumOfDate(c.getTime());
			
			list.add(seasons);
		}
		return list;
	}
	
	/**
	 * 获取给定时间所在年的开始日期
	 * @param date
	 * @return
	 * @throws ParseException 
	 */
	public static Date getFirstDayOfYear(Date date) throws ParseException{
		if (null == date) {
			date = new Date();
		}
		SimpleDateFormat myFormat = new SimpleDateFormat("yyyy");
		String temp = myFormat.format(date);
		Date tempDate = new Date();
		tempDate = myFormat.parse(temp);
		Calendar cal = DateHelper.getCalendar();
		cal.setTime(tempDate);
		return cal.getTime();
	}
	
	/**
	 * 获取当前时间所在年的开始日期
	 * @param date
	 * @return
	 * @throws ParseException 
	 */
	public static Date getFirstDayOfCurrentYear() throws ParseException{
		return getFirstDayOfYear(new Date());
	}
	
	/**
	 * 获取当前时间的下一年的开始日期
	 * @return
	 * @throws ParseException 
	 */
	public static Date getFirstDayOfNextYear() throws ParseException{
		Calendar cal = DateHelper.getCalendar();
		cal.add(Calendar.YEAR, 1);
		return getFirstDayOfYear(cal.getTime());
	}
	
	/**
	 * 获取给定时间所在年的结束日期
	 * @param date
	 * @return
	 * @throws ParseException 
	 */
	public static Date getLastDayOfYear(Date date) throws ParseException{
		if (null == date) {
			date = new Date();
		}
		Calendar cal = DateHelper.getCalendar();
		cal.setTime(date);
		cal.add(Calendar.YEAR, 1);
		Date newDate = getFirstDayOfYear(cal.getTime());
		cal.setTime(newDate);
		cal.add(Calendar.MILLISECOND, -1);
		return cal.getTime();
	}
	
	/**
	 * 获取当前时间所在年的结束日期
	 * @return
	 * @throws ParseException 
	 */
	public static Date getLastDayOfCurrentYear() throws ParseException{
		return getLastDayOfYear(new Date());
	}
	
	/**
	 * 返回指定日期的初始时间(00:00:00 00)
	 */
	public static Date getIniDate(Date date) {
		if (date == null) {
			return null;
		}
		
		return DateHelper.parseIsoDate(DateHelper.formatIsoDate(date));
	}
	
	/**
	 * 获取时间段相隔的天数 date2-date1
	 * @param date1
	 * @param date2
	 * @return
	 */
	public static Long getIntervalDays(Date date1, Date date2) {
		if (date1 == null || date2 == null) {
			return null;
		}
		
		return (DateHelper.getIniDate(date2).getTime() - DateHelper.getIniDate(date1).getTime()) / 1000 / 60 / 60 / 24;
	}
	
	/**
	 * 解析时间
	 * @param dateString 被解析的时间字符串
	 * @param dateFormate 时间格式
	 * @return
	 */
	public static Date parseDate(final String dateString, final String dateFormate) {
		return parseDate(dateString, dateFormate, TimeZone.getDefault());
	}
	
	/**
	 * 解析时间
	 * @param dateString 被解析的时间字符串
	 * @param dateFormate 时间格式
	 * @param timeZone 时区
	 * @return
	 */
	public static Date parseDate(final String dateString, final String dateFormate, final TimeZone timeZone) {
		Date date;
		try {
			final DateFormat df = new SimpleDateFormat(dateFormate);
			df.setTimeZone(timeZone);
			date = df.parse(dateString);
		} catch (final ParseException ex) {
			return null;
		}
		return date;
	}
	
	/**
	 * 格式化时间
	 * @param date 被格式化的时间
	 * @param dateFormate 时间格式
	 * @return
	 */
	public static String formatDate(final Date date, final String dateFormate) {
		return formatDate(date, dateFormate, TimeZone.getDefault());
	}
	
	/**
	 * 格式化时间
	 * @param date 被格式化的时间
	 * @param dateFormate 时间格式
	 * @param timeZone 时区
	 * @return
	 */
	public static String formatDate(final Date date, final String dateFormate, final TimeZone timeZone) {
		String dateString;
		try {
			final DateFormat df = new SimpleDateFormat(dateFormate);
			df.setTimeZone(timeZone);
			dateString = df.format(date);
		} catch (final Exception ex) {
			return null;
		}
		return dateString;
	}
	
	/**
	 * 根据开始月份和结束月份返回时间段内的月份集合
	 * 
	 * @param beginDate
	 * @param endDate
	 * @return List
	 */
	public static List<String> getDatesBetweenTwoDateForMonth(Date beginDate, Date endDate) {
		List<String> lDate = new ArrayList<String>();

		Calendar calBegin = Calendar.getInstance();
		calBegin.setTime(beginDate);
		int yearBegin = calBegin.get(Calendar.YEAR);
		int monthBegin = calBegin.get(Calendar.MONTH) + 1;
		if (monthBegin < 10) {
			lDate.add(String.valueOf(calBegin.get(Calendar.YEAR)) + "-0" + String.valueOf(monthBegin));
		} else {
			lDate.add(String.valueOf(calBegin.get(Calendar.YEAR)) + "-" + String.valueOf(monthBegin));
		}

		Calendar calEnd = Calendar.getInstance();
		calEnd.setTime(endDate);
		int yearEnd = calEnd.get(Calendar.YEAR);
		int monthEnd = calEnd.get(Calendar.MONTH) + 1;

		if (yearBegin == yearEnd && monthBegin == monthEnd) {
			return lDate;
		}
		boolean bContinue = true;
		while (bContinue) {
			calBegin.add(Calendar.MONTH, 1);
			int tmpYear = calBegin.get(Calendar.YEAR);
			int tmpMonth = calBegin.get(Calendar.MONTH) + 1;
			if (tmpYear >= yearEnd && tmpMonth >= monthEnd) {
				break;
			} else {
				if (tmpMonth < 10) {
					lDate.add(String.valueOf(tmpYear) + "-0" + String.valueOf(tmpMonth));
				} else {
					lDate.add(String.valueOf(tmpYear) + "-" + String.valueOf(tmpMonth));
				}
			}
		}
		return lDate;
	}
	/**
	 * 获取当周的日期范围的时间集合
	 * 
	 * @return List
	 */
	public static List<String> getCurrentWeekDateArr() {
		Calendar calNow = Calendar.getInstance();
		while (calNow.get(Calendar.DAY_OF_WEEK) != Calendar.MONDAY) {
			calNow.add(Calendar.DATE, -1);
		}
		List<String> dateArr = new ArrayList<String>();
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
		for (int i = 0; i < 7; i++) {
			dateArr.add(sdf.format(calNow.getTime()));
			calNow.add(Calendar.DATE, 1);
		}
		return dateArr;
	}
	
	/**
	 * 根据开始时间和结束时间返回时间段内的时间集合
	 * 
	 * @param beginDateStr
	 * @param endDateStr
	 * @return List
	 */
	public static List<String> getDatesBetweenTwoDate(String beginDateStr, String endDateStr) {
		String defaultStartDay = null;
		String defaultEndDay = null;
		if (beginDateStr == null || endDateStr == null || "".equals(beginDateStr) || "".equals(endDateStr)) {
			//默认为当月
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
			
			Calendar calNow = Calendar.getInstance();
			calNow.add(Calendar.MONTH, 0);
			calNow.set(Calendar.DAY_OF_MONTH, 1);
			defaultStartDay = sdf.format(calNow.getTime());
			
			calNow.set(Calendar.DAY_OF_MONTH, 
					calNow.getActualMaximum(Calendar.DAY_OF_MONTH));
			defaultEndDay = sdf.format(calNow.getTime());
		} else {
			defaultStartDay = beginDateStr;
			defaultEndDay = endDateStr;
		}
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
		Date startDate = null;
		Date endDate = null;
		List<String> lDate = new ArrayList<String>();
		try {
			startDate = sdf.parse(defaultStartDay);
			endDate = sdf.parse(defaultEndDay);
			lDate.add(defaultStartDay);// 把开始时间加入集合
			Calendar cal = Calendar.getInstance();
			// 使用给定的 Date 设置此 Calendar 的时间
			cal.setTime(startDate);
			boolean bContinue = true;
			while (bContinue) {
				// 根据日历的规则，为给定的日历字段添加或减去指定的时间量
				cal.add(Calendar.DAY_OF_MONTH, 1);
				// 测试此日期是否在指定日期之后
				if (endDate.after(cal.getTime())) {
					lDate.add(sdf.format(cal.getTime()));
				} else {
					break;
				}
			}
			if (endDate.after(startDate)) {
				lDate.add(sdf.format(endDate));// 把结束时间加入集合
			}
		} catch (ParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		return lDate;
	}
}
