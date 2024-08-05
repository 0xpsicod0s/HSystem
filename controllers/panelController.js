import { RegisterModel, flattenedMilitaryHierarchy } from "../models/Register.js";
import { System } from "../models/System.js";
import validator from "validator";

export const usersActive = async (req, res) => {
    try {
        const users = await RegisterModel.find({ state: 'Ativo' });
        return res.status(200).json({ usersActive: users.length });
    } catch (err) {
        res.status(500).json({ error: 'Houve um erro interno. Contate um desenvolvedor' });
    }
}

export const getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const searchCondition = search.trim() ? { nickname: { $regex: new RegExp(search.trim(), 'i') } } : {};
        const users = await RegisterModel.find(
            searchCondition,
            { _id: 1, nickname: 1, email: 1, role: 1 }
        )
        .limit(limit * 1)
        .skip((page - 1) * limit);

        const count = await RegisterModel.countDocuments(searchCondition);
        if (!users.length) return res.status(404).json({ error: 'Nenhum usuário registrado' });
    
        return res.status(200).json({
            users,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (err) {
        res.status(500).json({ error: 'Houve um erro interno. Contate um desenvolvedor' });
    }
}

export const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) return res.status(400).json({ error: 'ID não especificado' });

        const userDeleted = await RegisterModel.deleteOne({ _id: userId });
        if (userDeleted.deletedCount === 0) return res.status(404).json({ error: 'Usuário não encontrado' });

        return res.status(200).json({ success: 'Usuário deletado com sucesso!' });
    } catch (err) {
        res.status(500).json({ error: 'Houve um erro interno ao deletar o usuário' });
    }
}

export const editUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { nickname, email, role, permission } = req.body;

        const updateFields = {};
        if (nickname) updateFields.nickname = nickname;
        if (email) {
            if (!validator.isEmail(email)) return res.status(400).json({ error: 'Email invalido' });
            updateFields.email = email
        }
        if (role) {
            if (!flattenedMilitaryHierarchy.includes(role)) return this.res.status(403).json({ error: 'Patente inexistente' });
            updateFields.role = role
        }
        if (permission) {
            switch (permission) {
                case 'notSelected': break;
                case 'user':
                    updateFields.isAdmin = false;
                    break;
                case 'admin':
                    updateFields.isAdmin = true;
                    break;
                default:
                    return res.status(400).json({ error: 'Nível de permissão inválido' });
            }
        }

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ error: 'Nenhum campo para atualizar' });
        }

        const userUpdated = await RegisterModel.updateOne(
            { _id: userId },
            { $set: updateFields }
        );

        if (userUpdated.matchedCount === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        return res.status(200).json({ success: 'Usuário atualizado com sucesso' });
    } catch (err) {
        return res.status(500).json({ error: 'Houve um erro interno. Contate um desenvolvedor' });
    }
};

export const addPublication = async (req, res) => new System(req, res).addPublication();
export const getPublications = async (req, res) => new System(req, res).getPublications();
export const getPublication = async (req, res) => new System(req, res).getPublication();
export const editPublication = async (req, res) => new System(req, res).editPublication();
export const deletePublication = async (req, res) => new System(req, res).deletePublication();