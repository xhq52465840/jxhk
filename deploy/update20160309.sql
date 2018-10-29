-----20160309 Begin
----日志表修改字段名称，因为这个字段不只是保存ISARPID，同时也会保存SECTIONID、ACTIONID等，修改成TARGETID更准确
alter table e_iosa_operation_log  rename column ISARPID to TARGETID;
comment on column e_iosa_operation_log.TARGETID is '日志对应的级别的业务ID';
---添加字段type，用来保存日志级别
alter table e_iosa_operation_log add type varchar(40);
comment on column e_iosa_operation_log.type is '日志级别名称:isarp、action、section、report';
--添加字段oper_type，用来保存操作类型（审核，重新审计、保存、提交等）
alter table e_iosa_operation_log add oper_type varchar(40);
comment on column e_iosa_operation_log.oper_type is '日志对应的操作类型';
-----20160309 End----
