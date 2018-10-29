-- �������޸�
alter table L_ATTACHMENT add(
  update_time        DATE,
  creat_name         VARCHAR2(100),
  attach_server_name VARCHAR2(100)
  );

comment on column L_ATTACHMENT.update_time
  is '�����ϴ�ʱ��';
comment on column L_ATTACHMENT.creat_name
  is '�ϴ���';
comment on column L_ATTACHMENT.attach_server_name
  is '��������������';


-- Create table

DROP TABLE E_IOSA_ASSESSMENT CASCADE CONSTRAINTS;

CREATE TABLE E_IOSA_ASSESSMENT
(
  ID             NUMBER(10)                     NOT NULL,
  CREATOR        NUMBER(10),
  CREATED        DATE,
  LAST_MODIFIER  NUMBER(10),
  LAST_UPDATE    DATE,
  DELETED        NUMBER(1),
  TEXT           VARCHAR2(2000 BYTE),
  TYPE           VARCHAR2(100 BYTE)
)
LOGGING 
NOCOMPRESS 
NOCACHE
NOPARALLEL
MONITORING;


DROP TABLE E_IOSA_AUDITOR_ACTION CASCADE CONSTRAINTS;

CREATE TABLE E_IOSA_AUDITOR_ACTION
(
  ID             NUMBER(10)                     NOT NULL,
  CREATOR        NUMBER(10),
  CREATED        DATE,
  LAST_MODIFIER  NUMBER(10),
  LAST_UPDATE    DATE,
  DELETED        NUMBER(1),
  ACTIONID       NUMBER(10),
  AUDITORID      NUMBER(10)
)
LOGGING 
NOCOMPRESS 
NOCACHE
NOPARALLEL
MONITORING;


DROP TABLE E_IOSA_CHAPTER CASCADE CONSTRAINTS;

CREATE TABLE E_IOSA_CHAPTER
(
  ID             NUMBER(10)                     NOT NULL,
  CREATOR        NUMBER(10),
  CREATED        DATE,
  LAST_MODIFIER  NUMBER(10),
  LAST_UPDATE    DATE,
  DELETED        NUMBER(1),
  DOCUMENTID     NUMBER(10),
  DEC            VARCHAR2(200 BYTE),
  ISARPID        NUMBER(10)
)
LOGGING 
NOCOMPRESS 
NOCACHE
NOPARALLEL
MONITORING;


DROP TABLE E_IOSA_CHAPTER_TEMP CASCADE CONSTRAINTS;

CREATE TABLE E_IOSA_CHAPTER_TEMP
(
  ISARPID   INTEGER,
  DEC       VARCHAR2(2000 BYTE),
  DOC1      VARCHAR2(2000 BYTE),
  DOC2      VARCHAR2(2000 BYTE),
  DOC3      VARCHAR2(2000 BYTE),
  DOC4      VARCHAR2(2000 BYTE),
  DOC5      VARCHAR2(2000 BYTE),
  REPORTID  VARCHAR2(32 BYTE)
)
LOGGING 
NOCOMPRESS 
NOCACHE
NOPARALLEL
MONITORING;


DROP TABLE E_IOSA_CODE CASCADE CONSTRAINTS;

CREATE TABLE E_IOSA_CODE
(
  ID                NUMBER(10)                  NOT NULL,
  CREATOR           NUMBER(10),
  CREATED           DATE,
  LAST_MODIFIER     NUMBER(10),
  LAST_UPDATE       DATE,
  DELETED           NUMBER(1),
  TYPE              VARCHAR2(255 BYTE),
  CODE_NAME         VARCHAR2(255 BYTE),
  CODE_KEY          VARCHAR2(255 BYTE),
  CODE_DESCRIPTION  VARCHAR2(255 BYTE),
  CODE_SORT         NUMBER(10),
  VALIDITY          NUMBER(1),
  CODE_VALUE        VARCHAR2(10 BYTE)
)
LOGGING 
NOCOMPRESS 
NOCACHE
NOPARALLEL
MONITORING;


