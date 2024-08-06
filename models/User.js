import { RegisterModel } from '../models/Register.js';
import { RequirementModel } from '../models/DepartmentRequirements.js';
import bcrypt from 'bcryptjs';

export class User {
    constructor(req, res) {
        this.req = req;
        this.res = res;
    }

    async profile() {
        try {
            const findUser = await RegisterModel.findOne({ _id: this.req.userId }).select('-_id +role +department');
            if (!findUser) return this.res.status(400).json({ error: 'Requisição inválida. Por favor, tente novamente.' });
    
            const findCourses = await RequirementModel.find({
                type: 'postagem_de_aulas',
                'data.militaryNickname': findUser.nickname
            }).select('-_id data');
            return this.res.status(200).json({ user: findUser, courses: findCourses });
        } catch (err) {
            return this.res.status(500).json({ error: 'Erro interno. Não foi possível carregar as inforamções de seu perfil' });
        }
    }

    async reset() {
        try {
            let newPassword = this.req.body.password;
            if (!newPassword) return this.res.status(400).json({ error: 'Digite sua nova senha' });

            if (newPassword.length < 8) return this.res.status(400).json({ error: 'Sua nova senha precisa ter mais que 8 caracteres' });

            const findUser = await RegisterModel.findOne({ _id: this.req.userId }).select('+password');
            if (!findUser) return this.res.status(400).json({ error: 'Requisição inválida. Por favor, tenete novamente' });

            newPassword = await bcrypt.hash(newPassword, await bcrypt.genSalt());
            findUser.password = newPassword;
            await findUser.save();

            return this.res.status(200).json({ success: 'Senha redefinida com sucesso!' });
        } catch (err) {
            return this.res.status(500).json({ error: 'Erro interno. Não foi possível redefinir seus dados' });
        }
    }

    async isAdmin() {
        try {
            const user = await RegisterModel.findOne({ _id: this.req.userId }).select('isAdmin');
            if (!user) return this.res.status(400).json({ error: 'Oops! Algo deu errado.' });

            if (user.isAdmin) return this.res.status(200).json({ accessGranted: true });
            return this.res.status(200).json({ accessGranted: false });
        } catch(err) {
            return this.res.status(500).json({ error: 'Houve um erro interno. Contate um responsavel' });
        }
    }

    async viewProfile() {
        try {
            const { nick } = this.req.params;
            if (!nick) return this.res.status(400).json({ error: 'Nenhum nick especificado' });

            const findUser = await RegisterModel.findOne({ nickname: nick }).select('-_id +role +department');
            if (!findUser) return this.res.status(404).json({ error: 'Militar não encontrado' });

            const findCourses = await RequirementModel.find({
                type: 'postagem_de_aulas',
                'data.militaryNickname': findUser.nickname
            }).select('-_id data');

            return this.res.status(200).json({ user: findUser, courses: findCourses });
        } catch(err) {
            return this.res.status(500).json({ error: 'Houve um erro interno. Contate um responsavel' });
        }
    }
}