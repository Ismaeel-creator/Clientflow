import { db } from 'hatchable';

export const access = 'user';
export const methods = ['GET', 'PUT', 'DELETE'];
const statuses = ['planned', 'active', 'completed', 'on_hold'];
const priorities = ['low', 'medium', 'high'];
const clean = (v, n = 500) => typeof v === 'string' ? v.trim().slice(0, n) : '';

export default async function (req, res) {
  const id = req.params.id;
  if (!/^[0-9a-f-]{36}$/i.test(id || '')) return res.status(400).json({ error: 'Invalid project ID.' });
  if (req.method === 'GET') {
    const { rows } = await db.query('SELECT p.id, p.client_id, p.name, p.description, p.status, p.priority, p.start_date, p.due_date, p.created_at, p.updated_at, c.name AS client_name FROM projects p JOIN clients c ON c.id = p.client_id WHERE p.id = $1', [id]);
    if (!rows[0]) return res.status(404).json({ error: 'Project not found.' });
    const { rows: tasks } = await db.query('SELECT id, title, description, status, priority, due_date, completed_at, created_at FROM tasks WHERE project_id = $1 ORDER BY created_at DESC', [id]);
    return res.json({ ...rows[0], tasks });
  }
  if (req.method === 'DELETE') {
    const result = await db.query('DELETE FROM projects WHERE id = $1 RETURNING id', [id]);
    return result.rows.length ? res.json({ ok: true }) : res.status(404).json({ error: 'Project not found.' });
  }
  const b = req.body || {};
  const name = clean(b.name, 160);
  const status = statuses.includes(b.status) ? b.status : 'planned';
  const priority = priorities.includes(b.priority) ? b.priority : 'medium';
  const start = clean(b.start_date, 10) || null;
  const due = clean(b.due_date, 10) || null;
  if (!name) return res.status(400).json({ error: 'Project name is required.' });
  if (start && due && due < start) return res.status(400).json({ error: 'Due date cannot be before the start date.' });
  const { rows } = await db.query('UPDATE projects SET name = $2, description = $3, status = $4, priority = $5, start_date = $6, due_date = $7, updated_at = now() WHERE id = $1 RETURNING id, client_id, name, description, status, priority, start_date, due_date, created_at, updated_at', [id, name, clean(b.description, 3000), status, priority, start, due]);
  return rows[0] ? res.json(rows[0]) : res.status(404).json({ error: 'Project not found.' });
}