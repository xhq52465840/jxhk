package com.usky.sms.eiosa;

public enum DocumentsFieldEnum {
	
	ADDNEWDOCUMENT("addNewDocument","文件库中新加一本书"),
	UPDATEDOCUMENT("updateDocument","修改书"),
	ISARPADDNEWCUMENT("isarpAddNewDocument","该Isarp新增一本书"),
	ISARPADDCHAPTER("addChapter","新增章节"),
	ISARPUPDATECHAPTER("updateChapter","修改章节"),
	UPDATEREVIEWED("updateReviewed","修改reviewed"),
	UPDATEACRONYMS("updateAcronyms","修改acronyms"),
	UPDATEVERSIONNO("updateVersionno","修改versionno"),
	UPDATETYPE("updateType","修改Type"),
	UPDATEDATE("updateDate","修改date"),
	DELETEISARPDOCUMENT("deleteIsarpDocument","该Isarp删除一本书"),
	DELETEDOCUMENT("deleteDocument","书库中删除一本书"),
	ADDSECTIONDOCUMENTLINK("addSectionDocumentLink","添加关联"),
	DELETESECTIONDOCUMENTLINK("deleteSectionDocumentLink","删除关联");
	
	
	private String key;
	private String value;
	
	private DocumentsFieldEnum(String key,String value){
		this.key=key;
		this.value=value;
	}
	public static DocumentsFieldEnum getEnumByVal(String val)throws Exception {
		for (DocumentsFieldEnum each : values()) {
            if (String.valueOf(each.getKey()).equals(val.toLowerCase())) {
                return each;
            }
        }
		
		return null;
	}
	
	public static String getValueByVal(String val) throws Exception {
		DocumentsFieldEnum e = getEnumByVal(val);
		return e==null? null : e.getValue();
	}
	public String getKey() {
		return key;
	}
	public void setKey(String key) {
		this.key = key;
	}
	public String getValue() {
		return value;
	}
	public void setValue(String value) {
		this.value = value;
	}
	

}
