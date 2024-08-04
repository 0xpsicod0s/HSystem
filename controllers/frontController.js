import { RegisterModel } from '../models/Register.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const loginScreen = (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
export const pages = (req, res) => {
    const filePath = path.join(__dirname, '..', 'public', 'pages', req.path.split('/pages/')[1]);
    res.sendFile(filePath, err => {
        if (err) return res.status(404).send('Arquivo não encontrado');
    });
}

export const departments = (req, res) => {
    const filePath = path.join(__dirname, '..', 'public', 'departments', req.path.split('/departments/')[1]);
    res.sendFile(filePath, err => {
        if (err) return res.status(404).send('Arquivo não encontrado');
    });
}

export const panel = async (req, res) => {
    const user = await RegisterModel.findOne({ _id: req.userId }).select('isAdmin');
    if (!user) res.status(400).send('Algo deu errado');

    if (!user.isAdmin) return res.redirect('/pages/index.html');
    
    const filePath = path.join(__dirname, '..', 'public', 'pages', 'panel', req.path.split('/panel/')[1]);
    res.sendFile(filePath, err => {
        if (err) return res.status(404).send('Arquivo não encontrado');
    });
}