import mongoose from 'mongoose';
import { RegisterModel } from './Register.js';
import { RequirementModel } from './DepartmentRequirements.js'

const DepartmentScheema = new mongoose.Schema({
    name: { type: String, required: true },
    img: { type: String, required: true },
    hierarchy: { type: [String], required: true },
    pathname: { type: String, required: true },
    members: {
        leader: { type: String },
        viceLeader: { type: String },
        instructors: { type: [String], default: [''] },
        members: { type: [String], default: [''] }
    }
});

export const DepartmentModel = mongoose.model('Departments', DepartmentScheema, 'departments');

export class Department {
    constructor(req, res) {
        this.req = req;
        this.res = res;
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

    async editMember() {
        const { departmentName, memberName, newRole } = this.req.body;
        if (!departmentName || !memberName || !newRole) return this.res.status(400).json({ error: 'Requisição inválida' });
    
        const memberUser = await RegisterModel.findOne({ nickname: memberName }).select('+department');
        if (!memberUser) return this.res.status(404).json({ error: 'Militar não encontrado' });
    
        const editorUser = await RegisterModel.findOne({ _id: this.req.userId }).select('+department');
        if (!editorUser) return this.res.status(400).json({ error: 'Requisição inválida' });
    
        const findDepartment = await DepartmentModel.findOne({ name: departmentName });
        if (!findDepartment) return this.res.status(400).json({ error: 'Departamento inválido' });
    
        const editorDepartmentIndex = editorUser.department.findIndex(({ department }) => department === findDepartment.name);
        if (editorDepartmentIndex === -1) return this.res.status(403).json({ error: 'Você não tem permissão para realizar esta ação' });
    
        const memberDepartmentIndex = memberUser.department.findIndex(({ department }) => department === findDepartment.name);
        if (memberDepartmentIndex === -1) return this.res.status(400).json({ error: 'Este militar não faz parte deste departamento' });
    
        if (!findDepartment.hierarchy.includes(newRole)) return this.res.status(400).json({ error: 'Cargo inexistente dentro deste departamento' });
    
        let memberFound = false;
        console.log('variavel');
        for (const office in findDepartment.members) {
            if (memberFound) break;
            console.log(memberFound);
            if (!findDepartment.members.hasOwnProperty(office)) continue;
    
            if (office === 'leader' || office === 'viceLeader') continue;
    
            const memberIndex = findDepartment.members[office].findIndex(nickname => nickname === memberUser.nickname);
            if (memberIndex !== -1) {
                findDepartment.members[office].splice(memberIndex, 1);
    
                switch (newRole) {
                    case 'Instrutor':
                        findDepartment.members.instructors.push(memberName);
                        break;
                    case 'Membro':
                        findDepartment.members.members.push(memberName);
                        break;
                    case 'Lider':
                        findDepartment.members.leader = memberName;
                        break;
                    case 'Vice-Lider':
                        findDepartment.members.viceLeader = memberName;
                        break;
                    default:
                        return this.res.status(400).json({ error: 'Cargo não reconhecido' });
                }
    
                memberUser.department[memberDepartmentIndex].role = newRole;
    
                await DepartmentModel.findOneAndUpdate(
                    { name: departmentName },
                    { $set: { members: findDepartment.members } },
                    { new: true, runValidators: true }
                );
    
                await RegisterModel.findOneAndUpdate(
                    { _id: memberUser._id },
                    { $set: { department: memberUser.department } },
                    { new: true, runValidators: true }
                );
    
                await this.createRequirement(findDepartment, 'membro_editado', { memberName, newRole }, editorUser);
                memberFound = true;                
                return this.res.status(200).json({ success: 'Membro editado com sucesso!' });
            }
        }
    
        return this.res.status(404).json({ error: 'Membro não encontrado no departamento' });
    }
    
    async removeMember() {
        const { departmentName, memberName } = this.req.body;
        if (!departmentName || !memberName) return this.res.status(400).json({ error: 'Requisição inválida' });
    
        const memberUser = await RegisterModel.findOne({ nickname: memberName }).select('+department');
        if (!memberUser) return this.res.status(404).json({ error: 'Militar não encontrado' });
    
        const userRemover = await RegisterModel.findOne({ _id: this.req.userId }).select('+department');
        if (!userRemover) return this.res.status(400).json({ error: 'Requisição inválida' });
    
        const findDepartment = await DepartmentModel.findOne({ name: departmentName });
        if (!findDepartment) return this.res.status(400).json({ error: 'Departamento inválido' });
    
        const removeUserDepartmentIndex = userRemover.department.findIndex(({ department }) => department === findDepartment.name);
        if (removeUserDepartmentIndex === -1) return this.res.status(403).json({ error: 'Você não tem permissão de remover um membro deste departamento' });
    
        const memberDepartmentIndex = memberUser.department.findIndex(({ department }) => department === findDepartment.name);
        if (memberDepartmentIndex === -1) return this.res.status(403).json({ error: 'Este militar não faz parte deste departamento' });
    
        const removeUserDepartment = userRemover.department[removeUserDepartmentIndex];
        if (removeUserDepartment.role !== 'Lider' && removeUserDepartment.role !== 'Vice-Lider') 
            return this.res.status(403).json({ error: 'Você não tem permissão de remover um membro deste departamento' });
    
        let memberRemoved = false;
        for (const office in findDepartment.members) {
            if (!findDepartment.members.hasOwnProperty(office)) continue;
    
            if (office === 'leader' || office === 'viceLeader') continue;
    
            const findMember = findDepartment.members[office].findIndex(nickname => nickname === memberUser.nickname);
            if (findMember !== -1) {
                findDepartment.members[office].splice(findMember, 1);
                memberUser.department.splice(memberDepartmentIndex, 1);
    
                await DepartmentModel.findOneAndUpdate(
                    { name: departmentName },
                    { $set: { members: findDepartment.members } },
                    { new: true, runValidators: true }
                );
    
                await RegisterModel.findOneAndUpdate(
                    { _id: memberUser._id },
                    { $set: { department: memberUser.department } },
                    { new: true, runValidators: true }
                );
    
                await this.createRequirement(findDepartment, 'remove_membro', { memberName }, userRemover);
                memberRemoved = true;
                break;
            }
        }
    
        if (memberRemoved) {
            return this.res.status(200).json({ success: 'Membro removido com sucesso!' });
        } else {
            return this.res.status(404).json({ error: 'Membro não encontrado no departamento' });
        }
    }
    
}