import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

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
    'Dono',
    'Admin'
];

export const departments = [
    'Ensino',
    'Supervisores',
    'Marketing',
    'Recursos Humanos',
    'Patrulha'
];

export const flattenedMilitaryHierarchy = (function() {
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
        this.error = false;
        this.res = res;
    }

    async register() {
        try {
            if (this.validate() && await this.userExists()) {
                this.body.password = await bcrypt.hash(this.body.password, await bcrypt.genSalt());
                await RegisterModel.create(this.body);
                return this.res.status(201).json({ success: 'Conta registrada com sucesso!' });
            }
        } catch(err) {
            return this.res.status(500).json({ error: 'Erro interno' });
        }
    }

    async userExists() {
        const { nickname, email } = this.body;
        const user = await RegisterModel.findOne({ $or: [{ nickname }, { email }] });
        if (user) {
            this.res.status(400).json({ error: 'Usuario ja existente, tente novamente!' }); 
            this.error = true;
            return false;
        }
        return true;
    }

    validate() {
        this.cleanUp();
        if (!this.body.nickname || !this.body.email || !this.body.password) {
            this.res.status(400).json({ error: 'Preencha todos os campos' });
            this.error = true;
            return false;
        }
        if (!validator.isEmail(this.body.email)) {
            this.res.status(400).json({ error: 'Email invalido' });
            this.error = true;
            return false;
        }
        if (this.body.password.length < 8) {
            this.res.status(400).json({ error: 'A senha precisa ter mais que 8 caracteres' });
            this.error = true;
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
            password: this.body.password
        }
    }
}
