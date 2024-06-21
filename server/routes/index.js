import express from 'express';
import bimer from './bimerRouter.js'
import auth from './authRouter.js'
const router = express.Router();


router.use('/', auth)
router.use('/bimer',bimer)

export default router;
