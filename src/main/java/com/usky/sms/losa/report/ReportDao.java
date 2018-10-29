package com.usky.sms.losa.report;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;

import org.hibernate.SQLQuery;
import org.hibernate.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate3.support.HibernateDaoSupport;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.core.BaseDao;
import com.usky.sms.losa.ManageQueryForm;
import com.usky.sms.losa.score.ScoreSelectContentDO;
import com.usky.sms.losa.score.ScoreSelectContentDao;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;
@Transactional(readOnly = true, propagation = Propagation.SUPPORTS)
public class ReportDao extends HibernateDaoSupport {
	
  public Map queryFullTimeCaptain(ManageQueryForm manageQueryForm) throws Exception {
    String sql = "";
    Map resultmap = new HashMap<>();   
    String str  = parseSql(manageQueryForm);
    sql="select sum((case  "+
           "    when loa.full_time_captain1 <= 1000 and loa.full_time_captain2 <= 1000 then 2   "+
           "    when loa.full_time_captain2 <= 1000 then 1  "+
           "    when loa.full_time_captain1 <= 1000 then 1 else 0 "+
           "end)) as fulltime0,   "+
           "sum((case  "+
           "    when loa.full_time_captain1 <= 3000 and loa.full_time_captain1 > 1000 and loa.full_time_captain2 <= 3000 and loa.full_time_captain2 > 1000 then 2   "+
           "    when loa.full_time_captain2 <= 3000 and loa.full_time_captain2 > 1000 then 1  "+
           "    when loa.full_time_captain1 <= 3000 and loa.full_time_captain1 > 1000 then 1 else 0 "+
           "end)) as fulltime1,  "+
           "sum((case  "+
           "    when loa.full_time_captain1 <= 10000 and loa.full_time_captain1 > 3000 and loa.full_time_captain2 <= 10000 and loa.full_time_captain2 > 3000 then 2   "+
           "    when loa.full_time_captain2 <= 10000 and loa.full_time_captain2 > 3000 then 1  "+
           "    when loa.full_time_captain1 <= 10000 and loa.full_time_captain1 > 3000 then 1 else 0 "+
           "end)) as fulltime3,  "+
           "sum((case  "+
           "    when loa.full_time_captain1 > 10000 and loa.full_time_captain2 > 10000 then 2   "+
           "    when loa.full_time_captain2 > 10000 then 1  "+
           "    when loa.full_time_captain1 > 10000 then 1 else 0  "+
           "end)) as fulltime10,  "+
           "sum((case  "+
           "    when loa.full_time_captain1 is null and loa.full_time_captain2 is null and (loa.company_captain2 is not null or loa.captain_fly_time2 is not null or loa.this_aircraft_time_captain2 is not null or loa.telex_aircraft_time_captain2 is not null) then 2  "+ 
           "    when loa.full_time_captain2 is null and (loa.company_captain2 is not null or loa.captain_fly_time2 is not null or loa.this_aircraft_time_captain2 is not null or loa.telex_aircraft_time_captain2 is not null) then 1  "+
           "    when loa.full_time_captain1 is null then 1 else 0  "+
           "end)) as fulltimenull    "+
           "from l_observe_activity loa  ";
           if(!StringUtils.isBlank(str)){
             sql = sql + str + " and loa.deleted = 0 ";
           }else{
             sql += "left join L_PLAN lp on loa.plan_id = lp.id "+
             "where lp.plan_status = 'done' and lp.deleted = 0 and loa.deleted = 0 ";
           }
 
    Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();
    SQLQuery query = session.createSQLQuery(sql);
    List<Object[]> list= query.list();
    resultmap.put("result", list);
    return resultmap;
  }
  
  
  public Map queryThreatErrorCount(ManageQueryForm manageQueryForm) throws Exception {
    String sql = "";
    Map resultmap = new HashMap<>();
    String str  = parseSql(manageQueryForm);
    sql="select t1.count, t1.threatcount, t2.errorcount, t1.responsethreat, t2.responseerror from "+
           "(select count(distinct(loa.id)) as count, count(ltwm.id) as threatcount,  "+
           "sum(decode(ltwm.is_deal_validity, '是', 1, 0)) as responsethreat  "+
           "from l_observe_activity loa  "+
           "left join l_threat_work_manage ltwm on ltwm.observe_id = loa.id and ltwm.deleted = 0 ";
            if(!StringUtils.isBlank(str)){
              sql = sql + str + " and loa.deleted = 0 ";
            }else{
              sql += "left join L_PLAN lp on loa.plan_id = lp.id "+
              "where lp.plan_status = 'done' and lp.deleted = 0 and loa.deleted = 0";
            }
            sql += ")t1  "+
           "join  "+
           "(select count(distinct(loa.id)) as count, count(lewm.id) as errorcount,  "+
           "sum(decode(lewm.crew_response_of_error, 'prevent', 1, 0)) as responseerror  "+
           "from l_observe_activity loa  "+
           "left join l_error_work_manage lewm on lewm.observe_id = loa.id and lewm.deleted = 0 ";
            if(!StringUtils.isBlank(str)){
              sql = sql + str + " and loa.deleted = 0 ";
            }else{
              sql += "left join L_PLAN lp on loa.plan_id = lp.id "+
              "where lp.plan_status = 'done' and lp.deleted = 0 and loa.deleted = 0 ";
            }
            sql += ")t2  "+
           "on t1.count = t2.count";

    Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();
    SQLQuery query = session.createSQLQuery(sql);
    List<Object[]> list= query.list();
    resultmap.put("result", list);
    return resultmap;
  }
  
