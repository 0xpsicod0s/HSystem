import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { RegisterModel } from './Register.js';

const LoginSchema = new mongoose.Schema({
    nickname: { type: String, required: true },
    password: { type: String, required: true },
});

const LoginModel = mongoose.model('Login', LoginSchema, 'registers');

class Login {
    constructor(body, res) {
        this.body = body;
        this.res = res;
        this.error = false;
        this.user = null;
    }

    async login() {
        this.validate();
        
        if (this.error) return;

        this.user = await LoginModel.findOne({ nickname: this.body.nickname });
        if (!this.user) {
            this.error = true;
            this.res.status(400).json({ error: 'Usuario nao encontrado' });
            return;
        }

        if (!await bcrypt.compare(this.body.password, this.user.password)) {
            this.res.status(400).json({ error: 'Senha invalida' });
            this.error = true;
            this.user = null;
            return;
        }
    }

    async validate() {
        this.cleanUp();
        if (!this.body.nickname || !this.body.password) {
            this.res.status(400).json({ error: 'Campos obrigatorios nao preenchidos' });
            this.error = true;
        }

        if (this.body.password.length < 8) {
            this.res.status(400).json({ error: 'A senha precisa ter mais que 8 caracteres' });
            this.error = true;
            return;
        }

        const user = await RegisterModel.findOne({ nickname: this.body.nickname });
        if (!user) {
            this.res.status(403).json({ error: 'Você não tem uma conta registrada. Aliste-se!'});
            this.error = true;
            return;
        }

        if (user && user.state === 'Desativado') {
            this.res.status(403).json({ error: 'Sua conta está desativada' });
            this.error = true;
            return;
        }

        if (user && user.state === 'Demitido') {
            this.res.status(403).json({ error: 'Você foi demitido' });
            this.error = true;
            return;
        }

        if (user && user.state === 'Exonerado') {
            this.res.status(403).json({ error: 'Você está exonerado' });
            this.error = true;
            return;
        }
    }

    cleanUp() {
        for (const key in this.body) {
            if (typeof this.body[key] !== 'string') {
                this.body[key] = '';
            }
        }
        this.body = {
            nickname: this.body.nickname,
            password: this.body.password
        }
    }
}

export default Login;