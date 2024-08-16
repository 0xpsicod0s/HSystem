$(document).ready(function() {
    const csrfToken = document.cookie.split('; ').find(row => row.startsWith('XSRFTOKEN=')).split('=')[1];
    $.ajaxSetup({
        headers: {
            'CSRF-Token': csrfToken
        }
    });

    $.ajax({
        method: 'GET',
        url: '/api/user/profile',
        xhrFields: {
            withCredentials: true
        },
        success: function(data) {
            $('.image').append(`<img src='https://www.habbo.com.br/habbo-imaging/avatarimage?&user=${data.user.nickname}&action=std&direction=2&head_direction=2&img_format=png&gesture=sml&frame=1&headonly=0&size=m' alt='avatar'/>`);
            $('#user-nickname').text(data.user.nickname);
            $('#user-role').text(`Patente: ${data.user.role}`);
            $('#user-status').text(`Status: ${data.user.state}`);
            $('#user-createdAt').text(`Data de Criação: ${new Date(data.user.createdAt).toLocaleDateString('pt-BR')}`);

            if (data.courses.length === 0) {
                $('#approvedCourses').empty();
                $('#approvedCourses').append('<div class="has-text-white"><p>Você não foi aprovado em nenhum curso</p></div>');
            }
            data.courses.forEach(({ data: { typeOfClass } }) => {
                $('#approvedCourses').append(`<div class="course has-text-white"><p>${typeOfClass}</p></div>`);
            });

            if (data.user.department.length === 0) {
                $('#departments-participants').append(`<div class="department has-text-white"><p>Você não participa de nenhum departamento</p></div>`);
            }
            data.user.department.forEach(({ department }) => {
                $('#departments-participants').append(`<div class="department has-text-white"><p>${department}</p></div>`);
            });
        },
        error: function(data) {
            $('.is-centered').html(`<div class="notification is-danger">${data.responseJSON.error}</div>`);
        }
    });

    $('#resetForm').on('submit', function(e) {
        e.preventDefault();
        const newPassword = $('input[type="password"]').val();

        $.ajax({
            method: 'POST',
            url: '/api/user/reset',
            xhrFields: {
                withCredentials: true
            },
            data: JSON.stringify({ password: newPassword }),
            contentType: 'application/json; charset=utf-8',
            success: function(data) {
                $($('#resetForm').parent()).append(`<div class="notification is-success" style="margin-top: 20px;">${data.success}</div>`);
                setTimeout(() => window.location.reload(), 2000);
            },
            error: function(data) {
                $($('#resetForm').parent()).append(`<div class="notification is-danger" style="margin-top: 20px;">${data.responseJSON.error}</div>`)
            }
        });
    });
});
