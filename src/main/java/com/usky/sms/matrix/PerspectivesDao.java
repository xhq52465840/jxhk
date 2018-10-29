
package com.usky.sms.matrix;

import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.core.BaseDao;

public class PerspectivesDao extends BaseDao<PerspectivesDO> {
	
	public PerspectivesDao() {
		super(PerspectivesDO.class);
	}
	
	@Autowired
	protected MatrixDao matrixDao;
	
	@Autowired
	protected AidsDao aidsDao;
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void updateAllPerspectives(List<Map<String,Object>> list) throws Exception{
		if(list!=null&&list.size()>0){
			Integer matrixId = list.get(0).get("matrix")==null?null:((Number)list.get(0).get("matrix")).intValue();
			MatrixDO matrixDO = matrixDao.internalGetById(matrixId);		
			for (Map<String, Object> map : list) {
				if(map != null){
					String title = map.get("title")+"";
					String flag = map.get("flag")+"";
					Integer pid =map.get("id")==null?null:((Number)map.get("id")).intValue();
					if("A".equals(flag)){
						PerspectivesDO aperspectivesDO = new PerspectivesDO();
						aperspectivesDO.setTitle(title);
						aperspectivesDO.setMatrix(matrixDO);
						this.internalSave(aperspectivesDO);
					}else if("U".equals(flag)){
						Map<String,Object> currMap = new HashMap<String, Object>();
						currMap.put("title", title);
						this.update(pid,currMap);
					}else if("D".equals(flag)){
						String[] ids = new String[1];
						ids[0]= pid.toString();
						this.delete(ids);
					}
				}
			}
		}		
	}
	
	@Override
	protected void beforeDelete(Collection<PerspectivesDO> collection) {
		for (PerspectivesDO perspectivesDO : collection) {
			aidsDao.deleteByPerspectives(perspectivesDO);			
		}
	}
	
	public List<PerspectivesDO> getByMatrix(MatrixDO matrixDO) throws Exception{
		List<PerspectivesDO> list = this.getHibernateTemplate().find("from PerspectivesDO where matrix =?",matrixDO);
		return list;
	}

	public void setMatrixDao(MatrixDao matrixDao) {
		this.matrixDao = matrixDao;
	}

	public void setAidsDao(AidsDao aidsDao) {
		this.aidsDao = aidsDao;
	}
}
