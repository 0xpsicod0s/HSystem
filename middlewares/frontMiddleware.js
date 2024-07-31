import jwt from 'jsonwebtoken';
import { restrictedTokens } from '../controllers/authController.js';

export const frontAuthentication = (req, res, next) => {
    req.accessGranted = false;
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) return next();

    const cookies = cookieHeader.split(';');
    console.log(cookies);
    const tokenHeader = cookies.find(cookie => /^(token=| token=)/.test(cookie));
    if (!tokenHeader) return next();

    const authHeader = `Bearer ${tokenHeader.split('=')[1]}`;
    if (!authHeader) return next();

    const findToken = restrictedTokens.find(token => token === authHeader);
    if (findToken) {
        res.clearCookie('token', { path: '/' });
        return next();
    };
    const parts = authHeader.split(' ');
    if (!parts.length === 2) return next();
    
    const [ scheme, token ] = parts;
    if (!/^Bearer$/i.test(scheme)) {
        return next();
    }
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
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
        return res.redirect('/');
    }
    next();
}

export const accessGranted = (req, res, next) => {
    if (req.accessGranted) return res.redirect('/pages/index.html');
    next();
}