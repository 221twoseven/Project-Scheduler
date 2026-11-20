import sql from 'mssql';

// The response shape, as JSON Schema. It is also the contract (§E12): Fastify serializes
// through it, so a column not listed here never leaves the server. It mirrors what
// fieldsToProj (common/common.js) gives Timeline, so step 5 can compare record by record;
// `id` is the new UUID and `legacyAppId` the SharePoint appId it replaces.
export const projectSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'legacyAppId', 'name', 'client', 'jobCode', 'deadline', 'status', 'projectManager', 'drafter', 'leadFab', 'fabricators', 'activeDepartments', 'sortIndex', 'createdAt'],
  properties: {
    id: { type: 'string', format: 'uuid' },
    legacyAppId: { type: ['string', 'null'] },
    name: { type: 'string' },
    client: { type: 'string' },
    jobCode: { type: 'string' },
    deadline: { type: 'string' }, // YYYY-MM-DD, or '' as fieldsToProj gives
    status: { type: 'string' },
    projectManager: { type: 'string' },
    drafter: { type: 'string' },
    leadFab: { type: 'string' },
    fabricators: { type: 'string' },
    activeDepartments: { type: 'array', items: { type: 'string' } },
    sortIndex: { type: ['number', 'null'] },
    createdAt: { type: 'string' },
    confirmedAt: { type: 'string' }, // present only when set, as in fieldsToProj
    confirmedBy: { type: 'string' },
  },
} as const;

type Row = {
  id: string;
  legacyAppId: string | null;
  name: string;
  client: string;
  jobCode: string;
  deadline: Date | null;
  status: string;
  projectManager: string;
  drafter: string;
  leadFab: string;
  fabricators: string;
  activeDepartments: string;
  sortIndex: number | null;
  createdAt: Date | null;
  confirmedAt: Date | null;
  confirmedBy: string | null;
};

// `refs` and `rowVersion` stay in the database until a caller needs them.
const COLUMNS = `id, legacyAppId, name, client, jobCode, deadline, status, projectManager, drafter,
  leadFab, fabricators, activeDepartments, sortIndex, createdAt, confirmedAt, confirmedBy`;

const day = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : '');

function toProject(r: Row) {
  return {
    ...r,
    id: r.id.toLowerCase(), // SQL Server returns UUIDs in upper case
    deadline: day(r.deadline),
    createdAt: day(r.createdAt),
    activeDepartments: JSON.parse(r.activeDepartments) as string[],
    confirmedAt: r.confirmedAt ? r.confirmedAt.toISOString() : undefined,
    confirmedBy: r.confirmedAt ? (r.confirmedBy ?? '') : undefined,
  };
}

export async function listProjects(pool: sql.ConnectionPool) {
  const r = await pool.request().query<Row>(`SELECT ${COLUMNS} FROM dbo.Project ORDER BY sortIndex, deadline, name`);
  return r.recordset.map(toProject);
}

export async function getProject(pool: sql.ConnectionPool, id: string) {
  const r = await pool
    .request()
    .input('id', sql.UniqueIdentifier, id)
    .query<Row>(`SELECT ${COLUMNS} FROM dbo.Project WHERE id = @id`);
  return r.recordset[0] ? toProject(r.recordset[0]) : null;
}
