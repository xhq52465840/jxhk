package com.usky.comm;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.lang.reflect.Method;
import java.net.URL;
import java.net.URLClassLoader;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import oracle.sql.CLOB;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicNameValuePair;

import com.usky.sms.core.SMSException;

public class Utility {
	public static String GetNowStr(){
		return (new SimpleDateFormat("yyyy-MM-dd HH:mm:ss")).format(new java.util.Date());
	}
	
	public static boolean IsEmpty(String s) {
		return s == null || s.isEmpty();
	}
	
	@SuppressWarnings("rawtypes")
	public static boolean IsEmpty(Map h, String field) {
		return h == null || !h.containsKey(field) || h.get(field) == null || h.get(field).toString().isEmpty();
	}
	
	@SuppressWarnings("rawtypes")
	public static boolean HasField(Map h, String field) {
		return h != null && h.containsKey(field) && h.get(field) != null;
	}
	
	@SuppressWarnings({ "rawtypes", "unchecked" })
	public static boolean HasField(Map h, String field, Class c) {
		return HasField(h,field) && (h.get(field).getClass() == c || c.isAssignableFrom(h.get(field).getClass()));
	}
	
	@SuppressWarnings("rawtypes")
	public static Object GetFields(Map h, String fields) {
		Map m = h;
		String[] sa = fields.split("\\.");
		for (int i = 0; i < fields.length() - 1; i++) {
			String field = sa[i];
			m = GetMapField(m, field);
			if (m == null)
				return null;
		}
		
		return GetField(m, sa[sa.length - 1]);
	}
	
	@SuppressWarnings("rawtypes")
	public static Object GetField(Map h, String field) {
		if (!HasField(h, field))
			return null;
		
		return h.get(field);
	}
	
	@SuppressWarnings("rawtypes")
	public static Object GetField(Map h, String field, Class c) {
		if (!HasField(h, field, c))
			return null;
		
		return h.get(field);
	}
	
	@SuppressWarnings("rawtypes")
	public static ArrayList GetArrayListField(Map h, String field) {
		if (!HasField(h, field, ArrayList.class))
			return null;
		return (ArrayList)h.get(field);
	}
	
	@SuppressWarnings("rawtypes")
	public static String GetStringField(Map h, String field) {
		if (!HasField(h, field, String.class) && !HasField(h, field, Number.class))
			return null;
		return h.get(field).toString();
	}
	
	@SuppressWarnings("rawtypes")
	public static Map GetMapField(Map h, String field) {
		if (!HasField(h, field, Map.class))
			return null;
		return (Map)h.get(field);
	}
	
	public static String GetNotNullString(String s) {
		return IsEmpty(s) ? "" : s;
	}
	
	public static String GetExceptionMsg(Exception e) {
		//return (e.toString() + " " + Utility.GetNotNullString(e.getMessage())).trim();
		return e.getMessage() == null ? e.toString() : e.getMessage();
	}
	
	public static String codeToString(String s) throws UnsupportedEncodingException {
		if (IsEmpty(s))
			return s;
		
		//return new String(s.getBytes("ISO_8859-1"), "UTF-8");
		return s;
	}
	
	public static String NowStrMs() {
		return NowStr("yyyy-MM-dd HH:mm:ss.SSS");
	}
	
	public static String NowStr() {
		return NowStr("yyyy-MM-dd HH:mm:ss");
	}
	
	public static String NowStr(String fmt) {
		return (new SimpleDateFormat(fmt)).format(new java.util.Date());
	}
	
	@SuppressWarnings("rawtypes")
	public static ArrayList ResultSetToList(ResultSet rs) throws Exception {
		if (rs == null)
			return null;
		
		ArrayList<HashMap> al = new ArrayList<HashMap>();
		//ResultSetMetaData rsmd = rs.getMetaData();
		while (rs.next())
			al.add(ResultSetToHashMap(rs));
		
		return al;
	}
	
	public static HashMap<String, Object> ResultSetToHashMap(ResultSet rs) throws Exception {
		return ResultSetToHashMap(rs, new LinkedHashMap<String, Object>());
	}
	
