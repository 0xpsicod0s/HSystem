$(document).ready(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const nickname = urlParams.get('nick');
    if (nickname) {
        $.ajax({
            method: 'GET',
            url: `/api/user/${nickname}`,
            xhrFields: {
                withCredentials: true
            },
            success: function(data) {
                $('.image').append(`<img src="https://www.habbo.com.br/habbo-imaging/avatarimage?&user=${data.user.nickname}&action=std&direction=2&head_direction=2&img_format=png&gesture=sml&frame=1&headonly=0&size=m" alt="Avatar" style="max-width: 100%; height: auto;">`);
                $('#user-nickname').text(data.user.nickname);
                $('#user-role').text('Patente: ' + data.user.role);
                $('#user-status').text('Status: ' + data.user.state);
                const formattedDate = new Date(data.user.createdAt).toLocaleDateString('pt-BR');
                $('#user-createdAt').text('Data de Criação: ' + formattedDate);

                if (data.courses.length === 0) {
                    $('#approvedCourses').empty();
                    $('#approvedCourses').append('<div class="has-text-white"><p>Este militar não foi aprovado em nenhum curso</p></div>');
                } else {
                    $('#approvedCourses').empty();
                    data.courses.forEach(({ data: { course } }) => {
                        $('#approvedCourses').append(`<div class="course has-text-white"><p>${course}</p></div>`);
                    });
                }

                if (data.user.department.length === 0) {
                    $('#departments-participants').empty();
                    $('#departments-participants').append(`<div class="department has-text-white"><p>Este militar não participa de nenhum departamento</p></div>`);
                } else {
                    $('#departments-participants').empty();
                    data.user.department.forEach(({ department }) => {
                        $('#departments-participants').append(`<div class="department has-text-white"><p>${department}</p></div>`);
                    });
                }
            },
            error: function(err) {
                $('.main-box').html(`<div class="notification is-danger">${err.responseJSON.error}</div>`);
            }
        });
    } else {
        $('.main-box').html('<div class="notification is-danger">Nenhum usuário especificado.</div>');
    }
});