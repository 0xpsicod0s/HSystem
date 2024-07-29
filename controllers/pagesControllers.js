import { RegisterModel } from '../models/Register.js';
import { Members } from '../models/Members.js';
import { Requirements } from '../models/Requirements.js';
import { validationResult, query } from 'express-validator';

export const searchUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const nickname = req.query.user;
        const user = await RegisterModel.findOne({ nickname }).select('+role -_id').exec();
        if (!user) return res.status(404).json({ error: 'Usuario nao encontrado' });
        res.status(200).json(user);
    } catch(err) {
        return this.res.status(500).json({ error: 'Erro interno ao buscar usuario' });
    }
}

export const validateSearchUser = [
    query('user').trim().escape().notEmpty().withMessage('Nickname não especificado'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

export const requirements = async (req, res) => new Requirements(req, res).sendRequirement();

export const getMilitaries = async (req, res) => {
    if (!req.query && !req.query.body) return res.status(400).json({ error: 'Oops! Query não informada' });
    const members = new Members(req, res);
    members.getMilitaries();
}