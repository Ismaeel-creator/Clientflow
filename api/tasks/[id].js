import { db } from 'hatchable';

export const access = 'user';
export const methods = ['PUT', 'DELETE'];
const statuses = ['todo', 'in_progress', 'done'];
const priorities = ['low', 'medium', 'high'];
const clean = (v, n = 500) => typeof v === 'string' ? v.trim().slice(0, n) : '';

export default async function (req, res) {
  const id = req.params.id;
  if (!/^[0-9a-f-]{36}$/i.test(id || '')) return res.status(400).json({ error: 'Invalid task ID.' });
  if (req.method === 'DELETE') {
    const result = await db.query('DELETE FROM tasks WHERE id = $1 RETURNING id', [id]);
    return result.rows.length ? res.json({ ok: true }) : res.status(404).json({ error: 'Task not found.' });
  }
  const b = req.body || {};
  const title = clean(b.title, 200);
  const status = statuses.includes(b.status) ? b.status : 'todo';
  const priority = priorities.includes(b.priority) ? b.priority : 'medium';
  const due = clean(b.due_date, 10) || null;
  if (!title) return res.status(400).json({ error: 'Task title is required.' });
  if (due && !/^\d{4}-\d{2}-\d{2}$/.test(due)) return res.status(400).json({ error: 'Due date must use YYYY-MM-DD.' });
  const { rows } = await db.query('UPDATE tasks SET title = $2, description = $3, status = $4, priority = $5, due_date = $6, completed_at = CASE WHEN $4 = $7 THEN COALESCE(completed_at, now()) ELSE NULL END, updated_at = now() WHERE id = $1 RETURNING id, project_id, title, description, status, priority, due_date, completed_at, created_at, updated_at', [id, title, clean(b.description, 2000), status, priority, due, 'done']);
  return rows[0] ? res.json(rows[0]) : res.status(404).json({ error: 'Task not found.' });
}