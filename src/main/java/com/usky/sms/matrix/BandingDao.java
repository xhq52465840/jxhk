
package com.usky.sms.matrix;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.core.BaseDao;

public class BandingDao extends BaseDao<BandingDO> {
	
	public BandingDao() {
		super(BandingDO.class);
	}
	
	@Autowired
	protected MatrixDao matrixDao;
	
	@Autowired
	protected CoefficientDao coefficientDao;
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void updateAllBanding(List<Map<String,Object>> list) throws Exception{
		if(list!=null&&list.size()>0){
			Integer matrixId = list.get(0).get("matrix")==null?null:((Number)list.get(0).get("matrix")).intValue();
			MatrixDO matrixDO = matrixDao.internalGetById(matrixId);		
			for (Map<String, Object> map : list) {
				if(map != null){
					String title = map.get("title")+"";
					String color = map.get("color")+"";
					String handle = map.get("handle")+"";
					String description = map.get("description")+"";
					String flag = map.get("flag")+"";
					Integer bid =map.get("id")==null?null:((Number)map.get("id")).intValue();
					if("A".equals(flag)){
						BandingDO abandingDO = new BandingDO();
						abandingDO.setTitle(title);
						abandingDO.setColor(color);
						abandingDO.setHandle(handle);
						abandingDO.setDescription(description);
						abandingDO.setMatrix(matrixDO);
						this.internalSave(abandingDO);
					}else if("U".equals(flag)){
						Map<String,Object> currMap = new HashMap<String, Object>();
						currMap.put("title", title);
						currMap.put("color", color);
						currMap.put("handle", handle);
						currMap.put("description", description);
						this.update(bid,currMap);
					}else if("D".equals(flag)){
						String[] ids = new String[1];
						ids[0]= bid.toString();
						this.delete(ids);
					}
				}
			}
			coefficientDao.updateAllCoefficient(matrixDO);
		}
		
	}
	
	public List<BandingDO> getByMatrix(MatrixDO matrixDO) throws Exception{
		List<BandingDO> list = this.getHibernateTemplate().find("from BandingDO where matrix =?",matrixDO);
		return list;
	}
	
	public void setMatrixDao(MatrixDao matrixDao) {
		this.matrixDao = matrixDao;
	}
	public void setCoefficientDao(CoefficientDao coefficientDao) {
		this.coefficientDao = coefficientDao;
	}
}
