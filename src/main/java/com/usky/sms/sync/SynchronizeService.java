
package com.usky.sms.sync;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.accessinformation.AccessInformationDao;
import com.usky.sms.accessinformation.FlightInfoEntityDao;
import com.usky.sms.activity.ActivityDO;
import com.usky.sms.activity.ActivityDao;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.config.Config;
import com.usky.sms.config.ConfigService;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.SMSException;
import com.usky.sms.custom.CustomFieldValueDO;
import com.usky.sms.custom.CustomFieldValueDao;
import com.usky.sms.eventanalysis.EventAnalysisDao;
import com.usky.sms.field.FieldRegister;
import com.usky.sms.job.CronDataSynchronizingJob;
import com.usky.sms.label.LabelDao;
import com.usky.sms.processor.ProcessorDao;
import com.usky.sms.search.template.ISearchTemplate;
import com.usky.sms.search.template.SearchTemplateRegister;
import com.usky.sms.solr.SolrService;
import com.usky.sms.tem.TemDao;
import com.usky.sms.user.UserDao;

public class SynchronizeService extends AbstractService {
	
	private static final Logger logger = Logger.getLogger(SynchronizeService.class);
	
	private Config config;
	
	@Autowired
	private ActivityDao activityDao;
	
	@Autowired
	private CustomFieldValueDao customFieldValueDao;
	
	@Autowired
	private SolrService solrService;
	
	@Autowired
	private TemDao temDao;
	
	@Autowired
	private FlightInfoEntityDao flightInfoEntityDao;
	
	@Autowired
	private AccessInformationDao accessInformationDao;
	
	@Autowired
	private ProcessorDao processorDao;
	
	@Autowired
	private UserDao userDao;
	
	@Autowired
	private FieldRegister fieldRegister;
	
	@Autowired
	private EventAnalysisDao eventAnalysisDao;
	
	@Autowired
	private LabelDao labelDao;
	
	public SynchronizeService() {
		this.config = new ConfigService().getConfig();
	}
	
