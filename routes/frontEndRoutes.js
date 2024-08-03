import express from 'express';
import { departments, loginScreen, pages, panel } from '../controllers/frontController.js';
import { frontAuthentication, accessGranted, accessNotGranted } from '../middlewares/frontMiddleware.js';

const router = express.Router();

router.get('/', frontAuthentication, accessGranted, loginScreen);
router.get('/index.html', frontAuthentication, accessGranted, loginScreen);
router.get('/pages/panel/panel.html', frontAuthentication, accessNotGranted, panel);
router.get('/pages/*', frontAuthentication, accessNotGranted, pages);
router.get('/departments/*', frontAuthentication, accessNotGranted, departments);

export default router;