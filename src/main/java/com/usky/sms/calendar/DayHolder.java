
package com.usky.sms.calendar;

import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.TimeZone;

import com.usky.sms.common.DateHelper;
import com.usky.sms.common.DateHolder;
import com.usky.sms.common.DatePrecision;

public class DayHolder extends DateHolder {
	
	private static final long serialVersionUID = 2646871164508930568L;
	
	/** I18n keys of the day names (e. g. needed for I18n). */
	public static final String DAY_KEYS[] = new String[] { "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday" };
	
	private Map<String, Object> objects;
	
	private boolean marker = false;
	
	public static String getDayKey(final int dayOfWeek) {
		return DAY_KEYS[dayOfWeek - 1];
	}
	
	/**
	 * Initializes with current day (with time zone UTC!).
	 */
	public DayHolder() {
		super(DatePrecision.DAY);
	}
	
	/**
	 * @param date
	 */
	public DayHolder(final Date date) {
		super(date, DatePrecision.DAY);
	}
	
	public DayHolder(final Date date, final TimeZone timeZone, final Locale locale) {
		super(date, DatePrecision.DAY, timeZone, locale);
	}
	
	public DayHolder(final DateHolder dateHolder) {
		this.calendar = (Calendar) dateHolder.getCalendar().clone();
		setPrecision(DatePrecision.DAY);
	}
	
	/**
	 * Multipurpose marker, e. g. used by select date for marking days as days
	 * not from the current month.
	 * 
	 * @return
	 */
	public boolean isMarker() {
		return marker;
	}
	
	public DayHolder setMarker(final boolean marker) {
		this.marker = marker;
		return this;
	}
	
	public String getDayKey() {
		return getDayKey(getDayOfWeek());
	}
	
	public boolean isToday() {
		return isSameDay(new Date());
	}
	
	public boolean isSunday() {
		return Calendar.SUNDAY == getDayOfWeek();
	}
	
	public boolean isWeekend() {
		int dayOfWeek = getDayOfWeek();
		return Calendar.SUNDAY == dayOfWeek || Calendar.SATURDAY == dayOfWeek;
	}
	
	/** Does not set end of day as DateHolder. */
	@Override
	public DayHolder setEndOfWeek() {
		calendar.set(Calendar.DAY_OF_WEEK, calendar.getFirstDayOfWeek() + 6);
		return this;
	}
	
	/** Does not set end of day as DateHolder. */
	@Override
	public DayHolder setEndOfMonth() {
		int day = calendar.getActualMaximum(Calendar.DAY_OF_MONTH);
		calendar.set(Calendar.DAY_OF_MONTH, day);
		return this;
	}
	
	/**
	 * @return The time in millis for the day represented by this object but
	 *         with current time of day (now).
	 * @see DateHelper#getCalendar()
	 */
	public long getMillisForCurrentTimeOfDay() {
		Calendar cal = (Calendar) calendar.clone();
		cal.set(Calendar.YEAR, this.getYear());
		cal.set(Calendar.MONTH, this.getMonth());
		cal.set(Calendar.DAY_OF_MONTH, this.getDayOfMonth());
		return cal.getTimeInMillis();
	}
	
	@Override
	public String toString() {
		return isoFormat();
	}
	
	public String isoFormat() {
		return DateHelper.formatIsoDate(getDate());
	}
	
	/**
	 * For storing additional objects to a day. This is used by the date
	 * selector for showing the user's timesheets at this day.
	 * 
	 * @param obj
	 */
	public DayHolder addObject(final String key, final Object value) {
		if (this.objects == null) {
			this.objects = new HashMap<String, Object>();
		}
		this.objects.put(key, value);
		return this;
	}
	
	/**
	 * Used for getting e. g. the user time sheets at this day for showing the
	 * calendar in ical like format.
	 * 
	 * @return the stored objects to this day or null, if not exist.
	 */
	public Object getObject(final String key) {
		if (this.objects == null) {
			return null;
		}
		return this.objects.get(key);
	}
	
	public Map<String, Object> getObjects() {
		return this.objects;
	}
}
