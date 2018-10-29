
package com.usky.sms.solr;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicNameValuePair;
import org.apache.log4j.Logger;
import org.apache.solr.client.solrj.SolrQuery;
import org.apache.solr.client.solrj.SolrServerException;
import org.apache.solr.client.solrj.impl.HttpSolrServer;
import org.apache.solr.client.solrj.response.QueryResponse;
import org.apache.solr.client.solrj.response.UpdateResponse;
import org.apache.solr.common.SolrDocument;
import org.apache.solr.common.SolrDocumentList;
import org.apache.solr.common.SolrInputDocument;
import org.apache.solr.common.util.NamedList;
import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.common.BeanHelper;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.config.Config;
import com.usky.sms.config.ConfigService;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.EntityFieldType;
import com.usky.sms.core.SMSException;
import com.usky.sms.entity.EntityDO;
import com.usky.sms.entity.EntityDao;
import com.usky.sms.entity.EntityFieldDO;
import com.usky.sms.entity.EntityFieldDao;
import com.usky.sms.field.FieldRegister;
import com.usky.sms.search.template.ISearchTemplate;
import com.usky.sms.search.template.SearchTemplateRegister;

public class SolrService extends AbstractService {
	
	private static final Logger log = Logger.getLogger(SolrService.class);
	
	private static final Integer PATCH_SIZE = 1000;
	
	private Config config;
	
	@Autowired
	private EntityDao entityDao;
	
	@Autowired
	private EntityFieldDao entityFieldDao;
	
	@Autowired
	private FieldRegister fieldRegister;
	
	public SolrService() {
		this.config = new ConfigService().getConfig();
	}
	
