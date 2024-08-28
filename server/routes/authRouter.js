import express from 'express';
import { newLogin } from '../controller/auth/login.js';
import { newAccount, registerNewUser, getRoleUserById } from '../controller/auth/register.js';

const router = express.Router();

router.post('/auth/login', newLogin);
router.post('/account/new', newAccount);
router.post('/user/new', registerNewUser);
router.get('/user/role/:uuid', getRoleUserById);

export default router;
