
package com.usky.sms.common;

/**
 * Date formats.
 */
public enum DateFormatType {
	
	/**
	 * "dd.MM.", "MM/dd", "dd/MM", ...
	 */
	DATE_WITHOUT_YEAR,
	/**
	 * yyyy or yy depends on defaultDateFormat. "dd.MM.yy(yy)", "MM/dd/yy(yy)",
	 * "dd/MM/yy(yy)", ...
	 */
	DATE,
	/**
	 * E, DATE
	 */
	DATE_WITH_DAY_NAME,
	/**
	 * "dd.MM.yy", "MM/dd/yy", "dd/MM/yy", ... For Excel: "DD.MM.YY",
	 * "MM/DD/YY", "DD/MM/YY", ...
	 */
	DATE_SHORT,
	/**
	 * DATE_SHORT + HH:mm:ss
	 */
	TIMESTAMP_SHORT_SECONDS,
	/**
	 * DATE_SHORT + HH:mm
	 */
	TIMESTAMP_SHORT_MINUTES,
	/**
	 * DATE + "HH:mm:ss.SSS"
	 */
	TIMESTAMP_MILLIS,
	/**
	 * DATE + "HH:mm:ss"
	 */
	TIMESTAMP_SECONDS,
	/**
	 * DATE + "HH:mm"
	 */
	TIMESTAMP_MINUTES,
	/**
	 * "HH:mm:ss"
	 */
	TIME_OF_DAY_SECONDS,
	/**
	 * "HH:mm"
	 */
	TIME_OF_DAY_MINUTES,
	/**
	 * yyyy-MM-dd
	 */
	ISO_DATE,
	/**
	 * yyyy-MM-dd HH:mm:ss.SSS
	 */
	ISO_TIMESTAMP_MILLIS,
	/**
	 * yyyy-MM-dd HH:mm:ss
	 */
	ISO_TIMESTAMP_SECONDS,
	/**
	 * yyyy-MM-dd HH:mm:ss
	 */
	ISO_TIMESTAMP_MINUTES,
	/**
	 * EE
	 */
	DAY_OF_WEEK_SHORT;
	
}
