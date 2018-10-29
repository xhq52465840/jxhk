
package com.usky.sms.matrix;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;

public class CoefficientDao extends BaseDao<CoefficientDO> {
	
	public static final SMSException MATRIX_POSSIBLE_ISNULL = new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "可能性没有设置！");
	
	public static final SMSException MATRIX_SERIOUS_ISNULL = new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "严重性没有设置！");
	
	public static final SMSException MATRIX_BANDING_ISNULL = new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "色块没有设置！");
	
	public CoefficientDao() {
		super(CoefficientDO.class);
	}
	
	@Autowired
	private BandingDao bandingDao;
	
	@Autowired
	private RangeDao rangeDao;
	
	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz,boolean multiple, Field field) {
		String fieldName = field.getName();
		CoefficientDO coefficient = (CoefficientDO) obj;
		if ("banding".equals(fieldName)) {
		     BandingDO banding = bandingDao.internalGetById(coefficient.getBanding().getId());
			 map.put("banding",banding.getTitle());
			 map.put("bandingId",banding.getId());
			 map.put("bandingDeleted",banding.isDeleted());
			 map.put("bandingColor",banding.getColor());
		} else {
			super.setField(map, obj, claz, multiple, field);
		}
	}

	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void updateAllCoefficient(MatrixDO matrixDO) throws Exception {
		List<RangeDO> possibleList = rangeDao.getListByType(matrixDO, "P");
		List<RangeDO> seriousList = rangeDao.getListByType(matrixDO, "S");
		List<BandingDO> blist = bandingDao.getByMatrix(matrixDO);
		int psize = possibleList.size();
		int ssize = seriousList.size();
		int bsize = blist.size();
		if (psize > 0 && ssize > 0 && bsize > 0) {
			this.deleteByMatrix(matrixDO);
			for (int i = 0; i < ssize; i++) {
				RangeDO serious = seriousList.get(i);
				for (int j = 0; j < psize; j++) {
					RangeDO possible = possibleList.get(j);
					CoefficientDO coefficientDO = new CoefficientDO();
					coefficientDO.setMatrix(matrixDO);
					coefficientDO.setPossible(possible.getSource());
					coefficientDO.setSerious(serious.getSource());
					if ("digit".equals(possible.getStyle()) && "digit".equals(serious.getStyle())) {
						Integer source = (Integer.parseInt(possible.getSource()) * Integer.parseInt(serious.getSource()));
						coefficientDO.setScore(source.toString());
					} else {
						coefficientDO.setScore(serious.getSource() + "" + possible.getSource());
					}
					int position = (i + 1) * (j + 1);
					int partCount = (psize * ssize) / bsize;
					BandingDO bandingDO = blist.get((position / partCount) == 0 ? (position / partCount) : (position / partCount - 1));
					coefficientDO.setBanding(bandingDO);
					this.internalSave(coefficientDO);
				}
			}
		} else {
			if (psize == 0) throw MATRIX_POSSIBLE_ISNULL;
			if (ssize == 0) throw MATRIX_SERIOUS_ISNULL;
			if (bsize == 0) throw MATRIX_BANDING_ISNULL;
		}
	}
	
	public Map<String, List<Map<String, Object>>> getByMatrix(MatrixDO matrixDO) throws Exception {
		List<Map<String, Object>> pfinalList = new ArrayList<Map<String, Object>>();
		List<Map<String, Object>> sfinalList = new ArrayList<Map<String, Object>>();
		List<Map<String, Object>> cfinalList = new ArrayList<Map<String, Object>>();
		List<Map<String, Object>> bfinalList = bandingDao.convert(bandingDao.getByMatrix(matrixDO));
		Map<String, List<Map<String, Object>>> map = new HashMap<String, List<Map<String, Object>>>();
		String phql = "from AidsDO a " + "left join a.range r " + "where a.matrix=? and r.type='P' order by r.source asc";
		List<Object[]> plist = this.getHibernateTemplate().find(phql, matrixDO);
		for (Object[] obj : plist) {
			AidsDO aidsDO = (AidsDO) obj[0];
			RangeDO rangeDO = (RangeDO) obj[1];
			Map<String, Object> pmap = new HashMap<String, Object>();
			pmap.put("id", aidsDO.getId());
			pmap.put("source", rangeDO.getSource());
			pmap.put("description", aidsDO.getDescription());
			pfinalList.add(pmap);
		}
		
		String shql = "from AidsDO a " + "left join a.range r  " + "left join a.perspectives p  " + "where a.matrix=? and r.type='S' order by p.id asc ,r.source asc";
		List<Object[]> slist = this.getHibernateTemplate().find(shql, matrixDO);
		for (Object[] obj : slist) {
			AidsDO aidsDO = (AidsDO) obj[0];
			RangeDO rangeDO = (RangeDO) obj[1];
			PerspectivesDO perspectivesDO = (PerspectivesDO) obj[2];
			Map<String, Object> pmap = new HashMap<String, Object>();
			pmap.put("id", aidsDO.getId());
			pmap.put("source", rangeDO.getSource());
			pmap.put("title", perspectivesDO.getTitle());
			pmap.put("description", aidsDO.getDescription());
			sfinalList.add(pmap);
		}
		
		String chql = "from CoefficientDO c " + "left join c.banding b " + "where c.matrix=?";
		List<Object[]> clist = this.getHibernateTemplate().find(chql, matrixDO);
		for (Object[] obj : clist) {
			CoefficientDO coefficientDO = (CoefficientDO) obj[0];
			BandingDO bandingDO = (BandingDO) obj[1];
			Map<String, Object> cmap = new HashMap<String, Object>();
			cmap.put("id", coefficientDO.getId());
			cmap.put("possible", coefficientDO.getPossible());
			cmap.put("serious", coefficientDO.getSerious());
			cmap.put("score", coefficientDO.getScore());
			cmap.put("bandingId", bandingDO.getId());
			cmap.put("bandingColor", bandingDO.getColor());
			cmap.put("bandingTitle", bandingDO.getTitle());
			cfinalList.add(cmap);
		}
		map.put("P", pfinalList);
		map.put("S", sfinalList);
		map.put("C", cfinalList);
		map.put("B", bfinalList);
		return map;
	}
	
	public void deleteByMatrix(MatrixDO matrixDO) throws Exception {
		List<CoefficientDO> list = this.getHibernateTemplate().find("from CoefficientDO where matrix =?", matrixDO);
		this.delete(list);
	}
	
	public void setBandingDao(BandingDao bandingDao) {
		this.bandingDao = bandingDao;
	}
	
	public void setRangeDao(RangeDao rangeDao) {
		this.rangeDao = rangeDao;
	}
}
