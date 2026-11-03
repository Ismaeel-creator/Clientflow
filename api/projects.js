import { db } from 'hatchable';

export const access = 'user';
export const methods = ['GET', 'POST'];
const statuses = ['planned', 'active', 'completed', 'on_hold'];
const priorities = ['low', 'medium', 'high'];
const clean = (v, n = 500) => typeof v === 'string' ? v.trim().slice(0, n) : '';

export default async function (req, res) {
  if (req.method === 'GET') {
    const { rows } = await db.query('SELECT p.id, p.client_id, p.name, p.description, p.status, p.priority, p.start_date, p.due_date, p.created_at, p.updated_at, c.name AS client_name, (SELECT count(*) FROM tasks t WHERE t.project_id = p.id) AS task_count, (SELECT count(*) FROM tasks t WHERE t.project_id = p.id AND t.status = $1) AS completed_tasks FROM projects p JOIN clients c ON c.id = p.client_id ORDER BY p.created_at DESC', ['done']);
    return res.json(rows);
  }
  const b = req.body || {};
  const name = clean(b.name, 160);
  const clientId = clean(b.client_id, 36);
  const status = statuses.includes(b.status) ? b.status : 'planned';
  const priority = priorities.includes(b.priority) ? b.priority : 'medium';
  if (!name || !/^[0-9a-f-]{36}$/i.test(clientId)) return res.status(400).json({ error: 'Project name and a valid client are required.' });
  const start = clean(b.start_date, 10) || null;
  const due = clean(b.due_date, 10) || null;
  if (start && !/^\d{4}-\d{2}-\d{2}$/.test(start) || due && !/^\d{4}-\d{2}-\d{2}$/.test(due)) return res.status(400).json({ error: 'Dates must use YYYY-MM-DD.' });
  if (start && due && due < start) return res.status(400).json({ error: 'Due date cannot be before the start date.' });
  const { rows } = await db.query('INSERT INTO projects (client_id, name, description, status, priority, start_date, due_date) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, client_id, name, description, status, priority, start_date, due_date, created_at, updated_at', [clientId, name, clean(b.description, 3000), status, priority, start, due]);
  const project = rows[0];
  await db.query('INSERT INTO activity_logs (entity_type, entity_id, action, details) VALUES ($1, $2, $3, $4::jsonb)', ['project', project.id, 'Project created', JSON.stringify({ name: project.name })]);
  return res.status(201).json(project);
}