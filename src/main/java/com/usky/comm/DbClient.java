package com.usky.comm;

import java.sql.Clob;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
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

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.sql.DataSource;

public class DbClient {
	public String ContextName = "";	//context.xml的name值
	public String ErrorMessage = "";
	public Connection _conn = null;
	public ClientType ConnectType = ClientType.Unknown;
	protected String ClientTypeName = "";
	public Log log = null;
	
	public enum ClientType{
		Unknown,Oracle,MySQL
	}
	
	public DbClient(String name){
		ContextName = name;
	}
	
	public DbClient(){
		
	}
	
	public Connection GetConnection() {
		return _conn;
	}
	
	protected void WriteLog() {
		WriteLog(ErrorMessage);
	}
	
	protected void WriteLog(String msg) {
		if (log == null)
			return;
		log.WriteLine(msg);
	}
	
	protected void WriteLog(Exception e) {
		if (log == null || e == null)
			return;
		log.Write(e);
	}
	
	public String GetType() {
		return ClientTypeName;
	}
	
	public boolean Open()
	{
		return Open(ContextName);
	}
	
	public void SetConnectType(ClientType ct) {
		ConnectType = ct;
	}
	
	protected boolean SetConnectType() {
		try {
			if (_conn == null || _conn.isClosed()) {
				ErrorMessage = "SetConnectType failed: No Connection";
				return false;
			}
			DatabaseMetaData dmd = _conn.getMetaData();
			ClientTypeName = dmd.getDatabaseProductName();
			if ("Oracle".equals(dmd.getDatabaseProductName()))
				ConnectType = ClientType.Oracle;
			else if ("MySQL".equals(dmd.getDatabaseProductName())) {
				SetAutoCommit(false);
				ConnectType = ClientType.MySQL;
			}
			else
				ConnectType = ClientType.Unknown;
			//System.out.println("Connection = " + dmd.getDriverName() + " " + dmd.getDatabaseProductName());	//Oracle JDBC driver Oracle MySQL-AB JDBC Driver MySQL
			return true;
		}
		catch (Exception e) {
			ErrorMessage = "SetConnect failed: " + Utility.GetExceptionMsg(e);
			WriteLog(e);
			return false;
		}
	}
	
	public boolean Open(Connection conn) {
		_conn = conn;
		try {
			if (_conn == null || _conn.isClosed()) {
				ErrorMessage = "Open failed: No Connection";
				return false;
			}
		}
		catch(Exception e) {
			ErrorMessage = "Open failed: " + Utility.GetExceptionMsg(e);
			WriteLog(e);
			return false;
		}
		
		return SetConnectType();
	}
	
	public synchronized boolean Open(String ctx_name){
		try {
			Context ctx = new InitialContext();
			ContextName = ctx_name;
			DataSource ds = (DataSource) ctx
					.lookup(ContextName);
			_conn = ds.getConnection();
			if (_conn.isClosed()) {
				ErrorMessage = "从连接池获取的数据库连接已关闭";
				return false;
			}
			if (!SetConnectType())
				return false;
		} catch (NamingException e) {
			ErrorMessage = "Open fail: fail to get context " + ContextName + " " + Utility.GetExceptionMsg(e);
			WriteLog(e);
			//System.out.println(ErrorMessage);
			//e.printStackTrace();
			return false;
		} catch (SQLException e) {
			ErrorMessage = "Open fail: " + Utility.GetExceptionMsg(e);
			WriteLog(e);
			//System.out.println(ErrorMessage);
			//e.printStackTrace();
			return false;
		} catch (Exception e) {
			ErrorMessage = "Open fail: " + Utility.GetExceptionMsg(e);
			WriteLog(e);
			//System.out.println(ErrorMessage);
			//e.printStackTrace();
			return false;
		}
		
		return true;
	}
	
	public boolean Close(){
		try{
			if (_conn != null && !_conn.isClosed()){
				if (!_conn.getAutoCommit())
					_conn.rollback();
				_conn.close();
				return true;
			}
			return true;
		} catch (Exception e){
			ErrorMessage = "Close failed: " + Utility.GetExceptionMsg(e);
			WriteLog(e);
			//System.out.println(ErrorMessage);
			//e.printStackTrace();
			return false;
		}
	}
	
