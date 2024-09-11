$(document).ready(function () {
    const csrfToken = document.cookie.split('; ').find(row => row.startsWith('XSRFTOKEN=')).split('=')[1];
    $.ajaxSetup({
        method: 'POST',
        url: '/api/departments/requirements',
        xhrFields: {
            withCredentials: true
        },
        headers: {
            'CSRF-Token': csrfToken
        },
        contentType: 'application/json; charset=utf-8'
    });

    $('#departmentOptions').on('change', function () {
        if ($('.is-danger')) $('.is-danger').remove();
        const selectedOption = $(this).val();
        let contentHtml = '';

        switch (selectedOption) {
            case 'documentos':
                contentHtml = `
                    <div class="field">
                        <label class="label has-text-white">Documentos</label>
                        <div id="documentsList" class="content has-text-white">
                            <ul></ul>
                        </div>
                    </div>
                `;
                loadDocuments();
                break;

            case 'postagem_de_aula':
                contentHtml = `
                    <div class="field">
                        <label class="label has-text-white">Nick do Militar</label>
                        <div class="control">
                            <input class="input" type="text" placeholder="Nick do Militar">
                        </div>
                    </div>
                    <div class="field">
                        <label class="label has-text-white">Tipo de Aula</label>
                        <div class="control">
                            <div class="select is-fullwidth">
                                <select id="select-class">
                                    <option value="" disabled selected>Selecione uma aula</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="field">
                        <label class="label has-text-white">Observações</label>
                        <div class="control">
                            <textarea class="textarea" placeholder="Observações sobre a aula"></textarea>
                        </div>
                    </div>
                    <div class="field">
                        <div class="control">
                            <button class="button is-primary is-fullwidth" id="postLessonBtn">Postar Aula</button>
                        </div>
                    </div>
                `;
                setTimeout(() => classPost(selectedOption), 0);
                break;

            case 'aulas':
                contentHtml = `
                    <div class="field">
                        <label class="label has-text-white">Aulas</label>
                        <div id="lessonsList" class="content has-text-white">
                        </div>
                    </div>
                `;
                loadLessons();
                break;
            
            case 'aulas_rh':
                contentHtml = `
                    <table class="table is-fullwidth is-striped">
                        <thead>
                            <tr>
                                <th>Instrutor</th>
                                <th>Aluno</th>
                                <th>Nome do Curso</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody id="listOfCourses">
                        </tbody>
                    </table>
                `;
                $('#departmentContent').html(contentHtml);
                listOfCourses();
                break;
            case 'requerimentos':
                contentHtml = `
                    <div class="field">
                        <label class="label has-text-white">Selecione uma categoria de requerimento</label>
                        <div class="control">
                            <div class="select is-fullwidth">
                                <select id="requirementOptions">
                                    <option value="" disabled selected>Selecione uma opção</option>
                                    <option value="contrato">Contratos</option>
                                    <option value="promocao">Promoções</option>
                                    <option value="rebaixamento">Rebaixamentos</option>
                                    <option value="advertencia">Advertências</option>
                                    <option value="demissao">Demissões</option>
                                    <option value="vendaDeCargo">Venda de Cargo</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div id="requirementContent"></div>
                `;

                $('#departmentContent').html(contentHtml);
                setTimeout(() => {
                    $('#requirementOptions').off('change').on('change', function () {
                        if ($('.is-danger')) $('.is-danger').remove();
                        const selectedRequirement = $(this).val();
                        let tableHeaders = '';
                        switch (selectedRequirement) {
                            case 'contrato':
                                tableHeaders = '<th>Contratante</th><th>Contratado</th><th>Data</th><th>Status</th><th>Ações</th>';
                                break;
                            case 'promocao':
                                tableHeaders = '<th>Promotor</th><th>Promovido</th><th>Data</th><th>Status</th><th>Ações</th>';
                                break;
                            case 'rebaixamento':
                                tableHeaders = '<th>Rebaixador</th><th>Rebaixado</th><th>Data</th><th>Status</th><th>Ações</th>';
                                break;
                            case 'advertencia':
                                tableHeaders = '<th>Advertente</th><th>Advertido</th><th>Data</th><th>Status</th><th>Ações</th>';
                                break;
                            case 'demissao':
                                tableHeaders = '<th>Demissor</th><th>Demitido</th><th>Data</th><th>Status</th><th>Ações</th>';
                                break;
                            case 'vendaDeCargo':
                                tableHeaders = '<th>Vendedor</th><th>Comprador</th><th>Data</th><th>Status</th><th>Ações</th>';
                                break;
                        }
    
                        $('#requirementContent').html(`
                                <table class="table is-fullwidth is-striped">
                                    <thead>
                                        <tr>
                                            ${tableHeaders}
                                        </tr>
                                    </thead>
                                    <tbody id="requirementListBody">
                                    </tbody>
                                </table>
                            `);
    
                        showRequirements(selectedRequirement);
                    });
                }, 0);
                break;

            case 'membros':
                contentHtml = `
                    <div class="field">
                        <label class="label has-text-white">Membros</label>
                        <div id="membersList" class="content has-text-white">
                            <div id="leader">
                                <h2 class="has-text-centered has-text-white">Lider</h2>
                            </div>
                            <div id="viceLeader">
                                <h2 class="has-text-centered has-text-white">Vice-Lider</h2>
                            </div>
                            <div id="instructors">
                                <h2 class="has-text-centered has-text-white">Instrutores</h2>
                            </div>
                            <div id="members">
                                <h2 class="has-text-centered has-text-white">Membros</h2>
                            </div>
                        </div>
                    </div>
                `;
                loadMembers();
                break;

            default:
                contentHtml = '';
        }

        $('#departmentContent').html(contentHtml);
    });

    function loadDocuments() {
        const departmentName = encodeURIComponent($('input[type="hidden"]').val());
        $.ajax({
            method: 'GET',
            url: `/api/departments/getDocuments?departmentName=${departmentName}`,
            success: function (data) {
                let documentsHtml = '';
                data.forEach(document => {
                    documentsHtml += `                        
                        <li class="document-item">
                            <span class="document-title">${document.data.title}</span>
                            <button class="button is-primary box" style="margin-top: 10px">Ler</button>
                        </li>
                        <hr>
                    `;
                });

                $('#documentsList').html(documentsHtml);

                $('.button').each(function (index, element) {
                    $(element).on('click', function () {
                        const documentName = encodeURIComponent($(this).prev().text());
                        window.location = `/departments/doc/document.html?departmentName=${departmentName}&documentName=${documentName}`;
                    });
                });
            },
            error: function (data) {
                console.log(data);
                if (data.status === 400 ||
                    data.status === 403 ||
                    data.status === 404) {
                    showError(data.responseJSON.error);
                }
            }
        });
    }

    function classPost(selectedOption) {
        const departmentName = $('input[type="hidden"]').val();

        $.ajax({
            method: 'GET',
            url: `/api/departments/getClasses?departmentName=${departmentName}`,
            success: function (data) {
                data.forEach(({ data: { name } }) => {
                    $('#select-class').append(`<option value=${name}>${name}</option>`);
                });
            }
        });

        $('#postLessonBtn').on('click', function () {
            const dataToSend = [selectedOption, { inputValue: departmentName }];
            $('#departmentContent .control').each(function (index, element) {
                const inputElement = $($(element)[0].firstElementChild);
                if (inputElement.hasClass('button')) return;
                if (inputElement.hasClass('select')) {
                    dataToSend.push({ inputValue: $($(inputElement)[0].firstElementChild).val() });
                    return;
                }
                const inputValue = inputElement.val();
                dataToSend.push({ inputValue });
            });

            $.ajax({
                data: JSON.stringify(dataToSend),
                success: function (data) {
                    if (data.success) {
                        successfulOperation(data.success);
                        setTimeout(() => window.location.reload(), 2000);
                    }
                },
                error: function (data) {
                    if (data.status === 400 ||
                        data.status === 403 ||
                        data.status === 404) {
                        showError(data.responseJSON.error);
                    }
                }
            });
        });
    }

    function loadLessons() {
        const departmentName = $('input[type="hidden"]').val();

        $.ajax({
            method: 'GET',
            url: `/api/departments/getClasses?departmentName=${departmentName}`,
            success: function (data) {
                let classHtml = '';
                data.forEach(({ data }) => {
                    classHtml += `
                        <li class="document-item">
                            <span class="document-title">${data.name}</span>
                            <button class="button is-primary box" style="margin-top: 10px">Ler</button>
                        </li>
                        <hr>
                    `
                });
                $('#lessonsList').html(classHtml);

                $('.button').each(function (index, element) {
                    $(element).on('click', function () {
                        const className = $(element.previousElementSibling).text();
                        const { data: findClass } = data.find(({ data }) => data.name === className);
                        if (!findClass) showError('Aula nao encontrada');
                        console.log(findClass);
                        const classContentHtml = `
                            <div class="box">
                                <div class="content has-text-white">
                                    ${findClass.content}
                                </div>
                            </div>
                        `
                        $('#lessonsList').html(classContentHtml);
                    });
                });
            },
            error: function (data) {
                if (data.status === 400 ||
                    data.status === 403 ||
                    data.status === 404) {
                    showError(data.responseJSON.error);
                }
            }
        });
    }

    function listOfCourses() {
        const departmentName = $('input[type="hidden"]').val();
        $.ajax({
            method: 'GET',
            url: `/api/departments/listOfCourses?departmentName=${departmentName}`,
            xhrFields: {
                withCredentials: true
            },
            success: function(data) {
                $('#listOfCourses').empty();
                data.forEach(course => {
                    $('#listOfCourses').append(`
                        <tr>
                            <td data-label="Instrutor">${course.createdBy}</td>
                            <td data-label="Aluno">${course.data.militaryNickname}</td>
                            <td data-label="Nome do Curso">${course.data.typeOfClass}</td>
                            <td data-label="Status">${course.data.state}</td>
                            <td data-label="Ações">
                                <button class="button is-small is-info approve-button" data-id="${course._id}">Aprovar</button>
                                <button class="button is-small is-danger reject-button" data-id="${course._id}">Reprovar</button>
                            </td>
                        </tr>
                    `);
                    $(document).off('click', '.approve-button');
                    $(document).off('click', '.reject-button');
                    $(document).on('click', '.approve-button', function() {
                        actionRequest.call(this, 'Aprovado');
                    });
                    $(document).on('click', '.reject-button', function() {
                        actionRequest.call(this, 'Reprovado');
                    });

                    function actionRequest(action) {
                        const courseId = $(this).data('id');
                        $.ajax({
                            method: 'GET',
                            url: `/api/changeCourseStatus/${courseId}?departmentName=${departmentName}&action=${action}`,
                            xhrFields: {
                                withCredentials: true
                            },
                            success: function (data) {
                                successfulOperation(data.success);
                                listOfCourses();
                                setTimeout(() => $('.box > .is-success').remove(), 3000);
                            },
                            error: function (err) {
                                showError(err.responseJSON.error);
                                setTimeout(() => $('.box > .is-danger').remove(), 3000);
                            }
                        });
                    }
                });
            },
            error: function(err) {
                showError(err.responseJSON.error);
            }
        })
    }

    function loadMembers() {
        $('head').append('<style>.box.is-multiline { display: flex; flex-direction: column; align-items: center; }</style>');
        const departmentName = $('input[type="hidden"]').val();
        $.ajax({
            method: 'GET',
            url: `/api/departments/getMembers?departmentName=${departmentName}`,
            success: function (data) {
                data.forEach(member => {
                    if (member.lider) {
                        appendMemberHtml('#leader', member.lider);
                    } else if (member.viceLider) {
                        appendMemberHtml('#viceLeader', member.viceLider);
                    } else if (member.instrutores) {
                        member.instrutores.forEach(instructor => {
                            appendMemberHtml('#instructors', instructor);
                        });
                    } else if (member.membros) {
                        member.membros.forEach(departmentMember => {
                            appendMemberHtml('#members', departmentMember);
                        });
                    }
                });
            },
            error: function (data) {
                if (data.status === 400 ||
                    data.status === 403 ||
                    data.status === 404) {
                    showError(data.responseJSON.error);
                }
            }
        });
    }

    function showRequirements(selectedRequirement) {
        $.ajax({
            method: 'GET',
            url: `/api/requirements?type=${selectedRequirement}`,
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                $('#requirementListBody').empty();
                data.forEach(requirement => {
                    const formattedDate = new Date(requirement.date).toLocaleDateString('pt-BR');
                    $('#requirementListBody').append(`
                                <tr>
                                    <td>${requirement.applicant}</td>
                                    <td>${requirement.nickname}</td>
                                    <td data-label="Data">${formattedDate}</td>
                                    <td data-label="Status">${requirement.state}</td>
                                    <td data-label="Ações">
                                        <button class="button is-small is-info approve-button" data-id="${requirement._id}">Aprovar</button>
                                        <button class="button is-small is-danger reject-button" data-id="${requirement._id}">Reprovar</button>
                                    </td>
                                </tr>
                            `);
                });
                $(document).off('click', '.approve-button');
                $(document).off('click', '.reject-button');
                $(document).on('click', '.approve-button', function() {
                    actionRequest.call(this, 'Aprovado');
                });
                $(document).on('click', '.reject-button', function() {
                    actionRequest.call(this, 'Reprovado');
                });

                function actionRequest(action) {
                    const requirementId = $(this).data('id');
                    $.ajax({
                        method: 'GET',
                        url: `/api/changeRequirementStatus/${requirementId}?action=${action}`,
                        xhrFields: {
                            withCredentials: true
                        },
                        success: function (data) {
                            successfulOperation(data.success);
                            showRequirements(selectedRequirement);
                            setTimeout(() => $('.box > .is-success').remove(), 3000);
                        },
                        error: function (err) {
                            showError(err.responseJSON.error);
                            setTimeout(() => $('.box > .is-danger').remove(), 3000);
                        }
                    });
                }
            },
            error: function (err) {
                showError(err.responseJSON.error);
            }
        });
    }

    function appendMemberHtml(selector, memberName) {
        const memberHtml = `
            <div class="box is-multiline">
                <p class="has-text-white">${memberName}</p>
                <img src="https://www.habbo.com.br/habbo-imaging/avatarimage?&user=${memberName}&action=std&direction=2&head_direction=2&img_format=png&gesture=sml&frame=1&headonly=0&size=m" alt="Avatar do membro"/>
            </div>
        `;
        $(`#membersList ${selector}`).append(memberHtml);
    }

    function successfulOperation(message) {
        if ($('.box > .is-danger')) $('.box > .is-danger').remove();
        const successMessage = $(`<p>${message}</p>`);
        $('#departmentContent').after($('<div>').addClass('notification is-success').css('margin-top', '20px').append(successMessage));
    }

    function showError(message) {
        if ($('.box > .is-danger')) $('.box > .is-danger').remove();
        const errorMessage = $(`<p>${message}</p>`);
        $('#departmentContent').after($('<div>').addClass('notification is-danger').css('margin-top', '20px').append(errorMessage));
    }
});
