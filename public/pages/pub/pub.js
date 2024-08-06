$(document).ready(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const link = urlParams.get('link');
    
    if (link) {
        $.ajax({
            method: 'GET',
            url: `/api/pub/${link}`,
            xhrFields: {
                withCredentials: true
            },
            success: function(pub) {
                $('#publication-title').text(pub.title);
                const formattedDate = new Date(pub.date).toLocaleDateString('pt-BR');
                $('#publication-date').text(formattedDate);
                $('#publication-details').html(pub.content);
            },
            error: function(err) {
                $('.main-box').html(`<div class="notification is-danger">${err.responseJSON.error}</div>`);
            }
        });
    } else {
        $('.main-box').html('<div class="notification is-danger">Nenhuma publicação especificada.</div>');
    }
});