	/**
	 * 关闭资源
	 * @param rs
	 * @param ps
	 * @param conn
	 */
	public void close(ResultSet rs, Statement ps, Connection conn) {
		if (rs != null) {
			try {
				rs.close();
			} catch (SQLException e) {
				e.printStackTrace();
				ErrorMessage = "Close resultset failed: " + Utility.GetExceptionMsg(e);
				WriteLog(e);
			}
		}
		if (ps != null) {
			try {
				ps.close();
			} catch (SQLException e) {
				e.printStackTrace();
				ErrorMessage = "Close statement failed: " + Utility.GetExceptionMsg(e);
				WriteLog(e);
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
			ErrorMessage = "Close connection failed: " + Utility.GetExceptionMsg(e);
			WriteLog(e);
		}
	}
	
//	protected void finalize(){
//		Close();
//		
//		try {
//			super.finalize();
//		} catch (Throwable e) {
//			e.printStackTrace();
//		}
//	}
	
	public boolean IsOpen() throws Exception{
		return _conn != null && !_conn.isClosed();
	}
	
	public boolean IsOracle(){
		return ClientType.Oracle == ConnectType;
	}
	
	public boolean IsMySQL(){
		return ClientType.MySQL == ConnectType;
	}
	
	public boolean SetAutoCommit(boolean b) throws Exception{
		if (IsOpen()){
			try {
				_conn.setAutoCommit(b);
				return true;
			} catch (Exception e) {
				ErrorMessage = "SetAutoCommit failed: " + Utility.GetExceptionMsg(e);
				//e.printStackTrace();
				WriteLog(e);
				return false;
			}
		}
		else{
			ErrorMessage = "SetAutoCommit failed: No Connection";
			WriteLog();
			return false;
		}
	}
	
	public boolean GetAutocommit() throws Exception{
		if (IsOpen())
			return _conn.getAutoCommit();
		else
			return false;
	}
	
	public boolean IsBeginTrans() throws Exception {
		return IsOpen() && !_conn.getAutoCommit();
	}
	
	public boolean BeginTrans() throws Exception{
		if (!IsOpen()){
			ErrorMessage = "BeginTrans failed: No Connection";
			WriteLog();
			return false;
		}
		try {
			_conn.setAutoCommit(false);
		} catch (Exception e) {
			ErrorMessage = "BegainTrans failed: " + Utility.GetExceptionMsg(e);
			//e.printStackTrace();
			WriteLog(e);
			return false;
		}
		
		return true;
	}
	
	public boolean Commit() throws Exception{
		if (!IsOpen()){
			ErrorMessage = "Commit failed: No Connection";
			WriteLog(new Exception(ErrorMessage));
			WriteLog();
			return false;
		}
		try {
			if (!IsBeginTrans())
				return true;
			_conn.commit();
			_conn.setAutoCommit(false);
		} catch (Exception e) {
			ErrorMessage = "Commit failed: " + Utility.GetExceptionMsg(e);
			//e.printStackTrace();
			WriteLog(e);
			return false;
		}
		
		return true;
	}

	public boolean Rollback() throws Exception{
		if (!IsOpen()){
			ErrorMessage = "Rollback failed: No Connection";
			WriteLog();
			return false;
		}
		try {
			if (!IsBeginTrans())
				return true;
			_conn.rollback();
			_conn.setAutoCommit(false);
		} catch (Exception e) {
			ErrorMessage = "Rollback failed: " + Utility.GetExceptionMsg(e);
			//e.printStackTrace();
			WriteLog(e);
			
			return false;
		}
		
		return true;
	}
	
	public int Execute(String sql) throws Exception{
		if (!IsOpen() && !Open()){
			ErrorMessage = "Execute failed: No connection";
			WriteLog();
			return -1;
		}
		
		try {
			Statement stmt = _conn.createStatement();
			int ect = stmt.executeUpdate(sql);
			stmt.close();
			
			return ect;
		} catch (Exception e) {
			ErrorMessage = sql + "\n" + Utility.GetExceptionMsg(e);
			//e.printStackTrace();
			WriteLog(e);
			return -1;
		}
	}
	
	public boolean UpdateClob(ResultSet rs, String clob_col, String clob_value) throws Exception{
		if (!IsOpen() && !Open()){
			ErrorMessage = "UpdateClob failed: No connection";
			WriteLog();
			return false;
		}
		
		if (!IsOracle()) {
			ErrorMessage = "UpdateClob只支持Oracle数据库";
			WriteLog();
			return false;
		}
		
		try {
			boolean bCommit = false;
			if (!IsBeginTrans()) {
				BeginTrans();
				bCommit = true;
			}
			
			Clob clob = rs.getClob(clob_col);
			clob.setString(1, clob_value);
			if (bCommit)
				Commit();
			
			return true;
		} catch (Exception e) {
			ErrorMessage = Utility.GetExceptionMsg(e);
			WriteLog(e);
			return false;
		}
	}

	/**
	 * 执行SQL语句查询
	 * @param sql 要执行的SQL
	 * @return 结果集
	 * @throws Exception
	 * @deprecated 此方法会导致Statement和ResultSet等资源未关闭
	 * @see {@link com.usky.comm.DbClient.executeQuery}
	 */
	public ResultSet ExecuteQuery(String sql) throws Exception{
		if (!IsOpen() && !Open()){
			ErrorMessage = "ExecuteQuery failed: No connection";
			WriteLog();
			return null;
		}
		
		try {
			Statement stmt = _conn.createStatement();
			if (stmt == null) {
				ErrorMessage = "_conn.createStatement返回空";
				return null;
			}
			ResultSet rs = stmt.executeQuery(sql);
//			stmt.close();

			return rs;
		} catch (Exception e) {
			ErrorMessage = sql + "\n" + Utility.GetExceptionMsg(e);
			//e.printStackTrace();
			WriteLog(e);
			return null;
		}
	}
	
	/** 
	 * 执行查询语句返回结果集map的list
	 * @param sql SQL语句
	 * @param objs 参数
	 * @return
	 */
	public List<Map<String, Object>> executeQuery(String sql, Object... objs) {
		PreparedStatement ps = null;
		ResultSet rs = null;
		List<Map<String, Object>> resultList = new ArrayList<Map<String, Object>>();
		try {
			if (!IsOpen() && !Open()) {
				ErrorMessage = "ExecuteQuery failed: No connection";
				WriteLog();
				return null;
			}

			ps = _conn.prepareStatement(sql);
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

						String columnName = rm.getColumnLabel(i + 1);
						int columnType = rm.getColumnType(i + 1);
						if (null == rs.getObject(i + 1)) {
							tempMap.put(columnName, null);
						} else if (Types.VARCHAR == columnType) {
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
						} else if (Types.CLOB == columnType) {
							tempMap.put(columnName, rs.getClob(i + 1));
						} else {
							tempMap.put(columnName, rs.getObject(i + 1) + "");
						}
					}
					resultList.add(tempMap);
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
			ErrorMessage = sql + "\n" + Utility.GetExceptionMsg(e);
			WriteLog(e);
		} finally {
			close(rs, ps, null);
		}
		return resultList;
	}

