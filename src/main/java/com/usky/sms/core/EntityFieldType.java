
package com.usky.sms.core;

public enum EntityFieldType {
	
	STRING("string"), INT("int"), DOUBLE("double"), TEXT("text"), DATE("date"), TIME("time"), DATETIME("datetime"), ENUM("enum"), TREE("tree"), LIST("list");
	
	EntityFieldType(String type) {
	}
	
	public static EntityFieldType getType(String name) {
		if ("string".equals(name)) {
			return STRING;
		} else if ("int".equals(name)) {
			return INT;
		} else if ("double".equals(name)) {
			return DOUBLE;
		} else if ("text".equals(name)) {
			return TEXT;
		} else if ("date".equals(name)) {
			return DATE;
		} else if ("time".equals(name)) {
			return TIME;
		} else if ("datetime".equals(name)) {
			return DATETIME;
		} else if ("enum".equals(name)) {
			return ENUM;
		} else if ("tree".equals(name)) {
			return TREE;
		} else if ("list".equals(name)) {
			return LIST;
		} else {
			throw new UnsupportedOperationException("Unknown EntityFieldType: '" + name + "'");
		}
	}
	
}
