package com.usky.sms.common;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Types;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class DataFormat {

	public List<Map<String, Object>> executeQueryNoConn(String sql, Connection conn,Object... objs) {
		PreparedStatement ps = null;
		ResultSet rs = null;
		List<Map<String, Object>> resultList = new ArrayList<Map<String, Object>>();
		try {			
			ps = conn.prepareStatement(sql);
			if (objs != null) {
				for (int i = 0; i < objs.length; i++) {
					ps.setObject(i + 1, objs[i]);
				}
			}
			rs = ps.executeQuery();
			if (rs != null) {
				ResultSetMetaData rm = rs.getMetaData();
				while (rs.next()) {
					HashMap<String, Object> tempMap = new HashMap<String, Object>();
					for (int i = 0; i < rm.getColumnCount(); i++) {

						String columnName = rm.getColumnName(i + 1);
						int columnType = rm.getColumnType(i + 1);
						if (Types.VARCHAR == columnType) {
							tempMap.put(columnName, rs.getString(i + 1));
						} else if (Types.SMALLINT == columnType) {
							tempMap.put(columnName, rs.getShort(i + 1));
						} else if (Types.INTEGER == columnType) {
							tempMap.put(columnName, rs.getInt(i + 1));
						} else if (Types.FLOAT == columnType) {
							tempMap.put(columnName, rs.getFloat(i + 1));
						} else if (Types.DOUBLE == columnType) {
							tempMap.put(columnName, rs.getDouble(i + 1));
						} else if (Types.TIMESTAMP == columnType) {
							tempMap.put(columnName, rs.getTimestamp(i + 1));
						} else if (Types.DATE == columnType) {
							tempMap.put(columnName, rs.getDate(i + 1));
						} else {
							tempMap.put(columnName, rs.getObject(i + 1) + "");
						}
					}
					resultList.add(tempMap);
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			close(rs, ps, null);
		}
		return resultList;
	}
	
	public void close(ResultSet rs, Statement ps, Connection conn) {
		if (rs != null) {
			try {
				rs.close();
			} catch (SQLException e) {
				e.printStackTrace();
			}
		}
		if (ps != null) {
			try {
				ps.close();
			} catch (SQLException e) {
				e.printStackTrace();
			}
		}
		try {
			if (conn != null && !conn.isClosed()) {
				if (!conn.getAutoCommit()) {
					conn.rollback();
					conn.close();
				}
			}
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}
}