	public String GetSysdate() {
		switch (ConnectType) {
		case Oracle:
			return "sysdate";
		case MySQL:
			return "now()";
		default:
			return "sysdate_undefined";
		}
	}

	public String String2Date(String s) {
		switch (ConnectType) {
		case Oracle:
			return "to_date('" + s + "','yyyy-mm-dd hh24:mi:ss')";
		case MySQL:
			return "str_to_date('" + s + "','%Y-%m-%d %k:%i:%s')";
		default:
			return "String2Date_undefined";
		}
	}

	public String Date2String(String s) {
		switch (ConnectType) {
		case Oracle:
			return "to_char(" + s + ",'yyyy-mm-dd hh24:mi:ss')";
		case MySQL:
			return "date_to_str(" + s + "','%Y-%m-%d %k:%i:%s')";
		default:
			return "Date2String_undefined";
		}
	}

	public String TimeSecondDiff(String date1, String date2) { // date1 > date2
		switch (ConnectType) {
		case Oracle:
			return "timestampdiff(second," + date2 + "," + date1 + ")";
		case MySQL:
			return "round((" + date1 + " - " + date2 + ") * 86400),0";
		default:
			return "TimeSecondDiff_undefined";
		}
	}

	public String IntervalSeconds(long seconds) {
		switch (ConnectType) {
		case Oracle:
			return "sysdate " + (seconds >= 0 ? "+" : "-")
					+ String.valueOf(Math.round(Math.abs(seconds) / 86400.0 * 100) / 100.0);
		case MySQL:
			return "now() " + (seconds >= 0 ? "" : "-") + " interval " + String.valueOf(Math.abs(seconds)) + " second";
		default:
			return "IntervalSeconds_undefined";
		}
	}

