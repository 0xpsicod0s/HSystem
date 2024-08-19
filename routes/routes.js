import express from 'express';
import { register, login, logout } from '../controllers/authController.js';
import { isAuthenticated, roleMiddleware, departmentMiddleware } from '../middlewares/auth.js';
import { departmentParticipant, departmentsRequirements, getDocumentsDepartment, getMembers, getClasses, editMember, removeMember, getClassPosting, listOfCourses, getDepartment, isLeader, changeCourseStatus } from '../controllers/departmentsController.js';
import { searchUser, validateSearchUser, getMilitaries, changeRequirementStatus, listRequirements, requirements, showDocument, showPublication, getPublications, getDocuments } from '../controllers/pagesControllers.js';
import panelController from '../controllers/panelController.js';
import { middlewareIsAdmin } from '../middlewares/panelMiddleware.js';
import { getLogs } from '../controllers/logController.js';
import { profile, reset, isAdmin, viewProfile } from '../controllers/userController.js';
import { militaryHierarchy, departments } from '../models/Register.js';

const router = express.Router();

// Rotas de autenticação
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/logout', isAuthenticated, logout);

// Rotas do perfil
router.get('/user/profile', isAuthenticated, profile);
router.get('/isAdmin', isAuthenticated, isAdmin);
router.get('/user/:nick', isAuthenticated, viewProfile);
router.post('/user/reset', isAuthenticated, reset);

// Rotas internas do system
router.get('/search', isAuthenticated, validateSearchUser, searchUser);
router.get('/members', isAuthenticated, getMilitaries);
router.get('/departmentParticipant', isAuthenticated, departmentMiddleware(departments), departmentParticipant);
router.get('/doc/:link', isAuthenticated, showDocument);
router.get('/pub/:link', isAuthenticated, showPublication);
router.get('/getPublications', isAuthenticated, getPublications);
router.get('/getDocuments', isAuthenticated, getDocuments);
router.get('/changeRequirementStatus/:requirementId', isAuthenticated, departmentMiddleware(['Recursos Humanos']), changeRequirementStatus);
router.get('/requirements', isAuthenticated, departmentMiddleware(['Recursos Humanos']), listRequirements);
router.post('/requirements', isAuthenticated, requirements);
router.get('/changeCourseStatus/:courseId', isAuthenticated, departmentMiddleware(['Recursos Humanos']), changeCourseStatus);


// Rotas dos departamentos
router.post('/departments/requirements', isAuthenticated, departmentMiddleware(departments), departmentsRequirements);
router.get('/departments/getDocuments/', isAuthenticated, departmentMiddleware(departments), getDocumentsDepartment);
router.get('/departments/getMembers', isAuthenticated, departmentMiddleware(departments), getMembers);
router.get('/departments/getClasses', isAuthenticated, departmentMiddleware(departments), getClasses);
router.get('/departments/getClassPosting', isAuthenticated, departmentMiddleware(departments), getClassPosting);
router.get('/departments/listOfCourses', isAuthenticated, departmentMiddleware(['Recursos Humanos']), listOfCourses);
router.get('/departments/getDepartment', isAuthenticated, departmentMiddleware(departments), getDepartment);
router.get('/departments/isLeader', isAuthenticated, departmentMiddleware(departments), isLeader);

// Alterações de membros
router.post('/departments/editMember', isAuthenticated, editMember);
router.post('/departments/removeMember', isAuthenticated, removeMember);

// Rotas do painel administrativo
router.get('/panel/usersActive', isAuthenticated, middlewareIsAdmin, panelController.usersActive);
router.get('/panel/getUsers', isAuthenticated, middlewareIsAdmin, panelController.getUsers);
router.delete('/panel/deleteUser/:userId', isAuthenticated, middlewareIsAdmin, panelController.deleteUser);
router.put('/panel/editUser/:userId', isAuthenticated, middlewareIsAdmin, panelController.editUser);

router.get('/panel/getPublications', isAuthenticated, middlewareIsAdmin, panelController.getPublications);
router.get('/panel/getPublication/:pubId', isAuthenticated, middlewareIsAdmin, panelController.getPublication);
router.put('/panel/editPublication/:pubId', isAuthenticated, middlewareIsAdmin, panelController.editPublication);
router.delete('/panel/deletePublication/:pubId', isAuthenticated, middlewareIsAdmin, panelController.deletePublication);
router.post('/panel/addPublication', isAuthenticated, middlewareIsAdmin, panelController.addPublication);

router.get('/panel/getDocuments', isAuthenticated, middlewareIsAdmin, panelController.getDocuments);
router.get('/panel/getDocument/:docId', isAuthenticated, middlewareIsAdmin, panelController.getDocument);
router.put('/panel/editDocument/:docId', isAuthenticated, middlewareIsAdmin, panelController.editDocument);
router.delete('/panel/deleteDocument/:pubId', isAuthenticated, middlewareIsAdmin, panelController.deletePublication);
router.post('/panel/addDocument', isAuthenticated, middlewareIsAdmin, panelController.addDocument);

// Rota de logs
router.get('/logs', isAuthenticated, middlewareIsAdmin, getLogs);

export default router;