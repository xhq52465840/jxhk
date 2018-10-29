
package com.usky.sms.service;

import java.sql.Connection;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import com.google.gson.reflect.TypeToken;
import com.usky.comm.DbClient;
import com.usky.comm.Utility;
import com.usky.sms.accessinformation.AccessInformationDao;
import com.usky.sms.accessinformation.FlightInfoEntityDao;
import com.usky.sms.activity.ActivityDO;
import com.usky.sms.activity.ActivityDao;
import com.usky.sms.common.DateHelper;
import com.usky.sms.common.PageHelper;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.common.StringHelper;
import com.usky.sms.config.Config;
import com.usky.sms.config.ConfigService;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.IAttachment;
import com.usky.sms.core.SMSException;
import com.usky.sms.custom.CustomFieldValueDao;
import com.usky.sms.eventanalysis.EventAnalysisDao;
import com.usky.sms.field.EnumCommonField;
import com.usky.sms.field.FieldRegister;
import com.usky.sms.file.FileDO;
import com.usky.sms.label.LabelDao;
import com.usky.sms.permission.PermissionSetDao;
import com.usky.sms.permission.PermissionSets;
import com.usky.sms.processor.ProcessorDao;
import com.usky.sms.search.template.ISearchTemplate;
import com.usky.sms.search.template.SearchTemplateRegister;
import com.usky.sms.tem.TemDao;
import com.usky.sms.temptable.TempTableDao;
import com.usky.sms.unit.UnitDO;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserType;

public class QueryService extends AbstractService {
	
	private static final Logger log = Logger.getLogger(QueryService.class);
	
