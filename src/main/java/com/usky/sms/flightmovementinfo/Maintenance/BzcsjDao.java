package com.usky.sms.flightmovementinfo.Maintenance;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.orm.hibernate3.support.HibernateDaoSupport;

public class BzcsjDao extends HibernateDaoSupport {
	/*
	 * 根据飞机号获取不正常事件信息
	 */
	public List<Map<String, Object>> getBzcsjInfo(String tailNo) {
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
		String sql = "from BzcsjDO where tail_no = ? order by mat_date desc";
		@SuppressWarnings("unchecked")
		List<BzcsjDO> bzcsjList = this.getHibernateTemplate().find(sql,tailNo);
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		int count = 0;
		for (BzcsjDO bzcsj : bzcsjList) {
			if(count >= 10)break;
			count++;
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("tailNo", bzcsj.getTail_no());
			map.put("matDate", bzcsj.getMat_date());// 发生日期
			map.put("matAirport", bzcsj.getMat_airport());// 发生地点
			map.put("matPhase", bzcsj.getMat_phase());// 发生阶段
			map.put("matSrc", bzcsj.getMat_src());// 报告来源
			map.put("matChuli", bzcsj.getMat_chuli());// 处理情况
			map.put("matPieceName", bzcsj.getMat_piece_name());// 故障件名称
			map.put("bzcsjRpter", bzcsj.getBzcsj_rpter());// 填报人
			map.put("bzcsjRptDate", bzcsj.getBzcsj_rpt_date() == null ? null : sdf.format(bzcsj.getBzcsj_rpt_date()));// 填报日期
			map.put("bzcsjRptAirport", bzcsj.getBzcsj_rpt_airport());// 地点
			map.put("bzcsjExamer", bzcsj.getBzcsj_examer());// 审核人
			map.put("bzcsjExamDate", bzcsj.getBzcsj_exam_date() == null?null:sdf.format(bzcsj.getBzcsj_exam_date()));// 审核日期
			map.put("bzcsjFx", bzcsj.getBzcsj_fx());// 分析及总结
			list.add(map);
		}
		return list;
	}
}