  public Map queryThreatDetail(ManageQueryForm manageQueryForm,String sortby,String sortorders,Integer start,Integer length) throws Exception {
	    String sql = "";
	    Map resultmap = new HashMap<>();
	    List<Map<String,Object>> result = new ArrayList<Map<String,Object>>();
	    sql="select c.scheme_no,b.plan_no,b.id planId,t.threat_code,t.threat_desc,d.name threat_type,f.name threat_number,"
            +" s.dict_name,t.is_deal_validity,t.the_measures_for_threat,c.id,a.id observiewId from L_THREAT_WORK_MANAGE t"
            +" left join l_observe_activity a on t.observe_id = a.id left join l_plan b on a.plan_id = b.id left join l_scheme c"
            +" on c.id = b.scheme_id left join L_THREAT_BASEINFO d on d.num=t.threat_type left join l_dict_entry s on "
            +" s.dict_code=t.flight_procedure left join L_THREAT_BASEINFO f on f.num=t.threat_number where a.deleted=0 "
            +" and b.deleted=0 and t.deleted=0 and b.plan_status = 'done' ";
	    if(manageQueryForm!=null){
	    	if(!StringUtils.isBlank(manageQueryForm.getP_arrAirportNo())){
	            sql += " and b.arr_airport_no in ( "+parseSqlString(manageQueryForm.getP_arrAirportNo())+" ) ";
	          }
	          if(!StringUtils.isBlank(manageQueryForm.getP_depAirportNo())){
	            sql += " and b.dep_airport_no in ( "+parseSqlString(manageQueryForm.getP_depAirportNo())+" ) ";
	          }
	          if(!StringUtils.isBlank(manageQueryForm.getP_flightId())){
	            sql += " and b.flight_id in ( "+manageQueryForm.getP_flightId()+" ) ";
	          }
	          if(!StringUtils.isBlank(manageQueryForm.getP_observeDate())){
	            sql += " and b.observe_date >= to_date('"+manageQueryForm.getP_observeDate()+"','yyyy-MM-dd') ";
	          }
	          if(!StringUtils.isBlank(manageQueryForm.getP_observeDateTo())){
	            sql += " and b.observe_date <= to_date('"+manageQueryForm.getP_observeDateTo()+"','yyyy-MM-dd') ";
	          }
	          if(!StringUtils.isBlank(manageQueryForm.getP_observerId())){
	            sql += " and b.observer_id in ( "+manageQueryForm.getP_observerId()+" ) ";
	          }
	          if(!StringUtils.isBlank(manageQueryForm.getS_impleUnitId())){
	            sql += " and c.imple_unit_id in ( "+manageQueryForm.getS_impleUnitId()+" ) ";
	          }
	          if(!StringUtils.isBlank(manageQueryForm.getS_schemeName())){
	            sql += " and c.id in ( "+parseSqlString(manageQueryForm.getS_schemeName())+" ) ";
	          }
	          if(!StringUtils.isBlank(manageQueryForm.getS_schemeType())){
	            sql += " and c.scheme_type in ( "+parseSqlString(manageQueryForm.getS_schemeType())+" ) ";
	          }
	          if(!StringUtils.isBlank(manageQueryForm.getF_org_code())&&!manageQueryForm.getF_org_code().equals("null")){
	              sql += " and b.id in (  select lp.id from L_PLAN lp left join l_scheme_unit lu on lp.scheme_id = lu.scheme_id"+	
				         " where lu.unit_id in (select ffbau.unit_id from fxw_flight_bd_aero_unit ffbau"+
				         " start with ffbau.unit_id in (select ffbau.unit_id from t_organization ton"+
				         " join fxw_flight_bd_aero_unit ffbau on ton.deptcode = ffbau.unit_code"+
				         " where ton.id in ("+manageQueryForm.getF_org_code()+")) connect by prior ffbau.unit_id = ffbau.parent_id))";
	            } 
	    }
	    String sqlparam = "";
	    if(!StringUtils.isBlank(sortby)&&!StringUtils.isBlank(sortorders)){
			sqlparam+=" order by "+sortby+" "+sortorders+",c.id ";
        }else{
		    sqlparam+=" order by c.id desc ";
        }
	    Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();
	    SQLQuery query = session.createSQLQuery(sql+sqlparam);
	    List<Object[]> list= new ArrayList<Object[]>();
	    int count = 0;	 
	    if(start!=null&&length!=null){
        count = query.list().size();
        query.setFirstResult(start);
	    query.setMaxResults(length);
	    }else{
	    	count = query.list().size();
	    }	    
	    list= query.list();
	    if(list.size()>0){
	    	for (Object[] obj : list) {
		        Map tempMap = new HashMap();
		        tempMap.put("schemeNo", obj[0]);
		        tempMap.put("planNo", obj[1]);
		        tempMap.put("planId", obj[2]);
		        tempMap.put("threatCode", obj[3]);
		        tempMap.put("threatDesc", obj[4]);
		        tempMap.put("threatType", obj[5]);
		        tempMap.put("threatNumber", obj[6]);
		        tempMap.put("flight", obj[7]);
		        tempMap.put("isDeal", obj[8]);
		        tempMap.put("forThreat", obj[9]);
		        tempMap.put("schemeId", obj[10]);
		        tempMap.put("observiewId", obj[11]);
		        result.add(tempMap);
      }
	    }
	    
	    List countList=new ArrayList<Object>();
	    countList.add(count);
	    resultmap.put("all", countList);
	    resultmap.put("result", result);
	    return resultmap;
	  }
  
  
  public Map queryThreatPercent(ManageQueryForm manageQueryForm) throws Exception {
    String sql = "";
    Map resultmap = new HashMap<>();
    String str  = parseSql(manageQueryForm);
    sql="select ltb2.name, t.threatcount from "+
           "(select ltwm.threat_type as threatnumber , count(ltwm.id) as threatcount "+
           "from l_observe_activity loa "+
           "left join l_threat_work_manage ltwm on ltwm.observe_id = loa.id  ";
            if(!StringUtils.isBlank(str)){
              sql = sql + str + " and loa.deleted = 0 and ltwm.deleted = 0 ";
            }else{
              sql += "left join L_PLAN lp on loa.plan_id = lp.id "+
              "where lp.plan_status = 'done'  and lp.deleted = 0 and loa.deleted = 0 and ltwm.deleted = 0 ";
            }
            sql += "group by ltwm.threat_type)t "+
           "join l_threat_baseinfo ltb2 on t.threatnumber = ltb2.num "+
           "order by t.threatcount desc ";

    Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();
    SQLQuery query = session.createSQLQuery(sql);
    List<Object[]> list= query.list();
    resultmap.put("result", list);
    return resultmap;
  }
  