	public static HashMap<String, Object> ResultSetToHashMap(ResultSet rs, HashMap<String, Object> hm) throws Exception {
		ResultSetMetaData rsmd = rs.getMetaData();

		for (int i=1; i <= rsmd.getColumnCount(); i++) {
			//if (rs.getObject(i) != null)
			//	hm.put("Class" + i, rs.getObject(i).getClass().getName());
			if (rs.getObject(i) == null)
				hm.put(rsmd.getColumnLabel(i).toLowerCase(), rs.getObject(i));
			else if (rs.getObject(i).getClass() == java.sql.Timestamp.class)
				hm.put(rsmd.getColumnLabel(i).toLowerCase(), (new SimpleDateFormat("yyyy-MM-dd HH:mm:ss")).format(rs.getTimestamp(i)));
			else if (rsmd.getColumnTypeName(i).startsWith("oracle.sql.CLOB") || rs.getObject(i).getClass() == CLOB.class) {
				java.sql.Clob c = rs.getClob(i);
				//System.out.println(c.getSubString(1, (int)c.length()));
				if (c == null)
					hm.put(rsmd.getColumnLabel(i).toLowerCase(), null);
				else
					hm.put(rsmd.getColumnLabel(i).toLowerCase(), c.getSubString(1, (int)c.length()));
			}
			else {
				//System.out.println(rsmd.getColumnTypeName(i));
				hm.put(rsmd.getColumnLabel(i).toLowerCase(), rs.getObject(i));
				//hm.put(rsmd.getColumnName(i).toLowerCase(), rs.getObject(i).getClass().getName());
				//hm.put(rsmd.getColumnName(i).toLowerCase(), rs.getObject(i).toString());
			}
		}

		return hm;
	}
	
	/**
	 * 格式化查询的结果
	 * @param rs
	 * @param hm
	 * @return
	 * @throws Exception
	 */
	public static List<Map<String, Object>> formatResultMaps(List<Map<String, Object>> resultMaps) throws Exception {
		if (resultMaps == null) {
			return null;
		}
		List<Map<String, Object>> al = new ArrayList<Map<String, Object>>();
		for (Map<String, Object> map : resultMaps) {
			al.add(formatResultMap(map));
		}
		return al;
	}
	
	/**
	 * 格式化查询的结果
	 * @param rs
	 * @return
	 * @throws Exception
	 */
	public static Map<String, Object> formatResultMap(Map<String, Object> rs) throws Exception {
		return formatResultMap(rs, new LinkedHashMap<String, Object>());
	}
	
	/**
	 * 格式化查询的结果
	 * @param rs
	 * @param hm
	 * @return
	 * @throws Exception
	 */
	public static Map<String, Object> formatResultMap(Map<String, Object> rs, Map<String, Object> hm) throws Exception {
		
		for (String key : rs.keySet()) {
			if (rs.get(key) == null) {
				hm.put(key.toLowerCase(), rs.get(key));
			} else if (rs.get(key).getClass() == java.sql.Timestamp.class) {
				hm.put(key.toLowerCase(), (new SimpleDateFormat("yyyy-MM-dd HH:mm:ss")).format(rs.get(key)));
			} else if (rs.get(key).getClass() == CLOB.class) {
				java.sql.Clob c = (java.sql.Clob) rs.get(key);
				if (c == null)
					hm.put(key.toLowerCase(), null);
				else
					hm.put(key.toLowerCase(), c.getSubString(1, (int)c.length()));
			} else {
				hm.put(key.toLowerCase(), rs.get(key));
			}
		}
		
		return hm;
	}

	@SuppressWarnings("rawtypes")
	public static Object CallStaticFunc(String jar_name, String class_name, String func_name, Class[] argu_class, Object[] argu_value) throws Exception {
		return CallFunc(jar_name, class_name, func_name, argu_class, argu_value, true);
	}
	
	@SuppressWarnings("rawtypes")
	public static Object CallFunc(String jar_name, String class_name, String func_name, Class[] argu_class, Object[] argu_value) throws Exception {
		return CallFunc(jar_name, class_name, func_name, argu_class, argu_value, false);
	}
	
	//http://www.oschina.net/code/snippet_220184_8607
	@SuppressWarnings({ "rawtypes", "unchecked" })
	public static Object CallFunc(String jar_name, String class_name, String func_name, Class[] argu_class, Object[] argu_value, boolean b_static) throws Exception {
    	if (class_name.indexOf(".") < 0)
    		class_name = "com.usky.function." + class_name;
    	String cls_name = (Utility.IsEmpty(jar_name) ? "" : jar_name + ":") + class_name;
    	
    	Class cls;
    	try {
	    	if (!Utility.IsEmpty(jar_name)) {
				File f = new File(jar_name);
				URL u = f.toURI().toURL();
				URLClassLoader cl = new URLClassLoader(new URL[]{u});
					cls = cl.loadClass(class_name);
	    	}
	    	else 
				cls = Class.forName(class_name);
    	}
		catch (ClassNotFoundException e) {
			throw new Exception("类[" + cls_name + "]不存在");
		}

    	Method m;
    	try {
    		m = cls.getMethod(func_name, argu_class);
    	}
    	catch (NoSuchMethodException e) {
    		throw new Exception("类[" + cls_name + "]中没有功能[" + func_name + "]");
    	}
    	
    	Object o_result = null;
    	try {
    		Object inst = null;
    		if (!b_static)
    			inst = cls.newInstance();
    		o_result = m.invoke(inst, argu_value);
    	}
    	catch (Exception e) {
    		e.printStackTrace();
    		String msg = cls_name + "." + func_name + "执行异常：" + Utility.GetExceptionMsg(e);
    		Throwable t = e.getCause();
    		if (t != null) 
    			msg += " 原因：" + t.getMessage();
    		throw new Exception(msg);
    	}

    	return o_result;
	}
	
