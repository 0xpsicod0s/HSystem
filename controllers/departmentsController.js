import { RegisterModel } from '../models/Register.js';
import { DepartmentModel, Department } from '../models/Departments.js';
import { DepartmentRequirement, RequirementModel } from '../models/DepartmentRequirements.js';

export const departmentParticipant = async (req, res) => {
    const departments = [];
    try {
        for (const { department } of req.participatingDepartments) {
            const findDepartment = await DepartmentModel.findOne({ name: department });
            if (!findDepartment) continue;
            departments.push({ name: findDepartment.name, img: findDepartment.img, pathname: findDepartment.pathname });
        }

        const uniqueDepartments = Array.from(new Set(departments.map(dept => JSON.stringify(dept))))
        .map(dept => JSON.parse(dept));

        return res.status(200).json(uniqueDepartments);
    } catch(err) {
        return res.status(500).json({ error: 'Oops! Ocorreu um erro interno ao identificar seus departamentos' });
    }
}

export const getDepartment = async (req, res) => {
    const departments = [];
    try {
        for (const { department } of req.participatingDepartments) {
            const findDepartment = await DepartmentModel.findOne({ name: department });
            if (!findDepartment) continue;
            departments.push({ name: findDepartment.name });
        }
        if (!departments.length) return res.status(403).json({ error: 'Você não tem permissão de acesso aqui' });

        const uniqueDepartments = Array.from(new Set(departments.map(dept => JSON.stringify(dept))))
        .map(dept => JSON.parse(dept));
        return res.status(200).json(uniqueDepartments);
    } catch(err) {
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
}

export const isLeader = async (req, res) => {
    try {
        const currentDepartment = req.query.currentDepartment;
        if (!currentDepartment) return res.status(400).json({ error: 'Query não informada' });

        const findUser = await RegisterModel.findOne({ _id: req.userId });
        if (!findUser) return res.status(403).json({ error: 'Você não tem permissão de acesso aqui' });

        const findDepartment = await DepartmentModel.findOne({
            name: currentDepartment,
            $or: [
                { 'members.leader': findUser.nickname },
                { 'members.viceLeader': findUser.nickname }
            ]
        });
        if (!findDepartment) return res.status(403).json({ accessGranted: false });

        return res.status(200).json({ accessGranted: true });
    } catch(err) {
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
}

export const departmentsRequirements = async (req, res) => new DepartmentRequirement(req, res).sendRequirement();

export const getDocumentsDepartment = async (req, res) => {
    const { departmentName } = req.query;
    if (!departmentName) return res.status(400).json({ error: 'Query nao informada' });

    const user = await RegisterModel.findOne({ _id: req.userId }).select('+department');
    if (!user) return res.status(403).json({ error: 'Você não tem permissão para acessar os documentos' });
    
    const findDepartment = await DepartmentModel.findOne({ name: departmentName });
    if (!findDepartment) return res.status(404).json({ error: 'Departamento não encontrado' });

    const findUserDepartment = user.department.find(({ department }) => department === departmentName );
    if (!findUserDepartment) return res.status(403).json({ error: 'Você não faz parte deste departamento' });

    const findDocument = await RequirementModel.find({ department: findDepartment.name, type: 'postagem_de_documentos' }, { data: 1, createdBy: 1, createdAt: 1 }).lean();
    if (!findDocument.length) return res.status(404).json({ error: 'Nenhum documento foi encontrado' });

    return res.status(200).json(findDocument);
}

export const getMembers = async (req, res) => {
    const { departmentName } = req.query;
    const dataToBeSend = [];
    if (!departmentName) return res.status(400).json({ error: 'Query nao informada' });

    const user = await RegisterModel.findOne({ _id: req.userId }).select('+department');
    if (!user) return res.status(403).json({ error: 'Você não tem permissão para ver os membros deste departamento' });

    const findDepartment = await DepartmentModel.findOne({ name: departmentName });
    if (!findDepartment) return res.status(404).json({ error: 'Departamento não encontrado' });

    const findUserDepartment = user.department.find(({ department }) => department === departmentName );
    if (!findUserDepartment) return res.status(403).json({ error: 'Você não faz parte deste departamento' });


    for (const member in findDepartment.members) {
        if (!findDepartment.members.hasOwnProperty(member)) break;
        if (!findDepartment.members[member]) continue;
        switch (member) {
            case 'leader':
                dataToBeSend.push({ lider: findDepartment.members[member] });
                break;
            case 'viceLeader':
                dataToBeSend.push({ viceLider: findDepartment.members[member] });
                break;
            case 'instructors':
                const instructors = [];
                findDepartment.members[member].forEach(instructor => instructors.push(instructor));
                dataToBeSend.push({ instrutores: instructors });
                break;
            case 'members':
                const members = [];
                findDepartment.members[member].forEach(member => members.push(member));
                dataToBeSend.push({ membros: members });
                break;
        }
    }
    return res.status(200).json(dataToBeSend);
}

export const editMember = async (req, res) => new Department(req, res).editMember();

export const removeMember = async (req, res) => new Department(req, res).removeMember();

export const getClasses = async (req, res) => {
    const { departmentName } = req.query;
    if (!departmentName) return res.status(400).json({ error: 'Query nao informada' });

    const user = await RegisterModel.findOne({ _id: req.userId }).select('+department');
    if (!user) return res.status(403).json({ error: 'Você não tem permissão para ver as aulas deste departamento' });

    const findDepartment = await DepartmentModel.findOne({ name: departmentName });
    if (!findDepartment) return res.status(404).json({ error: 'Departamento não encontrado' });

    const findUserDepartment = user.department.find(({ department }) => department === departmentName );
    if (!findUserDepartment) return res.status(403).json({ error: 'Você não faz parte deste departamento' });

    const findClasses = await RequirementModel.find({ department: findDepartment.name, type: 'adiciona_aula' }).select('data -_id');
    if (!findClasses) return res.status(404).json({ error: 'Nenhum script de aula disponivel no momento' });

    return res.status(200).json(findClasses);
}

export const getClassPosting = async (req, res) => {
    const { departmentName } = req.query;
    const dataToBeSend = [];
    if (!departmentName) return res.status(400).json({ error: 'Query nao informada' });

    const user = await RegisterModel.findOne({ _id: req.userId }).select('+department');
    if (!user) return res.status(403).json({ error: 'Você não tem permissão para ver as aulas deste departamento' });

    const findDepartment = await DepartmentModel.findOne({ name: departmentName });
    if (!findDepartment) return res.status(404).json({ error: 'Departamento não encontrado' });

    const findUserDepartment = user.department.find(({ department }) => department === departmentName );
    if (!findUserDepartment) return res.status(403).json({ error: 'Você não faz parte deste departamento' });

    const findClasses = await RequirementModel.find({ department: findDepartment.name, type: 'postagem_de_aulas' }).select('data createdBy -_id');
    if (!findClasses) return res.status(404).json({ error: 'Nenhum script de aula disponivel no momento' });

    for (const { data, createdBy } of findClasses) {
        const classInstructor = await RegisterModel.findOne({ nickname: createdBy }).select('nickname -_id');
        if (!classInstructor) return res.status(404).json({ error: 'Oops! Algo deu errado' });
        dataToBeSend.push({ data, classInstructor });
    }

    return res.status(200).json(dataToBeSend);
}

export const listOfCourses = async (req, res) => {
    const { departmentName } = req.query;
    if (!departmentName) return res.status(400).json({ error: 'Query não especificada' });
    try {
        const user = await RegisterModel.findOne({ _id: req.userId }).select('+department');
        if (!user) return res.status(403).json({ error: 'Você não tem permissão para ver todos os cursos' });

        const findDepartment = await DepartmentModel.findOne({ name: departmentName });
        if (!findDepartment) return res.status(404).json({ error: 'Departamento não encontrado' });

        const findUserDepartment = user.department.find(({ department }) => department === departmentName );
        if (!findUserDepartment) return res.status(403).json({ error: 'Você não faz parte do RH' });

        const courses = await RequirementModel.find({ type: 'postagem_de_aulas' });
        if (!courses.length) return res.status(404).json({ error: 'Nenhuma aula encontrada' });

        return res.status(200).json(courses);
    } catch (err) {
        return res.status(500).json({ error: 'Houve um erro interno ao procurar por aulas' });
    }
}

export const changeCourseStatus = async (req, res) => {
    const { courseId } = req.params;
    if (!courseId) return res.status(400).json({ error: 'ID do curso não especificado' });

    const { action, departmentName } = req.query;
    if (!action) return res.status(400).json({ error: 'Ação não especificada' });
    if (action !== 'Reprovado' && action !== 'Aprovado') return res.status(400).json({ error: 'Ação não permitida. Tente novamente' });
    if (!departmentName) return res.status(400).json({ error: 'Nome do departamento não especificado' });

    try {
        const user = await RegisterModel.findOne({ _id: req.userId }).select('+department');
        if (!user) return res.status(403).json({ error: 'Você não tem permissão para aprovar/reprovar os cursos' });

        const findDepartment = await DepartmentModel.findOne({ name: departmentName });
        if (!findDepartment) return res.status(404).json({ error: 'Departamento não encontrado' });

        const findUserDepartment = user.department.find(({ department }) => department === departmentName );
        if (!findUserDepartment) return res.status(403).json({ error: 'Você não faz parte do RH' });

        const course = await RequirementModel.updateOne({ _id: courseId }, { $set: { 'data.state': action } });
        if (!course.matchedCount) return res.status(404).json({ error: 'Não foi possível encontrar o curso desejado' });
        if (!course.modifiedCount) return res.status(400).json({ error: 'Nenhuma modificação foi realizada' });
        return res.status(200).json({ success: `Curso ${action.toLowerCase()} com sucesso!` });
    } catch (err) {
        return res.status(500).json({ error: 'Houve um erro interno. Contate um desenvolvedor' });
    }
}