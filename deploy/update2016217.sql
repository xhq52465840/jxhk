-----20160217----SECTION_DOCUMENT关联的条件增加deleted判断，DOCUMENT_LIBARY去除used的过滤条件 
CREATE OR REPLACE VIEW VW_E_IOSA_SECTION_DOCUMENT AS
SELECT
     A.ID,a.reportid,
            A.REVIEWED,
            a.acronyms,
            a.versionno,
            a.TYPE,
            a.docdate,
            MAX (CASE WHEN UPPER (b.sectionname) = 'CAB' THEN 1 ELSE 0 END)
               AS "CAB",
            MAX (CASE WHEN UPPER (b.sectionname) = 'CGO' THEN 1 ELSE 0 END)
               AS "CGO",
            MAX (CASE WHEN UPPER (b.sectionname) = 'DSP' THEN 1 ELSE 0 END)
               AS "DSP",
            MAX (CASE WHEN UPPER (b.sectionname) = 'FLT' THEN 1 ELSE 0 END)
               AS "FLT",
            MAX (CASE WHEN UPPER (b.sectionname) = 'GRH' THEN 1 ELSE 0 END)
               AS "GRH",
            MAX (CASE WHEN UPPER (b.sectionname) = 'MNT' THEN 1 ELSE 0 END)
               AS "MNT",
            MAX (CASE WHEN UPPER (b.sectionname) = 'ORG' THEN 1 ELSE 0 END)
               AS "ORG",
            MAX (CASE WHEN UPPER (b.sectionname) = 'SEC' THEN 1 ELSE 0 END)
               AS "SEC"
       FROM    E_IOSA_DOCUMENT_LIBARY a
            LEFT JOIN
               (SELECT sectionname, DOCUMENTID
                  FROM    E_IOSA_SECTION_DOCUMENT t1
                       LEFT JOIN
                          e_iosa_section t2
                       ON t1.sectionid = t2.id
                 WHERE VALIDITY = 1 AND t1.deleted=0 AND t2.deleted = 0) b
            ON A.ID = b.DOCUMENTID
      WHERE 1 = 1 AND a.deleted = 0
   GROUP BY
   A.ID,a.reportid,
            A.REVIEWED,
            a.acronyms,
            a.versionno,
            a.TYPE,
            a.docdate;
-----20160217 End----
-----20160303----conformance报表查询视图 
create or replace view vw_conformance_report as
select t1.isarpid,
       t1.no,
       t1.text,
       t2.lastdate,
       t2.username,
       t3.documentation,
       t1.assessment,
       t1.reason,
       t1.rootcause,
       t1.taken,
       t1.created,
       t4.username2,
       t1.reports,
       t1.aaid,
       t1.status,
       t1.no_sort,
       t1.reportid 
  from (select eii.id as isarpid,
               eii.no,
               eii.text,
               '(' || eia.type || ')' || eia.text as assessment,
               eii.reason,
               eii.rootcause,
               eii.taken,
               eiia.aaid,
               eiia.created,
               eiia.reports,
               eiia.status,
               eiia.id,
               eii.no_sort,
               eis.reportid 
          from e_iosa_isarp eii
          left join e_iosa_isarp_action eiia
            on eii.id = eiia.isarpid
          left join e_iosa_assessment eia
            on eii.libtype = eia.id 
          left join e_iosa_section eis 
            on eii.sectionid = eis.id
         where eiia.libtype = 2) t1
  left join (select t.isarpid, t.lastdate, to_char(wm_concat(distinct(tu.username))) as username
               from (select row_number() over(partition by eiia.isarpid order by nvl(eiia.last_update, eiia.created) desc) as num,
                            eiia.isarpid,
                            nvl(eiia.last_update, eiia.created) as lastdate,
                            eiia.id
                       from e_iosa_isarp_action eiia
                      where eiia.libtype = 2) T
               left join e_iosa_auditor_action eiaa
                 on eiaa.actionid = t.id
               left join a_auditor aa
                 on aa.id = eiaa.auditorid
               left join t_user tu
                 on aa.user_id = tu.id
              where T.num = 1
              group by t.isarpid, t.lastdate ) t2
    on t1.isarpid = t2.isarpid
  left join (select eic.isarpid,
                    to_char(wm_concat(distinct('(' || eidl.acronyms || ')' ||
                                       eic.dec))) as documentation
               from e_iosa_chapter eic
               left join e_iosa_document_libary eidl
                 on eic.documentid = eidl.id
              group by eic.isarpid) t3
    on t1.isarpid = t3.isarpid
  left join (select eii.id as isarpid,to_char(wm_concat(distinct(tu.username))) as username2
          from e_iosa_isarp eii
          left join e_iosa_isarp_action eiia
            on eii.id = eiia.isarpid
          left join e_iosa_auditor_action eiaa
            on eiaa.actionid = eiia.id
          left join a_auditor aa
            on aa.id = eiaa.auditorid
          left join t_user tu
            on aa.user_id = tu.id
         where eiia.libtype = 2
         group by eii.id
  ) t4
  on t1.isarpid = t4.isarpid
 order by t1.no_sort,cast(substr(t1.aaid, 3) as int);


-----20160303 End----
 
 -----20160303 Isarps里面对AA的统计查询修改----
 CREATE OR REPLACE VIEW VW_ISARP_COUNT AS
