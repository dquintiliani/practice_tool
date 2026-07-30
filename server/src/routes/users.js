import { Router } from 'express';
import { listUsers } from '../users.js';

// Public: powers the mock account switcher, so it must be reachable before a
// user has been "logged in" as anyone.
export const publicUsersRouter = Router();
publicUsersRouter.get('/users', (req, res) => {
  res.json(listUsers().map(({ user_id, name, role }) => ({ user_id, name, role })));
});

const router = Router();
router.get('/me', (req, res) => {
  res.json(req.currentUser);
});

export default router;
