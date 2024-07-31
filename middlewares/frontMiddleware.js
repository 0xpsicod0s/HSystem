import jwt from 'jsonwebtoken';
import { restrictedTokens } from '../controllers/authController.js';

export const frontAuthentication = (req, res, next) => {
    req.accessGranted = false;
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) return next();

    const cookies = cookieHeader.split(';');
    const tokenHeader = cookies.find(cookie => cookie.startsWith(' token='));
    console.log('token: ', tokenHeader);
    if (!tokenHeader) return next();

    const authHeader = `Bearer ${tokenHeader.split('=')[1]}`;
    console.log('token mal formatado: ', authHeader);
    if (!authHeader) return next();

    const findToken = restrictedTokens.find(token => token === authHeader);
    if (findToken) {
        console.log('token restrito');
        res.clearCookie('token', { path: '/' });
        return next();
    };
    const parts = authHeader.split(' ');
    console.log(parts.length);
    if (!parts.length === 2) return next();
    
    const [ scheme, token ] = parts;
    console.log(scheme, token);
    if (!/^Bearer$/i.test(scheme)) {
        return next();
    }
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            console.log('deu ruim');
            return next();
        }
        req.userId = decoded.id;
        req.formattedToken = authHeader;
        req.accessGranted = true;
        return next();
    });
}

export const accessNotGranted = (req, res, next) => {
    if (!req.accessGranted) {
        console.log('caiu aq');
        return res.redirect('/');
    }
    next();
}

export const accessGranted = (req, res, next) => {
    if (req.accessGranted) return res.redirect('/pages/index.html');
    next();
}