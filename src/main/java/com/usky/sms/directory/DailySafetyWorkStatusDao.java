package com.usky.sms.directory;

import java.lang.reflect.Field;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.hibernate.HibernateException;
import org.hibernate.Query;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate3.HibernateCallback;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.common.DateHelper;
import com.usky.sms.core.BaseDao;
import com.usky.sms.file.EnumFileType;
import com.usky.sms.file.FileDO;
import com.usky.sms.file.FileDao;
import com.usky.sms.safetyreview.EnumDailySafetyWorkStatus;
import com.usky.sms.unit.UnitDao;
import com.usky.sms.user.UserContext;

public class DailySafetyWorkStatusDao extends BaseDao<DailySafetyWorkStatusDO> {

	@Autowired
	private FileDao fileDao;
	
	@Autowired
	private UnitDao unitDao;

	public DailySafetyWorkStatusDao() {
		super(DailySafetyWorkStatusDO.class);
	}

	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		DailySafetyWorkStatusDO dailySafetyWorkStatus = (DailySafetyWorkStatusDO) obj;
		String fieldName = field.getName();
		if ("status".equals(fieldName)) {
			String status = dailySafetyWorkStatus.getStatus();
			map.put(fieldName, EnumDailySafetyWorkStatus.getByStatus(status).getDescription());
		} else {
			super.setField(map, obj, claz, multiple, field);
		}
	}

	@Override
	protected void setFields(Map<String, Object> map, Object obj, Class<?> claz, List<String> fields, boolean multiple,
			boolean showExtendFields) {
		boolean editable = false;
		DailySafetyWorkStatusDO dailySafetyWorkStatus = (DailySafetyWorkStatusDO) obj;
		// 如果是未发布且当前用户是创建人时可执行编辑，上传附件，删除，发布操作
		if (EnumDailySafetyWorkStatus.UN_RELEASE.toString().equals(dailySafetyWorkStatus.getStatus())) {
			if (UserContext.getUserId().equals(dailySafetyWorkStatus.getCreator().getId())) {
				editable = true;
			}
		}
		map.put("editable", editable);
		super.setFields(map, obj, claz, fields, multiple, showExtendFields);
	}

	@Override
	protected void beforeUpdate(int id, Map<String, Object> map) {
		if (EnumDailySafetyWorkStatus.RELEASE.toString().equals((String) map.get("status"))) {
			map.put("releaseDate", new Date());
		}
	}

	@Override
	protected void beforeDelete(Collection<DailySafetyWorkStatusDO> collection) {
		// 物理删除掉所属附件
		for (DailySafetyWorkStatusDO dailySafetyWorkStatus : collection) {
			@SuppressWarnings("unchecked")
			List<FileDO> files = (List<FileDO>) this.query("from FileDO t where t.sourceType = ? and t.source = ?", EnumFileType.SAFETYREVIEW.getCode(), dailySafetyWorkStatus.getId());
			fileDao.internalDelete(files);
		}
	}

	@Override
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void delete(String[] ids) {
		this.markAsDeleted(ids);
	}

	/**
	 * 获取所有安全评审完成状态情况信息
	 * 
	 * @param directoryId
	 * @return
	 */
	public List<DailySafetyWorkStatusDO> getByDirectoryId(Integer directoryId) {
		@SuppressWarnings("unchecked")
		List<DailySafetyWorkStatusDO> list = (List<DailySafetyWorkStatusDO>) this.query("from DailySafetyWorkStatusDO t where t.deleted = false and t.directory.id = ?", directoryId);
		for (DailySafetyWorkStatusDO dailySafetyWorkStatus : list) {
			List<FileDO> attachments = fileDao.getFilesBySource(EnumFileType.SAFETYREVIEW.getCode(), dailySafetyWorkStatus.getId());
			dailySafetyWorkStatus.setAttachments(attachments);
		}
		return list;
	}

	/**
	 * 获取考核内容ID下当前用户所在具有查看日常安全工作情况权限的安监机构所有日常安全工作情况信息 <br>
	 * 
	 * @param unitIds
	 *            安检机构的Id(必须)
	 * @param assessmentCommentId
	 *            考核内容Id(必须)
	 * @param description
	 *            描述(模糊匹配, 可空)
	 * @param status
	 *            状态(可空)
	 * @return
	 */
	public List<DailySafetyWorkStatusDO> getByMultiCon(Integer assessmentCommentId, List<Integer> unitIds, String description, String status, Integer year, Integer season) {
		if (null == assessmentCommentId || null == unitIds || unitIds.isEmpty()) {
			return new ArrayList<DailySafetyWorkStatusDO>();
		}
		StringBuffer hql = new StringBuffer();
		hql.append("select distinct t from DailySafetyWorkStatusDO t left join fetch t.directory left join fetch t.creator")
		   .append(" left join t.unit inner join t.assessmentComment")
		   .append(" where t.deleted = false and t.assessmentComment.id =:assessmentCommentId and t.unit.id in (:unitIds)");
		List<String> params = new ArrayList<String>();
		List<Object> values = new ArrayList<Object>();
		// 考核内容的ID
		params.add("assessmentCommentId");
		values.add(assessmentCommentId);
		// 安检机构的ID
		params.add("unitIds");
		values.add(unitIds);
		// 年份
		if (null != year) {
			hql.append(" and t.year = :year");
			params.add("year");
			values.add(year);
		}
		// 季度
		if (null != season) {
			hql.append(" and t.season = :season");
			params.add("season");
			values.add(season);
		}
		// 描述
		if (null != description) {
			description = description.replaceAll("/", "//").replaceAll("%", "/%").replaceAll("_", "/_");
			hql.append(" and upper(t.description) like upper(:description)");
			params.add("description");
			values.add("%" + description + "%");
		}
		// 状态
		// 未发布的数据仅当前创建人可以检索到
		if (null == status) {
			hql.append(" and ((t.status = 'UN_RELEASE' and t.creator =:creator) or t.status = 'RELEASE')");
			params.add("creator");
			values.add(UserContext.getUser());
		} else if (EnumDailySafetyWorkStatus.RELEASE.toString().equals(status)) {
			hql.append(" and t.status =:status");
			params.add("status");
			values.add(status);
		} else if (EnumDailySafetyWorkStatus.UN_RELEASE.toString().equals(status)) {
			hql.append(" and t.status =:status and t.creator =:creator");
			params.add("status");
			values.add(status);
			params.add("creator");
			values.add(UserContext.getUser());
		}
		hql.append(" order by t.created");
		@SuppressWarnings("unchecked")
		List<DailySafetyWorkStatusDO> list = (List<DailySafetyWorkStatusDO>) this.query(hql.toString(), params.toArray(new String[0]), values.toArray());
		for (DailySafetyWorkStatusDO dailySafetyWorkStatus : list) {
			List<FileDO> attachments = fileDao.getFilesBySource(EnumFileType.SAFETYREVIEW.getCode(), dailySafetyWorkStatus.getId());
			dailySafetyWorkStatus.setAttachments(attachments);
		}
		return list;
	}

	/**
	 * 获取安全评审完成状态情况下的附件信息
	 * 
	 * @param directoryId
	 * @return
	 */
	public List<DailySafetyWorkStatusDO> getAttachmentsByDirectoryId(Integer directoryId) {
		@SuppressWarnings("unchecked")
		List<DailySafetyWorkStatusDO> list = (List<DailySafetyWorkStatusDO>) this.query("from DailySafetyWorkStatusDO t where t.deleted = false and t.directory.id = ?", directoryId);
		return list;
	}

	/**
	 * 通过评审内容、安监机构、季度检索日常安全工作情况的条数
	 */
	public int getDailySafetyWorkStatusCount(Integer assessmentCommentId, Integer unitId, Integer year, Integer season) {
		@SuppressWarnings("unchecked")
		List<Long> count = (List<Long>) this
				.query("select count(t) from DailySafetyWorkStatusDO t where t.deleted = false and t.year = ? and t.season = ? and t.assessmentComment.id = ? and t.unit.id = ?",
						year, season, assessmentCommentId, unitId);
		if (count.isEmpty()) {
			return 0;
		}
		return count.get(0).intValue();
	}
	
	/**
	 * 通过附件获取附件所在的日常安全工作情况
	 */
	@SuppressWarnings("unchecked")
	public List<DailySafetyWorkStatusDO> getByAttachment(Integer fileId){
		List<DailySafetyWorkStatusDO> list = null;
		if (null == fileId) {
			list = new ArrayList<DailySafetyWorkStatusDO>();
		} else {
			list = (List<DailySafetyWorkStatusDO>) this
					.query("select t from DailySafetyWorkStatusDO t, FileDO f where t.deleted = false and t.id = f.source and f.sourceType = ? and f.id = ?",
							EnumFileType.SAFETYREVIEW.getCode(), fileId);
		}
		return list;
	}
	
	/**
	 * 通过目录名，目录说明，段落，安全信息，安全评审等进行模糊查询
	 * 
	 * @param content
	 *            搜索内容
	 * @return 目录列表
	 */
	@SuppressWarnings("unchecked")
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
		final StringBuffer hql = new StringBuffer();
		
		// 日常安全工作情况按照安监机构名称，描述，对应的评审规则(考核内容的名称)，附件名称的字段进行模糊查询 
		hql.append(" from DailySafetyWorkStatusDO t, FileDO f where t.deleted = false");
		hql.append(" and (");
		// 安监机构名称、描述、对应的评审规则(考核内容的名称)
		hql.append(" upper(t.unit.name) like upper(:transferredContent) escape '/' or upper(t.description) like upper(:transferredContent) escape '/' or upper(t.assessmentComment.description) like upper(:transferredContent) escape '/'");
		// 3个like语句
		for (int i = 0; i < 3; i++) {
			params.add("transferredContent");
			values.add(transferredContent);
		}
		// 附件的名称
		hql.append(" or (f.deleted = false and upper(f.fileName) like upper(:transferredContent) escape '/' and t.id = f.source and f.sourceType = :sourceType)");
		params.add("transferredContent");
		values.add(transferredContent);
		params.add("sourceType");
		values.add(EnumFileType.SAFETYREVIEW.getCode());
		hql.append(")");
		final StringBuffer hqlForTotalCount = new StringBuffer("select count(distinct t)").append(hql);
		final StringBuffer hqlForContent = new StringBuffer("select distinct t").append(hql);
		List<Long> totalCounts = this.getHibernateTemplate().executeFind(new HibernateCallback<List<Long>>() {

			@Override
			public List<Long> doInHibernate(org.hibernate.Session session) throws HibernateException, SQLException {
				Query query = session.createQuery(hqlForTotalCount.toString());
				for (int i = 0; i < values.size(); i++) {
					setParameter(query,params.get(i),values.get(i));
				}
				
				List<Long> list = query.list();
				return list;
			}
		});
		// 总数
		result.put("totalCount", totalCounts.get(0) == null ? 0 : totalCounts.get(0));
		List<DailySafetyWorkStatusDO> dailySafetyWorkStatuses = this.getHibernateTemplate().executeFind(new HibernateCallback<List<DailySafetyWorkStatusDO>>() {

			@Override
			public List<DailySafetyWorkStatusDO> doInHibernate(org.hibernate.Session session) throws HibernateException, SQLException {
				Query query = session.createQuery(hqlForContent.toString());
				for (int i = 0; i < values.size(); i++) {
					setParameter(query,params.get(i),values.get(i));
				}
				if (null != showPage && null != row) {
					query.setFirstResult((showPage -1 ) * row);
					query.setMaxResults(row);
				}
				List<DailySafetyWorkStatusDO> list = query.list();
				return list;
			}
		});
		List<Map<String, String>> dataList = new ArrayList<Map<String,String>>();
		
		// 循环日常安全工作情况，返回安监机构名称，描述
		for (DailySafetyWorkStatusDO dailySafetyWorkStatus : dailySafetyWorkStatuses) {
			Map<String, String> dailySafetyWorkStatusMap = new HashMap<String, String>();
			dailySafetyWorkStatusMap.put("title", dailySafetyWorkStatus.getDescription());
			// 相关状态,信息类型,描述等信息
			StringBuffer detail = new StringBuffer();
			detail.append("安监机构：");
			detail.append(dailySafetyWorkStatus.getUnit().getName());
			detail.append(" 考核内容：");
			detail.append(dailySafetyWorkStatus.getAssessmentComment().getDescription());
			dailySafetyWorkStatusMap.put("content", detail.toString());
			// 考核内容的id
			dailySafetyWorkStatusMap.put("id", dailySafetyWorkStatus.getAssessmentComment().getId().toString());
			dailySafetyWorkStatusMap.put("type", EnumDirectoryType.SAFETYREVIEW.toString());
			dailySafetyWorkStatusMap.put("created", DateHelper.formatIsoSecond(dailySafetyWorkStatus.getCreated()));
			dailySafetyWorkStatusMap.put("lastupdate", DateHelper.formatIsoSecond(dailySafetyWorkStatus.getLastUpdate()));
			dataList.add(dailySafetyWorkStatusMap);
		}
		result.put("dataList", dataList);
				
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
	 * @param unitDao the unitDao to set
	 */
	public void setUnitDao(UnitDao unitDao) {
		this.unitDao = unitDao;
	}

}
