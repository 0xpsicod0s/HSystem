import jwt from 'jsonwebtoken';
import { restrictedTokens } from '../controllers/authController.js';

export const frontAuthentication = (req, res, next) => {
    req.accessGranted = false;
    const tokenHeader = req.headers.cookie;
    console.log(`Cookie header: ${tokenHeader}`);
    if (!tokenHeader) return next();
    const authHeader = `Bearer ${tokenHeader.split(';')[0].split('=')[1]}`;
    console.log(`Token formatado: ${authHeader}`);
    if (!authHeader) return next();

    const findToken = restrictedTokens.find(token => token === authHeader);
    if (findToken) {
        console.log(`Token no acesso restrito: ${findToken}`);
        res.clearCookie('token', { path: '/' });
        return next();
    };
    const parts = authHeader.split(' ');
    console.log(`Quantidade de partes dividas do token (deve ser 2): ${parts}`);
    if (!parts.length === 2) return next();
    
    const [ scheme, token ] = parts;
    if (!/^Bearer$/i.test(scheme)) {
        console.log(`Palavra enviada diferente de Bearer: ${scheme}`);
        return next();
    }
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            console.log(`Houve um erro ao realizar a autenticidade do token: ${err}`);
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
        console.log('Acesso nao garantido');
        return res.redirect('/');
    }
    next();
}

export const accessGranted = (req, res, next) => {
    if (req.accessGranted) return res.redirect('/pages/index.html');
    next();
}