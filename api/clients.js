import { db } from 'hatchable';

export const access = 'user';
export const methods = ['GET', 'POST'];

function clean(value, max = 500) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export default async function (req, res) {
  if (req.method === 'GET') {
    const { rows } = await db.query('SELECT id, name, email, company, phone, notes, archived_at, created_at, updated_at FROM clients ORDER BY created_at DESC');
    return res.json(rows);
  }
  const body = req.body || {};
  const name = clean(body.name, 120);
  if (!name) return res.status(400).json({ error: 'Client name is required.' });
  const email = clean(body.email, 254).toLowerCase() || null;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Enter a valid email address.' });
  const { rows } = await db.query('INSERT INTO clients (name, email, company, phone, notes) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, company, phone, notes, archived_at, created_at, updated_at', [name, email, clean(body.company, 160) || null, clean(body.phone, 40) || null, clean(body.notes, 2000)]);
  const client = rows[0];
  await db.query('INSERT INTO activity_logs (entity_type, entity_id, action, details) VALUES ($1, $2, $3, $4::jsonb)', ['client', client.id, 'Client created', JSON.stringify({ name: client.name })]);
  return res.status(201).json(client);
}