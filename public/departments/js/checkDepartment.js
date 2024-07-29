$(document).ready(function() {
    $.ajax({
        method: "GET",
        url: "/api/departments/getDepartment",
        xhrFields: {
            withCredentials: true
        },
        success: function (data) {
            if (!data.length) window.location.href = '/pages/departments.html';
            const currentDepartment = $('input[type="hidden"]').val();
            let accessGranted = false;

            data.forEach(({ name: departmentName }) => departmentName === currentDepartment ? accessGranted = true : accessGranted = accessGranted);
            
            if (!accessGranted) window.location.href = '/pages/departments.html';

            $.ajax({
                method: "GET",
                url: `/api/departments/isLeader?currentDepartment=${currentDepartment}`,
                xhrFields: {
                    withCredentials: true
                },
                success: function (data) {
                    if (data.accessGranted) {
                        $('.column.is-two-thirds').after(`
                            <div class="column is-one-third">
                                <aside class="menu">
                                    <h2 class="title has-text-white">Liderança</h2>
                                    <ul class="menu-list">
                                        <li><a href="./class_registration.html" id="registerLessons">Registro de aulas</a></li>
                                        <li><a href="./gestao_membros.html" id="controlMembers">Controle de membros</a></li>
                                        <li><a href="./add_document.html" id="editDocument">Adicionar documento</a></li>
                                        <li><a href="./add_script.html" id="addScript">Adicionar script de aula</a></li>
                                    </ul>
                                </aside>
                            </div>
                        `);
                    }
                },
                error: function (data) {
                    if (!data.responseJSON.accessGranted) $('.columns').addClass('is-centered');
                }
            });
        },
        error: function (data) {
            if (data.status === 403 || data.status === 404) {
                window.location.href = '/pages/departments.html';
            }
        }
    });
});