	public void synchronize(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			new CronDataSynchronizingJob().synchronizeAll(config.getUpsUsername(), config.getUpsPassword());
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			ResponseHelper.output(response, map);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	/**
	 * @deprecated
	 * @see {@link #synchronizeActivityWithThreads(HttpServletRequest, HttpServletResponse)}
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void synchronizeActivity(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			//			List<ActivityDO> activities = activityDao.getList();
			List<ActivityDO> activities = getActivityInfo();
			if (!activities.isEmpty()) {
				List<Map<String, Object>> maps = activityDao.convert(activities);
				Map<Integer, Map<String, Object>> idMap = new HashMap<Integer, Map<String, Object>>();
				for (Map<String, Object> map : maps) {
					idMap.put((Integer) map.get("id"), map);
				}
				List<CustomFieldValueDO> values = customFieldValueDao.getList();
				for (CustomFieldValueDO value : values) {
					if (value.getActivity() == null) continue;
					Map<String, Object> map = idMap.get(value.getActivity().getId());
					if (map == null) continue;
					String key = value.getKey();
					String searcher = fieldRegister.getFieldSearcher(key);
					if (searcher == null) {
						continue;
					}
					ISearchTemplate template = SearchTemplateRegister.getSearchTemplate(searcher);
					if (template == null) continue;
					map.put(key, template.getValue(value));
				}
				
				// 添加其他相关的需同步到solr的信息
				addOtherRelatedInfo(maps);
				
				solrService.deleteAllDoc("activity");
				solrService.addMapsBySolrj("activity", maps);
			}
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			ResponseHelper.output(response, map);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public static void main(String[] args) {
		List<String> list = new ArrayList<String>();
		for (int e = 1; e < 11; e++) {
			list.add(e+"");
		}
		ExecutorService fixedThreadPool = Executors.newFixedThreadPool(5);
		int interval = 1;
		int i = 10;
		SynchronizeService service = new SynchronizeService();
		for (int j = 0; j <= i; j++) {
			int from = j * interval;
			int to;
			if (j == i) {
				to = 10;
			} else {
				to = (j + 1) * interval;
			}
			if (from < to) {
				fixedThreadPool.execute(service.new SynchronizeThread(list.subList(from, to)));
			}
		}
		fixedThreadPool.shutdown();
		while(true) {
			if (fixedThreadPool.isTerminated()) {
				System.out.println("任务结束");
				break;
			}
		}
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void synchronizeActivityWithThreads(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			List<ActivityDO> activities = getActivityInfo();
			boolean deleteAll = Boolean.parseBoolean(request.getParameter("deleteAll"));
			synchronizeActivityWithThreads(activities, deleteAll);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void synchronizeActivityWithThreads(List<ActivityDO> activities, boolean deleteAll) {
		if (!activities.isEmpty()) {
			List<Integer> activityIds = new ArrayList<Integer>();
			for (ActivityDO activity : activities) {
				activityIds.add(activity.getId());
			}
			
			List<Map<String, Object>> maps = activityDao.convert(activities);
			Map<Integer, Map<String, Object>> idMap = new HashMap<Integer, Map<String, Object>>();
			for (Map<String, Object> map : maps) {
				idMap.put((Integer) map.get("id"), map);
			}
			
			if (deleteAll) {
				try {
					solrService.deleteAllDoc("activity");
				} catch (Exception e) {
					e.printStackTrace();
					throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "删除solr数据失败！message:" + e.getMessage());
				}
			}
			int interval = 500;// 每500个一个线程
			int i = activities.size() / interval;
//			Thread th = null;
			ExecutorService fixedThreadPool = Executors.newFixedThreadPool(10);
			try {
				for (int j = 0; j <= i; j++) {
					int from = j * interval;
					int to;
					if (j == i) {
						to = activities.size();
					} else {
						to = (j + 1) * interval;
					}
					if (from < to) {
						fixedThreadPool.execute(new SynchronizeThread(maps.subList(from, to), activityIds.subList(from, to)));
//						th = new Thread(new SynchronizeThread(maps.subList(from, to), activityIds.subList(from, to)));
//						th.setName("synchronizeActivity_" + j);
//						th.start();
					}
				}
			} catch (Exception e) {
				e.printStackTrace();
//				Log.info("线程:" + th.getName() + "同步失败！");
//				th.interrupt();
			}
			fixedThreadPool.shutdown();
			while(true) {
				if (fixedThreadPool.isTerminated()) {
					logger.info("同步任务结束");
					break;
				}
			}
		}
	}
	
	/**
	 * 将发生时间、tem信息和航班信息添加到map中<br>
	 * 处理人、发生时间、tem信息、航班信息
	 * 
	 * @param maps
	 */
	@SuppressWarnings("unchecked")
	private void addOtherRelatedInfo(List<Map<String, Object>> maps, List<Integer> activityIds) {
		// 自定义字段
		List<CustomFieldValueDO> values = customFieldValueDao.getByActivityIds(activityIds);
		// 标签
		Map<String, Object> labelMaps = labelDao.getLabelsForSolr(activityIds);
		// 处理人
		Map<String, Object> processorMaps = processorDao.getProcessorsForSolr(activityIds);
		// 发生时间
		Map<String, Object> occurredDateMaps = accessInformationDao.getOccurredDateForSolr(activityIds);
		// tem信息
		Map<String, Object> temInfoMaps = temDao.getTemInfoForSolr(activityIds);
		// 航班信息
		Map<String, Object> flightInfoMaps = flightInfoEntityDao.getFlightInfoForSolr(activityIds);
		// 事件分析信息
		Map<String, Object> eventAnalysisInfoMaps = eventAnalysisDao.getEventAnalysisInfoForSolr(activityIds);
		for (Map<String, Object> map : maps) {
			String id = map.get("id").toString();
			//编号
			map.put("activityNo", ((Map<String, Object>) map.get("unit")).get("code") + "-" + map.get("num"));
			for (CustomFieldValueDO value : values) {
				if (value.getActivity() == null) continue;
				if (map == null) continue;
				if (!value.getActivity().getId().toString().equals(id)) continue;
				String key = value.getKey();
				String searcher = fieldRegister.getFieldSearcher(key);
				if (searcher == null) {
					continue;
				}
				ISearchTemplate template = SearchTemplateRegister.getSearchTemplate(searcher);
				if (template == null) continue;
				map.put(key, template.getValue(value));
			}
			if (labelMaps.containsKey(id)) {
				map.putAll(((Map<String, Object>) labelMaps.get(id)));
			}
			if (processorMaps.containsKey(id)) {
				map.putAll(((Map<String, Object>) processorMaps.get(id)));
			}
			if (occurredDateMaps.containsKey(id)) {
				map.putAll(((Map<String, Object>) occurredDateMaps.get(id)));
			}
			if (temInfoMaps.containsKey(id)) {
				map.putAll(((Map<String, Object>) temInfoMaps.get(id)));
			}
			if (flightInfoMaps.containsKey(id)) {
				map.putAll(((Map<String, Object>) flightInfoMaps.get(id)));
			}
			if (eventAnalysisInfoMaps.containsKey(id)) {
				map.putAll(((Map<String, Object>) eventAnalysisInfoMaps.get(id)));
			}
		}
	}
	
	/**
	 * 将其他安全信息相关的信息添加到map中<br>
	 * 处理人、发生时间、tem信息、航班信息
	 * 
	 * @param maps
	 */
	@SuppressWarnings("unchecked")
	private void addOtherRelatedInfo(List<Map<String, Object>> maps) {
		for (Map<String, Object> map : maps) {
			Integer activityId = (Integer) map.get("id");
			//编号
			map.put("activityNo", ((Map<String, Object>) map.get("unit")).get("code") + "-" + map.get("num"));
			// 处理人
			Map<String, Object> processors = processorDao.getProcessorsForSolr(activityId);
			map.putAll(processors);
			// 发生时间
			Map<String, Object> occurredDate = accessInformationDao.getOccurredDateForSolr(activityId);
			map.putAll(occurredDate);
			// tem信息
			Map<String, Object> temInfo = temDao.getTemInfoForSolr(activityId);
			map.putAll(temInfo);
			// 航班信息
			Map<String, Object> flightInfo = flightInfoEntityDao.getFlightInfoForSolr(activityId);
			map.putAll(flightInfo);
		}
	}
	
	@SuppressWarnings("unchecked")
	private List<ActivityDO> getActivityInfo() {
		StringBuffer hql = new StringBuffer("select distinct a from ActivityDO a left join fetch a.unit left join a.type left join fetch a.status").append(" left join fetch a.priority left join fetch a.resolution left join fetch a.security left join fetch a.assignee").append(" left join fetch a.creator left join fetch a.reporter left join fetch a.values").append(" where a.deleted = false");
		//		hql.append(" and a.created >= ?");
		//		hql.append(" and a.created < ?");
		//		Calendar cal1 = DateHelper.getCalendar();
		//		cal1.set(Calendar.MONTH, 3);
		//		cal1.set(Calendar.DAY_OF_MONTH, 1);
		//		Calendar cal2 = DateHelper.getCalendar();
		//		cal2.set(Calendar.MONTH, 3);
		//		cal2.set(Calendar.DAY_OF_MONTH, 16);
		return (List<ActivityDO>) activityDao.query(hql.toString());
	}
	
	class SynchronizeThread implements Runnable {
		
		List<Map<String, Object>> maps = null;
		
		List<Integer> activityIds = null;
		
		List<String> list = null;
		
		public SynchronizeThread(List<Map<String, Object>> maps, List<Integer> activityIds) {
			this.maps = maps;
			this.activityIds = activityIds;
		}
		
		public SynchronizeThread(List<String> list) {
			this.list = list;
		}
		
		@Override
		public void run() {
//			System.out.println(Thread.currentThread().getId() + "size:" + list.size() + ", value:" + list.get(0));
			
			// 添加其他相关的需同步到solr的信息
			addOtherRelatedInfo(maps, activityIds);
			solrService.addMapsBySolrj("activity", maps);
			
			for (Map<String, Object> map : maps) {
				solrService.updateSolrFields("activity", (Integer) map.get("id"), map);
			}
			
		}
		
	}
	
	public void setActivityDao(ActivityDao activityDao) {
		this.activityDao = activityDao;
	}
	
	public void setCustomFieldValueDao(CustomFieldValueDao customFieldValueDao) {
		this.customFieldValueDao = customFieldValueDao;
	}
	
	public void setSolrService(SolrService solrService) {
		this.solrService = solrService;
	}
	
	public void setTemDao(TemDao temDao) {
		this.temDao = temDao;
	}
	
	public void setFlightInfoEntityDao(FlightInfoEntityDao flightInfoEntityDao) {
		this.flightInfoEntityDao = flightInfoEntityDao;
	}
	
	public void setAccessInformationDao(AccessInformationDao accessInformationDao) {
		this.accessInformationDao = accessInformationDao;
	}
	
	public void setProcessorDao(ProcessorDao processorDao) {
		this.processorDao = processorDao;
	}
	
	public void setUserDao(UserDao userDao) {
		this.userDao = userDao;
	}
	
	public void setFieldRegister(FieldRegister fieldRegister) {
		this.fieldRegister = fieldRegister;
	}

	public void setEventAnalysisDao(EventAnalysisDao eventAnalysisDao) {
		this.eventAnalysisDao = eventAnalysisDao;
	}

	public void setLabelDao(LabelDao labelDao) {
		this.labelDao = labelDao;
	}
	
}
