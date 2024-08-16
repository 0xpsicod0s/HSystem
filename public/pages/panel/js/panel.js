$(document).ready(function() {
    const csrfToken = document.cookie.split('; ').find(row => row.startsWith('XSRFTOKEN=')).split('=')[1];
    $.ajaxSetup({
        headers: {
            'CSRF-Token': csrfToken
        }
    });
    $.ajax({
        method: 'GET',
        url: '/api/panel/usersActive',
        xhrFields: {
            withCredentials: true
        },
        success: function (data) {
            $('#users-active').text(`Usuários ativos: ${data.usersActive}`);
        },
        error: () => $('#users-active').text('Não foi possível pesquisar por usuários ativos')
    });

    $.ajax({
        method: 'GET',
        url: '/api/logs',
        xhrFields: {
            withCredentials: true
        },
        success: function (logs) {
            for (let i = 0; i < 5; i++) {
                const log = logs[i];
                const formattedDate = new Date(log.timestamp).toLocaleDateString('pt-BR');
                $('.logs').append(`<p class="has-text-white">${formattedDate} - ${log.user} - ${log.action} - ${log.details}</p>`);
            }
        },
        error: () => $('.logs').append('<p class=has-text-white">Não foi possivel pesquisar por logs</p>')
    });
});