  public Map queryThreatTop5(ManageQueryForm manageQueryForm) throws Exception {
    String sql = "";
    Map resultmap = new HashMap<>();
    String str  = parseSql(manageQueryForm);
    sql="select t.threatname, t.threatcount from "+
           "(select ltb.name as threatname, count(ltwm.id) as threatcount "+
           "from l_observe_activity loa "+
           "left join l_threat_work_manage ltwm on ltwm.observe_id = loa.id "+
           "join l_threat_baseinfo ltb on ltwm.threat_number = ltb.num ";
            if(!StringUtils.isBlank(str)){
              sql = sql + str + " and loa.deleted = 0 and ltwm.deleted = 0 ";
            }else{
              sql += "left join L_PLAN lp on loa.plan_id = lp.id "+
              "where lp.plan_status = 'done' and lp.deleted = 0 and loa.deleted = 0 and ltwm.deleted = 0 ";
            }
            sql += "group by ltb.name "+
           "order by count(ltwm.id) desc )t "+
           "where rownum <= 5";

    Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();
    SQLQuery query = session.createSQLQuery(sql);
    List<Object[]> list= query.list();
    resultmap.put("result", list);
    return resultmap;
  }
  
  public Map queryErrorPercent(ManageQueryForm manageQueryForm) throws Exception {
    String sql = "";
    Map resultmap = new HashMap<>();
    String str  = parseSql(manageQueryForm);
    sql="select leb2.name, t.errorcount from "+
           "(select lewm.error_type as errornumber , count(lewm.id) as errorcount "+
           "from l_observe_activity loa "+
           "left join l_error_work_manage lewm on lewm.observe_id = loa.id  ";
            if(!StringUtils.isBlank(str)){
              sql = sql + str + " and loa.deleted = 0 and lewm.deleted = 0 ";
            }else{
              sql += "left join L_PLAN lp on loa.plan_id = lp.id "+
              "where lp.plan_status = 'done'  and lp.deleted = 0 and loa.deleted = 0 and lewm.deleted = 0 ";
            }
            sql += "group by lewm.error_type) t "+
           "join l_error_baseinfo leb2 on t.errornumber = leb2.num "+
           "order by t.errorcount desc ";

    Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();
    SQLQuery query = session.createSQLQuery(sql);
    List<Object[]> list= query.list();
    resultmap.put("result", list);
    return resultmap;
  }
  public Map queryErrorDetail(ManageQueryForm manageQueryForm,String sortby,String sortorders,Integer start,Integer length) throws Exception {
	    String sql = "";
	    Map resultmap = new HashMap<>();
	    String str  = parseSql(manageQueryForm);
	    List<Map<String,Object>> result = new ArrayList<Map<String,Object>>();
	    sql=" select c.scheme_no,b.plan_no,t.plan_id,a.error_code,a.error_desc,d.dict_name flight_procedure,e.name error_type,f.name error_type_item,g.name error_number,"
            +" h.dict_name the_person_cause_error,i.dict_name the_person_found_error,j.dict_name crew_response_of_error,k.dict_name the_consequences_of_error,l.name is_relate_threat_type,"
            +" m.name is_relate_threat_number, a.is_deal_error,n.name unexcept_aircraft_type,p.name unexpect_aircraft_number, r.dict_name the_person_found_status,w.dict_name crew_response_for_unexcept_air,"
            +"y.dict_name the_consequencesof_unexcept_ai,t.id observiewId,c.id from l_error_work_manage a left join l_observe_activity t on a.observe_id = t.id left join l_plan b on t.plan_id = b.id left join l_scheme c on b.scheme_id=c.id "
            +" left join l_dict_entry d on d.dict_code=a.flight_procedure left join L_ERROR_BASEINFO e on e.num=a.error_type left join L_ERROR_BASEINFO f on f.num=a.error_type_item left join L_ERROR_BASEINFO g on g.num=a.error_number"
            +" left join l_dict_entry h on h.dict_code=a.the_person_cause_error left join l_dict_entry i on i.dict_code=a.the_person_found_error left join L_THREAT_BASEINFO l on l.num=a.is_relate_threat_type "
            +" left join L_THREAT_BASEINFO m on m.num=a.is_relate_threat_number left join l_dict_entry j on j.dict_code=a.crew_response_of_error left join l_dict_entry k on k.dict_code=a.the_consequences_of_error "
            +" left join L_UNEXCEPT_STATUS_BASEINFO n on n.num=a.unexcept_aircraft_type left join L_UNEXCEPT_STATUS_BASEINFO p on p.num=a.unexpect_aircraft_number left join l_dict_entry r on r.dict_code=a.the_person_found_status "
            +" left join l_dict_entry w on w.dict_code=a.crew_response_for_unexcept_air left join l_dict_entry y on y.dict_code=a.the_consequencesof_unexcept_ai"
            +" where a.deleted = 0 and b.deleted=0 and b.plan_status = 'done'";
	    if(manageQueryForm!=null){
	    	if(!StringUtils.isBlank(manageQueryForm.getP_arrAirportNo())){
	            sql += " and b.arr_airport_no in ( "+parseSqlString(manageQueryForm.getP_arrAirportNo())+" ) ";
	          }
	          if(!StringUtils.isBlank(manageQueryForm.getP_depAirportNo())){
	            sql += " and b.dep_airport_no in ( "+parseSqlString(manageQueryForm.getP_depAirportNo())+" ) ";
	          }
	          if(!StringUtils.isBlank(manageQueryForm.getP_flightId())){
	            sql += " and b.flight_id in ( "+manageQueryForm.getP_flightId()+" ) ";
	          }
	          if(!StringUtils.isBlank(manageQueryForm.getP_observeDate())){
	            sql += " and b.observe_date >= to_date('"+manageQueryForm.getP_observeDate()+"','yyyy-MM-dd') ";
	          }
	          if(!StringUtils.isBlank(manageQueryForm.getP_observeDateTo())){
	            sql += " and b.observe_date <= to_date('"+manageQueryForm.getP_observeDateTo()+"','yyyy-MM-dd') ";
	          }
	          if(!StringUtils.isBlank(manageQueryForm.getP_observerId())){
	            sql += " and b.observer_id in ( "+manageQueryForm.getP_observerId()+" ) ";
	          }
	          if(!StringUtils.isBlank(manageQueryForm.getS_impleUnitId())){
	            sql += " and c.imple_unit_id in ( "+manageQueryForm.getS_impleUnitId()+" ) ";
	          }
	          if(!StringUtils.isBlank(manageQueryForm.getS_schemeName())){
	            sql += " and c.id in ( "+parseSqlString(manageQueryForm.getS_schemeName())+" ) ";
	          }
	          if(!StringUtils.isBlank(manageQueryForm.getS_schemeType())){
	            sql += " and c.scheme_type in ( "+parseSqlString(manageQueryForm.getS_schemeType())+" ) ";
	          }
	          if(!StringUtils.isBlank(manageQueryForm.getF_org_code())&&!manageQueryForm.getF_org_code().equals("null")){
	              sql += " and b.id in (  select lp.id from L_PLAN lp left join l_scheme_unit lu on lp.scheme_id = lu.scheme_id"+	
				         " where lu.unit_id in (select ffbau.unit_id from fxw_flight_bd_aero_unit ffbau"+
				         " start with ffbau.unit_id in (select ffbau.unit_id from t_organization ton"+
				         " join fxw_flight_bd_aero_unit ffbau on ton.deptcode = ffbau.unit_code"+
				         " where ton.id in ("+manageQueryForm.getF_org_code()+")) connect by prior ffbau.unit_id = ffbau.parent_id))";
	            } 
	    }
	    String sqlparam = "";
	    if(!StringUtils.isBlank(sortby)&&!StringUtils.isBlank(sortorders)){
			sqlparam+=" order by "+sortby+" "+sortorders+",c.id ";
        }else{
		    sqlparam+=" order by c.id desc ";
        }
	    Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();
	    SQLQuery query = session.createSQLQuery(sql+sqlparam);
	    List<Object[]> list= new ArrayList<Object[]>();
	    int count = 0;	
	    if(start!=null&&length!=null){
        count = query.list().size();
        query.setFirstResult(start);
	    query.setMaxResults(length);
	    }else{
	    	count = query.list().size();
	    }
	    list= query.list();
	    if(list.size()>0){
	    	for (Object[] obj : list) {
		        Map tempMap = new HashMap();
		        tempMap.put("schemeNo", obj[0]);
		        tempMap.put("planNo", obj[1]);
		        tempMap.put("planId", obj[2]);
		        tempMap.put("errorCode", obj[3]);
		        tempMap.put("errorDesc", obj[4]);
		        tempMap.put("flightStatue", obj[5]);
		        tempMap.put("errorType", obj[6]);
		        tempMap.put("errorItem", obj[7]);
		        tempMap.put("errorNumber", obj[8]);
		        tempMap.put("causeError", obj[9]);
		        tempMap.put("perError", obj[10]);
		        tempMap.put("resError", obj[11]);
		        tempMap.put("conError", obj[12]);
		        tempMap.put("threatType", obj[13]);
		        tempMap.put("threatNumber", obj[14]);
		        tempMap.put("dealError", obj[15]);
		        tempMap.put("airType", obj[16]);
		        tempMap.put("airNumber", obj[17]);
		        tempMap.put("foundStatue", obj[18]);
		        tempMap.put("forAir", obj[19]);
		        tempMap.put("theAi", obj[20]);
		        tempMap.put("observiewId", obj[21]);
		        tempMap.put("schemeId", obj[22]);
		        result.add(tempMap);
    }
	    }
	    List countList=new ArrayList<Object>();
	    countList.add(count);
	    resultmap.put("all", countList);
	    resultmap.put("result", result);
	    return resultmap;
	  }
  
