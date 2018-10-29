package com.usky.sms.file;

import java.io.Serializable;
import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.hibernate.exception.ConstraintViolationException;

import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;
import com.usky.sms.directory.DirectoryDO;

public class FileTypeDirectoryMappingDao extends BaseDao<FileTypeDirectoryMappingDO> {

	protected FileTypeDirectoryMappingDao() {
		super(FileTypeDirectoryMappingDO.class);
	}
	
	@Override
	public Serializable internalSave(FileTypeDirectoryMappingDO obj) {
		try {
			return super.internalSave(obj);
		} catch (ConstraintViolationException e) {
			throw this.generateExistSameFileTypeException(obj.getFileType());
		}
	}

	@Override
	public boolean internalUpdate(FileTypeDirectoryMappingDO obj) {
		try {
			return super.internalUpdate(obj);
		} catch (ConstraintViolationException e) {
			throw this.generateExistSameFileTypeException(obj.getFileType());
		}
	}
	
	/**
	 * 生成文件类型唯一性的异常
	 * @param fileType
	 * @return
	 */
	private SMSException generateExistSameFileTypeException(String fileType) {
		EnumFileType enumFileType;
		String comment;
		try {
			enumFileType = EnumFileType.getEnumByVal(fileType);
			comment = enumFileType.toComment();
		} catch (Exception e) {
			comment = "未知类型";
		}
		return new SMSException("-30000", "附件类型[" + comment + "]已配置过了");
	}

	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		FileTypeDirectoryMappingDO fileTypeDirectoryMapping = (FileTypeDirectoryMappingDO) obj;
		if ("fileType".equals(field.getName())) {
			Map<String, Object> fileType = new HashMap<String, Object>();
			fileType.put("id", fileTypeDirectoryMapping.getFileType());
			try {
				EnumFileType enumFileType = EnumFileType.getEnumByVal(fileTypeDirectoryMapping.getFileType());
				fileType.put("comment", enumFileType.toComment());
			} catch (Exception e) {
				fileType.put("comment", "未知类型");
			}
			map.put(field.getName(), fileType);
		} else {
			super.setField(map, obj, claz, multiple, field);
		}
	}

	/**
	 * 根据文件类型返回改文件类型对应的目录
	 * @param fileType 文件类型
	 * @return 文件类型对应的目录
	 */
	public DirectoryDO getDirectoryByFileType(String fileType) {
		@SuppressWarnings("unchecked")
		List<DirectoryDO> list = this.getHibernateTemplate().find("select t.directory from FileTypeDirectoryMappingDO t where t.deleted = false and t.fileType = ?", fileType);
		return list.isEmpty() ? null : list.get(0);
	}
}
