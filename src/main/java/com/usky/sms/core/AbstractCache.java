
package com.usky.sms.core;

public abstract class AbstractCache {
	
	private static final org.apache.log4j.Logger log = org.apache.log4j.Logger.getLogger(AbstractCache.class);
	
	public static final long TICKS_PER_SECOND = 1000;
	
	public static final long TICKS_PER_MINUTE = TICKS_PER_SECOND * 60;
	
	public static final long TICKS_PER_HOUR = TICKS_PER_MINUTE * 60;
	
	protected long expireTime = 60 * TICKS_PER_MINUTE;
	
	private transient long timeOfLastRefresh = -1;
	
	private transient boolean isExpired = true;
	
	private transient boolean refreshInProgress = false;
	
	protected AbstractCache() {
	}
	
	protected AbstractCache(final long expireTime) {
		this.expireTime = expireTime;
	}
	
	public void setExpireTimeInMinutes(long expireTime) {
		this.expireTime = expireTime * TICKS_PER_MINUTE;
	}
	
	public void setExpireTimeInSeconds(long expireTime) {
		this.expireTime = expireTime * TICKS_PER_SECOND;
	}
	
	public void setExpireTimeInHours(long expireTime) {
		this.expireTime = expireTime * TICKS_PER_HOUR;
	}
	
	/**
	 * Cache will be refreshed before next use.
	 */
	public void setExpired() {
		this.isExpired = true;
	}
	
	/**
	 * Sets the cache to expired and calls checkRefresh, which forces refresh.
	 */
	public void forceReload() {
		setExpired();
		checkRefresh();
	}
	
	/**
	 * Checks the expire time and calls refresh, if cache is expired.
	 */
	protected synchronized void checkRefresh() {
		if (refreshInProgress == true) {
			// Do nothing because refreshing is already in progress.
			return;
		}
		if (this.isExpired == true || System.currentTimeMillis() - this.timeOfLastRefresh > this.expireTime) {
			try {
				refreshInProgress = true;
				this.timeOfLastRefresh = System.currentTimeMillis();
				try {
					this.refresh();
				} catch (Throwable ex) {
					log.error(ex.getMessage(), ex);
				}
				this.isExpired = false;
			} finally {
				refreshInProgress = false;
			}
		}
	}
	
	/**
	 * Please implement this method refreshing the stored object _data. Do not
	 * forget to call checkRefresh in your cache methods.
	 * 
	 * @see #checkRefresh()
	 */
	protected abstract void refresh();
	
}
