import { LogModel } from "../models/Log.js";

export const saveLog = async (user, action, details, req) => {
    try {
        const log = new LogModel({
            user,
            action,
            details,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });
        await log.save();
    } catch (err) {
        console.error('Erro ao salvar log: ', err);
    }
}

export const getLogs = async (req, res) => {
    try {
        const logs = await LogModel.find({}, { _id: 0 }).sort({ timestamp: -1 }).limit(100);
        res.status(200).json(logs);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao procurar os logs' });
    }
}