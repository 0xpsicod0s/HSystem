$(document).ready(function () {
    let currentPage = 1;
    let searchTerm = '';
    const limit = 10;

    const fetchUsers = (page, searchTerm = '') => {
        $.ajax({
            method: 'GET',
            url: `/api/panel/getUsers?page=${page}&limit=${limit}&search=${encodeURIComponent(searchTerm)}`,
            xhrFields: {
                withCredentials: true
            },
            success: function (response) {
                const users = response.users;
                const totalPages = response.totalPages;

                $('#user-list').empty();
                users.forEach((user, index) => {
                    $('#user-list').append(`
                        <tr>
                            <td>${index + 1 + (page - 1) * limit}</td>
                            <td>${user.nickname}</td>
                            <td>${user.email}</td>
                            <td>${user.role}</td>
                            <td>
                                <button class="button is-small is-info edit-button" data-id="${user._id}">Editar</button>
                                <button class="button is-small is-danger delete-button" data-id="${user._id}">Excluir</button>
                            </td>
                        </tr>
                    `);
                });

                $('#prev-page').toggleClass('is-disabled', page <= 1);
                $('#next-page').toggleClass('is-disabled', page >= totalPages);
                currentPage = page;
            }
        });
    }

    fetchUsers(currentPage);

    $('#prev-page').click(function () {
        if (currentPage > 1) {
            fetchUsers(currentPage - 1);
        }
    });

    $('#next-page').click(function () {
        fetchUsers(currentPage + 1);
    });

    $('#search-btn').click(function () {
        searchTerm = $('#search-input').val().trim();
        fetchUsers(1, searchTerm);
    });

    $(document).on('click', '.edit-button', function () {
        const user = $(this).parent().parent().children();
        const userId = $(this).data('id');
        const nickname = $(user[1]).text();
        const email = $(user[2]).text();
        const role = $(user[3]).text();

        $('#edit-user-id').val(userId);
        $('#edit-user-nickname').val(nickname);
        $('#edit-user-email').val(email);
        $('#edit-user-role').val(role);

        $('#edit-user-modal').addClass('is-active');
    });

    $(document).on('click', '.delete, #cancel-edit-btn', function () {
        $('#edit-user-modal').removeClass('is-active');
    });

    $('#save-user-btn').click(function () {
        const userId = $('#edit-user-id').val();
        const nickname = $('#edit-user-nickname').val();
        const email = $('#edit-user-email').val();
        const role = $('#edit-user-role').val();
        const permission = $('#edit-user-role-select').val();

        $.ajax({
            method: 'PUT',
            url: `/api/panel/editUser/${userId}`,
            xhrFields: {
                withCredentials: true
            },
            data: JSON.stringify({ nickname, email, role, permission }),
            contentType: 'application/json',
            success: function (data) {
                $('#edit-user-modal').removeClass('is-active');
                $('.container').append(`<div id="userUpdated" class="notification is-success">${data.success}</div>`);
                setTimeout(() => $('#userUpdated').remove(), 3000);
                fetchUsers(currentPage);
            },
            error: function (err) {
                $('.modal-card-foot').append(`<div id="errorUpdating" class="notification is-danger">${err.responseJSON.error}</div>`);
                setTimeout(() => $('#errorUpdating').remove(), 3000);
            }
        });
    });

    $(document).on('click', '.delete-button', function () {
        const userId = $(this).data('id');
        if (confirm('Tem certeza que deseja excluir este usuário?')) {
            $.ajax({
                method: 'DELETE',
                url: `/api/panel/deleteUser/${userId}`,
                xhrFields: {
                    withCredentials: true
                },
                success: function (data) {
                    $('.container').append(`<div id="userDeleted" class="notification is-success">${data.success}</div>`);
                    setTimeout(() => $('#userDeleted').remove(), 3000);
                    fetchUsers(currentPage);
                },
                error: function (err) {
                    $('.container').append(`<div id="errorDeleting" class="notification is-danger">${err.responseJSON.err}</div>`);
                    setTimeout(() => $('#errorDeleting').remove(), 3000);
                    alert(`Erro ao excluir usuário: ${err.responseJSON.error}`);
                }
            });
        }
    });
});