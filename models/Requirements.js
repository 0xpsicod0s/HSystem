import { RegisterModel, militaryHierarchy, flattenedMilitaryHierarchy } from './Register.js';
import mongoose from 'mongoose';

const RequirementSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['promocao', 'rebaixamento', 'advertencia', 'contrato', 'demissao', 'vendaDeCargo']
    },
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'Register', required: true },
    nickname: { type: String, required: true },
    date: { type: Date, default: Date.now },
    details: { type: mongoose.Schema.Types.Mixed, required: true }
});

const RequirementModel = mongoose.model('Requirement', RequirementSchema);

export class Requirements {
    constructor(req, res) {
        this.req = req;
        this.res = res;
    }

    async sendRequirement() {
        try {
            const [ requirementType, ...data ] = this.req.body;
            if (!requirementType || !data) return this.res.status(400).json({ error: 'Dados invalidos' });
            const senderRequest = await RegisterModel.findById(this.req.userId).select('+role');
            if (!senderRequest) return this.res.status(400).json({ error: 'Oops! Algo deu errado!' });
            if (this.findRankLevel(senderRequest.role) === -1) return this.res.status(400).json({ error: 'Você não tem patente para isso' });
    
            switch (requirementType) {
                case 'promocao': return this.promotion(data, senderRequest);
                case 'rebaixamento': return this.relegation(data, senderRequest);
                case 'advertencia': return this.warning(data, senderRequest);
                case 'contrato': return this.contract(data, senderRequest);
                case 'demissao': return this.resignation(data, senderRequest);
                case 'vendaDeCargo': return this.saleOfPosition(data, senderRequest);
                default: return;
            }
        } catch(err) {
            return this.res.status(500).json({ error: 'Erro interno' });
        }
    }

    findRankLevel(role) {
        for (let i = 0; i < militaryHierarchy.length; i++) {
            if (Array.isArray(militaryHierarchy[i])) {
                if (militaryHierarchy[i].includes(role)) {
                    return i;
                }
            } else {
                if (militaryHierarchy[i] === role) {
                    return i;
                }
            }
        }
        return -1;
    }

    async createRequirement(type, applicant, nickname, details) {
        if (!type || !applicant || !nickname || !details) {
            throw new Error('Todos os campos são obrigatórios');
        }

        const newRequirement = new RequirementModel({
            type,
            applicant,
            nickname,
            details
        });
        await newRequirement.save();
        return newRequirement;
    }

    async promotion(data, promoterUser) {
        const { inputValue: nicknameOfThePromoted } = data[0];
        const { inputValue: promotedPatent } = data[1];
        const { inputValue: reasonForPromotion } = data[2];
        if (!nicknameOfThePromoted || !promotedPatent || !reasonForPromotion) return this.res.status(400).json({ error: 'Preencha todos os campos' });
        if (!flattenedMilitaryHierarchy.includes(promotedPatent)) return this.res.status(403).json({ error: 'Patente inexistente' });

        const promoterPatentLevel = this.findRankLevel(promoterUser.role);
        const promotedPatentLevel = this.findRankLevel(promotedPatent);

        if (promoterPatentLevel <= promotedPatentLevel) return this.res.status(403).json({ error: 'Você não tem um nivel de patente suficiente para promover este militar' });
        if ((promotedPatentLevel + 1) >= promoterPatentLevel) return this.res.status(403).json({ error: 'Você deve estar 2 patentes acima do promovido para promover' });

        try {
            const promotedUser = await RegisterModel.findOne({ nickname: nicknameOfThePromoted }).select('+role');
            if (!promotedUser) return this.res.status(404).json({ error: 'Não foi possivel encontrar o militar promovido' });
            if (this.findRankLevel(promotedUser.role) + 1 !== promotedPatentLevel) return this.res.status(403).json({ error: 'Você deve promover o militar para a patente sucessora a dele' });
    
            promotedUser.role = promotedPatent;
            await this.createRequirement('promocao', promoterUser, promotedUser.nickname, { promotedPatent, reasonForPromotion });
            await promotedUser.save();
            return this.res.status(200).json({ success: 'Promoção realizada com sucesso!' });
    
        } catch(err) {
            return this.res.status(500).json({ error: 'Oops! Ocorreu um erro interno ao aplicar a promoção, contate um desenvolvedor' });
        }
    }

