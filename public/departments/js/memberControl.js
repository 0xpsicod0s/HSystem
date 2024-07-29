$(document).ready(function () {
    const departmentName = $('input[type="hidden"]').val();
    $.ajaxSetup({
        method: 'POST',
        url: '/api/departments/requirements',
        xhrFields: {
            withCredentials: true
        },
        contentType: 'application/json; charset=utf-8'
    });

    $.ajax({
        method: 'GET',
        url: `/api/departments/getMembers?departmentName=${departmentName}`,
        success: function (data) {
            data.forEach(member => {
                for (const nickname in member) {
                    if (!member[nickname]) continue;
                    switch (nickname) {
                        case 'lider':
                            $('.columns:last').append(appendMemberHtml(member[nickname], 'Líder'));
                            break;
                        case 'viceLider':
                            $('.columns:last').append(appendMemberHtml(member[nickname], 'Vice-Líder'));
                            break;
                        case 'instrutores':
                            member[nickname].forEach(nick => {
                                $('.columns:last').append(appendMemberHtml(nick, 'Instrutor'));
                            });
                            break;
                        case 'membros':
                            member[nickname].forEach(nick => {
                                $('.columns:last').append(appendMemberHtml(nick, 'Membro'));
                            });
                            break;
                    }
                }
            });
        },
        error: function (data) {
            showError(data.responseJSON.error);
        }
    });

    function appendMemberHtml(nickname, position) {
        return `
            <div class="column is-one-third">
                <div class="box member-box">
                    <h2 class="subtitle has-text-white">${nickname}</h2>
                    <div class="content">
                        <p class="has-text-white">Cargo: ${position}</p>
                        <div class="buttons">
                            <button class="button is-warning edit-role-btn">Editar Cargo</button>
                            <button class="button is-danger delete-member-btn">Excluir</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    $('.columns').on('click', '.edit-role-btn', function () {
        const memberBox = $(this).closest('.member-box');
        const memberName = memberBox.find('h2').text();
        const buttonsDiv = memberBox.find('.buttons');

        buttonsDiv.html(`
            <p>Digite o novo cargo para ${memberName}:</p>
            <input class="input new-role-input" type="text" placeholder="Novo cargo">
            <button class="button is-success confirm-edit-role-btn">Salvar</button>
            <button class="button is-warning cancel-edit-role-btn">Cancelar</button>
        `);
    });

    let isRequesting = false;

    $('.columns').on('click', '.confirm-edit-role-btn', function () {
        if (isRequesting) return;
        isRequesting = true;

        const memberBox = $(this).closest('.member-box');
        const memberName = memberBox.find('h2').text();
        const newRole = memberBox.find('.new-role-input').val();

        if (newRole) {
            $.ajax({
                url: `/api/departments/editMember`,
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ departmentName, memberName, newRole }),
                success: function (data) {
                    isRequesting = false;  
                    successfulOperation(data.success);
                    setTimeout(() => window.location.reload(), 2000);
                },
                error: function (data) {
                    isRequesting = false;  
                    showError(data.responseJSON.error);
                    setTimeout(() => window.location.reload(), 2000);
                }
            });
        } else {
            isRequesting = false;  
        }
    });

    $('.columns').on('click', '.cancel-edit-role-btn', function () {
        const memberBox = $(this).closest('.member-box');
        const buttonsDiv = memberBox.find('.buttons');

        buttonsDiv.html(`
            <button class="button is-warning edit-role-btn">Editar Cargo</button>
            <button class="button is-danger delete-member-btn">Excluir</button>
        `);
    });

    $('.columns').on('click', '.delete-member-btn', function () {
        const memberBox = $(this).closest('.member-box');
        const memberName = memberBox.find('h2').text();
        const buttonsDiv = memberBox.find('.buttons');

        buttonsDiv.html(`
            <p>Tem certeza que deseja excluir ${memberName}?</p>
            <button class="button is-danger confirm-delete-member-btn">Excluir</button>
            <button class="button is-warning cancel-delete-member-btn">Cancelar</button>
        `);
    });

    $('.columns').on('click', '.confirm-delete-member-btn', function () {
        const memberBox = $(this).closest('.member-box');
        const memberName = memberBox.find('h2').text();
        const dataToBeSend = { departmentName, memberName };

        if (isRequesting) return;
        isRequesting = true; 

        $.ajax({
            url: `/api/departments/removeMember`,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(dataToBeSend),
            success: function (data) {
                isRequesting = false;  
                successfulOperation(data.success);
                setTimeout(() => window.location.reload(), 2000);
                memberBox.closest('.column').remove();
            },
            error: function (data) {
                isRequesting = false;
                showError(data.responseJSON.error);
                setTimeout(() => window.location.reload(), 2000);
            }
        });
    });

    $('.columns').on('click', '.cancel-delete-member-btn', function () {
        const memberBox = $(this).closest('.member-box');
        const buttonsDiv = memberBox.find('.buttons');

        buttonsDiv.html(`
            <button class="button is-warning edit-role-btn">Editar Cargo</button>
            <button class="button is-danger delete-member-btn">Excluir</button>
        `);
    });

    $('#addMemberBtn').on('click', function () {
        $(this).after('<button class="button is-primary box is-pulled-right" id="return">Voltar</button>')
        $(this).remove();
        $('.main-box').html(`
            <h1 class="title has-text-centered has-text-white">Adicionar Membro</h1>
            <div class="field">
                <label class="label has-text-white">Nickname do Militar</label>
                <div class="control">
                    <input class="input" type="text" placeholder="Nickname do Militar">
                </div>
            </div>
            <div class="field">
                <label class="label has-text-white">Cargo</label>
                <div class="control">
                    <div class="select is-fullwidth">
                        <select>
                            <option value="" disabled selected>Selecione um cargo</option>
                            <option value="Lider">Lider</option>
                            <option value="Vice-Lider">Vice Lider</option>
                            <option value="Instrutor">Instrutor</option>
                            <option value="Membro">Membro</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="field">
                <div class="control">
                    <button class="button is-primary is-fullwidth" id="toSave">Salvar</button>
                </div>
            </div>
        `);
        $('#return').on('click', () => window.location.reload());

        $('#toSave').on('click', function () {
            const dataToSend = ['adiciona_membro'];
            $('.field .control').each(function (index, element) {
                const inputElement = $($(element)[0].firstElementChild);
                if (inputElement.hasClass('button')) return;
                if (inputElement.hasClass('select')) {
                    dataToSend.push({ inputValue: $($(inputElement)[0].firstElementChild).val() });
                    return;
                }
                const inputValue = inputElement.val();
                dataToSend.push({ inputValue });
            });

            if (isRequesting) return;
            isRequesting = true; 

            $.ajax({
                data: JSON.stringify(dataToSend),
                success: function (data) {
                    isRequesting = false;
                    successfulOperation(data.success);
                    setTimeout(() => window.location.reload(), 2000);
                },
                error: function (data) {
                    isRequesting = false;
                    showError(data.responseJSON.error);
                    setTimeout(() => window.location.reload(), 2000);
                }
            });
        });
    });

    function successfulOperation(message) {
        if ($('.column .is-danger')) $('.column .is-danger').remove();
        const successMessage = $(`<p>${message}</p>`);
        $('.main-box').after($('<div>').addClass('notification is-success').css('margin-top', '20px').append(successMessage));
    }

    function showError(message) {
        if ($('.column .is-danger')) $('.column .is-danger').remove();
        const errorMessage = $(`<p>${message}</p>`);
        $('.main-box').after($('<div>').addClass('notification is-danger').css('margin-top', '20px').append(errorMessage));
    }
});