	public String GetPageSql(String sql, String order, String page_no, String page_size) {
		switch (ConnectType) {
		case Oracle: {
			if (!sql.toUpperCase().startsWith("SELECT "))
				return sql;

			int no = 0;
			int size = 0;

			try {
				no = Integer.parseInt(page_no);
				size = Integer.parseInt(page_size);
			} catch (Exception e) {
				return sql;
			}

			sql = "select * from (" + sql.substring(0, 7) + "row_number() over(order by " + order + ") row_number,"
					+ sql.substring(7) + " order by " + order + ") where row_number between "
					+ String.valueOf((no - 1) * size + 1) + " and " + String.valueOf(no * size);

			return sql;
		}
		case MySQL: {
			if (!sql.toUpperCase().startsWith("SELECT "))
				return sql;

			int no = 0;
			int size = 0;

			try {
				no = Integer.parseInt(page_no);
				size = Integer.parseInt(page_size);
			} catch (Exception e) {
				return sql;
			}

			sql += " order by " + order;
			sql += " limit " + String.valueOf((no - 1) * size) + "," + page_size;

			return sql;
		}
		default:
			return "GetPageSql_undefined";
		}
	}

	public String GetTotal(String sql) {
		try {
			switch (ConnectType) {
			case Oracle: {
//				sql = "select count(*) total from (" + sql + ")";
//				ResultSet rs = ExecuteQuery(sql);
				sql = "select count(*) total from (" + sql + ")";
				List<Map<String, Object>> rs = this.executeQuery(sql);
				if (rs == null)
					return "";
				if (rs.isEmpty()) {
					ErrorMessage = sql;
					WriteLog();
					return "";
				}
				return String.valueOf(rs.get(0).get("TOTAL"));
			}
			case MySQL: {
//				sql = "select count(*) total from (" + sql + ") total_table";
//				ResultSet rs = ExecuteQuery(sql);
				sql = "select count(*) total from (" + sql + ") total_table";
				List<Map<String, Object>> rs = this.executeQuery(sql);
				if (rs == null)
					return "";
				if (rs.isEmpty()) {
					ErrorMessage = sql;
					WriteLog();
					return "";
				}
				return String.valueOf(rs.get(0).get("TOTAL"));
			}
			default:
				ErrorMessage = "GetTotal_undefined";
				WriteLog();
				return "";
			}
		} catch (Exception e) {
			ErrorMessage = sql + "\n" + e.getMessage();
			WriteLog(e);
			return "";
		}
	}

	public String GetSeqNextValue(String name) {
		switch (ConnectType) {
		case Oracle:
			return name + ".nextval";
		case MySQL:
			return "0";
		default:
			return "GetSeqNextValue_undefined";
		}
	}

	public String FormatString(String s) {
		if (s == null)
			return "";
		switch (ConnectType) {
		case Oracle:
			return s.replace("'", "''");
		case MySQL:
			return s.replace("'", "''").replace("\\", "\\\\");
		default:
			return "Format_undefined";
		}
	}

	public String GetSequence(String name) {
		try {
			switch (ConnectType) {
			case Oracle: {
//				String sql = "select to_char(" + name + ".currval) from dual";
//				ResultSet rs = ExecuteQuery(sql);
				String sql = "select to_char(" + name + ".currval) as CURRVAL from dual";
				List<Map<String, Object>> rs = this.executeQuery(sql);
				if (rs == null)
					return "";
				if (rs.isEmpty()) {
					ErrorMessage = "内部错误：" + sql + " 没有返回数据";
					WriteLog();
					return "";
				}
				return (String) rs.get(0).get("CURRVAL");
			}
			case MySQL: {
				String sql = "select @@identity";
				ResultSet rs = ExecuteQuery(sql);
				if (rs == null)
					return "";
				if (!rs.next()) {
					ErrorMessage = "内部错误：select@@identity没有返回数据";
					WriteLog();
					return "";
				}
				return rs.getObject(1).toString();
			}
			default:
				ErrorMessage = "GetSequence_undefined";
				WriteLog();
				return "";
			}
		} catch (Exception e) {
			ErrorMessage = Utility.GetExceptionMsg(e);
			WriteLog(e);
			return "";
		}
	}
}
