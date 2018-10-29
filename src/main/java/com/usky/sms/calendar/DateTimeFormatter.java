
package com.usky.sms.calendar;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;

import com.usky.sms.common.DateFormatType;
import com.usky.sms.common.DateFormats;
import com.usky.sms.common.DateHelper;

public class DateTimeFormatter {
	
	private static DateTimeFormatter instance = new DateTimeFormatter();
	
	public static final DateTimeFormatter instance() {
		return instance;
	}
	
	/** Used by getPrettyFormattedDuration */
	public static final int DEFAULT_HOURS_OF_DAY = 8;
	
	/** Used by getPrettyFormattedDuration */
	public static final int DEFAULT_MIN_HOURS4DAY_SEPARATION = 24;
	
	/**
	 * @param date
	 * @return Return the as two digits formatted week of year. If given date is
	 *         null then "" is returned.
	 * @see DateHelper#getWeekOfYear(Date)
	 */
	public static String formatWeekOfYear(final Date date) {
		if (date == null) {
			return "";
		}
		final int weekOfYear = DateHelper.getWeekOfYear(date);
		return weekOfYear < 10 ? "0" + weekOfYear : String.valueOf(weekOfYear);
	}
	
	private int durationOfWorkingDay = 8;
	
	/**
	 * Uses patternKey SHORT_DATE_FORMAT
	 * 
	 * @param dateTime
	 * @see #getFormattedDateTime(Object, String, Locale, TimeZone)
	 */
	public String getFormattedDate(final Object date) {
		return getFormattedDate(date, Locale.getDefault(), TimeZone.getDefault());
	}
	
	/**
	 * Uses patternKey SHORT_DATE_FORMAT
	 * 
	 * @param dateTime
	 * @see #getFormattedDateTime(Object, String)
	 */
	public String getFormattedDate(final Object date, final Locale locale, final TimeZone timeZone) {
		return getFormattedDate(date, DateFormats.getFormatString(DateFormatType.DATE), locale, timeZone);
	}
	
	/**
	 * Gets the formatted date (without time of day) with the context user's
	 * time zone and the internationalized pattern.
	 * 
	 * @param date
	 * @param patternKey i18n key of the pattern
	 */
	public String getFormattedDate(final Object date, final String pattern) {
		return getFormattedDate(date, pattern, Locale.getDefault(), TimeZone.getDefault());
	}
	
	/**
	 * Gets the formatted date (without time of day) with the context user's
	 * time zone and the internationalized pattern.
	 * 
	 * @param date
	 * @param patternKey i18n key of the pattern
	 */
	public String getFormattedDate(final Object date, final String pattern, final Locale locale, final TimeZone timeZone) {
		if (date == null) {
			return "";
		}
		final DateFormat format = locale != null ? new SimpleDateFormat(pattern, locale) : new SimpleDateFormat(pattern);
		if (timeZone != null) {
			format.setTimeZone(timeZone);
		}
		return format.format(date);
	}
	
	/**
	 * Uses patternKey SHORT_TIMESTAMP_FORMAT_WITH_MINUTES
	 * 
	 * @param dateTime
	 * @see #getFormattedDateTime(Date, String)
	 */
	public String getFormattedDateTime(final Date dateTime) {
		return getFormattedDateTime(dateTime, DateFormats.getFormatString(DateFormatType.TIMESTAMP_SHORT_MINUTES));
	}
	
	/**
	 * Uses patternKey SHORT_TIMESTAMP_FORMAT_WITH_MINUTES
	 * 
	 * @param dateTime
	 * @see #getFormattedDateTime(Date, String)
	 */
	public String getFormattedDateTime(final Date dateTime, final Locale locale, final TimeZone timeZone) {
		return getFormattedDateTime(dateTime, DateFormats.getFormatString(DateFormatType.TIMESTAMP_SHORT_MINUTES), Locale.getDefault(), TimeZone.getDefault());
	}
	
	/**
	 * Gets the formatted time stamp with the context user's time zone and the
	 * internationalized pattern.
	 * 
	 * @param dateTime
	 * @param patternKey i18n key of the pattern
	 */
	public String getFormattedDateTime(final Date dateTime, final String pattern) {
		return getFormattedDateTime(dateTime, pattern, Locale.getDefault(), TimeZone.getDefault());
	}
	
