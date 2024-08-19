import mongoose from 'mongoose';
import { RegisterModel, militaryHierarchy, flattenedMilitaryHierarchy } from './Register.js';
import { DepartmentModel } from './Departments.js';
import sanitize from 'sanitize-html';


const RequirementSchema = new mongoose.Schema({
    department: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: [
            'postagem_de_aulas',
            'postagem_de_documentos',
            'adiciona_membro',
            'salva_documento',
            'adiciona_aula',
            'membro_editado',
            'remove_membro'
        ],
        required: true
    },
    data: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: String,
        required: true
    }
});

export const RequirementModel = mongoose.model('DepartmentRequirements', RequirementSchema);

export class DepartmentRequirement {
    constructor(req, res) {
        this.req = req;
        this.res = res;
    }

    async sendRequirement() {
        try {
            const [ requirementType, ...data ] = this.req.body;
            if (!requirementType || !data) return this.res.status(400).json({ error: 'Dados invalidos' });
            
            const senderRequest = await RegisterModel.findById(this.req.userId).select('+role +department');
            if (!senderRequest) return this.res.status(400).json({ error: 'Oops! Algo deu errado' });
            switch (requirementType) {
                case 'adiciona_membro': return this.addMember(data, senderRequest);
                case 'postagem_de_aula': return this.classPost(data, senderRequest);
                case 'salva_documento': return this.addDocument(data, senderRequest);
                case 'adiciona_aula': return this.addClass(data, senderRequest);
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

    async createRequirement(department, type, data, createdBy) {
        if (!department || !type || !data || !createdBy) {
            throw new Error('Todos os campos são obrigatórios');
        }

        const newRequirement = new RequirementModel({ 
            department,
            type,
            data,
            createdBy
        });
        await newRequirement.save();
        return newRequirement;
    }

    async classPost(data, teacher) {
        const { inputValue: departmentName } = data[0];
        const { inputValue: militaryNickname } = data[1];
        const { inputValue: typeOfClass } = data[2];
        const { inputValue: comments } = data[3];

        if (!typeOfClass && militaryNickname && comments) return this.res.status(400).json({ error: 'Selecione qual aula foi aplicada' });
        if (!militaryNickname || !typeOfClass || !comments) return this.res.status(400).json({ error: 'Preencha todos os campos' });

        try {
            const studentUser = await RegisterModel.findOne({ nickname: militaryNickname }).select('+role');
            const department = await DepartmentModel.findOne({ name: departmentName });
            if (!studentUser) return this.res.status(404).json({ error: 'Nao foi possivel encontrar o militar' });
            if (!department) return this.res.status(404).json({ error: 'Departamento inexistente' });
    
            const teacherPatentLevel = this.findRankLevel(teacher.role);
            const studentPatentLevel = this.findRankLevel(studentUser.role);
            if (teacherPatentLevel <= studentPatentLevel) return this.res.status(403).json({ error: 'Você não tem nivel de patente suficiente para aplicar esta aula a este militar' });
    
            const findDepartment = teacher.department.find(({ department: departmentName }) => departmentName === department.name);
            if (!findDepartment) return this.res.status(403).json({ error: 'Você nao faz parte deste departamento' });

            await this.createRequirement(department.name, 'postagem_de_aulas', { militaryNickname, typeOfClass, comments, state: 'Pendente' }, teacher.nickname);
            return this.res.status(201).json({ success: 'Aula postada com sucesso!' });
        } catch(err) {
            return this.res.status(500).json({ error: 'Erro interno' });
        }
    }

    async addMember(data, leader) {
        const { inputValue: departmentName } = data[0];
        const { inputValue: militaryNickname } = data[1];
        const { inputValue: office } = data[2];

        if (!office && militaryNickname) return this.res.status(400).json({ error: 'Selecione um cargo' });
        if (!militaryNickname || !office) return this.res.status(400).json({ error: 'Preencha todos os campos' });

        try {
            const newMemberUser = await RegisterModel.findOne({ nickname: militaryNickname }).select('+role +department');
            const department = await DepartmentModel.findOne({ hierarchy: { $in: [office] }, name: departmentName });
            if (!newMemberUser) return this.res.status(404).json({ error: 'Nao foi possivel encontrar o militar' });
            if (!department) return this.res.status(404).json({ error: 'Cargo inexistente na hierarquia do departamento' });

            if (department.members.leader !== leader.nickname && department.members.viceLeader !== leader.nickname)
                return this.res.status(403).json({ error: 'Você não tem permissao para adicionar um membro' });

            const findDepartment = newMemberUser.department.find(({ department }) => department === departmentName);


            async function relocateMember(positionInEnglish) {
                if (findDepartment.role === office) return !!this.res.status(403).json({ error: 'O militar ja está neste cargo' });

                switch(findDepartment.role) {
                    case 'Instrutor': 
                        const searchInstructorIndex = department.members['instructors'].findIndex(member => member === newMemberUser.nickname);
                        department.members['instructors'].splice(searchInstructorIndex, 1);
                        break;
                    case 'Membro':
                        const searchMemberIndex = department.members['members'].findIndex(member => member === newMemberUser.nickname);
                        department.members['members'].splice(searchMemberIndex, 1);
                }

                if (office === 'Lider' || office === 'Vice-Lider') {
                    newMemberUser.department = { role: office, department: department.name };
                    department.members[positionInEnglish] = newMemberUser.nickname;
                    await this.createRequirement(department.name, 'adiciona_membro', { militaryNickname, office, changeOfPosition: true }, leader.nickname);
                    await department.save();
                    return !!this.res.status(200).json({ success: 'Liderança renomeada com sucesso!' });
                } else if (office !== 'Instrutor' && office !== 'Membro') return !!this.res.status(400).json({ error: 'Este não é um cargo valido na hierarquia interna do departamento' });
                
                newMemberUser.department = { role: office, department: department.name };
                await this.createRequirement(department.name, 'adiciona_membro', { militaryNickname, office, changeOfPosition: true }, leader.nickname);
                department.members[positionInEnglish].push(newMemberUser.nickname);
                await department.save();
                return !!this.res.status(200).json({ success: 'Membro realocado com sucesso!' });
            }


            switch(office) {
                case 'Lider':
                    if (findDepartment && relocateMember.call(this, 'leader')) return;
                    department.members['leader'] = newMemberUser.nickname;
                    break;
                case 'Vice-Lider':
                    if (findDepartment && relocateMember.call(this, 'viceLeader')) return;
                    department.members['viceLeader'] = newMemberUser.nickname;
                    break;
                case 'Instrutor':
                    if (findDepartment && relocateMember.call(this, 'instructors')) return;
                    department.members['instructors'].push(newMemberUser.nickname);
                    break;
                case 'Membro':
                    if (findDepartment && relocateMember.call(this, 'members')) return;
                    department.members['members'].push(newMemberUser.nickname);
                    break;
                default:
                    return this.res.status(400).json({ error: 'Este não é um cargo valido na hierarquia interna do departamento' });
            }
            await department.save();

            newMemberUser.department.push({ role: office, department: department.name });
            await this.createRequirement(department.name, 'adiciona_membro', { militaryNickname, office }, leader.nickname);
            await newMemberUser.save();
            return this.res.status(201).json({ success: 'Novo membro adicionado no departamento com sucesso!' })
        } catch(err) {
            console.log(err);
            return this.res.status(500).json({ error: 'Erro interno' });
        }
    }

    async addDocument(data, creator) {
        const { departmentName, documentTitle, documentContent } = data[0];
        if (!documentTitle || !documentContent) return this.res.json(400).json({ error: 'Preencha todos os campos' });
        
        const cleanHtml = sanitize(documentContent, {
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

        try {
            const findDepartment = await DepartmentModel.findOne({ name: departmentName });
            if (!findDepartment) return this.res.status(404).json({ error: 'Departamento inexistente' });
    
            const departmentIndex = creator.department.findIndex(({ department }) => department === departmentName);
            if (creator.department[departmentIndex].role !== 'Lider' && creator.department[departmentIndex].role !== 'Vice-Lider') 
                return this.res.status(403).json({ error: 'Você não tem permissao para adicionar um novo documento' });
            const documents = await RequirementModel.find({ department: findDepartment, type: 'postagem_de_documentos' });
            const findDocument = documents.find(document => document.data.title === documentTitle);
            if (findDocument) return this.res.status(403).json({ error: 'Este documento ja está postado' });
    
            await this.createRequirement(findDepartment.name, 'postagem_de_documentos', { title: documentTitle, content: cleanHtml }, creator.nickname);
            return this.res.status(201).json({ success: 'Documento adicionado com sucesso!' });
        } catch(err) {
            return this.res.status(500).json({ error: 'Erro interno' });
        }
    }

    async addClass(data, creator) {
        const { departmentName, className, classContent } = data[0];
        if (!className || !classContent) return this.res.json(400).json({ error: 'Preencha todos os campos' });
        
        const cleanHtml = sanitize(classContent, {
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

        try {
            const findDepartment = await DepartmentModel.findOne({ name: departmentName });
            if (!findDepartment) return this.res.status(404).json({ error: 'Departamento inexistente' });
    
            const departmentIndex = creator.department.findIndex(({ department }) => department === departmentName);
            if (creator.department[departmentIndex].role !== 'Lider' && creator.department[departmentIndex].role !== 'Vice-Lider') 
                return this.res.status(403).json({ error: 'Você não tem permissao para adicionar uma nova aula' });
            
            const documents = await RequirementModel.find({ department: findDepartment, type: 'adiciona_aula' });
            const findDocument = documents.find(document => document.data.title === className);
            if (findDocument) return this.res.status(403).json({ error: 'Esta aula ja está postada' });
    
            await this.createRequirement(findDepartment.name, 'adiciona_aula', { name: className, content: cleanHtml }, creator.nickname);
            return this.res.status(201).json({ success: 'Aula adicionada com sucesso!' });
        } catch(err) {
            return this.res.status(500).json({ error: 'Erro interno' });
        }
    }
}