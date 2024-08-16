$(document).ready(function() {
    const csrfToken = document.cookie.split('; ').find(row => row.startsWith('XSRFTOKEN=')).split('=')[1];
    $.ajax({
        method: 'GET',
        url: '/api/isAdmin',
        xhrFields: {
            withCredentials: true
        },
        headers: {
            'CSRF-Token': csrfToken
        },
        success: function ({ accessGranted }) {
            if (accessGranted) {
                $('.navbar-start').append(`
                    <a class="navbar-item" href="./panel/panel.html">
                        Painel
                    </a>    
                `);
            }
        }
    });
});