	/**
	 * Gets the formatted time stamp with the context user's time zone and the
	 * internationalized pattern.
	 * 
	 * @param dateTime
	 * @param patternKey i18n key of the pattern
	 */
	public String getFormattedDateTime(final Date dateTime, final String pattern, final Locale locale, final TimeZone timeZone) {
		if (dateTime == null) {
			return "";
		}
		final DateFormat format = locale != null ? new SimpleDateFormat(pattern, locale) : new SimpleDateFormat(pattern);
		if (timeZone != null) {
			format.setTimeZone(TimeZone.getDefault());
		}
		return format.format(dateTime);
	}
	
	/**
	 * Uses patternKey TIMEOFDAY_FORMAT
	 * 
	 * @param dateTime
	 * @see #getFormattedTime(Date, String)
	 */
	public String getFormattedTime(final Date time) {
		return getFormattedTime(time, DateFormats.getFormatString(DateFormatType.TIME_OF_DAY_MINUTES));
	}
	
	/**
	 * Gets the formatted time of day with the context user's time zone and the
	 * internationalized pattern.
	 * 
	 * @param time
	 * @param patternKey i18n key of the pattern
	 */
	public String getFormattedTime(final Date time, final String pattern) {
		if (time == null) {
			return "";
		}
		final DateFormat format = new SimpleDateFormat(pattern, Locale.getDefault());
		format.setTimeZone(TimeZone.getDefault());
		return format.format(time);
	}
	
	public String getFormattedDuration(final TimePeriod timePeriod) {
		return getFormattedDuration(timePeriod.getDuration());
	}
	
	/**
	 * Calls getFormattedDuration with hoursOfDay = this.durationOfWorkingDay
	 * and minHours4DaySeparation = 24.
	 * 
	 * @param millis
	 * @return
	 * @see #getFormattedDuration(long, int, int)
	 */
	public String getFormattedDuration(final long millis) {
		return getFormattedDuration(millis, durationOfWorkingDay, 24);
	}
	
	/**
	 * Calls getPrettyFormattedDuration with DEFAULT_HOURS_OF_DAY and
	 * DEFAULT_MIN_HOURS4DAY_SEPARATION.
	 * 
	 * @param millis
	 * @return
	 * @see #getPrettyFormattedDuration(long, int, int)
	 */
	public String getPrettyFormattedDuration(final long millis) {
		return getPrettyFormattedDuration(millis, DEFAULT_HOURS_OF_DAY, DEFAULT_MIN_HOURS4DAY_SEPARATION);
	}
	
	/**
	 * Examples: 12d 1:00h (97:00h), 9:00h
	 * 
	 * @param millis
	 * @param hoursOfDay
	 * @param minHours4DaySeparation
	 * @return
	 */
	public String getPrettyFormattedDuration(final long millis, final int hoursOfDay, final int minHours4DaySeparation) {
		final StringBuffer buf = new StringBuffer();
		final String str1 = getFormattedDuration(millis, hoursOfDay, minHours4DaySeparation);
		final String str2 = getFormattedDuration(millis, hoursOfDay, -1);
		buf.append(str1);
		if (str1.equals(str2) == false) {
			buf.append(" (").append(str2).append(")");
		}
		return buf.toString();
	}
	
	/**
	 * Examples of output (localized units): 9:00h, 12d 1:00h
	 * 
	 * @param millis
	 * @param hoursOfDay
	 * @param minHours4DaySeparation
	 * @return
	 */
	public String getFormattedDuration(final long millis, final int hoursOfDay, final int minHours4DaySeparation) {
		final int[] fields = TimePeriod.getDurationFields(millis, hoursOfDay, minHours4DaySeparation);
		final StringBuffer buf = new StringBuffer();
		if (fields[0] > 0) { // days
			buf.append(fields[0]).append("d").append(" ");
		}
		buf.append(fields[1]).append(":"); // hours
		formatNumber(buf, fields[2]); // minutes
		buf.append("h");
		return buf.toString();
	}
	
	private void formatNumber(final StringBuffer buf, final long number) {
		if (number < 10) {
			buf.append("0");
		}
		buf.append(number);
	}
	
	/**
	 * Set the default duration of working day (8 at default).
	 * 
	 * @param durationOfWorkingDay
	 */
	public void setDurationOfWorkingDay(final int durationOfWorkingDay) {
		this.durationOfWorkingDay = durationOfWorkingDay;
	}
	
	public int getDurationOfWorkingDay() {
		return durationOfWorkingDay;
	}
	
}