SELECT sectionid,
            NO AS LEVEL_NAME,
            SUM (CASE WHEN a.assessment = 8 and a.reason is not null then 1 when b.status = 1 THEN 1 ELSE 0 END) AS complete_num,
            COUNT (B.ID) AS total_num,
            0 AS ISARP_NUM,
            0 AS ISARP_COUNT
       FROM e_iosa_isarp a LEFT JOIN e_iosa_isarp_action b ON A.ID = B.ISARPID
      WHERE a.libtype = 2 AND LEVELS = 3
   GROUP BY sectionid,
            SUBSTR (RPAD (NO, LENGTH (NO) + 1, '.'),
                    1,
                      INSTR (RPAD (NO, LENGTH (NO) + 1, '.'),
                             '.',
                             1,
                             1)
                    - 1),
               SUBSTR (RPAD (NO, LENGTH (NO) + 1, '.'),
                       1,
                         INSTR (RPAD (NO, LENGTH (NO) + 1, '.'),
                                '.',
                                1,
                                1)
                       - 1)
            || '.'
            || SUBSTR (RPAD (NO, LENGTH (NO) + 1, '.'),
                         INSTR (RPAD (NO, LENGTH (NO) + 1, '.'),
                                '.',
                                1,
                                1)
                       + 1,
                         INSTR (RPAD (NO, LENGTH (NO) + 1, '.'),
                                '.',
                                1,
                                2)
                       - INSTR (RPAD (NO, LENGTH (NO) + 1, '.'),
                                '.',
                                1,
                                1)
                       - 1),
            NO
   UNION ALL
     SELECT sectionid,
               SUBSTR (RPAD (NO, LENGTH (NO) + 1, '.'),
                       1,
                         INSTR (RPAD (NO, LENGTH (NO) + 1, '.'),
                                '.',
                                1,
                                1)
                       - 1)
            || '.'
            || SUBSTR (RPAD (NO, LENGTH (NO) + 1, '.'),
                         INSTR (RPAD (NO, LENGTH (NO) + 1, '.'),
                                '.',
                                1,
                                1)
                       + 1,
                         INSTR (RPAD (NO, LENGTH (NO) + 1, '.'),
                                '.',
                                1,
                                2)
                       - INSTR (RPAD (NO, LENGTH (NO) + 1, '.'),
                                '.',
                                1,
                                1)
                       - 1)
               AS LEVEL_NAME,
            SUM (CASE WHEN a.assessment = 8 and a.reason is not null then 1 when b.status = 1 THEN 1 ELSE 0 END) AS complete_num,
            COUNT (B.ID) AS total_num,
            SUM (CASE WHEN A.STATUS = 5 THEN 1 ELSE 0 END) AS ISARP_NUM,
            COUNT (DISTINCT A.ID) AS ISARP_COUNT
       FROM e_iosa_isarp a LEFT JOIN e_iosa_isarp_action b ON A.ID = B.ISARPID
      WHERE a.libtype = 2 AND LEVELS = 3
   GROUP BY sectionid,
            SUBSTR (RPAD (NO, LENGTH (NO) + 1, '.'),
                    1,
                      INSTR (RPAD (NO, LENGTH (NO) + 1, '.'),
                             '.',
                             1,
                             1)
                    - 1),
               SUBSTR (RPAD (NO, LENGTH (NO) + 1, '.'),
                       1,
                         INSTR (RPAD (NO, LENGTH (NO) + 1, '.'),
                                '.',
                                1,
                                1)
                       - 1)
            || '.'
            || SUBSTR (RPAD (NO, LENGTH (NO) + 1, '.'),
                         INSTR (RPAD (NO, LENGTH (NO) + 1, '.'),
                                '.',
                                1,
                                1)
                       + 1,
                         INSTR (RPAD (NO, LENGTH (NO) + 1, '.'),
                                '.',
                                1,
                                2)
                       - INSTR (RPAD (NO, LENGTH (NO) + 1, '.'),
                                '.',
                                1,
                                1)
                       - 1)
   UNION ALL
     SELECT sectionid,
            SUBSTR (RPAD (NO, LENGTH (NO) + 1, '.'),
                    1,
                      INSTR (RPAD (NO, LENGTH (NO) + 1, '.'),
                             '.',
                             1,
                             1)
                    - 1)
               AS LEVEL_NAME,
            SUM (CASE WHEN a.assessment = 8 and a.reason is not null then 1 when b.status = 1 THEN 1 ELSE 0 END) AS complete_num,
            COUNT (B.ID) AS total_num,
            SUM (CASE WHEN A.STATUS = 5 THEN 1 ELSE 0 END) AS ISARP_NUM,
            COUNT (DISTINCT A.ID) AS ISARP_COUNT
       FROM e_iosa_isarp a LEFT JOIN e_iosa_isarp_action b ON A.ID = B.ISARPID
      WHERE a.libtype = 2 AND LEVELS = 3
   GROUP BY sectionid,
            SUBSTR (RPAD (NO, LENGTH (NO) + 1, '.'),
                    1,
                      INSTR (RPAD (NO, LENGTH (NO) + 1, '.'),
                             '.',
                             1,
                             1)
                    - 1);
    -----20160303 End----
