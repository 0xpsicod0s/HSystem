import { RegisterModel } from "../models/Register.js"

export const usersActive = async (req, res) => {
    const users = await RegisterModel.find({ state: 'Ativo' });
    if (!users) return res.status(200).json({ success: 0 });

    return res.status(200).json({ usersActive: users.length });
}