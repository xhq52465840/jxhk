package com.usky.sms.flightmovementinfo;

import java.util.ArrayList;

public class AirPortContent {
	

	private String id;
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}

	private String name;
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	

	private String bureauId;
	public String getBureauId() {
		return bureauId;
	}
	public void setBureauId(String bureauId) {
		this.bureauId = bureauId;
	}
	

	private String airportCode;
	public String getAirportCode() {
		return airportCode;
	}
	public void setAirportCode(String airportCode) {
		this.airportCode = airportCode;
	}
	

	private  String airportRuleFile;
	public String getAirportRuleFile() {
		return airportRuleFile;
	}
	public void setAirportRuleFile(String airportRuleFile) {
		this.airportRuleFile = airportRuleFile;
	}
	

	private ArrayList<AirPortChart> chartList;
	public ArrayList<AirPortChart> getChartList() {
		return chartList;
	}
	public void setChartList(ArrayList<AirPortChart> chartList) {
		this.chartList = chartList;
	}

	public AirPortContent() {
		super();
		// TODO Auto-generated constructor stub
	}
	

	public AirPortContent(String id, String name, String bureauId,
			String airportCode, ArrayList<AirPortChart> chartList) {
		super();
		this.id = id;
		this.name = name;
		this.bureauId = bureauId;
		this.airportCode = airportCode;
		this.chartList=chartList;
	}

}
