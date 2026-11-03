import { db } from 'hatchable';

export const access = 'user';
export const methods = ['GET'];

export default async function (req, res) {
  const [clients, projects, tasks, recent] = await Promise.all([
    db.query('SELECT count(*)::int AS total FROM clients WHERE archived_at IS NULL'),
    db.query("SELECT count(*)::int AS total, count(*) FILTER (WHERE status = 'active')::int AS active, count(*) FILTER (WHERE status = 'completed')::int AS completed FROM projects"),
    db.query("SELECT count(*) FILTER (WHERE status <> 'done')::int AS open, count(*) FILTER (WHERE status <> 'done' AND due_date < CURRENT_DATE)::int AS overdue, count(*) FILTER (WHERE status = 'done')::int AS completed FROM tasks"),
    db.query('SELECT id, entity_type, entity_id, action, details, created_at FROM activity_logs ORDER BY created_at DESC LIMIT 8')
  ]);
  const p = projects.rows[0] || { total: 0, active: 0, completed: 0 };
  const t = tasks.rows[0] || { open: 0, overdue: 0, completed: 0 };
  return res.json({ clients: clients.rows[0].total, projects: p.total, activeProjects: p.active, completedProjects: p.completed, openTasks: t.open, overdueTasks: t.overdue, completedTasks: t.completed, completionRate: Number(t.completed) + Number(t.open) ? Math.round(Number(t.completed) * 100 / (Number(t.completed) + Number(t.open))) : 0, recentActivity: recent.rows });
}