    async relegation(data, downgraderUser) {
        const { inputValue: relegatorsNickname } = data[0];
        const { inputValue: currentPatent } = data[1];
        const { inputValue: newPatent } = data[2];
        const { inputValue: reasonForDemotion } = data[3];

        if (!relegatorsNickname || !currentPatent || !newPatent || !reasonForDemotion) return this.res.status(400).json({ error: 'Preencha todos os campos' });
        if (!flattenedMilitaryHierarchy.includes(currentPatent) || !flattenedMilitaryHierarchy.includes(newPatent)) return this.res.status(403).json({ error: 'Patente inexistente' });

        const demoterRankLevel = this.findRankLevel(downgraderUser.role);
        const demotedRankLevel = this.findRankLevel(currentPatent);
        const newPatentLevel = this.findRankLevel(newPatent);

        if (demoterRankLevel <= demotedRankLevel) return this.res.status(403).json({ error: 'Você não tem nivel de patente suficiente para rebaixar este militar' });
        if ((demotedRankLevel + 1) >= demoterRankLevel && (newPatentLevel + 1) >= demoterRankLevel) return this.res.status(403).json({ error: 'Você deve ser 2 patentes acima do militar rebaixado' });

        try {
            const demotedUser = await RegisterModel.findOne({ nickname: relegatorsNickname }).select('+role');
            if (!demotedUser) return this.res.status(404).json({ error: 'Não foi possivel encontrar o militar rebaixado' });
            if (demotedUser.role !== currentPatent) return this.res.status(403).json({ error: 'Verifique a patente atual do militar rebaixado' });
            if (this.findRankLevel(demotedUser.role) - 1 !== newPatentLevel) return this.res.status(403).json({ error: 'Você deve rebaixar o militar para a patente antecessora a dele' });
    
            demotedUser.role = newPatent;
            await this.createRequirement('rebaixamento', downgraderUser, demotedUser.nickname, { currentPatent, newPatent, reasonForDemotion });
            await demotedUser.save();
            return this.res.status(200).json({ success: 'Rebaixamento realizado com sucesso!' });
        } catch (err) {
            return this.res.status(500).json({ error: 'Oops! Ocorreu um erro interno ao aplicar o rebaixamento, contate um desenvolvedor' });
        }
    }

    async warning(data, warningApplicator) {
        const { inputValue: militaryNickname } = data[0];
        const { inputValue: reasonForWarning } = data[1];

        if (!militaryNickname || !reasonForWarning) return this.res.status(400).json({ error: 'Preencha todos os campos' });

        try {
            const userWarned = await RegisterModel.findOne({ nickname: militaryNickname }).select('+role +warnings');
            if (!userWarned) return this.res.status(404).json({ error: 'Não foi possivel encontrar o militar advertido' });
            
            const applicatorPatentLevel = this.findRankLevel(warningApplicator.role);
            const warnedRankLevel = this.findRankLevel(userWarned.role);
            if (applicatorPatentLevel - 1 <= warnedRankLevel) return this.res.status(403).json({ error: 'Você não tem nivel de patente suficiente para advertir este militar' });
    
            userWarned.warnings++;
            await this.createRequirement('advertencia', warningApplicator, userWarned.nickname, { reasonForWarning });
            await userWarned.save();
            return this.res.status(200).json({ success: 'Militar advertido com sucesso!' });
        } catch (err) {
            return this.res.status(500).json({ error: 'Oops! Ocorreu um erro interno ao aplicar a advertência, contate um desenvolvedor' });
        }

    }

