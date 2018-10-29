
package com.usky.sms.common;

public enum DatePrecision {
	
	MILLISECOND,
	/** Milliseconds will be set to zero (default). */
	SECOND,
	/** Milliseconds and seconds will be set to zero. */
	MINUTE,
	/**
	 * Milliseconds and seconds will be set to zero, minutes to 0, 15, 30 or 45.
	 */
	MINUTE_15,
	/** Milliseconds, seconds and minutes will be set to zero. */
	HOUR_OF_DAY,
	/** Milliseconds, seconds, minutes and hours will be set to zero. */
	DAY;
	
}
