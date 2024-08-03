import { RegisterModel } from '../models/Register.js';

export const middlewareIsAdmin = async (req, res, next) => {
    try {
        const user = await RegisterModel.findOne({ _id: req.userId }).select('isAdmin');
        if (!user) return res.status(400).json({ error: 'Oops! Algo deu errado' });

        if (!user.isAdmin) return res.status(403).json({ error: 'Você não tem permissão administrativa' });

        return next();
    } catch (err) {
        return res.status(500).json({ error: 'Erro interno. Contate um responsavel' });
    }
}