    async contract(data, contractor) {
        const { inputValue: militaryNickname } = data[0];
        const { inputValue: militaryRanked } = data[1];
        const { inputValue: reasonForContract } = data[2];

        if (!militaryNickname || !militaryRanked || !reasonForContract) return this.res.status(400).json({ error: 'Preencha todos os campos' });
        if (!flattenedMilitaryHierarchy.includes(militaryRanked)) return this.res.status(403).json({ error: 'Patente inexistente' });

        const contractorPatentLevel = this.findRankLevel(contractor.role);
        const contractedPatentLevel = this.findRankLevel(militaryRanked);
        if (contractorPatentLevel - 1 <= contractedPatentLevel) return this.res.status(403).json({ error: 'Você não tem nivel de patente suficiente para contratar nesta patente' });

        try {
            const militaryContracted = await RegisterModel.findOne({ nickname: militaryNickname }).select('+role');
            if (militaryContracted) {
                if (contractedPatentLevel <= this.findRankLevel(militaryContracted.role)) return this.res.status(400).json({ error: 'Você não pode contratar um militar em uma patente inferior a dele atual' });
                await this.createRequirement('contrato', contractor, militaryContracted.nickname, { oldPatent: militaryContracted.role, newPatent: militaryRanked, reasonForContract  });
                militaryContracted.role = militaryRanked;
                await militaryContracted.save();
                return this.res.status(200).json({ success: 'Militar realocado com sucesso!' });
            } 
            await RegisterModel.create({ nickname: militaryNickname, role: militaryRanked, email: `${militaryNickname}@email.com`, password: 'invalid' });
            await this.createRequirement('contrato', contractor, militaryRanked, { reasonForContract });
            return this.res.status(201).json({ success: 'Militar contratado com sucesso!' });
        } catch (err) {
            return this.res.status(500).json({ error: 'Oops! Ocorreu um erro interno ao aplicar o contrato, contate um desenvolvedor' });
        }
    }

    async resignation(data, dismisser) {
        const { inputValue: militaryNickname } = data[0];
        const { inputValue: reasonForDismissal } = data[1];

        if (!militaryNickname || !reasonForDismissal) return this.res.status(400).json({ error: 'Preencha todos os campos' });

        const userFired = await RegisterModel.findOne({ nickname: militaryNickname }).select('+role');
        if (!userFired) return this.res.status(404).json({ error: 'Não foi possivel encontrar o militar demitido' });

        const dismissorRankLevel = this.findRankLevel(dismisser.role);
        const dismissedRankLevel = this.findRankLevel(userFired.role);
        if (dismissorRankLevel - 1 <= dismissedRankLevel) return this.res.status(403).json({ error: 'Você não tem nivel de patente suficiente para demitir este militar' });
        
        userFired.role = 'Civil';
        userFired.state = 'Desativado';
        userFired.department = [];
        userFired.warnings = 0;
        await this.createRequirement('demissao', dismisser, userFired.nickname, { reasonForDismissal });
        await userFired.save();
        return this.res.status(200).json({ success: 'Militar demitido com sucesso!' });
    }

    async saleOfPosition(data, seller) {
        const { inputValue: militaryNickname } = data[0];
        const { inputValue: positionSold } = data[1];
        const { inputValue: price } = data[2];

        if (!militaryNickname || !positionSold || !price) return this.res.status(400).json({ error: 'Preencha todos os campos' });
        if (!flattenedMilitaryHierarchy.includes(positionSold)) return this.res.status(403).json({ error: 'Cargo inexistente' });

        const directorRankLevel = this.findRankLevel('Diretor');
        const sellerRankLevel = this.findRankLevel(seller.role);
        const buyerRankLevel = this.findRankLevel(positionSold);
        if (sellerRankLevel < directorRankLevel) return this.res.status(403).json({ error: 'Você não faz parte da administração' });
        if (sellerRankLevel - 1 <= buyerRankLevel) return this.res.status(403).json({ error: 'Você não tem nivel de patente suficiente para vender este cargo' });

        try {
            const buyerUser = await RegisterModel.findOne({ nickname: militaryNickname }).select('+role');
            if (buyerUser) {
                await this.createRequirement('vendaDeCargo', seller, buyerUser.nickname, { positionSold, price });
                buyerUser.role = positionSold;
                await buyerUser.save();
                return this.res.status(200).json({ success: 'Militar contratado com sucesso!' });
            }
            await RegisterModel.create({ nickname: militaryNickname, role: positionSold, email: `${militaryNickname}@email.com`, password: 'invalid' });
            await this.createRequirement('vendaDeCargo', seller, buyerUser.nickname, { positionSold, price });
            return this.res.status(201).json({ success: 'Militar contratado com sucesso!' });
        } catch(err) {
            return this.res.status(500).json({ error: 'Oops! Ocorreu um erro interno ao relizar essa venda, contate um desenvolvedor' });
        }
    }
}
