import { db } from 'hatchable';

export const access = 'user';
export const methods = ['GET', 'POST'];
const statuses = ['todo', 'in_progress', 'done'];
const priorities = ['low', 'medium', 'high'];
const clean = (v, n = 500) => typeof v === 'string' ? v.trim().slice(0, n) : '';

export default async function (req, res) {
  if (req.method === 'GET') {
    const { rows } = await db.query('SELECT t.id, t.project_id, t.title, t.description, t.status, t.priority, t.due_date, t.completed_at, t.created_at, p.name AS project_name, c.name AS client_name FROM tasks t JOIN projects p ON p.id = t.project_id JOIN clients c ON c.id = p.client_id ORDER BY (t.due_date IS NULL), t.due_date ASC, t.created_at DESC');
    return res.json(rows);
  }
  const b = req.body || {};
  const projectId = clean(b.project_id, 36);
  const title = clean(b.title, 200);
  const status = statuses.includes(b.status) ? b.status : 'todo';
  const priority = priorities.includes(b.priority) ? b.priority : 'medium';
  const due = clean(b.due_date, 10) || null;
  if (!title || !/^[0-9a-f-]{36}$/i.test(projectId)) return res.status(400).json({ error: 'Task title and a valid project are required.' });
  if (due && !/^\d{4}-\d{2}-\d{2}$/.test(due)) return res.status(400).json({ error: 'Due date must use YYYY-MM-DD.' });
  const { rows } = await db.query('INSERT INTO tasks (project_id, title, description, status, priority, due_date, completed_at) VALUES ($1, $2, $3, $4, $5, $6, CASE WHEN $4 = $7 THEN now() ELSE NULL END) RETURNING id, project_id, title, description, status, priority, due_date, completed_at, created_at', [projectId, title, clean(b.description, 2000), status, priority, due, 'done']);
  return res.status(201).json(rows[0]);
}