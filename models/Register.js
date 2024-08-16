import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import axios from 'axios';

export const militaryHierarchy = [
    'Civil',
    ['Soldado', 'Estagiário'],
    ['Cabo', 'Agente'],
    ['Sargento', 'Sócio'],
    ['Suboficial', 'Analista'],
    ['Aspirante', 'Supervisor'],
    ['Tenente', 'Inspetor'],
    ['Capitão', 'Inspetor-Chefe'],
    ['Major', 'Coordenador'],
    ['Tenente-coronel', 'Administrador'],
    ['Coronel', 'Escrivão'],
    ['General', 'Ministro'],
    ['Marechal', 'Conselheiro'],
    ['Subcomandante', 'Acionista'],
    ['Comandante', 'Chanceler'],
    'Diretor',
    'Diretor-Geral',
    'Supremo',
    'Regente',
    'Dono'
];

export const departments = [
    'Ensino',
    'Supervisores',
    'Marketing',
    'Recursos Humanos',
    'Patrulha'
];

export const flattenedMilitaryHierarchy = (function () {
    return militaryHierarchy.flatMap(rank => Array.isArray(rank) ? rank : [rank]);
}());

const UserDepartmentSchema = new mongoose.Schema({
    role: { type: String, required: true, enum: ['Lider', 'Vice-Lider', 'Instrutor', 'Membro'] },
    department: { type: String, required: true, enum: departments }
}, { _id: false });

const RegisterSchema = new mongoose.Schema({
    nickname: { type: String, required: true, unique: true },
    email: { type: String, required: true, lowercase: true, select: false, default: 'invalid' },
    password: { type: String, required: true, select: false, default: 'invalid' },
    role: {
        type: String,
        required: true,
        select: false,
        enum: flattenedMilitaryHierarchy,
        default: 'Civil'
    },
    isAdmin: { type: Boolean, required: false, default: false, select: false },
    department: { type: [UserDepartmentSchema], select: false },
    warnings: { type: Number, select: false, default: 0 },
    state: { type: String, required: true, default: 'Desativado' },
    createdAt: { type: Date, default: Date.now }
});
export const RegisterModel = mongoose.model('Register', RegisterSchema);

export class Register {
    constructor(body, res) {
        this.body = body;
        this.res = res;
        this.prefix = 'DOP-';
    }

    async verifyHabboMission(nickname, code) {
        try {
            const response = await axios.get(`https://www.habbo.com.br/api/public/users?name=${nickname}`);
            const userData = response.data;

            return userData.motto === code;
        } catch (error) {
            console.error('Erro ao verificar missão do Habbo:', error);
            return false;
        }
    };

    async register() {
        try {
            if (!await this.validate()) return;
            if (!await this.userExists()) return;

            this.body.password = await bcrypt.hash(this.body.password, await bcrypt.genSalt());

            const user = await RegisterModel.findOne({ nickname: this.body.nickname }).select('+password +email');
            user.state = 'Ativo';
            user.password = this.body.password;
            user.email = this.body.email;
            await user.save();

            return this.res.status(201).json({ success: 'Conta registrada com sucesso!' });
        } catch (err) {
            return this.res.status(500).json({ error: 'Erro interno' });
        }
    }

    async userExists() {
        const { nickname } = this.body;
        const user = await RegisterModel.findOne({ nickname });

        if (!user) {
            this.res.status(403).json({ error: 'Você não tem permissão para se registrar'});
            return false;
        }

        if (user && user.state === 'Ativo') {
            this.res.status(400).json({ error: 'Usuario ja existente, tente novamente!' });
            return false;
        }

        if (user && user.state === 'Demitido') {
            this.res.status(403).json({ error: 'Você foi demitido' });
            return false;
        }

        if (user && user.state === 'Exonerado') {
            this.res.status(403).json({ error: 'Você foi exonerado' });
            return false;
        }
        return true;
    }

    async validate() {
        this.cleanUp();
        if (!this.body.nickname || !this.body.email || !this.body.password) {
            this.res.status(400).json({ error: 'Preencha todos os campos' });
            return false;
        }
        if (!this.body.code) {
            this.res.status(400).json({ error: 'Código de missão obrigatório' });
            return false;
        }
        if (!validator.isEmail(this.body.email)) {
            this.res.status(400).json({ error: 'Email invalido' });
            return false;
        }
        if (this.body.password.length < 8) {
            this.res.status(400).json({ error: 'A senha precisa ter mais que 8 caracteres' });
            return false;
        }

        const isCodeValid = this.body.code.startsWith(this.prefix);
        if (!isCodeValid) {
            this.res.status(400).json({ error: 'Código inválido' });
            return false;
        }

        const isMissionCorrect = await this.verifyHabboMission(this.body.nickname, this.body.code);
        if (!isMissionCorrect) {
            this.res.status(400).json({ error: 'Código de missão incorreto' });
            return false;
        }
        return true;
    }

    cleanUp() {
        for (const key in this.body) {
            if (typeof this.body[key] !== 'string') {
                this.body[key] = '';
            }
        }
        this.body = {
            email: this.body.email,
            nickname: this.body.nickname,
            password: this.body.password,
            code: this.body.code
        }
    }
}
