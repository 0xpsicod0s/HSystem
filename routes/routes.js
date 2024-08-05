import express from 'express';
import { register, login, logout, authenticate } from '../controllers/authController.js';
import { isAuthenticated, roleMiddleware, departmentMiddleware } from '../middlewares/auth.js';
import { departmentParticipant, departmentsRequirements, getDocuments, getMembers, getClasses, editMember, removeMember, getClassPosting, getDepartment, isLeader } from '../controllers/departmentsController.js';
import { searchUser, validateSearchUser, getMilitaries, requirements } from '../controllers/pagesControllers.js';
import { usersActive, getUsers, deleteUser, editUser, addPublication, getPublications, getPublication, editPublication, deletePublication } from '../controllers/panelController.js';
import { middlewareIsAdmin } from '../middlewares/panelMiddleware.js';
import { getLogs } from '../controllers/logController.js';
import { profile, reset, isAdmin } from '../controllers/userController.js';
import { militaryHierarchy, departments } from '../models/Register.js';

const router = express.Router();

// Rotas de autenticação
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/logout', isAuthenticated, logout);
router.post('/authenticate', authenticate);

// Rotas do perfil
router.get('/user/profile', isAuthenticated, profile);
router.get('/isAdmin', isAuthenticated, isAdmin);
router.post('/user/reset', isAuthenticated, reset);

// Rotas internas do system
router.get('/search', isAuthenticated, roleMiddleware(militaryHierarchy), validateSearchUser, searchUser);
router.get('/members', isAuthenticated, getMilitaries);
router.get('/departmentParticipant', isAuthenticated, departmentMiddleware(departments), departmentParticipant);
router.post('/requirements', isAuthenticated, requirements);


// Rotas dos departamentos
router.post('/departments/requirements', isAuthenticated, departmentMiddleware(departments), departmentsRequirements);
router.get('/departments/getDocuments/', isAuthenticated, departmentMiddleware(departments), getDocuments);
router.get('/departments/getMembers', isAuthenticated, departmentMiddleware(departments), getMembers);
router.get('/departments/getClasses', isAuthenticated, departmentMiddleware(departments), getClasses);
router.get('/departments/getClassPosting', isAuthenticated, departmentMiddleware(departments), getClassPosting);
router.get('/departments/getDepartment', isAuthenticated, departmentMiddleware(departments), getDepartment);
router.get('/departments/isLeader', isAuthenticated, departmentMiddleware(departments), isLeader);

// Alterações de membros
router.post('/departments/editMember', isAuthenticated, editMember);
router.post('/departments/removeMember', isAuthenticated, removeMember);

// Rotas do painel administrativo
router.get('/panel/usersActive', isAuthenticated, middlewareIsAdmin, usersActive);
router.get('/panel/getUsers', isAuthenticated, middlewareIsAdmin, getUsers);
router.delete('/panel/deleteUser/:userId', isAuthenticated, middlewareIsAdmin, deleteUser);
router.put('/panel/editUser/:userId', isAuthenticated, middlewareIsAdmin, editUser);
router.get('/panel/getPublications', isAuthenticated, middlewareIsAdmin, getPublications);
router.get('/panel/getPublication/:pubId', isAuthenticated, middlewareIsAdmin, getPublication);
router.put('/panel/editPublication/:pubId', isAuthenticated, middlewareIsAdmin, editPublication);
router.delete('/panel/deletePublication/:pubId', isAuthenticated, middlewareIsAdmin, deletePublication);
router.post('/panel/publications', isAuthenticated, middlewareIsAdmin, addPublication);

// Rota de logs
router.get('/logs', isAuthenticated, middlewareIsAdmin, getLogs);

export default router;