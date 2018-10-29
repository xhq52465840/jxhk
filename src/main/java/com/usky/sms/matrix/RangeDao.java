
package com.usky.sms.matrix;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.core.BaseDao;

public class RangeDao extends BaseDao<RangeDO> {
	
	public RangeDao() {
		super(RangeDO.class);
	}
	
	@Autowired
	protected MatrixDao matrixDao;
	
	@Autowired
	protected AidsDao aidsDao;
	
	@Autowired
	protected PerspectivesDao perspectivesDao;
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void updateAllRange(List<Map<String,Object>> list) throws Exception{
		if(list!=null&&list.size()>0){
			//获取matrix
			Integer matrixId = list.get(0).get("matrix")==null?null:((Number)list.get(0).get("matrix")).intValue();
			MatrixDO matrixDO = matrixDao.internalGetById(matrixId);
			//创建range和视角集合
			List<RangeDO> rangeList = new ArrayList<RangeDO>();
			List<PerspectivesDO> perspectivesList = perspectivesDao.getByMatrix(matrixDO);
			//删除所有range和所有决策帮助
			this.deleteByMatrix(matrixDO);
			aidsDao.deleteByMatrix(matrixDO);
			//添加视角
			for (Map<String, Object> map : list) {
				if(map != null){
					String source = map.get("source")+"";
					String type = map.get("type")+"";
					String style = map.get("style")+"";					
					RangeDO rangeDO = new RangeDO();
					rangeDO.setSource(source);
					rangeDO.setType(type);
					rangeDO.setStyle(style);
					rangeDO.setMatrix(matrixDO);
					rangeList.add(rangeDO);
					this.internalSave(rangeDO);
				}
			}
			for (RangeDO rangeDO : rangeList) {			
				if("P".equals(rangeDO.getType())){
					AidsDO aidsDo = new AidsDO();
					aidsDo.setRange(rangeDO);
					aidsDo.setMatrix(matrixDO);
					aidsDao.internalSave(aidsDo);
				}else if("S".equals(rangeDO.getType())){
					for (PerspectivesDO perspectivesDO : perspectivesList) {
						AidsDO aidsDo = new AidsDO();
						aidsDo.setRange(rangeDO);
						aidsDo.setPerspectives(perspectivesDO);
						aidsDo.setMatrix(matrixDO);
						aidsDao.internalSave(aidsDo);
					}
				}
			}
		}
	}


	public void deleteByMatrix(MatrixDO matrixDO) throws Exception{
		List<RangeDO> list = this.getHibernateTemplate().find("from RangeDO where matrix =?",matrixDO);
		this.delete(list);
	}
	
	public List<RangeDO> getListByType(MatrixDO matrixDO,String type) throws Exception{
		List<RangeDO> list = this.getHibernateTemplate().find("from RangeDO where matrix =? and type=? order by source asc",matrixDO,type);
		return list;
	}
	
	public void setMatrixDao(MatrixDao matrixDao) {
		this.matrixDao = matrixDao;
	}
	public void setAidsDao(AidsDao aidsDao) {
		this.aidsDao = aidsDao;
	}
	public void setPerspectivesDao(PerspectivesDao perspectivesDao) {
		this.perspectivesDao = perspectivesDao;
	}
}