  public Map queryErrorNameCount(ManageQueryForm manageQueryForm) throws Exception {
    String sql = "";
    Map resultmap = new HashMap<>();
    String str  = parseSql(manageQueryForm);
    sql="select leb.name as errorname, count(lewm.id) as errorcount, "+
           "sum(decode(lewm.crew_response_of_error, 'no response', 1, 0)) as responseerror "+
           "from l_observe_activity loa "+
           "left join l_error_work_manage lewm on lewm.observe_id = loa.id  "+
           "join l_error_baseinfo leb on lewm.error_number = leb.num ";
            if(!StringUtils.isBlank(str)){
              sql = sql + str + " and loa.deleted = 0 and lewm.deleted = 0 ";
            }else{
              sql += "left join L_PLAN lp on loa.plan_id = lp.id "+
              "where lp.plan_status = 'done' and lp.deleted = 0 and loa.deleted = 0 and lewm.deleted = 0 ";
            }
            sql += "group by leb.name "+
           "order by count(lewm.id) desc ";
    Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();
    SQLQuery query = session.createSQLQuery(sql);
    List<Object[]> list= query.list();
    resultmap.put("result", list);
    return resultmap;
  }
  
  private String parseSql(ManageQueryForm manageQueryForm) {
    String sql = "";
    if(manageQueryForm!=null){
      if(!StringUtils.isBlank(manageQueryForm.getS_impleUnitId())||!StringUtils.isBlank(manageQueryForm.getS_schemeName())||!StringUtils.isBlank(manageQueryForm.getS_schemeType())){
        sql += " left join L_PLAN lp on loa.plan_id = lp.id left join L_SCHEME ls on lp.scheme_id = ls.id where lp.plan_status = 'done' and lp.deleted = 0 and ls.deleted = 0";
      }else{
        sql += " left join L_PLAN lp on loa.plan_id = lp.id where lp.plan_status = 'done' and lp.deleted = 0 ";  
      }
      
      if(!StringUtils.isBlank(manageQueryForm.getP_arrAirportNo())){
        sql += " and lp.arr_airport_no in ( "+parseSqlString(manageQueryForm.getP_arrAirportNo())+" ) ";
      }
      if(!StringUtils.isBlank(manageQueryForm.getP_depAirportNo())){
        sql += " and lp.dep_airport_no in ( "+parseSqlString(manageQueryForm.getP_depAirportNo())+" ) ";
      }
      if(!StringUtils.isBlank(manageQueryForm.getP_flightId())){
        sql += " and lp.flight_id in ( "+manageQueryForm.getP_flightId()+" ) ";
      }
      if(!StringUtils.isBlank(manageQueryForm.getP_observeDate())){
        sql += " and lp.observe_date >= to_date('"+manageQueryForm.getP_observeDate()+"','yyyy-MM-dd') ";
      }
      if(!StringUtils.isBlank(manageQueryForm.getP_observeDateTo())){
        sql += " and lp.observe_date <= to_date('"+manageQueryForm.getP_observeDateTo()+"','yyyy-MM-dd') ";
      }
      if(!StringUtils.isBlank(manageQueryForm.getP_observerId())){
        sql += " and lp.observer_id in ( "+manageQueryForm.getP_observerId()+" ) ";
      }
      if(!StringUtils.isBlank(manageQueryForm.getS_impleUnitId())){
        sql += " and ls.imple_unit_id in ( "+manageQueryForm.getS_impleUnitId()+" ) ";
      }
      if(!StringUtils.isBlank(manageQueryForm.getS_schemeName())){
        sql += " and ls.id in ( "+parseSqlString(manageQueryForm.getS_schemeName())+" ) ";
      }
      if(!StringUtils.isBlank(manageQueryForm.getS_schemeType())){
        sql += " and ls.scheme_type in ( "+parseSqlString(manageQueryForm.getS_schemeType())+" ) ";
      }
      if(!StringUtils.isBlank(manageQueryForm.getF_org_code())&&!manageQueryForm.getF_org_code().equals("null")){
          sql += " and lp.id in (  select lp.id from L_PLAN lp left join l_scheme_unit lu on lp.scheme_id = lu.scheme_id"+	
		         " where lu.unit_id in (select ffbau.unit_id from fxw_flight_bd_aero_unit ffbau"+
		         " start with ffbau.unit_id in (select ffbau.unit_id from t_organization ton"+
		         " join fxw_flight_bd_aero_unit ffbau on ton.deptcode = ffbau.unit_code"+
		         " where ton.id in ("+manageQueryForm.getF_org_code()+")) connect by prior ffbau.unit_id = ffbau.parent_id))";
        } 
    }
    return sql;
  }
//根据当前登录用户的user_id，判断用户的查询权限和所属公司
		public String getUserAuths(Integer userId){
			try{
				Session session0 = getHibernateTemplate().getSessionFactory().getCurrentSession();
				String sql= "select a.resp_name，a.observer_org from l_observer_info a where a.deleted = 0 and a.userid ="+userId;
				SQLQuery query0 = session0.createSQLQuery((sql).toString());
				String groupName = "";
				String groupOrg = "";
				List<?> list=query0.list();
    			for(int i=0;i<list.size();i++){
    				Object[] obj = (Object[])list.get(i);
    				groupName=(String) obj[0];
    				groupOrg=(String) obj[1];
    			}
				if(groupName.indexOf("sysAdmin")!=-1){
					return groupOrg;
				}else if(groupName.indexOf("branchAdmin")!=-1&&groupName.indexOf("observer")!=-1){
					return groupOrg;
				}else if(groupName.indexOf("branchAdmin")!=-1){
					return groupOrg;
				}else if(groupName.indexOf("observer")!=-1){
					return groupOrg;
				}else{
					return "";
				}
			}catch(Exception e){
				e.printStackTrace();
			}
			return null;
		}
	//查询审计方案的被实施单位
	public List<Map<String,Object>> querySchemeOrgcode(Map<String,Object> paramMap) throws Exception{
		List<Map<String,Object>> result = new ArrayList<Map<String,Object>>();
		try{
			String unitName = (String)paramMap.get("unitName"); 
			Session session0 = getHibernateTemplate().getSessionFactory().getCurrentSession();
			String sql="select a.id,a.\"name\" from t_organization a where a.olevel = '2'"
					+" and (a.deptcode like 'EA%' or a.id = 10) and a.deleted = 0 and a.\"unit\" is not null";
			String sqlparam = "";
			if(StringUtils.isNotBlank(unitName)){
				sqlparam+=" and a.\"name\" like '%"+unitName+"%'";
			}
			SQLQuery query0 = session0.createSQLQuery((sql+sqlparam).toString());
			List<?> list= new ArrayList<Object[]>();
			list= query0.list();
			if(list.size()>0){
	        	for(int i=0;i<list.size();i++){
	        		 Object[] obj = (Object[])list.get(i);
	        		 Map<String,Object> map = new HashMap<String,Object>();
	        		 map.put("id", obj[0]);
	        		 map.put("unitName", obj[1]);
	        		 result.add(map);
	        	}
	        }
		}catch(Exception e){
			e.printStackTrace();
		}
		
		return result;
	}
  
  private String parseSqlString(String str) {
    String sql = "";
    String [] stringArr= str.split(",");
    for(int i=0; i<stringArr.length-1; i++){
      sql += " '"+stringArr[i]+"', ";
    }
    if(stringArr.length>0){
      sql += " '"+stringArr[stringArr.length-1]+"'";
    }
    return sql;
  }

}
