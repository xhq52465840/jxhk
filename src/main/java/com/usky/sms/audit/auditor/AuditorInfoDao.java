package com.usky.sms.audit.auditor;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.core.BaseDao;
import com.usky.sms.file.EnumFileType;
import com.usky.sms.file.FileDao;

public class AuditorInfoDao extends BaseDao<AuditorInfoDO> {

	@Autowired
	private AuditorDao auditorDao;
	
	@Autowired
	private FileDao fileDao;
	
	protected AuditorInfoDao() {
		super(AuditorInfoDO.class);
	}
	
	protected Map<String, Object> getByAuditor(Integer auditorId) {
		@SuppressWarnings("unchecked")
		List<AuditorInfoDO> auditorInfos = this.getHibernateTemplate().find("from AuditorInfoDO a where a.deleted = false and a.auditor.id = ?", auditorId);
		List<AuditorInfoDO> PERSONAL = new ArrayList<AuditorInfoDO>();
		List<AuditorInfoDO> TRAIN = new ArrayList<AuditorInfoDO>();
		List<AuditorInfoDO> SITUATION = new ArrayList<AuditorInfoDO>();
		List<AuditorInfoDO> AUDIT = new ArrayList<AuditorInfoDO>();
		List<AuditorInfoDO> RISK = new ArrayList<AuditorInfoDO>();
		List<AuditorInfoDO> SAFE = new ArrayList<AuditorInfoDO>();
		List<AuditorInfoDO> INFO = new ArrayList<AuditorInfoDO>();
		for (AuditorInfoDO auditorInfo : auditorInfos) {
			if ("PERSONAL".equals(auditorInfo.getType())) {
				PERSONAL.add(auditorInfo);
			} else if ("TRAIN".equals(auditorInfo.getType())) {
				TRAIN.add(auditorInfo);
			} else if ("SITUATION".equals(auditorInfo.getType())) {
				SITUATION.add(auditorInfo);
			} else if ("AUDIT".equals(auditorInfo.getType())) {
				AUDIT.add(auditorInfo);
			} else if ("RISK".equals(auditorInfo.getType())) {
				RISK.add(auditorInfo);
			}else if ("SAFE".equals(auditorInfo.getType())) {
				SAFE.add(auditorInfo);
			}else if ("INFO".equals(auditorInfo.getType())) {
				INFO.add(auditorInfo);
			}
		}
		Map<String, Object> map = new LinkedHashMap<String, Object>();
		map.put("personal", this.convert(PERSONAL));
		map.put("train", this.convert(TRAIN));
		map.put("situation", this.convert(SITUATION));
		map.put("audit", this.convert(AUDIT));
		map.put("risk", this.convert(RISK));
		map.put("safe", this.convert(SAFE));
		map.put("info", this.convert(INFO));
		if (auditorDao.hasEditBaseInfo(auditorId)){
			map.put("edit", true);
		} else {
			map.put("edit", false);
		}
		return map;
	}

	
	@Override
	protected void setFields(Map<String, Object> map, Object obj, Class<?> claz, List<String> fields, boolean multiple, boolean showExtendFields) {
		AuditorInfoDO auditorInfo = (AuditorInfoDO) obj;
		if ("TRAIN".equals(auditorInfo.getType())) {
			map.put("trainFiels", fileDao.convert(fileDao.getFilesBySource(EnumFileType.AUDITOR_TRAIN.getCode(), auditorInfo.getId())));
		}
		super.setFields(map, obj, claz, fields, multiple, showExtendFields);
	}

	public void setAuditorDao(AuditorDao auditorDao) {
		this.auditorDao = auditorDao;
	}

	public void setFileDao(FileDao fileDao) {
		this.fileDao = fileDao;
	}
	
	
	
}