	public static String GetHtml(String url) throws Exception {
		URL u = new URL(url);
		BufferedReader br = new BufferedReader(new InputStreamReader(u.openStream(), "UTF-8"));
		String s = "";
		StringBuffer sb = new StringBuffer("");
		while ((s = br.readLine()) != null)
			sb.append(s + "\r\n");
		br.close();
		return sb.toString();
	}
	
	/**
	 * 查询solr<br>
	 * start或rows为null时，默认检索10条数据<br>
	 * @param fields 返回的字段列表，如果为空返回所有字段
	 */
	public static Map<String, Object> SolrQuery(String url, String q, String fq, String start, String rows, String sorts, List<String> fields, Map<String, String> otherOptions) throws Exception {
		//Config config = new ConfigService().getConfig();
		DefaultHttpClient httpClient = new DefaultHttpClient();
		List<NameValuePair> nvps = new ArrayList<NameValuePair>();
		nvps.add(new BasicNameValuePair("stream.contentType", "text/json;charset=utf-8"));
		nvps.add(new BasicNameValuePair("wt", "json"));
		if (!Utility.IsEmpty(q)) {
			nvps.add(new BasicNameValuePair("q", q));
		}
		if (otherOptions != null) {
			for (Entry<String, String> entry : otherOptions.entrySet()) {
				nvps.add(new BasicNameValuePair(entry.getKey(), entry.getValue()));
			}
		}
		if (!Utility.IsEmpty(fq)) {
			nvps.add(new BasicNameValuePair("fq", fq));
		}
		if (!Utility.IsEmpty(start))
			nvps.add(new BasicNameValuePair("start", start));
		if (!Utility.IsEmpty(rows))
			nvps.add(new BasicNameValuePair("rows", rows));
		if (!Utility.IsEmpty(sorts))
			nvps.add(new BasicNameValuePair("sort", sorts));
		// 返回的字段
		if (null != fields && !fields.isEmpty()) {
			for (String field : fields) {
				nvps.add(new BasicNameValuePair("fl", field));
			}
		}
		HttpPost httpPost = new HttpPost(url);
		httpPost.setEntity(new UrlEncodedFormEntity(nvps, "UTF-8"));
		HttpResponse response = httpClient.execute(httpPost);
		
		try {
			HttpEntity entity = response.getEntity();
			InputStream instream = entity.getContent();
			try {
				BufferedReader reader = new BufferedReader(new InputStreamReader(instream, "UTF-8"));
				StringBuilder builder = new StringBuilder();
				String line = "";
				while ((line = reader.readLine()) != null) {
					builder.append(line);
					builder.append("\n");
				}
				@SuppressWarnings("unchecked")
				Map<String, Object> result = (Map<String, Object>) JsonUtil.getGson().fromJson(builder.toString(), Object.class);
				@SuppressWarnings("unchecked")
				Map<String, Object> header = (Map<String, Object>) result.get("responseHeader");
				Double status = (Double) header.get("status");
				if (status != 0) {
					@SuppressWarnings("unchecked")
					Map<String, Object> error = (Map<String, Object>) result.get("error");
					throw new SMSException(error.get("code").toString(), "[Solr]" + (String) error.get("msg"));
				} else {
					return result;
				}
			} catch (IOException ex) {
				throw ex;
			} catch (RuntimeException ex) {
				httpPost.abort();
				throw ex;
			} finally {
				try {
					instream.close();
				} catch (Exception ignore) {
				}
			}
		} finally {
			httpPost.releaseConnection();
		}
		
	}
	
	@SuppressWarnings("restriction")
	public static String pwdEncode(byte[] bstr){ 
		return new sun.misc.BASE64Encoder().encode(bstr); 
	} 
	
	@SuppressWarnings("restriction")
	public static byte[] pwdDecode(String str){ 
		byte[] bt = null; 
		try { 
			sun.misc.BASE64Decoder decoder = new sun.misc.BASE64Decoder(); 
			bt = decoder.decodeBuffer( str ); 
		} catch (IOException e) { 
			e.printStackTrace(); 
		} 
		return bt; 
	}
}
