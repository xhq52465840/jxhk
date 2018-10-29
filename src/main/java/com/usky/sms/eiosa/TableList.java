package com.usky.sms.eiosa;

import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;

public class TableList {
public TableList(){}
  
  public TableList(JRBeanCollectionDataSource tableList,String role,String type) {  
  
     
	   
	    this.tableList=tableList;
	    this.role=role;
	    this.type=type;
  } 
  
 
  private JRBeanCollectionDataSource tableList;
  private String role;
  private String type;
  
  
  public JRBeanCollectionDataSource getTableList() {
	return tableList;
}

public void setTableList(JRBeanCollectionDataSource tableList) {
	this.tableList = tableList;
}

public String getRole() {
	return role;
}

public void setRole(String role) {
	this.role = role;
}

public String getType() {
	return type;
}

public void setType(String type) {
	this.type = type;
}



}
