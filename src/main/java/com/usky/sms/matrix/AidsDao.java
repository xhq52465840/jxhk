
package com.usky.sms.matrix;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.usky.sms.core.BaseDao;

public class AidsDao extends BaseDao<AidsDO> {
	
	public AidsDao() {
		super(AidsDO.class);
	}
	
	public void deleteByPerspectives(PerspectivesDO perspectivesDO) {
		List<AidsDO> list = this.getHibernateTemplate().find("from AidsDO where perspectives =?",perspectivesDO);
		this.delete(list);
	}
	
	public void deleteByMatrix(MatrixDO matrixDO) throws Exception{
		List<AidsDO> list = this.getHibernateTemplate().find("from AidsDO where matrix =?",matrixDO);
		this.delete(list);
	}
	
	public Map<String,List<Map<String,Object>>> getByMatrix(MatrixDO matrixDO) throws Exception{
		List<Map<String,Object>> pfinalList = new ArrayList<Map<String,Object>>();
		List<Map<String,Object>> sfinalList = new ArrayList<Map<String,Object>>();
		Map<String,List<Map<String,Object>>> map = new HashMap<String, List<Map<String,Object>>>();
		String phql = "from AidsDO a " +
				"left join a.range r " +
				"where a.matrix=? and r.type='P' order by r.source asc";
		List<Object[]> plist = this.getHibernateTemplate().find(phql,matrixDO);		
		for (Object[] obj : plist) {
			AidsDO aidsDO = (AidsDO)obj[0];
			RangeDO rangeDO = (RangeDO)obj[1];
			Map<String,Object> pmap = new HashMap<String, Object>();
			pmap.put("id", aidsDO.getId());
			pmap.put("source", rangeDO.getSource());
			pmap.put("description", aidsDO.getDescription());
			pfinalList.add(pmap);
		}
		
		String shql = "from AidsDO a " +
		"left join a.range r  " +
		"left join a.perspectives p  " +
		"where a.matrix=? and r.type='S' order by p.id asc ,r.source asc";
		List<Object[]> slist = this.getHibernateTemplate().find(shql,matrixDO);		
		for (Object[] obj : slist) {
			AidsDO aidsDO = (AidsDO)obj[0];
			RangeDO rangeDO = (RangeDO)obj[1];
			PerspectivesDO perspectivesDO = (PerspectivesDO)obj[2];
			Map<String,Object> pmap = new HashMap<String, Object>();
			pmap.put("id", aidsDO.getId());
			pmap.put("source", rangeDO.getSource());
			pmap.put("title", perspectivesDO.getTitle());
			pmap.put("description", aidsDO.getDescription());
			sfinalList.add(pmap);
		}
		map.put("P", pfinalList);
		map.put("S", sfinalList);
		return map;	
	}
}
