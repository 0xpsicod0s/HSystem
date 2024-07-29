import jwt, { decode } from 'jsonwebtoken';
import { RegisterModel } from '../models/Register.js';
import { restrictedTokens } from '../controllers/authController.js';

export const isAuthenticated = (req, res, next) => {
    const tokenHeader = req.headers.cookie;
    if (!tokenHeader) return res.status(401).json({ error: 'Cabeçalho de token nao informado' });
    const authHeader = `Bearer ${tokenHeader.split(';')[0].split('=')[1]}`;
    if (!authHeader) return res.status(401).json({ error: 'Token nao informado' });

    const findToken = restrictedTokens.find(token => token === authHeader);
    if (findToken) {
        res.clearCookie('token', { path: '/' });
        return res.status(401).json({ error: 'Este token foi invalidado' });
    };
    const parts = authHeader.split(' ');
    if (!parts.length === 2) return res.status(401).json({ error: 'Erro de token' });
    
    const [ scheme, token ] = parts;
    if (!/^Bearer$/i.test(scheme)) return res.status(401).json({ error: 'Token mal formatado' });
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Token invalido' });
        req.userId = decoded.id;
        req.formattedToken = authHeader;
        return next();
    });
}

export const roleMiddleware = (roles) => {
    return async (req, res, next) => {
        const user = await RegisterModel.findById(req.userId).select('+role');
        if (!user) return res.status(404).json({ error: 'Você não tem permissão para realizar a busca' });

        if (!roles.includes(user.role)) {
            return res.status(404).json({ error: 'Permissão negada' });
        }
        next();
    }
}

export const departmentMiddleware = (departments) => {
    const departmentInformation = [];

    return async (req, res, next) => {
        const user = await RegisterModel.findById(req.userId).select('+department');
        if (!user) return res.status(404).json({ error: 'Oops! Algo deu errado.' });

        if (!user.department.length) return res.status(404).json({ error: 'Você não faz parte de nenhum departamento' });
        user.department.forEach(department => {
            const checksPresence = departmentInformation.some(d => d.department === department.department && d.level === department.role);
            if (departments.includes(department.department) && !checksPresence) {
                departmentInformation.push({ department: department.department, level: department.role });
            }
        });

        if (!departmentInformation.length) return res.status(404).json({ error: 'Departamento invalido' });

        req.participatingDepartments = departmentInformation;
        next();
    }
}