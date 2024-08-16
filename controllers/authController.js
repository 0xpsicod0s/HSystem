import { Register, RegisterModel } from '../models/Register.js';
import Login from '../models/Login.js';
import { saveLog } from '../controllers/logController.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
    const register = new Register(req.body, res);
    await register.register();
}

export const login = async (req, res) => {
    const login = new Login(req.body, res);
    await login.login();

    if (login.error) return;

    try {
        const { nickname, password } = login.body;
        const user = await RegisterModel.findOne({ nickname }).select('+password');

        if (!user) return res.status(400).json({ error: 'Usuario nao encontrado' });
        if (!await bcrypt.compare(password, user.password)) return res.status(400).json({ error: 'Senha invalida' });

        user.password = undefined;
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: 86400
        });

        res.cookie('token', token, { httpOnly: true, path: '/' });
        await saveLog(nickname, 'LOGIN', 'Usuário logado com sucesso', req);
        return res.status(200).json({ success: 'Login efetuado com sucesso!' });
    } catch(err) {
        return res.status(500).json({ error: 'Erro ao definir token: ' + err });
    }
}

export let restrictedTokens = [];
function clearExpiredTokens() {
    const currentTime = Math.floor(Date.now() / 1000);
    restrictedTokens = restrictedTokens.filter(token => {
        try {
            const decoded = jwt.decode(token);
            return decoded.exp > currentTime;
        } catch (err) {
            return false;
        }
    });
}

setInterval(clearExpiredTokens, 3600000);

export const logout = async (req, res) => {
    restrictedTokens.push(req.formattedToken);
    res.clearCookie('token', { path: '/' });
    return res.status(200).json({ success: 'Deslogado com sucesso!' });
}