	public void addCore(HttpServletRequest request, HttpServletResponse response) {
		try {
			String coreName = request.getParameter("corename");
			if (coreName == null || coreName.trim().length() == 0) throw SMSException.NO_CORE;
			Object data = addCore(coreName);
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", data);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void synchronize(HttpServletRequest request, HttpServletResponse response) {
		try {
			synchronizeAll(request);
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	private void synchronizeAll(HttpServletRequest request) throws Exception {
		List<EntityDO> entities = entityDao.getList();
		for (EntityDO entity : entities) {
			synchronize(entity.getName(), this.getDataAccessObject(request, entity.getName()).getList());
		}
	}
	
	private void synchronize(String coreName, List<? extends AbstractBaseDO> baseDOs) throws Exception {
		this.deleteAllDoc(coreName);
		int size = baseDOs.size();
		if (size == 0) return;
		List<EntityFieldDO> fields = entityFieldDao.getFieldsByEntityName(coreName);
		for (int i = 0; i <= (size - 1) / PATCH_SIZE; i++) {
			int count = size - PATCH_SIZE * i;
			count = count < PATCH_SIZE ? count : PATCH_SIZE;
			List<Object> docList = new ArrayList<Object>();
			for (int j = 0; j < count; j++) {
				AbstractBaseDO baseDO = baseDOs.get(PATCH_SIZE * i + j);
				Map<String, Object> docMap = new HashMap<String, Object>();
				docMap.put("id", baseDO.getId().toString());
				for (EntityFieldDO field : fields) {
					String key = field.getKey();
					Object value = BeanHelper.getProperty(baseDO, key);
					if (value == null) continue;
					switch (EntityFieldType.getType(field.getType())) {
						case STRING:
						case DATE:
						case TIME:
						case DATETIME:
						case TEXT:
						case ENUM:
							value = value.toString();
							docMap.put(key + "_string", value);
							continue;
						case INT:
						case TREE:
						case LIST:
							// TODO: 解决外键关联
							if (value instanceof AbstractBaseDO || value instanceof Collection) continue;
							value = ((Number) value).intValue();
							docMap.put(key + "_int", value);
							continue;
						case DOUBLE:
							docMap.put(key + "_double", value);
							continue;
						default:
					}
				}
				docList.add(docMap);
			}
			Map<String, Object> addMap = new HashMap<String, Object>();
			addMap.put("add", docList);
			this.addDoc(coreName, "json", gson.toJson(addMap));
		}
	}
	
	public Map<String, Object> addCore(String coreName) throws Exception {
		Map<String, String> map = new HashMap<String, String>();
		map.put("action", "CREATE");
		map.put("name", coreName);
		map.put("instanceDir", coreName);
		//		map.put("config", config.getSolrConfigPath());
		//		map.put("schema", config.getSolrSchemaPath());
		map.put("dataDir", "data");
		return executeService("admin", "cores", null, map);
	}
	
	/**
	 * 以map的形式返回的solr中core为<code>coreName</code>,id为<code>id</code>的值<br>
	 * 其中map的key是将solr中的field去掉最后一个下划线以后的值。如：flightPhase_multi_string --> flightPhase_multi
	 * @param coreName
	 * @param id
	 * @return
	 * @throws Exception
	 */
	public Object getById(String coreName, String id) throws Exception {
		@SuppressWarnings("unchecked")
		Map<String, Object> response = (Map<String, Object>) queryDoc(coreName, "json", "id:" + id).get("response");
		@SuppressWarnings("unchecked")
		List<Map<String, String>> docs = (List<Map<String, String>>) response.get("docs");
		if (docs.size() == 0) return null;
		Map<String, Object> map = new HashMap<String, Object>();
		for (Map.Entry<String, String> entry : docs.get(0).entrySet()) {
			String key = entry.getKey();
			if (!"id".equals(key)) {
				int pos = key.lastIndexOf("_");
				key = key.substring(0, pos);
			}
			map.put(key, entry.getValue());
		}
		return map;
	}
	
	/**
	 * 返回的solr中core为<code>coreName</code>,id为<code>id</code>的SolrDocument
	 * @param coreName
	 * @param id
	 * @return
	 * @throws Exception
	 */
	public SolrDocument getSolrDocumentById(String coreName, String id) throws Exception {
		String url = config.getSolr() + "/" + coreName;
		HttpSolrServer solrClient = new HttpSolrServer(url);
		SolrQuery query =new SolrQuery();
		query.setQuery("id:" + id);
		QueryResponse rsp = null;
		try {
			rsp = solrClient.query(query);
		} catch (SolrServerException e) {
			e.printStackTrace();
			throw e;
		} finally{
			solrClient.shutdown();
		}
		SolrDocumentList docs = rsp.getResults();
		if (null == docs || docs.isEmpty()) {
			return null;
		}
		return docs.get(0);
	}
	
	public Map<String, Object> addDoc(String coreName, String dataType, String data) {
		return updateDoc(coreName, dataType, data);
	}
	
	public Map<String, Object> addDoc(String coreName, Integer id, Map<String, Object> map) {
		Map<String, Object> data = new HashMap<String, Object>();
		data.put("id", id.toString());
		for (String key : map.keySet()) {
			if (map.get(key) == null) continue;
			String searcher = fieldRegister.getFieldSearcher(key);
			if (searcher == null) continue;
			ISearchTemplate template = SearchTemplateRegister.getSearchTemplate(searcher);
			if (template == null) continue;
			// 将map里的数据按照solr的存储格式放到data Map中
			data.put(template.getSolrFieldName(key), template.getSolrFieldValue(map.get(key)));
			data.put(template.getSolrFieldSortName(key), template.getSolrFieldSortValue(map.get(key)));
		}
		Map<String, Object> doc = new HashMap<String, Object>();
		doc.put("doc", data);
		Map<String, Object> add = new HashMap<String, Object>();
		add.put("add", doc);
		return addDoc(coreName, "json", gson.toJson(add));
	}
	
	public Map<String, Object> updateDoc(String coreName, String dataType, String data) {
		Map<String, String> map = new HashMap<String, String>();
		map.put("stream.body", data);
		return executeService(coreName, "update", dataType, map);
	}
	
	public Map<String, Object> updateDoc(String coreName, Integer id, Map<String, Object> map) {
		return addDoc(coreName, id, map);
	}
	
	public Map<String, Object> deleteDoc(String coreName, String dataType, String data) {
		return updateDoc(coreName, dataType, data);
	}
	
	public Map<String, Object> deleteAllDoc(String coreName) {
		return updateDoc(coreName, "json", "{\"delete\":{\"query\":\"*:*\"}}");
	}
	
	public Map<String, Object> queryDoc(String coreName, String dataType, String filter, String... parameters) {
		Map<String, String> map = new HashMap<String, String>();
		map.put("q", filter);
		for (int i = 1; i < parameters.length; i = i + 2) {
			if (parameters[i - 1] == null || parameters[i] == null) continue;
			map.put(parameters[i - 1], parameters[i]);
		}
		return executeService(coreName, "select", dataType, map);
	}
	
	public Object getCoreInfo(String coreName, String dataType) {
		Map<String, String> map = new HashMap<String, String>();
		map.put("action", "STATUS");
		map.put("core", coreName);
		@SuppressWarnings("unchecked")
		Map<String, Object> cores = (Map<String, Object>) executeService("admin", "cores", dataType, map).get("status");
		return cores.get(coreName);
	}
	
	public Map<String, Object> executeService(String coreName, String operation, String dataType, Map<String, String> parameters) {
		try {
			DefaultHttpClient httpClient = new DefaultHttpClient();
			List<NameValuePair> nvps = new ArrayList<NameValuePair>();
			if (parameters != null) {
				for (Map.Entry<String, String> entry : parameters.entrySet()) {
					nvps.add(new BasicNameValuePair(entry.getKey(), entry.getValue()));
				}
			}
			if ("update".equalsIgnoreCase(operation)) nvps.add(new BasicNameValuePair("commit", "true"));
			if (dataType != null && dataType.trim().length() > 0) nvps.add(new BasicNameValuePair("stream.contentType", "text/" + dataType + ";charset=utf-8"));
			nvps.add(new BasicNameValuePair("wt", "json"));
			HttpPost httpPost = new HttpPost(config.getSolr() + "/" + coreName + "/" + operation);
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
					log.debug(builder);
					@SuppressWarnings("unchecked")
					Map<String, Object> result = (Map<String, Object>) gson.fromJson(builder.toString(), Object.class);
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
		} catch (Exception e) {
			e.printStackTrace();
			throw new SMSException(e);
		}
	}
	
	/**
	 * 对solr的字段为key的进行更新操作
	 * @param coreName solr的core
	 * @param id 待更新记录的id
	 * @param key 待更新字段对应的key
	 * @param value 待更新字段的值
	 */
	public void updateSolrField(String coreName, Integer id, String key, Object value) {
		Map<String, Object> map = new HashMap<String, Object>();
		map.put(key, value);
		updateSolrFields(coreName, id, map);
	}
	
	/**
	 * 对solr的某些字段进行更新操作
	 * @param coreName solr的core
	 * @param id 待更新记录的id
	 * @param map 待更新的map
	 */
	public void updateSolrFields(String coreName, Integer id, Map<String, Object> map) {
		SolrDocument solrDocument = null;
		try {
			solrDocument = this.getSolrDocumentById(coreName, id.toString());
		} catch (Exception e) {
			e.printStackTrace();
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "更新solr失败！从solr中获取" + coreName + "[id:" + id.toString() + "]的信息失败！");
		}
		if (null != solrDocument) {
			SolrInputDocument solrInputDocument = this.transferMapToSolrDocument(map);
			for (Entry<String, Object> entry : solrDocument.entrySet()) {
				if (!solrInputDocument.containsKey(entry.getKey())) {
					solrInputDocument.setField(entry.getKey(), entry.getValue());
				}
			}
			this.addDocBySolrj(coreName, solrInputDocument);
		}
		
	}
	
	/**
	 * 通过Solrj对solr的字段为key的进行更新操作<br>
	 * 此方法对solr4.0.0以下的版本更新multiple类型的字段时不起作用
	 * @param coreName solr的core
	 * @param id 待更新记录的id
	 * @param key 待更新字段对应的key
	 * @param value 待更新字段的值
	 */
	public void updateSolrFieldBySolrj(String coreName, Integer id, String key, Object value) {
		Map<String, Object> map = new HashMap<String, Object>();
		map.put(key, value);
		updateSolrFieldsBySolrj(coreName, id, map);
	}
	
	/**
	 * 通过Solrj对solr的某些字段进行更新操作<br>
	 * 此方法对solr4.0.0以下的版本更新multiple类型的字段时不起作用
	 * @param coreName solr的core
	 * @param id 待更新记录的id
	 * @param map 待更新的map
	 */
	public void updateSolrFieldsBySolrj(String coreName, Integer id, Map<String, Object> map) {
		SolrInputDocument doc = new SolrInputDocument(); // 构造一个SolrInputDocument对象
		Map<String, Object> updateFiledMap = null;
		Map<String, Object> updateFiledSortMap = null;
		doc.addField("id", id.toString());
		for (String key : map.keySet()) {
			if (map.get(key) != null) {
				String searcher = fieldRegister.getFieldSearcher(key);
				if (searcher != null) {
					ISearchTemplate template = SearchTemplateRegister.getSearchTemplate(searcher);
					if (template != null) {
						// solrField
						updateFiledMap = new HashMap<String, Object>();
						updateFiledMap.put("set", gson.toJson(template.getSolrFieldValue(map.get(key))));
						doc.addField(template.getSolrFieldName(key), updateFiledMap);

						// solrSortField
						updateFiledSortMap = new HashMap<String, Object>();
						updateFiledSortMap.put("set", gson.toJson(template.getSolrFieldSortValue(map.get(key))));
						doc.addField(template.getSolrFieldSortName(key), updateFiledSortMap);
					}
				}
			}
		}
		Collection<SolrInputDocument> docs = new ArrayList<SolrInputDocument>();
		docs.add(doc);
		addSolrInputDocumentsBySolrj(coreName, docs);
	}
	
	/**
	 * 通过Solrj将map里的数据按照solr的格式保存到solr中<br>
	 * @param coreName solr的core
	 * @param map 待保存的map
	 */
	public void addMapBySolrj(String coreName, Map<String, Object> map) {
		Collection<Map<String, Object>> maps = new ArrayList<Map<String, Object>>();
		if (null != map) {
			maps.add(map);
		}
		this.addMapsBySolrj(coreName, maps);
	}
	
	/**
	 * 通过Solrj对将SolrInputDocument添加到solr里<br>
	 * @param coreName solr的core
	 * @param id 待更新记录的id
	 * @param docs 待添加的的SolrInputDocument
	 */
	public void addDocBySolrj(String coreName, SolrInputDocument solrInputDocument) {
		List<SolrInputDocument> solrInputDocumentList = new ArrayList<SolrInputDocument>();
		if (null != solrInputDocument) {
			solrInputDocumentList.add(solrInputDocument);
		}
		addSolrInputDocumentsBySolrj(coreName, solrInputDocumentList);
	}
	
	/**
	 * 通过Solrj将maps列表里的数据按照solr的格式保存到solr中<br>
	 * @param coreName solr的core
	 * @param id 待更新记录的id
	 * @param map 待更新的map
	 */
	public void addMapsBySolrj(String coreName, Collection<Map<String, Object>> maps) {
		Collection<SolrInputDocument> solrInputDocuments = this.transferMapsToSolrDocuments(maps);
		this.addSolrInputDocumentsBySolrj(coreName, solrInputDocuments);
	}

	/**
	 * 通过Solrj对将SolrInputDocument的列表添加到solr里<br>
	 * @param coreName solr的core
	 * @param docs 待添加的的SolrInputDocument列表
	 * @throws SolrServerException 
	 * @throws IOException 
	 */
	@SuppressWarnings("unchecked")
	public void addSolrInputDocumentsBySolrj(String coreName, Collection<SolrInputDocument> docs) {
		try{
			String url = config.getSolr() + "/" + coreName;
			HttpSolrServer solrClient = new HttpSolrServer(url);
			try {
				// 添加一个doc文档
				UpdateResponse response = solrClient.add(docs);
				if (response.getStatus() != 0) {
					NamedList<Object> namedList = response.getResponse();
					Map<String, Object> error = (Map<String, Object>) namedList.get("error");
					throw new SMSException(error.get("code").toString(), "[Solr]" + (String) error.get("msg"));
				}
				solrClient.commit();// commit后才保存到索引库
			} catch (SolrServerException e) {
				e.printStackTrace();
				throw e;
			} catch (IOException e) {
				e.printStackTrace();
				throw e;
			} finally {
				solrClient.shutdown();
			}
		} catch (Exception e) {
			e.printStackTrace();
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, e.getMessage());
		}
	}
	
	/**
	 * 将要放到solr里的map里的数据按照solr的存储格式放到solrDocument中
	 */
	private SolrInputDocument transferMapToSolrDocument(Map<String, Object> map) {
		SolrInputDocument solrInputDocument = new SolrInputDocument();
		for (String key : map.keySet()) {
			if ("id".equals(key)) {
				solrInputDocument.setField("id", map.get(key));
				continue;
			}
//			if (map.get(key) == null){
//				continue;
//			}
			String searcher = fieldRegister.getFieldSearcher(key);
			if (searcher == null){
				continue;
			}
			ISearchTemplate template = SearchTemplateRegister.getSearchTemplate(searcher);
			if (template == null){
				continue;
			}
			// 将map里的数据按照solr的存储格式放到solrDocument中
			solrInputDocument.setField(template.getSolrFieldName(key), template.getSolrFieldValue(map.get(key)));
			solrInputDocument.setField(template.getSolrFieldSortName(key), template.getSolrFieldSortValue(map.get(key)));
		}
		return solrInputDocument;
	}
	
	/**
	 * 将要放到solr里的map的列表里的数据按照solr的存储格式放到solrDocument的列表中
	 */
	private Collection<SolrInputDocument> transferMapsToSolrDocuments(Collection<Map<String, Object>> maps) {
		Collection<SolrInputDocument> solrInputDocumentList = new ArrayList<SolrInputDocument>();
		for (Map<String, Object> map : maps) {
			solrInputDocumentList.add(transferMapToSolrDocument(map));
		}
		return solrInputDocumentList;
	}
	
	/**
	 * 通过Solrj对将SolrInputDocument的列表进行删除<br>
	 * @param coreName solr的core
	 * @param ids 待删除的的id
	 * @throws SolrServerException 
	 * @throws IOException 
	 */
	@SuppressWarnings("unchecked")
	public void deleteSolrInputDocumentsBySolrj(String coreName, List<String> ids) {
		try{
			String url = config.getSolr() + "/" + coreName;
			HttpSolrServer solrClient = new HttpSolrServer(url);
			try {
				// 删除文档
				UpdateResponse response = solrClient.deleteById(ids);
				if (response.getStatus() != 0) {
					NamedList<Object> namedList = response.getResponse();
					Map<String, Object> error = (Map<String, Object>) namedList.get("error");
					throw new SMSException(error.get("code").toString(), "[Solr]" + (String) error.get("msg"));
				}
				solrClient.commit();// commit后才保存到索引库
			} catch (SolrServerException e) {
				e.printStackTrace();
				throw e;
			} catch (IOException e) {
				e.printStackTrace();
				throw e;
			} finally {
				solrClient.shutdown();
			}
		} catch (Exception e) {
			e.printStackTrace();
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, e.getMessage());
		}
	}
	
