import mongoose from 'mongoose';
import sanitize from 'sanitize-html';
import { RegisterModel } from './Register.js';

const SystemSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['publicacao', 'documento']
    },
    title: { type: String, required: true },
    applicant: { type: String, required: true },
    date: { type: Date, default: Date.now },
    details: { type: mongoose.Schema.Types.Mixed, required: true }
});

export const SystemModel = mongoose.model('System', SystemSchema);

export class System {
    constructor(req, res) {
        this.req = req;
        this.res = res;
    }

    async createRequirement(type, title, applicant, details) {
        if (!type || !title || !applicant || !details) {
            throw new Error('Todos os campos são obrigatórios');
        }

        const newRequirement = new SystemModel({
            type,
            title,
            applicant,
            details
        });
        await newRequirement.save();
        return newRequirement;
    }

    cleanHtml(content) {
        return sanitize(content, {
            allowedTags: sanitize.defaults.allowedTags.concat(['img']),
            allowedAttributes: {
                '*': ['style', 'class'],
                'a': ['href', 'name', 'target'],
                'img': ['src']
            },
            allowedSchemes: ['http', 'https', 'ftp', 'mailto'],
            allowedSchemesByTag: {
                'img': ['data']
            }
        });
    }

    async getPublications() {
        try {
            const publications = await SystemModel.find();
            if (!publications.length) return this.res.status(404).json({ error: 'Não há publicações postadas' });

            return this.res.status(200).json(publications);
        } catch (err) {
            return this.res.status(500).json({ error: 'Houve um erro interno. Contate um desenvolvedor' });
        }
    }

    async getPublication() {
        const { pubId } = this.req.params;
        if (!pubId) return this.res.status(400).json({ error: 'ID não especificado' });

        try {
            const publication = await SystemModel.findOne({ _id: pubId });
            if (!publication) return this.res.status(404).json({ error: 'Não foi possivel encontrar a publicação desejada' });

            return this.res.status(200).json(publication);
        } catch (err) {
            return this.res.status(500).json({ error: 'Houve um erro interno. Contate um desenvolvedor' });
        }
    }

    async addPublication() {
        const { title, content } = this.req.body;
        if (!title || !content) return this.res.status(400).json({ error: 'Preencha todos os campos' });

        try {
            const publisher = await RegisterModel.findById({ _id: this.req.userId }).select('nickname isAdmin');
            if (!publisher.isAdmin) return this.res.status(403).json({ error: 'Você não tem permissão administrativa para isso' });
            
            await this.createRequirement('publicacao', title, publisher.nickname, this.cleanHtml(content));
            return this.res.status(201).json({ success: 'Nova publicação adicionada com sucesso!' });
        } catch (err) {
            return this.res.status(500).json({ error: 'Houve um erro interno. Contate um desenvolvedor' });
        }
    }

    async editPublication() {
        const { pubId } = this.req.params;
        if (!pubId) return this.res.status(400).json({ error: 'ID não especificado' });

        const { title, content } = this.req.body;
        if (!title || !content) return this.res.status(400).json({ error: 'Preencha todos os campos' });

        try {
            const updateFields = {};
            if (title) updateFields.title = title;
            if (content) updateFields.details = this.cleanHtml(content);

            if (Object.keys(updateFields).length === 0) {
                return this.res.status(400).json({ error: 'Nenhum campo para atualizar' });
            }

            const publicationUpdated = await SystemModel.updateOne(
                { _id: pubId },
                { $set: updateFields }
            );
            if (publicationUpdated.matchedCount === 0) {
                return this.res.status(404).json({ error: 'Publicação não encontrada' });
            }

            return this.res.status(200).json({ success: 'Publicação atualizada com sucesso!' });
        } catch (err) {
            return this.res.status(500).json({ error: 'Houve um erro interno. Contate um desenvolvedor' });
        }
    }

    async deletePublication() {
        const { pubId } = this.req.params;
        if (!pubId) return this.res.status(400).json({ error: 'ID não especificado' });

        try {
            const pubDeleted = await SystemModel.deleteOne({ _id: pubId });
            if (pubDeleted.deletedCount === 0) return this.res.status(404).json({ error: 'Publicação não encontrada' });

            return this.res.status(200).json({ success: 'Publicação deletada com sucesso!' });
        } catch (err) {
            return this.res.status(500).json({ error: 'Houve um erro interno. Contate um desenvolvedor' });
        }
    }
}