	public static final SMSException NO_ATTACHMENTS = new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "该对象无附件功能！");
	
	public static final SMSException MISSING_PARAMETERS = new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "缺少参数！");
	
	@Autowired
	private FieldRegister fieldRegister;
	
	@Autowired
	private PermissionSetDao permissionSetDao;
	
	@Autowired
	private LabelDao labelDao;
	
	@Autowired
	private ProcessorDao processorDao;
	
	@Autowired
	private AccessInformationDao accessInformationDao;
	
	@Autowired
	private FlightInfoEntityDao flightInfoEntityDao;
	
	@Autowired
	private EventAnalysisDao eventAnalysisDao;
	
	@Autowired
	private TemDao temDao;
	
	@Autowired
	private ActivityDao activityDao;
	
	@Autowired
	private CustomFieldValueDao customFieldValueDao;
	
	@Autowired
	private TempTableDao tempTableDao;
	
	@Transactional(readOnly = true)
	@Override
	public void doDefault(HttpServletRequest request, HttpServletResponse response) {
		try {
			Object result = getResult(request, response);
			ResponseHelper.output(response, result);
		} catch (SMSException e) {
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	private Object getResult(HttpServletRequest request, HttpServletResponse response) throws Exception {
		String method = request.getParameter("method");
		Object data;
		if ("stdcomponent.getbysearch".equals(method)) {
			data = getList(request);
		} else if ("stdcomponent.getbysearchex".equals(method)) {
			data = getListEx(request);
		} else if ("stdcomponent.getbyid".equals(method)) {
			data = getById(request);
		} else if ("stdcomponent.getbyids".equals(method)) {
			data = getByIds(request);
		} else if ("echo".equals(method)) {
			data = null;
		} else {
			throw SMSException.UNRECOGNIZED_REQUEST;
		}
		Map<String, Object> result = new HashMap<String, Object>();
		result.put("success", true);
		result.put("data", data);
		return result;
	}
	
	private Object getList(HttpServletRequest request) throws Exception {
		switch (getDataObjectType(request)) {
			case DATABASE:
			case SOLR:
				return getListFromDatabase(request);
			case ATTACHMENT:
				return getAttachments(request);
			default:
				throw SMSException.UNKNOWN_EXCEPTION;
		}
	}
	
	private Object getListEx(HttpServletRequest request) throws Exception {
		String query = request.getParameter("query");
		String core = request.getParameter("core");
		if (Utility.IsEmpty(core)) throw new Exception("缺少core参数");
		String start = request.getParameter("start");
		if (Utility.IsEmpty(start)) start = "0";
		String length = request.getParameter("length");
		if (Utility.IsEmpty(length)) length = "10";
		String fl = request.getParameter("fl");
		String sort = request.getParameter("sort");
		String search = request.getParameter("search");
		List<Map<String, Object>> columns = gson.fromJson(request.getParameter("columns"), new TypeToken<List<Map<String, Object>>>() {}.getType());
		// 查询时是否需要权限控制
		boolean isNeedPermission = request.getParameter("isNeedPermission") == null ? true : Boolean.valueOf(request.getParameter("isNeedPermission"));
		
		return getResultByParams(UserContext.getUserId().toString(), query, core, start, length, fl, sort, search, columns, isNeedPermission);
	}
	
	public Map<String, Object> getActivityIdsByParams(String currentUserId, String query, String core, String start, String length, String sort, String search, boolean isNeedPermission) throws Exception {
		Map<String, Object> map = new HashMap<String, Object>();
		String solrUql = this.getSolrUql(currentUserId, query, search, isNeedPermission);
		// 查询solr只返回id
		List<String> fields = new ArrayList<String>();
		fields.add("id");
		Config config = new ConfigService().getConfig();
		String url = config.getSolr() + "/activity/select";
		sort = this.getSort(sort);
		Map<String, Object> m_solr = Utility.SolrQuery(url, solrUql, null, start, length, sort, fields, null);
		if (!Utility.HasField(m_solr, "response", Map.class)) {
			map.put("m_solr", m_solr);
			return map;
		}
		Map m_response = (Map) m_solr.get("response");
		map.put("m_response", m_response);
		if (!Utility.HasField(m_response, "docs", List.class)) {
			return map;
		}
		List list_docs = (List) m_response.get("docs");
		
		List<String> list_ids = new ArrayList<String>();
		for (Object o_doc : list_docs) {
			if (o_doc == null || !Map.class.isAssignableFrom(o_doc.getClass())) continue;
			Map<String, Object> m_doc = (Map<String, Object>) o_doc;
			String id = Utility.GetStringField(m_doc, "id");
			if (Utility.IsEmpty(id)) continue;
			list_ids.add(id);
		}
		map.put("ids", list_ids);
		return map;
	}
	
	public String getSolrUql(String currentUserId, String query, String search, boolean isNeedPermission) throws Exception {
		String uql = this.getUql(query, search);
		// 对当前用户的处理
		String solr_uql = uql.replace("currentUser()", currentUserId);
		// 对当前季度的处理("["表示包括，"}"表示不包括,大于等于当前季度的开始时间，小于下个季度的开始时间)
		if (solr_uql.contains("currentSeason()")) {
			String solrCurrentSeason = "[ " + DateHelper.formatStandardDate(DateHelper.getCurrentSeasonStartTime()) + "Z TO " + DateHelper.formatStandardDate(DateHelper.getNextSeasonStartTime()) + "Z }";
			solr_uql = solr_uql.replace("currentSeason()", solrCurrentSeason);
		}
		// 对当前月的处理
		if (solr_uql.contains("currentMonth()")) {
			String solrCurrentMonth = "[ " + DateHelper.formatStandardDate(DateHelper.getFirstDayOfCurrentMonth()) + "Z TO " + DateHelper.formatStandardDate(DateHelper.getFirstDayOfNextMonth()) + "Z }";
			solr_uql = solr_uql.replace("currentMonth()", solrCurrentMonth);
		}
		// 对上月的处理
		if (solr_uql.contains("prevMonth()")) {
			String solrPreMonth = "[ " + DateHelper.formatStandardDate(DateHelper.getFirstDayOfPreviousMonth(new Date(), 1)) + "Z TO " + DateHelper.formatStandardDate(DateHelper.getFirstDayOfCurrentMonth()) + "Z }";
			solr_uql = solr_uql.replace("prevMonth()", solrPreMonth);
		}
		// 对当前年的处理
		if (solr_uql.contains("currentYear()")) {
			String solrCurrentYear = "[ " + DateHelper.formatStandardDate(DateHelper.getFirstDayOfCurrentYear()) + "Z TO " + DateHelper.formatStandardDate(DateHelper.getFirstDayOfNextYear()) + "Z }";
			solr_uql = solr_uql.replace("currentYear()", solrCurrentYear);
		}
		// 对前12个月的处理(包括当前月)
		if (solr_uql.contains("last12Months()")) {
			String last12Months = "[ " + DateHelper.formatStandardDate(DateHelper.getFirstDayOfPreviousMonth(new Date(), 11)) + "Z TO " + DateHelper.formatStandardDate(DateHelper.getFirstDayOfNextMonth()) + "Z }";
			solr_uql = solr_uql.replace("last12Months()", last12Months);
		}
		
		// 是否要进行权限判断
		if (isNeedPermission) {
			solr_uql += getPermissionUql(Integer.parseInt(currentUserId));
		}
		// 检索时默认检索未删除的数据
		solr_uql += " AND deleted_string:\"false\"";
		return solr_uql;
	}
	
	@Transactional(readOnly = true)
	@SuppressWarnings("unchecked")
	public Map<String, Object> getResultByParams(String currentUserId, String query, String core, String start, String length, String fl, String sort, String search, List<Map<String, Object>> columns, boolean isNeedPermission) throws Exception {
		Map<String, Object> map = getActivityIdsByParams(currentUserId, query, core, start, length, sort, search, isNeedPermission);
		
		if (map.containsKey("m_solr")) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, map.get("m_solr").toString());
		}
		
		if (!map.containsKey("ids")) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, map.get("m_response").toString());
		}
		
		List<String> list_ids = (List<String>) map.get("ids");
		if (list_ids == null || list_ids.isEmpty()) {
			return null;
		}
		
		String s_ids = StringUtils.join(list_ids, ",");
		List<Integer> activityIds = StringHelper.converStringListToIntegerList(list_ids);
		// activityIds过多，有超过1000个的情况，故使用临时表
		try {
			tempTableDao.insertIds(activityIds);
		} catch (Exception e) {
			e.printStackTrace();
		}
		List<Map<String, Object>> list_activity = activityDao.convert((List<ActivityDO>) activityDao.query("from ActivityDO t where t.deleted = false and t.id in (select id from TempTableDO) order by locate(" + s_ids + ", t.id)"));
		
		// 显示的列
		Set<String> displayColumnKeys = new HashSet<>();
		if (columns != null) {
			for (Map<String, Object> clumn : columns) {
				displayColumnKeys.add(clumn.get("data").toString());
			}
		}
		// 自定义字段
		Map<Integer, Map<String, Object>> m_custom = customFieldValueDao.findByActivityIdsThroughTempTable();
		// 标签
		Map<String, Object> labels = labelDao.getLabelsThroughTempTable();
		// 处理人
		Map<String, Object> processorUserMap = processorDao.getProcessorUserMapsThroughTempTable();
		// 发生时间
		Map<String, Object> occurredDateMap = accessInformationDao.getOccurredDateMapsThroughTempTable();
		
		// 航班信息 航班号
		Map<String, Object> flightInfoMaps = null;
		boolean displayFlightInfo = this.isDisplayFlightInfo(displayColumnKeys);
		if (displayFlightInfo) {
			flightInfoMaps = flightInfoEntityDao.getFlightInfoMapsByActivityIds(displayColumnKeys);
		}
		
		// tem信息
		Map<String, Object> temInfoMaps = null;
		boolean displayTemInfo = this.isDisplayTemInfo(displayColumnKeys);
		if (displayTemInfo) {
			temInfoMaps = temDao.getTemInfoMapsThroughTempTable();
		}
		// 事件分析信息
		Map<String, Object> eventAnalysisInfoMaps = null;
		boolean displayEventAnalysisInfo = this.isDisplayEventAnalysisInfo(displayColumnKeys);
		if (displayEventAnalysisInfo) {
			eventAnalysisInfoMaps = eventAnalysisDao.getEventAnalysisInfoMapsThroughTempTable();
		}
		for (Map<String, Object> m_activity : list_activity) {
			String activityId = m_activity.get("id").toString();
			if (m_custom != null && m_custom.containsKey(m_activity.get("id"))) {
				m_activity.putAll(m_custom.get(m_activity.get("id")));
			}
			m_activity.put("label", labels.get(activityId) == null ? "" : labels.get(activityId));
			m_activity.put("processors", processorUserMap.get(activityId) == null ? "" : processorUserMap.get(activityId));
			m_activity.put("occurredDate", occurredDateMap.get(activityId) == null ? "" : occurredDateMap.get(activityId));
			if (displayFlightInfo && null != flightInfoMaps.get(activityId)) {
				m_activity.putAll((Map<String, Object>) flightInfoMaps.get(activityId));
			}
			if (displayTemInfo && null != temInfoMaps.get(activityId)) {
				m_activity.putAll((Map<String, Object>) temInfoMaps.get(activityId));
			}
			if (displayEventAnalysisInfo && null != eventAnalysisInfoMaps.get(activityId)) {
				m_activity.putAll((Map<String, Object>) eventAnalysisInfoMaps.get(activityId));
			}
		}
		List<Map<String, Object>> list_result = new ArrayList<Map<String, Object>>();
		
		ID: for (String idString : list_ids) {
			for (Map<String, Object> m_result : list_activity) {
				if (!idString.equals(m_result.get("id").toString())) continue;
				if (!Utility.IsEmpty(fl)) {
					Map<String, Object> m_doc = new LinkedHashMap<String, Object>();
					for (Map.Entry<String, Object> entry : m_result.entrySet()) {
						if (("," + fl + ",").indexOf("," + entry.getKey() + ",") >= 0) m_doc.put(entry.getKey(), entry.getValue());
					}
					list_result.add(m_doc);
				} else {
					list_result.add(m_result);
				}
				list_activity.remove(m_result);
				continue ID;
			}
		}
		
		Map<String, Object> m_result = new LinkedHashMap<String, Object>();
		m_result.put("iTotalDisplayRecord", length);
		m_result.put("iTotalRecords", Utility.GetField((Map<String, Object>) map.get("m_response"), "numFound"));
		m_result.put("aaData", list_result);
		
		return m_result;
	}
	
	/**
	 * 是否显示航班信息
	 * @param displayColumnKeys
	 */
	private boolean isDisplayFlightInfo(Set<String> displayColumnKeys) {
		List<String> flightInfoKeys = EnumCommonField.getKeyByGroup("flightInfo");
		return !Collections.disjoint(flightInfoKeys, displayColumnKeys);
	}
	
	/**
	 * 是否显示tem信息
	 * @param displayColumnKeys
	 */
	private boolean isDisplayTemInfo(Set<String> displayColumnKeys) {
		List<String> temInfoKeys = EnumCommonField.getKeyByGroup("tem");
		return !Collections.disjoint(temInfoKeys, displayColumnKeys);
	}
	
	/**
	 * 是否显示事件分析信息
	 * @param displayColumnKeys
	 */
	private boolean isDisplayEventAnalysisInfo(Set<String> displayColumnKeys) {
		List<String> eventAnalysisInfoKeys = EnumCommonField.getKeyByGroup("eventAnalysis");
		return !Collections.disjoint(eventAnalysisInfoKeys, displayColumnKeys);
	}
	
	private String getSort(String sort) {
		StringBuilder sb = new StringBuilder();
		if (!Utility.IsEmpty(sort)) {
			for (String s : sort.split(",")) {
				if (Utility.IsEmpty(s)) continue;
				String fieldName = s.trim();
				String sc = "asc";
				if (fieldName.toLowerCase().endsWith(" desc")) {
					fieldName = fieldName.substring(0, fieldName.length() - 5).trim();
					sc = "desc";
				} else if (fieldName.toLowerCase().endsWith(" asc")) {
					fieldName = fieldName.substring(0, fieldName.length() - 4).trim();
					sc = "asc";
				}
				ISearchTemplate ist = SearchTemplateRegister.getSearchTemplate(fieldRegister.getFieldSearcher(fieldName));
				if (null != ist) {
					fieldName = ist.getSolrFieldSortName(fieldName);
					if (Utility.IsEmpty(fieldName)) continue;
					sb.append(fieldName).append(" ").append(sc).append(",");
				}
			}
			if (sb.length() > 0) sb.deleteCharAt(sb.length() - 1);
		}
		return sb.toString();
	}
	
	private String getUql(String query, String search) throws Exception {
		StringBuilder queryUql = new StringBuilder();
		if (StringUtils.isNotEmpty(query) && !"{}".equals(query.trim()) && !"[]".equals(query.trim())) {
			List<Map<String, Object>> list_query = gson.fromJson(query, new TypeToken<List<Map<String, Object>>>() {}.getType());
			for (Map<String, Object> m_query : list_query) {
				String id = Utility.GetStringField(m_query, "id");
				if (Utility.IsEmpty(id)) continue;
				@SuppressWarnings("unchecked")
				List<Map<String, Object>> list_value = (List<Map<String, Object>>) Utility.GetField(m_query, "value", List.class);
				ISearchTemplate ist = SearchTemplateRegister.getSearchTemplate(fieldRegister.getFieldSearcher(id));
				if (ist == null) throw new Exception("没有找到[" + id + "]搜索模板");
				String u = ist.getUql(id, list_value);
				if (StringUtils.isEmpty(u)) continue;
				queryUql.append(u).append(" AND ");
			}
		}
		int length = queryUql.length();
		if (length == 0) {
			queryUql.append("*:*");
		} else {
			queryUql.delete(length - 5, length);
		}
		StringBuilder search_uql = new StringBuilder();
		if (StringUtils.isNotEmpty(search)) {
			List<Map<String, Object>> list_search = gson.fromJson(search, new TypeToken<List<Map<String, Object>>>() {}.getType());
			for (Map<String, Object> m_search : list_search) {
				String id = Utility.GetStringField(m_search, "id");
				if (StringUtils.isEmpty(id)) continue;
				@SuppressWarnings("unchecked")
				List<Map<String, Object>> list_value = (List<Map<String, Object>>) Utility.GetField(m_search, "value", List.class);
				ISearchTemplate ist = SearchTemplateRegister.getSearchTemplate(fieldRegister.getFieldSearcher(id));
				if (ist == null) throw new Exception("没有找到[" + id + "]搜索模板");
				String u = ist.getUql(id, list_value);
				if (StringUtils.isEmpty(u)) continue;
				if (search_uql.length() == 0) {
					search_uql.append(u);
				} else {
					search_uql.append(" OR ").append(u);
				}
			}
		}
		return search_uql.length() == 0 ? queryUql.toString() : "(" + queryUql.toString() + ") AND (" + search_uql + ")";
	}
	
	private String getPermissionUql(int userId) {
		StringBuilder permissionUql = new StringBuilder();
		List<UnitDO> permittedUnits = permissionSetDao.getPermittedUnits(userId, PermissionSets.VIEW_ACTIVITY.getName());
		if (!permittedUnits.isEmpty()) {
			permissionUql.append("unit_int:(");
			for (UnitDO unit : permittedUnits) {
				permissionUql.append(unit.getId()).append(" OR ");
			}
			int length = permissionUql.length();
			permissionUql.delete(length - 4, length).append(") OR ");
		}
		List<UnitDO> reporterUnits = permissionSetDao.getPermittedUnitsByUserType(UserType.REPORTER, PermissionSets.VIEW_ACTIVITY.getName());
		if (!reporterUnits.isEmpty()) {
			permissionUql.append("(creator_int:").append(userId).append(" AND unit_int:(");
			for (UnitDO unit : reporterUnits) {
				permissionUql.append(unit.getId()).append(" OR ");
			}
			int length = permissionUql.length();
			permissionUql.delete(length - 4, length).append(")) OR ");
		}
		List<UnitDO> processorUnits = permissionSetDao.getPermittedUnitsByUserType(UserType.PROCESSOR, PermissionSets.VIEW_ACTIVITY.getName());
		if (!processorUnits.isEmpty()) {
			permissionUql.append("(processors_multi_int:").append(userId).append(" AND unit_int:(");
			for (UnitDO unit : processorUnits) {
				permissionUql.append(unit.getId()).append(" OR ");
			}
			int length = permissionUql.length();
			permissionUql.delete(length - 4, length).append(")) OR ");
		}
		if (permissionUql.length() > 0) {
			permissionUql.insert(0, " AND (");
			int length = permissionUql.length();
			permissionUql.delete(length - 4, length).append(")");
		} else {
			// 当所有权限条件都不生效时，添加过滤所有数据的过滤条件，不返回任何数据
			permissionUql.append(" AND id:0");
		}
		return permissionUql.toString();
	}
	
	public Map<Integer, String> GetColumn(Connection conn) throws Exception {
		DbClient dc = new DbClient();
		if (!dc.Open(conn)) throw new Exception(dc.ErrorMessage);
		String sql = "select b.name,b.position from t_column_layout a,t_column_layout_item b where a.id = b.id and user_id = " + UserContext.getUserId();
		ResultSet rs_column = dc.ExecuteQuery(sql);
		if (rs_column == null) throw new Exception(dc.ErrorMessage);
		Map<Integer, String> m_column = new HashMap<Integer, String>();
		while (rs_column.next()) {
			m_column.put(rs_column.getInt("POSITION"), rs_column.getString("NAME"));
		}
		rs_column.close();
		return m_column;
	}
	
	public Object getListFromDatabase(HttpServletRequest request) throws Exception {
		String objName = request.getParameter("dataobject");
		if (objName == null || objName.trim().length() == 0) throw SMSException.NO_DATA_OBJECT;
		String doName = getDOName(objName);
		if (doName == null || doName.trim().length() == 0) throw SMSException.NO_MATCHABLE_OBJECT;
		Map<String, Object> map = new HashMap<String, Object>();
		String rule = request.getParameter("rule");
		List<Object> ruleList;
		if (rule != null && rule.trim().length() > 0) {
			ruleList = gson.fromJson(rule, new TypeToken<List<List<Map<String, Object>>>>() {}.getType());
		} else {
			ruleList = Collections.emptyList();
		}
		map.put("rule", ruleList);
		String search = request.getParameter("search");
		Map<String, Object> searchMap;
		if (search != null && search.trim().length() > 0) {
			searchMap = gson.fromJson(search, new TypeToken<Map<String, Object>>() {}.getType());
		} else {
			searchMap = Collections.<String, Object> emptyMap();
		}
		List<String> orders = getOrders(request);
		
		BaseDao<? extends AbstractBaseDO> dao = getDataAccessObject(request, objName);
		List<Object> list = dao.getList(map, searchMap, orders, PageHelper.getFirstResult(request), PageHelper.getMaxResults(request));
		Map<String, Object> result = PageHelper.getPagedResult((List<?>) list.get(0), request, (Integer) list.get(1));
		dao.afterGetList(result, map);
		return result;
	}
	
	private Object getAttachments(HttpServletRequest request) throws SMSException {
		String obj = request.getParameter("obj");
		if (obj == null || obj.trim().length() == 0) return null;
		Map<String, Object> objMap = gson.fromJson(obj, new TypeToken<Map<String, Object>>() {}.getType());
		String[] keys = objMap.keySet().toArray(new String[0]);
		if (keys.length == 0) throw MISSING_PARAMETERS;
		String objName = keys[0].toLowerCase();
		Integer id = ((Number) objMap.get(objName)).intValue();
		BaseDao<? extends AbstractBaseDO> baseDao = this.getDataAccessObject(request, objName);
		AbstractBaseDO baseDO = baseDao.internalGetById(id);
		if (baseDO == null) throw SMSException.NO_MATCHABLE_OBJECT;
		if (!(baseDO instanceof IAttachment)) throw NO_ATTACHMENTS;
		List<FileDO> list = ((IAttachment) baseDO).attachments();
		
		Map<String, Object> result = new HashMap<String, Object>();
		result.put("sEcho", request.getParameter("sEcho"));
		result.put("iTotalDisplayRecords", list.size());
		result.put("iTotalRecords", list.size());
		result.put("aaData", list);
		return result;
	}
	
	private List<String> getOrders(HttpServletRequest request) {
		String orderStr = request.getParameter("order");
		String columnsStr = request.getParameter("columns");
		if (orderStr == null || orderStr.length() == 0 || columnsStr == null || columnsStr.length() == 0) return null;
		List<Map<String, Object>> orderMaps = gson.fromJson(orderStr, new TypeToken<List<Map<String, Object>>>() {}.getType());//column dir
		List<Map<String, Object>> columnMaps = gson.fromJson(columnsStr, new TypeToken<List<Map<String, Object>>>() {}.getType());// data
		List<String> orders = new ArrayList<String>();
		for (int i = 0; i < orderMaps.size(); i++) {
			Map<String, Object> orderMap = orderMaps.get(i);
			Integer columnIndex = ((Number) orderMap.get("column")).intValue();
			String column = (String) columnMaps.get(columnIndex).get("data");
			String dir = (String) orderMap.get("dir");
			orders.add(column + " " + dir);
		}
		return orders;
	}
	
	private Object getById(HttpServletRequest request) throws Exception {
		switch (getDataObjectType(request)) {
			case DATABASE:
			case SOLR:
				return getByIdFromDatabase(request);
			default:
				throw SMSException.UNKNOWN_EXCEPTION;
		}
	}
	
	private Object getByIdFromDatabase(HttpServletRequest request) throws Exception {
		String objName = request.getParameter("dataobject");
		if (objName == null || objName.trim().length() == 0) throw SMSException.NO_DATA_OBJECT;
		String doName = getDOName(objName);
		if (doName == null || doName.trim().length() == 0) throw SMSException.NO_MATCHABLE_OBJECT;
		String idStr = request.getParameter("dataobjectid");
		if (idStr == null || idStr.trim().length() == 0) throw SMSException.NO_ENTRY_SELECTED;
		Integer id = new Double(idStr).intValue();
		Map<String, Object> result = getDataAccessObject(request, objName).getById(id);
		return result;
	}
	
	private Object getByIds(HttpServletRequest request) throws Exception {
		switch (getDataObjectType(request)) {
			case DATABASE:
			case SOLR:
				return getByIdsFromDatabase(request);
			default:
				throw SMSException.UNKNOWN_EXCEPTION;
		}
	}
	
	private Object getByIdsFromDatabase(HttpServletRequest request) throws Exception {
		String objName = request.getParameter("dataobject");
		if (objName == null || objName.trim().length() == 0) throw SMSException.NO_DATA_OBJECT;
		String doName = getDOName(objName);
		if (doName == null || doName.trim().length() == 0) throw SMSException.NO_MATCHABLE_OBJECT;
		String idStr = request.getParameter("dataobjectid");
		if (idStr == null || idStr.trim().length() == 0) throw SMSException.NO_ENTRY_SELECTED;
		Integer[] ids = gson.fromJson(idStr, Integer[].class);
		List<String> idList = new ArrayList<String>();
		for (Integer id : ids) {
			idList.add(id.toString());
		}
		BaseDao<?> dao = getDataAccessObject(request, objName);
		Object result = dao.getByIds(idList.toArray(new String[0]));
		return result;
	}
	
	public void setFieldRegister(FieldRegister fieldRegister) {
		this.fieldRegister = fieldRegister;
	}
	
	public void setPermissionSetDao(PermissionSetDao permissionSetDao) {
		this.permissionSetDao = permissionSetDao;
	}

	public void setLabelDao(LabelDao labelDao) {
		this.labelDao = labelDao;
	}

	public void setProcessorDao(ProcessorDao processorDao) {
		this.processorDao = processorDao;
	}

	public void setAccessInformationDao(AccessInformationDao accessInformationDao) {
		this.accessInformationDao = accessInformationDao;
	}

	public void setFlightInfoEntityDao(FlightInfoEntityDao flightInfoEntityDao) {
		this.flightInfoEntityDao = flightInfoEntityDao;
	}

	public void setEventAnalysisDao(EventAnalysisDao eventAnalysisDao) {
		this.eventAnalysisDao = eventAnalysisDao;
	}

	public void setTemDao(TemDao temDao) {
		this.temDao = temDao;
	}

	public void setActivityDao(ActivityDao activityDao) {
		this.activityDao = activityDao;
	}

	public void setCustomFieldValueDao(CustomFieldValueDao customFieldValueDao) {
		this.customFieldValueDao = customFieldValueDao;
	}

	public void setTempTableDao(TempTableDao tempTableDao) {
		this.tempTableDao = tempTableDao;
	}
	
}
