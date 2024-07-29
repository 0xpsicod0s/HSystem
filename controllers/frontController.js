import path from 'path';
import { fileURLToPath } from 'url';

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
