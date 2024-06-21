import express from 'express';
import { newLogin } from '../controller/auth/login.js';
import { newAccount, registerNewUser } from '../controller/auth/register.js';

const router = express.Router();


router.post('/auth/login', newLogin);
router.post('/account/new', newAccount);
router.post('/user/new', registerNewUser);

export default router;