DROP TABLE E_IOSA_DOCUMENT_LIBARY CASCADE CONSTRAINTS;

CREATE TABLE E_IOSA_DOCUMENT_LIBARY
(
  ID             NUMBER(10)                     NOT NULL,
  CREATOR        NUMBER(10),
  CREATED        DATE,
  LAST_MODIFIER  NUMBER(10),
  LAST_UPDATE    DATE,
  DELETED        NUMBER(1),
  REPORTID       NUMBER(10),
  REVIEWED       VARCHAR2(200 BYTE),
  ACRONYMS       VARCHAR2(200 BYTE),
  VERSIONNO      VARCHAR2(20 BYTE),
  TYPE           VARCHAR2(20 BYTE),
  DOCDATE        DATE,
  USED           NUMBER(1)
)
LOGGING 
NOCOMPRESS 
NOCACHE
NOPARALLEL
MONITORING;


DROP TABLE E_IOSA_ISARP CASCADE CONSTRAINTS;

CREATE TABLE E_IOSA_ISARP
(
  ID                      NUMBER(10)            NOT NULL,
  CREATOR                 NUMBER(10),
  CREATED                 DATE,
  LAST_MODIFIER           NUMBER(10),
  LAST_UPDATE             DATE,
  DELETED                 NUMBER(1),
  SECTIONID               NUMBER(10),
  ASSESSMENT              NUMBER(10),
  REASON                  VARCHAR2(2000 BYTE),
  ROOTCAUSE               VARCHAR2(2000 BYTE),
  TAKEN                   VARCHAR2(1000 BYTE),
  COMMENTS                VARCHAR2(4000 BYTE),
  STATUS                  NUMBER(10),
  TEXT                    VARCHAR2(4000 BYTE),
  GUIDANCE                VARCHAR2(4000 BYTE),
  LIBTYPE                 NUMBER(5),
  BASEID                  NUMBER(10),
  PARENTID                NUMBER(10),
  LEVELS                  NUMBER(1),
  NO                      VARCHAR2(20 BYTE),
  LAST_AUDIT_DATE         DATE,
  LAST_AUDIT_DATE_STRING  VARCHAR2(500 BYTE),
  LAST_AUDIT_NAME         VARCHAR2(100 BYTE),
  TEMPLET_COMMENTS        VARCHAR2(4000 BYTE),
  NO_SORT                 VARCHAR2(20 BYTE)
)
LOGGING 
NOCOMPRESS 
NOCACHE
NOPARALLEL
MONITORING;


DROP TABLE E_IOSA_ISARP_ACTION CASCADE CONSTRAINTS;

CREATE TABLE E_IOSA_ISARP_ACTION
(
  ID                NUMBER(10)                  NOT NULL,
  CREATOR           NUMBER(10),
  CREATED           DATE,
  LAST_MODIFIER     NUMBER(10),
  LAST_UPDATE       DATE,
  DELETED           NUMBER(1),
  ISARPID           NUMBER(10),
  AUDITORS          VARCHAR2(200 BYTE),
  REPORTS           VARCHAR2(2000 BYTE),
  STATUS            NUMBER(10),
  TYPENAME          VARCHAR2(20 BYTE),
  BASEID            NUMBER(10),
  LIBTYPE           NUMBER(5),
  TITLE             VARCHAR2(1000 BYTE),
  AUDITDATE         DATE,
  AUDITDATE_STRING  VARCHAR2(50 BYTE),
  AAID              VARCHAR2(20 BYTE)
)
LOGGING 
NOCOMPRESS 
NOCACHE
NOPARALLEL
MONITORING;


DROP TABLE E_IOSA_ISARP_ACTION_EXCEL_TEMP CASCADE CONSTRAINTS;

