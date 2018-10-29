package com.usky.sms.qar;

import java.util.ArrayList;
import java.util.List;

import com.usky.sms.core.BaseDao;

public class QarEventDao extends BaseDao<QarEventDO>{

	protected QarEventDao() {
		super(QarEventDO.class);
		// TODO Auto-generated constructor stub
	}

	/**
	 * 查询qar地图数据
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<QarEventDO> getQarEvent(String year,String month,String type) {
		QarEventDO vo = new QarEventDO();		
    
		List<QarEventDO> list = (List<QarEventDO>) this
				.query("from QarEventDO t where t.theYear in ( " + year  +" ) and t.type = '"+ type +"' and t.theMonth in ("+ month +") order by t.airport");
		List<QarEventDO> result = new ArrayList<QarEventDO>();	
		
		if(list.size()>1){
			vo = list.get(0);
			for(int i=1;i<list.size();i++){
				if(vo.getAirport().equals(list.get(i).getAirport())){
					vo.setTheCount(vo.getTheCount()+list.get(i).getTheCount());
				}else{
					result.add(vo);
					vo = list.get(i);
				}
			}			
		}
		
		result.add(vo);			
		
		return result;
	}	
	
	
}

