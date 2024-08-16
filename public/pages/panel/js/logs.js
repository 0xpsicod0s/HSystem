$(document).ready(function () {
    const csrfToken = document.cookie.split('; ').find(row => row.startsWith('XSRFTOKEN=')).split('=')[1];
    $.ajaxSetup({
        headers: {
            'CSRF-Token': csrfToken
        }
    });
    $.ajax({
        method: 'GET',
        url: '/api/logs',
        xhrFields: {
            withCredentials: true
        },
        success: function (logs) {
            renderLogs(logs);
            setupSearch(logs);
        }
    });

    function renderLogs(logs) {
        const logsContainer = $('.logs');
        logsContainer.empty();
        logs.forEach(log => {
            const formattedDate = new Date(log.timestamp).toLocaleString('pt-BR');
            logsContainer.append(`
                <p class="has-text-white">
                    Data: ${formattedDate}<br>
                    Nick: ${log.user}<br>
                    Ação: ${log.action}<br>
                    ${log.details}<br>
                    Endereço IP: ${log.ipAddress}<br>
                    User-Agent: ${log.userAgent}
                </p>
            `);
        });
    }

    function setupSearch(logs) {
        $('#search').on('input', function () {
            const searchTerm = $(this).val().trim().toLowerCase();
            const filteredLogs = logs.filter(log => {
                return (
                    log.user.toLowerCase().includes(searchTerm) ||
                    log.action.toLowerCase().includes(searchTerm) ||
                    log.details.toLowerCase().includes(searchTerm) ||
                    new Date(log.timestamp).toLocaleString('pt-BR').toLowerCase().includes(searchTerm)
                );
            });
            renderLogs(filteredLogs);
        });
    }
});