	/**
	 * 通过Solrj对将SolrInputDocument进行删除<br>
	 * @param coreName solr的core
	 * @param id 待删除的的id
	 * @throws SolrServerException 
	 * @throws IOException 
	 */
	@SuppressWarnings("unchecked")
	public void deleteSolrInputDocumentBySolrj(String coreName, String id) {
		try{
			String url = config.getSolr() + "/" + coreName;
			HttpSolrServer solrClient = new HttpSolrServer(url);
			try {
				// 删除文档
				UpdateResponse response = solrClient.deleteById(id);
				if (response.getStatus() != 0) {
					NamedList<Object> namedList = response.getResponse();
					Map<String, Object> error = (Map<String, Object>) namedList.get("error");
					throw new SMSException(error.get("code").toString(), "[Solr]" + (String) error.get("msg"));
				}
				solrClient.commit();// commit后才保存到索引库
			} catch (SolrServerException e) {
				e.printStackTrace();
				throw e;
			} catch (IOException e) {
				e.printStackTrace();
				throw e;
			} finally {
				solrClient.shutdown();
			}
		} catch (Exception e) {
			e.printStackTrace();
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, e.getMessage());
		}
	}
	
	public void setEntityDao(EntityDao entityDao) {
		this.entityDao = entityDao;
	}
	
	public void setEntityFieldDao(EntityFieldDao entityFieldDao) {
		this.entityFieldDao = entityFieldDao;
	}
	
	public void setFieldRegister(FieldRegister fieldRegister) {
		this.fieldRegister = fieldRegister;
	}
	
}
