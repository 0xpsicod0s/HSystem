import { Register, RegisterModel } from '../models/Register.js';
import Login from '../models/Login.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import axios from 'axios';

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
        const dataToSend = { nickname, password };
        const response = await axios.post('https://dopsystem-production.up.railway.app/api/authenticate', dataToSend);
        const token = response.data.token;
        
        res.cookie('token', token, { httpOnly: true, path: '/' });
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

export const authenticate = async (req, res) => {
    const { nickname, password } = req.body;
    const user = await RegisterModel.findOne({ nickname }).select('+password');

    if (!user) return res.status(400).json({ error: 'Usuario nao encontrado' });
    if (!await bcrypt.compare(password, user.password)) return res.status(400).json({ error: 'Senha invalida' });

    user.password = undefined;
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: 86400
    });

    res.json({ user, token });
}