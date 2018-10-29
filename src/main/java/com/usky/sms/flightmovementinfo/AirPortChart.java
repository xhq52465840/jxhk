package com.usky.sms.flightmovementinfo;

public class AirPortChart {

	public AirPortChart() {
		super();
		// TODO Auto-generated constructor stub
	}
	

	public AirPortChart(String chartType, String filePath, String chartName) {
		super();
		this.chartType = chartType;
		this.filePath = filePath;
		this.chartName = chartName;
	}
	

	private String chartType;
	public String getChartType() {
		return chartType;
	}
	public void setChartType(String chartType) {
		this.chartType = chartType;
	}
	

	private String filePath;
	public String getFilePath() {
		return filePath;
	}
	public void setFilePath(String filePath) {
		this.filePath = filePath;
	}
	
	
	private String chartName;
	public String getChartName() {
		return chartName;
	}
	public void setChartName(String chartName) {
		this.chartName = chartName;
	}
	
}
