import { db } from 'hatchable';

export const access = 'user';
export const methods = ['GET', 'PUT', 'DELETE'];

function clean(value, max = 500) { return typeof value === 'string' ? value.trim().slice(0, max) : ''; }

export default async function (req, res) {
  const id = req.params.id;
  if (!/^[0-9a-f-]{36}$/i.test(id || '')) return res.status(400).json({ error: 'Invalid client ID.' });
  if (req.method === 'GET') {
    const { rows } = await db.query('SELECT id, name, email, company, phone, notes, archived_at, created_at, updated_at FROM clients WHERE id = $1', [id]);
    return rows[0] ? res.json(rows[0]) : res.status(404).json({ error: 'Client not found.' });
  }
  if (req.method === 'DELETE') {
    const { rows } = await db.query('SELECT id FROM projects WHERE client_id = $1 LIMIT 1', [id]);
    if (rows.length) return res.status(409).json({ error: 'This client has projects. Archive the client or remove its projects first.' });
    const result = await db.query('DELETE FROM clients WHERE id = $1 RETURNING id', [id]);
    return result.rows.length ? res.json({ ok: true }) : res.status(404).json({ error: 'Client not found.' });
  }
  const body = req.body || {};
  const name = clean(body.name, 120);
  if (!name) return res.status(400).json({ error: 'Client name is required.' });
  const email = clean(body.email, 254).toLowerCase() || null;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Enter a valid email address.' });
  const { rows } = await db.query('UPDATE clients SET name = $2, email = $3, company = $4, phone = $5, notes = $6, updated_at = now() WHERE id = $1 RETURNING id, name, email, company, phone, notes, archived_at, created_at, updated_at', [id, name, email, clean(body.company, 160) || null, clean(body.phone, 40) || null, clean(body.notes, 2000)]);
  return rows[0] ? res.json(rows[0]) : res.status(404).json({ error: 'Client not found.' });
}