-- Alter table
--观察表格表  将 ARR_TIME，DEP_TIME由number型转换为String类型
alter table L_OBSERVE_ACTIVITY
add (ARR_TIME_STR VARCHAR2(10),
	 DEP_TIME_STR VARCHAR2(10));
update L_OBSERVE_ACTIVITY t 
set t.ARR_TIME_STR = nvl2(t.ARR_TIME,to_char(t.ARR_TIME,'0000'),''),
    t.DEP_TIME_STR = nvl2(t.DEP_TIME,to_char(t.DEP_TIME,'0000'),'');
alter table L_OBSERVE_ACTIVITY
drop (ARR_TIME, DEP_TIME);
alter table L_OBSERVE_ACTIVITY rename column ARR_TIME_STR to ARR_TIME;
alter table L_OBSERVE_ACTIVITY rename column DEP_TIME_STR to DEP_TIME;