CREATE TABLE E_IOSA_ISARP_ACTION_EXCEL_TEMP
(
  ISARPID           INTEGER,
  AUDITDATE_STRING  VARCHAR2(2000 BYTE),
  AUDITORS          VARCHAR2(2000 BYTE),
  REPORTS           VARCHAR2(2000 BYTE),
  STATUS            NUMBER,
  TYPENAME          VARCHAR2(3 BYTE),
  ID                INTEGER,
  DELETED           NUMBER,
  CREATED           DATE,
  SECTION           VARCHAR2(2000 BYTE),
  ISARP             VARCHAR2(2000 BYTE),
  REPORTID          VARCHAR2(32 BYTE)
)
LOGGING 
NOCOMPRESS 
NOCACHE
NOPARALLEL
MONITORING;


DROP TABLE E_IOSA_ISARP_ASSESSMENT CASCADE CONSTRAINTS;

CREATE TABLE E_IOSA_ISARP_ASSESSMENT
(
  ID             NUMBER(10)                     NOT NULL,
  CREATOR        NUMBER(10),
  CREATED        DATE,
  LAST_MODIFIER  NUMBER(10),
  LAST_UPDATE    DATE,
  DELETED        NUMBER(1),
  ISARPID        NUMBER(10),
  ASSESSNAMEID   VARCHAR2(2000 BYTE)
)
LOGGING 
NOCOMPRESS 
NOCACHE
NOPARALLEL
MONITORING;


DROP TABLE E_IOSA_ISARP_COMMENT_TEMP CASCADE CONSTRAINTS;

CREATE TABLE E_IOSA_ISARP_COMMENT_TEMP
(
  SECTIONID         INTEGER,
  NO                VARCHAR2(20 BYTE),
  TEXT              CLOB,
  TEMPLET_COMMENTS  CLOB,
  GUIDANCE          CLOB,
  DELETED           NUMBER,
  CREATED           DATE,
  ID                INTEGER,
  LIBTYPE           NUMBER,
  NO_SORT           VARCHAR2(9 BYTE)
)
LOB (TEXT) STORE AS (
  TABLESPACE  SMS2TEST
  ENABLE      STORAGE IN ROW
  CHUNK       8192
  RETENTION
  NOCACHE
  LOGGING
      STORAGE    (
                  INITIAL          64K
                  NEXT             1M
                  MINEXTENTS       1
                  MAXEXTENTS       UNLIMITED
                  PCTINCREASE      0
                  BUFFER_POOL      DEFAULT
                  FLASH_CACHE      DEFAULT
                  CELL_FLASH_CACHE DEFAULT
                 ))
LOB (TEMPLET_COMMENTS) STORE AS (
  TABLESPACE  SMS2TEST
  ENABLE      STORAGE IN ROW
  CHUNK       8192
  RETENTION
  NOCACHE
  LOGGING
      STORAGE    (
                  INITIAL          64K
                  NEXT             1M
                  MINEXTENTS       1
                  MAXEXTENTS       UNLIMITED
                  PCTINCREASE      0
                  BUFFER_POOL      DEFAULT
                  FLASH_CACHE      DEFAULT
                  CELL_FLASH_CACHE DEFAULT
                 ))
LOB (GUIDANCE) STORE AS (
  TABLESPACE  SMS2TEST
  ENABLE      STORAGE IN ROW
  CHUNK       8192
  RETENTION
  NOCACHE
  LOGGING
      STORAGE    (
                  INITIAL          64K
                  NEXT             1M
                  MINEXTENTS       1
                  MAXEXTENTS       UNLIMITED
                  PCTINCREASE      0
                  BUFFER_POOL      DEFAULT
                  FLASH_CACHE      DEFAULT
                  CELL_FLASH_CACHE DEFAULT
                 ))
LOGGING 
NOCOMPRESS 
NOCACHE
NOPARALLEL
MONITORING;


DROP TABLE E_IOSA_ISARP_TEMP CASCADE CONSTRAINTS;

