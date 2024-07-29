import { RegisterModel, flattenedMilitaryHierarchy } from "./Register.js";

export class Members {
    constructor(req, res) {
        this.req = req;
        this.res = res;
        this.militaryHierarchy = [...flattenedMilitaryHierarchy];
        this.militaryHierarchy.shift();
    }

    async getMilitaries() {
        const body = this.req.query.body;

        try {
            const beggar = await RegisterModel.findById(this.req.userId);
            if (!beggar) return this.res.status(400).json({ error: 'Oops! Algo deu errado' });

            switch(body) {
                case 'corpo_pracas': return this.getCorpsOfSquares();
                case 'corpo_subalternos': return this.getJuniorOfficerCorps();
                case 'corpo_superiores': return this.getSeniorOfficerCorps();
                case 'corpo_generais': return this.getGeneralOfficerCorps();
                case 'alto_comando': return this.getHighCommand();
                default: return this.res.status(400).json({ error: 'Corpo inválido' });
            }
        } catch(err) {
            return this.res.status(500).json({ error: 'Ocorreu um erro interno. Contate um militar do Alto Comando' });
        }
    }

    async getCorpsOfSquares() {
        const bodyOfSquares = this.militaryHierarchy.slice(0, 8);

        const users = await RegisterModel.find({ role: { $in: bodyOfSquares }, state: 'Ativo' }).select('+role -_id');
        if (!users.length) return this.res.status(403).json({ error: 'Nenhum militar neste corpo' });

        users.sort((a, b) => bodyOfSquares.indexOf(a.role) - bodyOfSquares.indexOf(b.role));
        return this.res.status(200).json(users);
    }

    async getJuniorOfficerCorps() {
        const juniorOfficerCorps = this.militaryHierarchy.slice(8, 14);

        const users = await RegisterModel.find({ role: { $in: juniorOfficerCorps }, state: 'Ativo' }).select('+role -_id');
        if (!users.length) return this.res.status(403).json({ error: 'Nenhum militar neste corpo' });

        users.sort((a, b) => juniorOfficerCorps.indexOf(a.role) - juniorOfficerCorps.indexOf(b.role));
        return this.res.status(200).json(users);
    }

    async getSeniorOfficerCorps() {
        const seniorOfficerCorps = this.militaryHierarchy.slice(14, 20);

        const users = await RegisterModel.find({ role: { $in: seniorOfficerCorps }, state: 'Ativo' }).select('+role -_id');
        if (!users.length) return this.res.status(403).json({ error: 'Nenhum militar neste corpo' });

        users.sort((a, b) => seniorOfficerCorps.indexOf(a.role) - seniorOfficerCorps.indexOf(b.role));
        return this.res.status(200).json(users);
    }

    async getGeneralOfficerCorps() {
        const generalOfficerCorps = this.militaryHierarchy.slice(20, 28);

        const users = await RegisterModel.find({ role: { $in: generalOfficerCorps }, state: 'Ativo' }).select('+role -_id');
        if (!users.length) return this.res.status(403).json({ error: 'Nenhum militar neste corpo' });

        users.sort((a, b) => generalOfficerCorps.indexOf(a.role) - generalOfficerCorps.indexOf(b.role));
        return this.res.status(200).json(users);
    }

    async getHighCommand() {
        const highCommand = this.militaryHierarchy.slice(28, 33);

        const users = await RegisterModel.find({ role: { $in: highCommand }, state: 'Ativo' }).select('+role -_id');
        if (!users.length) return this.res.status(403).json({ error: 'Nenhum militar neste corpo' });

        users.sort((a, b) => highCommand.indexOf(a.role) - highCommand.indexOf(b.role));
        return this.res.status(200).json(users);
    }
}