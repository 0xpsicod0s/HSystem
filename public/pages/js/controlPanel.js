$(document).ready(function() {
    $.ajax({
        method: 'GET',
        url: '/api/isAdmin',
        xhrFields: {
            withCredentials: true
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