CREATE TABLE E_IOSA_ISARP_TEMP
(
  NO                      VARCHAR2(2000 BYTE),
  TEXT                    CLOB,
  ASSESSMENT              NUMBER,
  REASON                  VARCHAR2(2000 BYTE),
  ROOTCAUSE               VARCHAR2(2000 BYTE),
  TAKEN                   VARCHAR2(2000 BYTE),
  ID                      INTEGER,
  LAST_AUDIT_NAME         VARCHAR2(2000 BYTE),
  DELETED                 NUMBER,
  CREATED                 DATE,
  LAST_AUDIT_DATE_STRING  VARCHAR2(2000 BYTE),
  REPORTID                VARCHAR2(32 BYTE),
  SECTIONNAME             VARCHAR2(2000 BYTE)
)
LOB (TEXT) STORE AS (
  TABLESPACE  SMS2TEST
  ENABLE      STORAGE IN ROW
  CHUNK       8192
  RETENTION
  NOCACHE
  LOGGING
      STORAGE    (
                  INITIAL          64K
                  NEXT             1M
                  MINEXTENTS       1
                  MAXEXTENTS       UNLIMITED
                  PCTINCREASE      0
                  BUFFER_POOL      DEFAULT
                  FLASH_CACHE      DEFAULT
                  CELL_FLASH_CACHE DEFAULT
                 ))
LOGGING 
NOCOMPRESS 
NOCACHE
NOPARALLEL
MONITORING;


DROP TABLE E_IOSA_OPERATION_LOG CASCADE CONSTRAINTS;

CREATE TABLE E_IOSA_OPERATION_LOG
(
  ID             NUMBER(10)                     NOT NULL,
  CREATOR        NUMBER(10),
  CREATED        DATE,
  LAST_MODIFIER  NUMBER(10),
  LAST_UPDATE    DATE,
  DELETED        NUMBER(1),
  ISARPID        NUMBER(10),
  DESCOPERATE    VARCHAR2(1000 BYTE),
  RECEIVER       NUMBER(10)
)
LOGGING 
NOCOMPRESS 
NOCACHE
NOPARALLEL
MONITORING;


DROP TABLE E_IOSA_REPORT CASCADE CONSTRAINTS;

CREATE TABLE E_IOSA_REPORT
(
  ID             NUMBER(10)                     NOT NULL,
  CREATOR        NUMBER(10),
  CREATED        DATE,
  LAST_MODIFIER  NUMBER(10),
  LAST_UPDATE    DATE,
  DELETED        NUMBER(1),
  REPNO          VARCHAR2(50 BYTE),
  REPSTATUS      VARCHAR2(50 BYTE),
  REPDATE        DATE,
  FRONT          VARCHAR2(100 BYTE),
  NOTICE         VARCHAR2(1000 BYTE),
  DECLARACTION   VARCHAR2(1000 BYTE),
  LIBTYPE        NUMBER(2),
  BASEID         NUMBER(10),
  TITLE          VARCHAR2(1000 BYTE)
)
LOGGING 
NOCOMPRESS 
NOCACHE
NOPARALLEL
MONITORING;


DROP TABLE E_IOSA_SECTION CASCADE CONSTRAINTS;

CREATE TABLE E_IOSA_SECTION
(
  ID               NUMBER(10)                   NOT NULL,
  CREATOR          NUMBER(10),
  CREATED          DATE,
  LAST_MODIFIER    NUMBER(10),
  LAST_UPDATE      DATE,
  DELETED          NUMBER(1),
  REPORTID         NUMBER(10),
  SECTIONNAME      VARCHAR2(50 BYTE),
  DISCIPLINE       VARCHAR2(1000 BYTE),
  SECTIONNO        VARCHAR2(50 BYTE),
  SECTIONFULLNAME  VARCHAR2(1000 BYTE),
  APPLICTION       VARCHAR2(255 CHAR),
  STARTDATE        DATE,
  ENDDATE          DATE,
  APPLICABILITY    CLOB,
  GUIDANCE         CLOB,
  LIBTYPE          NUMBER,
  CHIEFAUDITOR     VARCHAR2(50 BYTE)
)
LOB (APPLICABILITY) STORE AS (
  TABLESPACE  SMS2TEST
  ENABLE      STORAGE IN ROW
  CHUNK       8192
  RETENTION
  NOCACHE
  LOGGING
      STORAGE    (
                  INITIAL          64K
                  NEXT             1M
                  MINEXTENTS       1
                  MAXEXTENTS       UNLIMITED
                  PCTINCREASE      0
                  BUFFER_POOL      DEFAULT
                  FLASH_CACHE      DEFAULT
                  CELL_FLASH_CACHE DEFAULT
                 ))
