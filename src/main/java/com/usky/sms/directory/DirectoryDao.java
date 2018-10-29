package com.usky.sms.directory;

import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.hibernate.HibernateException;
import org.hibernate.Query;
import org.hibernate.SQLQuery;
import org.hibernate.Session;
import org.hibernate.type.StandardBasicTypes;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate3.HibernateCallback;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.activity.ActivityDao;
import com.usky.sms.common.DateHelper;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;
import com.usky.sms.file.FileDO;
import com.usky.sms.file.FileDao;
import com.usky.sms.flightmovementinfo.AirportDao;
import com.usky.sms.flightmovementinfo.FlightInfoDao;
import com.usky.sms.flightmovementinfo.Maintenance.AircraftDao;
import com.usky.sms.label.LabelDao;
import com.usky.sms.permission.PermissionSetDao;
import com.usky.sms.permission.PermissionSets;
import com.usky.sms.safetyreview.AssessmentCommentDao;
import com.usky.sms.section.SectionDO;
import com.usky.sms.section.SectionDao;

public class DirectoryDao extends BaseDao<DirectoryDO> {

	@Autowired
	private FileDao fileDao;

	@Autowired
	private SectionDao sectionDao;

	@Autowired
	private ActivityDao activityDao;

	@Autowired
	private AssessmentCommentDao assessmentCommentDao;
	
	@Autowired
	private DailySafetyWorkStatusDao dailySafetyWorkStatusDao;
	
	@Autowired
	private PermissionSetDao permissionSetDao;
	
	@Autowired
	private LabelDao labelDao;
	
	@Autowired
	private AirportDao airportDao;
	
	@Autowired
	private AircraftDao aircraftDao;
	
	@Autowired
	private FlightInfoDao flightInfoDao;

	public DirectoryDao() {
		super(DirectoryDO.class);
	}
	
