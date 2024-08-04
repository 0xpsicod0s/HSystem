import { LogModel } from "../models/Log.js";

function getIpv4(ipv6) {
    if (ipv6.startsWith('::ffff:')) {
        return ipv6.split(':').pop();
    }
    return ipv6;
}

export const saveLog = async (user, action, details, req) => {
    try {
        const ipAddress = getIpv4(req.ip);
        const log = new LogModel({
            user,
            action,
            details,
            ipAddress,
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