LOB (GUIDANCE) STORE AS (
  TABLESPACE  SMS2TEST
  ENABLE      STORAGE IN ROW
  CHUNK       8192
  RETENTION
  NOCACHE
  LOGGING
      STORAGE    (
                  INITIAL          64K
                  NEXT             1M
                  MINEXTENTS       1
                  MAXEXTENTS       UNLIMITED
                  PCTINCREASE      0
                  BUFFER_POOL      DEFAULT
                  FLASH_CACHE      DEFAULT
                  CELL_FLASH_CACHE DEFAULT
                 ))
LOGGING 
NOCOMPRESS 
NOCACHE
NOPARALLEL
MONITORING;


DROP TABLE E_IOSA_SECTION_DOCUMENT CASCADE CONSTRAINTS;

CREATE TABLE E_IOSA_SECTION_DOCUMENT
(
  ID             NUMBER(10)                     NOT NULL,
  CREATOR        NUMBER(10),
  CREATED        DATE,
  LAST_MODIFIER  NUMBER(10),
  LAST_UPDATE    DATE,
  DELETED        NUMBER(1),
  SECTIONID      NUMBER(10),
  DOCUMENTID     NUMBER(10),
  VALIDITY       NUMBER(1)
)
LOGGING 
NOCOMPRESS 
NOCACHE
NOPARALLEL
MONITORING;


DROP TABLE E_IOSA_SECTION_TASK CASCADE CONSTRAINTS;

CREATE TABLE E_IOSA_SECTION_TASK
(
  ID             NUMBER(10)                     NOT NULL,
  CREATOR        NUMBER(10),
  CREATED        DATE,
  LAST_MODIFIER  NUMBER(10),
  LAST_UPDATE    DATE,
  DELETED        NUMBER(1),
  TARGETID       NUMBER(10),
  DEALERID       NUMBER(10),
  TYPE           NUMBER(1),
  VALIDITY       NUMBER(1)
)
LOGGING 
NOCOMPRESS 
NOCACHE
NOPARALLEL
MONITORING;

COMMENT ON COLUMN E_IOSA_SECTION_TASK.TARGETID IS 'targetId����ID';

COMMENT ON COLUMN E_IOSA_SECTION_TASK.DEALERID IS 'dealer����ID';

COMMENT ON COLUMN E_IOSA_SECTION_TASK.TYPE IS '1��ʾdealer����section����2��ʾdealer����isarp��level1����3��ʾdealer����isarp��level2����4��ʾdealer����isarp��level3����';

COMMENT ON COLUMN E_IOSA_SECTION_TASK.VALIDITY IS '0��ʾ��Ч��1��ʾ��Ч';



CREATE UNIQUE INDEX UNION_KEY ON E_IOSA_DOCUMENT_LIBARY
(REPORTID, ACRONYMS)
LOGGING
NOPARALLEL;


ALTER TABLE E_IOSA_DOCUMENT_LIBARY ADD (
  CONSTRAINT UNION_KEY
  UNIQUE (REPORTID, ACRONYMS)
  USING INDEX UNION_KEY
  ENABLE VALIDATE);

ALTER TABLE E_IOSA_OPERATION_LOG ADD (
  CONSTRAINT FK8609377B2D50393B 
  FOREIGN KEY (CREATOR) 
  REFERENCES T_USER (ID)
  ENABLE NOVALIDATE,
  CONSTRAINT FK8609377BBFCDA2FE 
  FOREIGN KEY (RECEIVER) 
  REFERENCES T_USER (ID)
  ENABLE NOVALIDATE);