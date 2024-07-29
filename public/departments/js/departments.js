$(document).ready(function () {
    $.ajaxSetup({
        method: 'POST',
        url: '/api/departments/requirements',
        xhrFields: {
            withCredentials: true
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
                break;

            case 'aulas':
                contentHtml = `
                    <div class="field">
                        <label class="label has-text-white">Aulas</label>
                        <div id="lessonsList" class="content has-text-white">
                            <!-- Aulas serão carregadas aqui -->
                        </div>
                    </div>
                `;
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
                break;

            default:
                contentHtml = '';
        }

        $('#departmentContent').html(contentHtml);

        if (selectedOption === 'documentos') loadDocuments();
        if (selectedOption === 'postagem_de_aula') classPost(selectedOption);
        if (selectedOption === 'membros') loadMembers();
        if (selectedOption === 'aulas') loadLessons();
    });

    function loadDocuments() {
        const departmentName = $('input[type="hidden"]').val();
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
                    $(element).on('click', function() {
                        const documentName = $(element.previousElementSibling).text();
                        const { data: findDocument } = data.find(({ data }) => data.title === documentName);
                        if (!findDocument) showError('Documento nao encontrado');
                        const documentContentHtml = `
                            <div class="box">
                                <div class="content has-text-white">
                                    ${findDocument.content}
                                </div>
                            </div>
                        `
                        $('#documentsList').html(documentContentHtml);
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
                    $(element).on('click', function() {
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
        if ($('.box .is-danger')) $('.box .is-danger').remove();
        const successMessage = $(`<p>${message}</p>`);
        $('#departmentContent').after($('<div>').addClass('notification is-success').css('margin-top', '20px').append(successMessage));
    }

    function showError(message) {
        if ($('.box .is-danger')) $('.box .is-danger').remove();
        const errorMessage = $(`<p>${message}</p>`);
        $('#departmentContent').after($('<div>').addClass('notification is-danger').css('margin-top', '20px').append(errorMessage));
    }
});
