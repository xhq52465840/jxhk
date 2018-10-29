package com.usky.sms.activity;

public class ImportProgress {
	/** 总是 */
	private int total;

	/** 已被处理数 */
	private int processed;

	/** 信息 */
	private String message;

	/**
	 * @return the total
	 */
	public int getTotal() {
		return total;
	}

	/**
	 * @param total the total to set
	 */
	public void setTotal(int total) {
		this.total = total;
	}

	/**
	 * @return the processed
	 */
	public int getProcessed() {
		return processed;
	}

	/**
	 * @param processed the processed to set
	 */
	public void setProcessed(int processed) {
		this.processed = processed;
	}

	/**
	 * @return the message
	 */
	public String getMessage() {
		return message;
	}

	/**
	 * @param message the message to set
	 */
	public void setMessage(String message) {
		this.message = message;
	}
}
