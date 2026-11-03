import { auth } from 'hatchable';

export const access = 'public';
export const methods = ['GET'];

export default async function (req, res) {
  const user = await auth.getUser(req);
  if (!user) return res.json({ user: null });
  return res.json({ user: { id: user.id, email: user.email, name: user.name, image: user.image } });
}