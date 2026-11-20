-- 0001: the Project table (item 51, step 3). Shaped from Timeline's projToFields /
-- fieldsToProj (timeline/index.html, common/common.js): one column per field they carry.
-- Applied in one transaction by src/migrate.ts; never edit a migration once applied —
-- add the next number instead.
CREATE TABLE dbo.Project (
  id                UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_Project PRIMARY KEY
                    CONSTRAINT DF_Project_id DEFAULT NEWSEQUENTIALID(),
  -- Today's identifiers, kept for the import and rewritten into references once (§E7).
  legacyAppId       NVARCHAR(64)     NULL,   -- SharePoint appId (genId(): time stamp + 6 characters)
  legacySpId        INT              NULL,   -- SharePoint list item ID
  name              NVARCHAR(255)    NOT NULL,
  client            NVARCHAR(255)    NOT NULL CONSTRAINT DF_Project_client DEFAULT N'',
  jobCode           NVARCHAR(64)     NOT NULL CONSTRAINT DF_Project_jobCode DEFAULT N'',
  deadline          DATE             NULL,
  status            NVARCHAR(32)     NOT NULL CONSTRAINT DF_Project_status DEFAULT N'auto',
  -- Display names as Timeline stores them today; they join nothing. People IDs replace
  -- them when People's table exists (Phase 8).
  projectManager    NVARCHAR(255)    NOT NULL CONSTRAINT DF_Project_projectManager DEFAULT N'',
  drafter           NVARCHAR(255)    NOT NULL CONSTRAINT DF_Project_drafter DEFAULT N'',
  leadFab           NVARCHAR(255)    NOT NULL CONSTRAINT DF_Project_leadFab DEFAULT N'',
  fabricators       NVARCHAR(1000)   NOT NULL CONSTRAINT DF_Project_fabricators DEFAULT N'',
  activeDepartments NVARCHAR(MAX)    NOT NULL CONSTRAINT DF_Project_activeDepartments DEFAULT N'[]'
                    CONSTRAINT CK_Project_activeDepartments CHECK (ISJSON(activeDepartments) = 1),
  sortIndex         FLOAT            NULL,   -- an ordering key (can fall between two rows), not money
  createdAt         DATE             NULL,
  confirmedAt       DATETIME2(3)     NULL,   -- "Schedule still accurate" (item 6)
  confirmedBy       NVARCHAR(255)    NULL,
  refs              NVARCHAR(MAX)    NULL
                    CONSTRAINT CK_Project_refs CHECK (refs IS NULL OR ISJSON(refs) = 1),  -- item 28
  rowVersion        ROWVERSION       NOT NULL -- the version check writes will use (§E7)
);

-- An appId is never reused; many rows may have none.
CREATE UNIQUE INDEX UX_Project_legacyAppId ON dbo.Project (legacyAppId) WHERE legacyAppId IS NOT NULL;