	@Override
	protected Object getQueryParamValue(String key, Object value) {
		if ("status".equals(key)) return ((Number) value).intValue();
		if ("father.status".equals(key)) return ((Number) value).intValue();
		return super.getQueryParamValue(key, value);
	}

	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		DirectoryDO directory = (DirectoryDO) obj;
		if ("created".equals(field.getName())) {
			map.put(field.getName(), DateHelper.formatIsoSecond(directory.getCreated()));
		} else if ("lastUpdate".equals(field.getName())) {
			map.put(field.getName(), DateHelper.formatIsoSecond(directory.getLastUpdate()));
		} else {
			super.setField(map, obj, claz, multiple, field);
		}
	}

	@Override
	protected void setFields(Map<String, Object> map, Object obj,
			Class<?> claz, List<String> fields, boolean multiple, boolean showExtendFields) {
		super.setFields(map, obj, claz, fields, multiple, showExtendFields);
		if (showExtendFields) {
			DirectoryDO directoryDO = (DirectoryDO) obj;
			DirectoryDO father = directoryDO.getFather();
			if (father != null && father.isDeleted()) {
				directoryDO.setDeleted(true);
			}
			List<FileDO> files = new ArrayList<FileDO>(
					directoryDO.getAttachments());
			List<SectionDO> sections = new ArrayList<SectionDO>(
					directoryDO.getSections());
			//List<Map<String, Object>> fileList = new ArrayList<Map<String, Object>>();
			List<Map<String, Object>> sectionList = new ArrayList<Map<String, Object>>();

			// 对附件按更新时间的倒序进行排序
			Collections.sort(files, new Comparator<FileDO>() {

				public int compare(FileDO arg0, FileDO arg1) {
					return -(arg0.getLastUpdate().compareTo(arg1.getLastUpdate()));
				}
			});
//			for (FileDO file : files) {
//				// 不检索假删除的数据
//				if (file.isDeleted()) {
//					continue;
//				}
//				Integer id = file.getId();
//				String name = file.getFileName();
//				String fileType = file.getType();
//				String size = file.getSize();
//				Integer sourceType = file.getSourceType();
//				Map<String, Object> inseMap = new HashMap<String, Object>();
//				inseMap.put("id", id);
//				inseMap.put("name", name);
//				inseMap.put("type", fileType);
//				inseMap.put("size", size);
//				// soureType的中文显示
//				String comment = null;
//				String sourceName = "";
//				try {
//					comment = EnumFileType.getEnumByVal(sourceType.toString())
//							.toComment();
//					// 不是自定义上传的时候,返回相关联的名称
//					if (EnumFileType.SAFETYINFORMATION.getCode() == sourceType) {
//						sourceName = activityDao.internalGetById(file.getSource()).getSummary();
//					} else if (EnumFileType.SAFETYREVIEW.getCode() == sourceType) {
//						DailySafetyWorkStatusDO dailySafetyWorkStatus = dailySafetyWorkStatusDao.internalGetById(file.getSource());
//						sourceName = dailySafetyWorkStatus.getAssessmentComment().getDescription();
//					}
//				} catch (Exception e1) {
//					comment = "";
//				}
//				inseMap.put("sourceType", comment);
//				inseMap.put("sourceName", sourceName);
//				inseMap.put("source", file.getSource());
//				SimpleDateFormat dateformat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
//				inseMap.put("uploadTime", dateformat.format(file.getUploadTime()));
//				inseMap.put("uploadUser", file.getUploadUser().getDisplayName());
//
//				fileList.add(inseMap);
//			}

			// 对段落按sortkey升序进行排序
			Collections.sort(sections, new Comparator<SectionDO>() {

				public int compare(SectionDO arg0, SectionDO arg1) {
					return arg0.getSortKey().compareTo(arg1.getSortKey());
				}
			});
			for (SectionDO section : sections) {
				// 不检索假删除的数据
				if (section.isDeleted()) {
					continue;
				}
				Integer id = section.getId();
				String content = section.getContent();
				String name = section.getName();
				Integer sortKey = section.getSortKey();
				Map<String, Object> inseMap = new HashMap<String, Object>();

				inseMap.put("id", id);
				inseMap.put("name", name);
				inseMap.put("content", content == null ? "" : content);
				inseMap.put("sortKey", sortKey);
				sectionList.add(inseMap);
			}
			DirectoryDO previous = new DirectoryDO();
			if (null != father) {
				@SuppressWarnings("unchecked")
				List<DirectoryDO> list = (List<DirectoryDO>) this
						.query("from DirectoryDO where sortKey < ? and father.id = ? and deleted = false order by sortKey desc",
								directoryDO.getSortKey(), father.getId());
				if (!list.isEmpty()) {
					previous = list.get(0);
				}
			}

			map.put("previousName", previous.getName());
			map.put("previous", previous.getId());
			//map.put("attachments", fileList);
			map.put("sections", sectionList);
		}
	}

	@Override
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void delete(String[] ids) {
		this.markAsDeleted(ids);
	}

	@Override
	protected void beforeDelete(Collection<DirectoryDO> collection) {
		// 是否有管理图书馆的全局权限
		checkModifyPermission();
		// 子目录也删除
		for (DirectoryDO directory : collection) {
			// 只能增删改自定义目录
			if(EnumDirectoryType.CUSTOM.getCode() != directory.getType()){
				throw SMSException.NO_ACCESS_RIGHT;
			}
			Collection<DirectoryDO> subDirectorys = this
					.getSubDirectorys(directory.getId());
			this.beforeDelete(subDirectorys);
			for (DirectoryDO subDirectory : subDirectorys) {
				subDirectory.setDeleted(true);
				this.internalUpdate(subDirectory);
			}
		}
	}

	/**
	 *  检查是否有管理安全图书馆的自定义目录的全局权限
	 */
	public void checkModifyPermission(){
		if (!permissionSetDao.hasPermission(PermissionSets.MANAGE_SAFETY_LIBRARY.getName())) {
			throw SMSException.NO_ACCESS_RIGHT;
		}
	}
	
	/**
	 * 获取当前目录下的子目录
	 */
	@SuppressWarnings("unchecked")
	public List<DirectoryDO> getSubDirectorys(Integer directoryId) {
		return (List<DirectoryDO>) this
				.query("from DirectoryDO where father.id = ? and deleted = false order by sortKey",
						directoryId);
	}

	/**
	 * 获取所有自定义的目录
	 */
	@SuppressWarnings("unchecked")
	public List<DirectoryDO> getCustomDirectorys() {
		return (List<DirectoryDO>) this.query(
				"from DirectoryDO where type = ? and deleted = false", EnumDirectoryType.CUSTOM.getCode());
	}

	/**
	 * 获取所有未删除的不是安全评审的目录
	 */
	@SuppressWarnings("unchecked")
	public List<DirectoryDO> getAllDirectorys() {
		return (List<DirectoryDO>) this
				.query("from DirectoryDO where deleted = false order by type desc, sortKey asc");
	}
	
	/**
	 * 通过目录名，目录说明，段落，安全信息，安全评审等进行模糊查询
	 * 
	 * @param content
	 *            搜索内容
	 * @return 目录列表
	 */
	@Transactional(readOnly = true, propagation = Propagation.SUPPORTS)
	public Map<String, Object> fuzzySearch(String content, final Integer showPage, final Integer row) {
		Map<String, Object> result = new HashMap<String, Object>();
		if (null == content) {
			return result;
		}
		String transferredContent = content.replaceAll("/", "//").replaceAll("%", "/%").replaceAll("_", "/_");
		transferredContent = "%" + transferredContent + "%";
		final List<String> params = new ArrayList<String>();
		final List<Object> values = new ArrayList<Object>();
		StringBuffer hql = new StringBuffer();
		// 自定义目录按照条目标题，条目内容，段落标题，段落内容，附件名称的字段进行模糊查询
		hql.append(" from DirectoryDO t left join t.sections s left join t.attachments a where t.deleted = false");
		// 如果没有查看系统目录的权限则只能查询自定义字段的内容
		if (!permissionSetDao.hasPermission(PermissionSets.VIEW_SAFETY_LIBRARY_SYS_DIR.getName())) {
			hql.append(" and t.type = :type");
			params.add("type");
			values.add(EnumDirectoryType.CUSTOM.getCode());
		}
		// 条目标题、条目内容
		hql.append(" and (");
		hql.append(" upper(t.name) like upper(:transferredContent) escape '/' or upper(t.description) like upper(:transferredContent) escape '/'");
		// 段落标题、段落内容
		hql.append(" or (s.deleted = false and (upper(s.name) like upper(:transferredContent) escape '/' or upper(s.content) like upper(:transferredContent) escape '/'))");
		// 附件名称、描述
		hql.append(" or (a.deleted = false and (upper(a.fileName) like upper(:transferredContent) escape '/' or upper(a.description) like upper(:transferredContent) escape '/'))");
		hql.append(")");
		
		// 6个模糊查询项
		for (int i = 0; i < 6; i++) {
			params.add("transferredContent");
			values.add(transferredContent);
		}
		
		final StringBuffer hqlForTotalCount = new StringBuffer("select count(distinct t) ").append(hql);
		final StringBuffer hqlForContent = new StringBuffer("select distinct t ").append(hql);
		@SuppressWarnings("unchecked")
		List<Long> totalCounts = this.getHibernateTemplate().executeFind(new HibernateCallback<List<Long>>() {
			
			@Override
			public List<Long> doInHibernate(org.hibernate.Session session) throws HibernateException, SQLException {
				Query query = session.createQuery(hqlForTotalCount.toString());
				for (int i = 0; i < values.size(); i++) {
					setParameter(query,params.get(i),values.get(i));
				}
				
				@SuppressWarnings("unchecked")
				List<Long> list = query.list();
				return list;
			}
		});
		// 总数
		result.put("totalCount", totalCounts.get(0) == null ? 0 : totalCounts.get(0));
		@SuppressWarnings("unchecked")
		List<DirectoryDO> directorys = this.getHibernateTemplate().executeFind(new HibernateCallback<List<DirectoryDO>>() {

			@Override
			public List<DirectoryDO> doInHibernate(org.hibernate.Session session) throws HibernateException, SQLException {
				Query query = session.createQuery(hqlForContent.toString());
				for (int i = 0; i < values.size(); i++) {
					setParameter(query,params.get(i),values.get(i));
				}
				if (null != showPage && null != row) {
					query.setFirstResult((showPage - 1) * row);
					query.setMaxResults(row);
				}
				@SuppressWarnings("unchecked")
				List<DirectoryDO> list = query.list();
				return list;
			}
		});
		List<Map<String, String>> dataList = new ArrayList<Map<String,String>>();
		// 循环自定义目录，返回条目标题，条目内容
		for (DirectoryDO directory : directorys) {
			Map<String, String> directoryMap = new HashMap<String, String>();
			directoryMap.put("title", directory.getName());
			directoryMap.put("content", directory.getDescription() == null ? "" : directory.getDescription());
			directoryMap.put("id", directory.getId().toString());
			directoryMap.put("created", DateHelper.formatIsoSecond(directory.getCreated()));
			directoryMap.put("lastupdate", DateHelper.formatIsoSecond(directory.getLastUpdate()));
			dataList.add(directoryMap);
		}
		result.put("dataList", dataList);
				
		return result;
	}
	
	/**
	 * 递归模糊查询父节点是father的所有子节点的条目<br>
	 * 查询语句使用的是sql
	 * @param content
	 * @param showPage
	 * @param row
	 * @return
	 */
	public Map<String, Object> fuzzySearchRiskSource(DirectoryDO father,String content, final Integer showPage, final Integer row) {
		Map<String, Object> result = new HashMap<String, Object>();
		if (null == content) {
			return result;
		}
		String transferredContent = content.replaceAll("/", "//").replaceAll("%", "/%").replaceAll("_", "/_");
		transferredContent = "%" + transferredContent + "%";
		// 子查询(查询条件主体)
		StringBuffer sql = new StringBuffer();
		sql.append("select distinct t.id");
		sql.append(" from t_directory t");
		// 条件
		sql.append(" where t.deleted = '0'");
		// 条目标题、条目内容
		sql.append(" and (");
		sql.append(" upper(t.name) like upper(:transferredContent) escape '/' or upper(t.description) like upper(:transferredContent) escape '/'");
		sql.append(" )");
		// 向下递归
		sql.append(" connect by t.father_id = prior t.id");
		// 开始节点
		if (null != father) {
			sql.append(" start with t.id = :fatherId");
		}
		
		// 总数
		StringBuffer sqlForTotalCount = new StringBuffer();
		sqlForTotalCount.append("select count(id) from (");
		sqlForTotalCount.append(sql);
		sqlForTotalCount.append(")");
		
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
		SQLQuery query = session.createSQLQuery(sqlForTotalCount.toString());
		// 递归开始位置
		if (null != father) {
			query.setInteger("fatherId", father.getId());
		}
		// 2个模糊查询项
		for (int i = 0; i < 2; i++) {
			query.setString("transferredContent", transferredContent);
		}
		@SuppressWarnings("unchecked")
		List<BigDecimal> totalCounts = query.list();
		// 总数
		result.put("totalCount", totalCounts.get(0) == null ? 0 : totalCounts.get(0).intValue());
		
		// 返回的字段sql(进行分页)
		StringBuffer sqlForContent = new StringBuffer();
		// 查询的字段
		sqlForContent.append("select");
		sqlForContent.append(" id as id,");
		sqlForContent.append(" name as title,");
		sqlForContent.append(" description as description,");
		sqlForContent.append(" created as created,");
		sqlForContent.append(" last_update as lastUpdate");
		sqlForContent.append(" from t_directory");
		sqlForContent.append(" where id in (");
		
		// 分页
		sqlForContent.append(" select id from (");
		sqlForContent.append(" select id, rownum as rn from (");
		sqlForContent.append(sql);
		sqlForContent.append(" )");
		sqlForContent.append(" )");
		Integer startNum = null;
		Integer endNum = null;
		if (null != showPage && null != row) {
			// 从1开始
			startNum = (showPage - 1) * row + 1;
			endNum = showPage * row;
			sqlForContent.append(" where rn >= :startNum and rn <= :endNum");
		}
		sqlForContent.append(" )");
		query = session.createSQLQuery(sqlForContent.toString());
		// 递归开始位置
		if (null != father) {
			query.setInteger("fatherId", father.getId());
		}
		// 2个模糊查询项
		for (int i = 0; i < 2; i++) {
			query.setString("transferredContent", transferredContent);
		}
		if (null != startNum && null != endNum) {
			query.setInteger("startNum", startNum);
			query.setInteger("endNum", endNum);
		}
		query.addScalar("id", StandardBasicTypes.INTEGER);
		query.addScalar("title", StandardBasicTypes.STRING);
		query.addScalar("description", StandardBasicTypes.STRING);
		query.addScalar("created", StandardBasicTypes.TIMESTAMP);
		query.addScalar("lastUpdate", StandardBasicTypes.TIMESTAMP);
		
		@SuppressWarnings("unchecked")
		List<Object[]> list = query.list();
		List<Map<String, String>> dataList = new ArrayList<Map<String,String>>();
		for (Object[] item : list) {
			Map<String, String> resultMap = new HashMap<String, String>();
			Integer id = (Integer) item[0];
			String title = (String) item[1];
			String description = (String) item[2];
			Date created = (Date) item[3];
			Date lastUpdate = (Date) item[4];
			resultMap.put("title", title == null ? "" : title);
			resultMap.put("content", description == null ? "" : description);
			resultMap.put("id", id.toString());
			resultMap.put("created", DateHelper.formatIsoSecond(created));
			resultMap.put("lastupdate", DateHelper.formatIsoSecond(lastUpdate));
			dataList.add(resultMap);
		}
		result.put("dataList", dataList);
		return result;
	}
	
	/**
	 * 递归模糊查询段落父节点是father的所有子节点的条目<br>
	 * 查询语句使用的是sql
	 * @param content
	 * @param showPage
	 * @param row
	 * @return
	 */
	public Map<String, Object> fuzzySearchRiskSourceSection(DirectoryDO father,String searchKey, final Integer showPage, final Integer row) {
		Map<String, Object> result = new HashMap<String, Object>();
		if (null == searchKey) {
			return result;
		}
		String transferredContent = searchKey.replaceAll("/", "//").replaceAll("%", "/%").replaceAll("_", "/_");
		transferredContent = "%" + transferredContent + "%";
		// 子查询(查询条件主体)
		StringBuffer sql = new StringBuffer();
		sql.append("select distinct t.id");
		sql.append(" from t_section t");
		// 条件
		sql.append(" where t.deleted = '0'");
		// 条目标题、条目内容
		sql.append(" and (");
		sql.append(" upper(t.name) like upper(:transferredContent) escape '/' or upper(t.content) like upper(:transferredContent) escape '/'");
		sql.append(" )");
		sql.append(" and t.directory_id in (");
		sql.append("select distinct t.id");
		sql.append(" from t_directory t");
		// 条件
		sql.append(" where t.deleted = '0'");
		// 向下递归
		sql.append(" connect by t.father_id = prior t.id");
		// 开始节点
		if (null != father) {
			sql.append(" start with t.id = :fatherId");
		}
		sql.append(" )");
		
		// 总数
		StringBuffer sqlForTotalCount = new StringBuffer();
		sqlForTotalCount.append("select count(id) from (");
		sqlForTotalCount.append(sql);
		sqlForTotalCount.append(")");
		
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
		SQLQuery query = session.createSQLQuery(sqlForTotalCount.toString());
		// 递归开始位置
		if (null != father) {
			query.setInteger("fatherId", father.getId());
		}
		// 2个模糊查询项
		for (int i = 0; i < 2; i++) {
			query.setString("transferredContent", transferredContent);
		}
		@SuppressWarnings("unchecked")
		List<BigDecimal> totalCounts = query.list();
		// 总数
		result.put("totalCount", totalCounts.get(0) == null ? 0 : totalCounts.get(0).intValue());
		
		// 返回的字段sql(进行分页)
		StringBuffer sqlForContent = new StringBuffer();
		// 查询的字段
		sqlForContent.append("select");
		sqlForContent.append(" directory_id as directoryId,");
		sqlForContent.append(" name as title,");
		sqlForContent.append(" content as content,");
		sqlForContent.append(" created as created,");
		sqlForContent.append(" last_update as lastUpdate");
		sqlForContent.append(" from t_section");
		sqlForContent.append(" where id in (");
		
		// 分页
		sqlForContent.append(" select id from (");
		sqlForContent.append(" select id, rownum as rn from (");
		sqlForContent.append(sql);
		sqlForContent.append(" )");
		sqlForContent.append(" )");
		Integer startNum = null;
		Integer endNum = null;
		if (null != showPage && null != row) {
			// 从1开始
			startNum = (showPage - 1) * row + 1;
			endNum = showPage * row;
			sqlForContent.append(" where rn >= :startNum and rn <= :endNum");
		}
		sqlForContent.append(" )");
		query = session.createSQLQuery(sqlForContent.toString());
		// 递归开始位置
		if (null != father) {
			query.setInteger("fatherId", father.getId());
		}
		// 2个模糊查询项
		for (int i = 0; i < 2; i++) {
			query.setString("transferredContent", transferredContent);
		}
		if (null != startNum && null != endNum) {
			query.setInteger("startNum", startNum);
			query.setInteger("endNum", endNum);
		}
		query.addScalar("directoryId", StandardBasicTypes.INTEGER);
		query.addScalar("title", StandardBasicTypes.STRING);
		query.addScalar("content", StandardBasicTypes.STRING);
		query.addScalar("created", StandardBasicTypes.TIMESTAMP);
		query.addScalar("lastUpdate", StandardBasicTypes.TIMESTAMP);
		
		@SuppressWarnings("unchecked")
		List<Object[]> list = query.list();
		List<Map<String, String>> dataList = new ArrayList<Map<String,String>>();
		for (Object[] item : list) {
			Map<String, String> resultMap = new HashMap<String, String>();
			Integer directoryId = (Integer) item[0];
			String title = (String) item[1];
			String content = (String) item[2];
			Date created = (Date) item[3];
			Date lastUpdate = (Date) item[4];
			resultMap.put("title", title == null ? "" : title);
			resultMap.put("content", content == null ? "" : content);
			resultMap.put("id", directoryId.toString());
			resultMap.put("created", DateHelper.formatIsoSecond(created));
			resultMap.put("lastupdate", DateHelper.formatIsoSecond(lastUpdate));
			dataList.add(resultMap);
		}
		result.put("dataList", dataList);
		return result;
	}
	
	/**
	 * 通过目录名进行模糊查询
	 * 
	 * @param content
	 *            搜索内容
	 * @return 目录列表
	 */
	@SuppressWarnings("unchecked")
	public List<DirectoryDO> fuzzySearchByName(String content) {
		content = content.replaceAll("/", "//").replaceAll("%", "/%").replaceAll("_", "/_");
		List<DirectoryDO> list = (List<DirectoryDO>) this.query(
				"from DirectoryDO where upper(name) like upper(?) escape '/' and deleted = false", "%"
						+ content + "%");
		return list;
	}

	/**
	 * 通过目录名进行当前目录的子目录的模糊查询
	 * 
	 * @param content
	 *            搜索内容
	 * @return 目录列表
	 */
	@SuppressWarnings("unchecked")
	public List<DirectoryDO> fuzzySearchSubDirectorysByName(String content, Integer fatherId) {
		content=content.replaceAll("/", "//").replaceAll("%","/%").replaceAll("_","/_");
		List<DirectoryDO> list = (List<DirectoryDO>) this
				.query("from DirectoryDO where upper(name) like upper(?) escape '/' and father.id = ? and deleted = false",
						"%" + content + "%", fatherId);
		return list;
	}
	
	/**
	 * 通过目录名进行当前目录的子目录的查询<br>
	 * 从自定义目录进行查询
	 * 
	 * @param name
	 *            搜索目录名
	 * @return 目录
	 */
	public DirectoryDO getSubDirecotoryByName(String name, Integer fatherId){
		StringBuffer hql = new StringBuffer("from DirectoryDO where deleted = false and type = ?");
		List<Object> values = new ArrayList<Object>();
		values.add(EnumDirectoryType.CUSTOM.getCode());
		if (null == name) {
			hql.append(" and name is null");
		} else {
			hql.append(" and name = ?");
			values.add(name);
		}
		if (null == fatherId) {
			hql.append(" and father.id is null");
		}else{
			hql.append(" and father.id = ?");
			values.add(fatherId);
		}
		@SuppressWarnings("unchecked")
		List<DirectoryDO> list = (List<DirectoryDO>) this.query(hql.toString(), values.toArray());
		if (list.isEmpty()) {
			return null;
		}
		return list.get(0);
	}

	/**
	 * 新增目录
	 */
	public void addDirectory(DirectoryDO current, DirectoryDO previous) {
		Integer previousSortKey = previous == null ? -1 : previous.getSortKey();
		current.setSortKey(previousSortKey + 1);
		@SuppressWarnings("unchecked")
		List<DirectoryDO> list = (List<DirectoryDO>) this.query(
				"from DirectoryDO where father.id = ? and sortKey > ?", current.getFather().getId(), previousSortKey);
		for (DirectoryDO directory : list) {
			directory.setSortKey(directory.getSortKey() + 1);
			this.internalUpdate(directory);
		}
		this.internalSave(current);
	}

	/**
	 * 同目录下的更新
	 * 
	 * @param current
	 * @param previous
	 * @throws Exception
	 */
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void updateDirectoryToSameFather(DirectoryDO current,
			DirectoryDO previous) {
		Integer oldSortKey = current.getSortKey();
		Integer previousSortKey = previous == null ? -1 : previous.getSortKey();
		current.setSortKey(previousSortKey + 1);
		if (oldSortKey > previousSortKey) {
			// 由后转到前，sortKey由大变小,newSortKey与oldSortKey之间的sortKey增1
			@SuppressWarnings("unchecked")
			List<DirectoryDO> list = (List<DirectoryDO>) this
					.query("from DirectoryDO where father.id = ? and sortKey > ? and sortKey < ?",
							current.getFather().getId(),
							previousSortKey.intValue(), oldSortKey.intValue());
			for (DirectoryDO directory : list) {
				directory.setSortKey(directory.getSortKey() + 1);
				this.internalUpdate(directory);
			}
			this.update(current);
		} else {
			// 由前转到后，sortKey由小变大,newSortKey与oldSortKey之间的sortKey减1
			@SuppressWarnings("unchecked")
			List<DirectoryDO> list = (List<DirectoryDO>) this
					.query("from DirectoryDO where father.id = ? and sortKey > ? and sortKey <= ?",
							current.getFather().getId(), oldSortKey.intValue(),
							previousSortKey.intValue());
			for (DirectoryDO directory : list) {
				directory.setSortKey(directory.getSortKey() - 1);
				this.update(directory);
			}
			current.setSortKey(previousSortKey);
			this.update(current);
		}
	}

	/**
	 * 不同目录下的更新
	 * 
	 * @param current
	 * @param previous
	 * @throws Exception
	 */
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void updateDirectoryToDiffFather(DirectoryDO current, DirectoryDO previous, DirectoryDO newFather){
		// 检查目标目录是否是源目录的子目录
		if (isSubDirectory(newFather, current)) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "所属章节不能为当前章节或当前章节的子章节！");
		}
		Integer oldSortKey = current.getSortKey();
		Integer previousSortKey = previous == null ? -1 : previous.getSortKey();
		// 原目录以后的sortKey减1
		@SuppressWarnings("unchecked")
		List<DirectoryDO> oldDirectorys = (List<DirectoryDO>) this
				.query("from DirectoryDO where father.id = ? and sortKey > ?",
						current.getFather().getId(), oldSortKey.intValue());
		for (DirectoryDO directory : oldDirectorys) {
			directory.setSortKey(directory.getSortKey() - 1);
			this.update(directory);
		}
		// 新目录以后的sortKey增1
		@SuppressWarnings("unchecked")
		List<DirectoryDO> newDirectorys = (List<DirectoryDO>) this
				.query("from DirectoryDO where father.id = ? and sortKey > ?",
						newFather.getId(), previousSortKey.intValue());
		for (DirectoryDO directory : newDirectorys) {
			directory.setSortKey(directory.getSortKey() + 1);
			this.update(directory);
		}
		current.setFather(newFather);
		current.setSortKey(previousSortKey + 1);
		this.update(current);
	}

	public DirectoryDO getSubDirectorysByName(Integer fatherId, String name) {
		if (null == name) {
			return null;
		}
		@SuppressWarnings("unchecked")
		List<DirectoryDO> list = (List<DirectoryDO>) this
				.query("from DirectoryDO where deleted = false and name = ? and father.id = ?",
						name, fatherId);
		if (!list.isEmpty()) {
			return list.get(0);
		}
		return null;
	}

	/**
	 * 通过目录类型查询目录
	 * 
	 * @param type
	 * @return
	 */
	public List<DirectoryDO> getDirectorysByType(Integer type) {
		if (null == type) {
			return null;
		}
		@SuppressWarnings("unchecked")
		List<DirectoryDO> list = (List<DirectoryDO>) this.query(
				"from DirectoryDO where deleted = false and type = ?", type);
		if (!list.isEmpty()) {
			return list;
		}
		return null;
	}
	
	/**
	 * 目标目录是否是源目录的子目录
	 * @param fromDirectory
	 * @param toDirectory
	 * @return
	 */
	private boolean isSubDirectory(DirectoryDO toDirectory, DirectoryDO fromDirectory){
		boolean result = false;
		if (null == toDirectory) {
			if(toDirectory == fromDirectory){
				result = true;
			}
		} else {
			if (toDirectory.equals(fromDirectory)) {
				result = true;
			} else {
				// 递归判断目标目录的父目录是否是源目录的子目录
				result = isSubDirectory(toDirectory.getFather(), fromDirectory);
			}
		}
		return result;
	}
	
	private Query setParameter(Query query, String param, Object value) {
		if (param != null && value != null) {
			// 这里考虑传入的参数是什么类型，不同类型使用的方法不同
			if (value instanceof Collection<?>) {
				query.setParameterList(param, (Collection<?>) value);
			} else if (value instanceof Object[]) {
				query.setParameterList(param, (Object[]) value);
			} else {
				query.setParameter(param, value);
			}
		}
		return query;
	}

	/**
	 * @param fileDao
	 *            the fileDao to set
	 */
	public void setFileDao(FileDao fileDao) {
		this.fileDao = fileDao;
	}

	/**
	 * @param sectionDao
	 *            the sectionDao to set
	 */
	public void setSectionDao(SectionDao sectionDao) {
		this.sectionDao = sectionDao;
	}

	/**
	 * @param activityDao
	 *            the activityDao to set
	 */
	public void setActivityDao(ActivityDao activityDao) {
		this.activityDao = activityDao;
	}

	/**
	 * @param assessmentCommentDao
	 *            the assessmentCommentDao to set
	 */
	public void setAssessmentCommentDao(
			AssessmentCommentDao assessmentCommentDao) {
		this.assessmentCommentDao = assessmentCommentDao;
	}

	/**
	 * @param permissionSetDao the permissionSetDao to set
	 */
	public void setPermissionSetDao(PermissionSetDao permissionSetDao) {
		this.permissionSetDao = permissionSetDao;
	}

	/**
	 * @param labelDao the labelDao to set
	 */
	public void setLabelDao(LabelDao labelDao) {
		this.labelDao = labelDao;
	}

	/**
	 * @param airportDao the airportDao to set
	 */
	public void setAirportDao(AirportDao airportDao) {
		this.airportDao = airportDao;
	}

	/**
	 * @param aircraftDao the aircraftDao to set
	 */
	public void setAircraftDao(AircraftDao aircraftDao) {
		this.aircraftDao = aircraftDao;
	}

	/**
	 * @param flightInfoDao the flightInfoDao to set
	 */
	public void setFlightInfoDao(FlightInfoDao flightInfoDao) {
		this.flightInfoDao = flightInfoDao;
	}

	/**
	 * @param dailySafetyWorkStatusDao the dailySafetyWorkStatusDao to set
	 */
	public void setDailySafetyWorkStatusDao(DailySafetyWorkStatusDao dailySafetyWorkStatusDao) {
		this.dailySafetyWorkStatusDao = dailySafetyWorkStatusDao;
	}
}
