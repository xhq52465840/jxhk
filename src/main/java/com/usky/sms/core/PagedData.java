package com.usky.sms.core;

import java.util.List;

public class PagedData {
	
	private List<?> data;
	
	/**
	 * 总条数
	 */
	private int totalCount;
	
	/**
	 * 总页数
	 */
	private int pageCount;
	
	/**
	 * 每页大小
	 */
	private int pageSize;
	
	/**
	 * 当前第几页
	 */
	private int currPage;

	public List<?> getData() {
		return data;
	}

	public void setData(List<?> data) {
		this.data = data;
	}

	public int getTotalCount() {
		return totalCount;
	}

	public void setTotalCount(int totalCount) {
		this.totalCount = totalCount;
	}

	public int getPageCount() {
		return pageCount;
	}

	public void setPageCount(int pageCount) {
		this.pageCount = pageCount;
	}

	public int getPageSize() {
		return pageSize;
	}

	public void setPageSize(int pageSize) {
		this.pageSize = pageSize;
	}

	public int getCurrPage() {
		return currPage;
	}

	public void setCurrPage(int currPage) {
		this.currPage = currPage;
	}
	
}
