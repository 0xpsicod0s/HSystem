$(document).ready(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const link = urlParams.get('link');
    const csrfToken = document.cookie.split('; ').find(row => row.startsWith('XSRFTOKEN=')).split('=')[1];
    $.ajaxSetup({
        headers: {
            'CSRF-Token': csrfToken
        }
    });
    
    if (link) {
        $.ajax({
            method: 'GET',
            url: `/api/doc/${link}`,
            xhrFields: {
                withCredentials: true
            },
            success: function(doc) {
                $('#document-title').text(doc.title);
                const formattedDate = new Date(doc.date).toLocaleDateString('pt-BR');
                $('#document-date').text(formattedDate);
                $('#document-details').html(doc.content);
            },
            error: function(err) {
                $('.main-box').html(`<div class="notification is-danger">${err.responseJSON.error}</div>`);
            }
        });
    } else {
        $('.main-box').html('<div class="notification is-danger">Nenhum documento especificado.</div>');
    }
});