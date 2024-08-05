$(document).ready(function () {
    const fetchPublications = () => {
        $.ajax({
            method: 'GET',
            url: '/api/panel/getPublications',
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                $('#publication-list').empty();
                data.forEach((pub, index) => {
                    $('#publication-list').append(`
                        <tr>
                            <td data-label="ID">${index}</td>
                            <td data-label="Postador">${pub.applicant}</td>
                            <td data-label="Título">${pub.title}</td>
                            <td data-label="Ações">
                                <button class="button is-small is-info edit-button" data-id="${pub._id}">Editar</button>
                                <button class="button is-small is-danger delete-button" data-id="${pub._id}">Excluir</button>
                            </td>
                        </tr>
                    `);
                });
            },
            error: function () {
                showError('Erro ao procurar por publicações.');
            }
        });
    }
    fetchPublications();

    let editor;
    $(document).on('click', '.edit-button', function () {
        const pubId = $(this).data('id');

        if (editor) editor.destruct();
        editor = new Jodit('#edit-editor', {
            toolbar: true,
            height: 400,
            uploader: {
                insertImageAsBase64URI: true
            },
            buttons: [
                'source', '|', 'bold', 'italic', 'underline', 'strikethrough', '|', 'ul', 'ol', '|',
                'align', 'undo', 'redo',
                '|', 'image', 'video', 'link', 'symbol', '|', 'clean', 'fullsize', 'print'
            ],
            language: 'pt_BR'
        });

        $.ajax({
            method: 'GET',
            url: `/api/panel/getPublication/${pubId}`,
            xhrFields: {
                withCredentials: true
            },
            success: function (pub) {
                $('#edit-publication-id').val(pub._id);
                $('#edit-publication-title').val(pub.title);
                editor.value = pub.details;
            }
        });

        $('#save-publication-btn').off('click').on('click', function () {
            const id = $('#edit-publication-id').val();
            const title = $('#edit-publication-title').val();
            const content = editor.value;

            if (!title || !content) {
                $('.modal-card-foot').append('<div class="notification is-danger">Preencha todos os campos antes de salvar a publicação.</div>');
                return;
            }

            const publication = { id, title, content };

            $.ajax({
                method: 'PUT',
                url: `/api/panel/editPublication/${id}`,
                data: JSON.stringify(publication),
                contentType: 'application/json; charset=utf-8',
                success: function (data) {
                    $('#edit-publication-modal').removeClass('is-active');
                    successfulOperation(data.success);
                    setTimeout(() => $('.is-success').remove(), 3000);
                    fetchPublications();
                },
                error: function (error) {
                    $('.modal-card-foot').append(`<div class="notification is-danger">${error.responseJSON.error}</div>`);
                }
            });

        });

        $('#edit-publication-modal').addClass('is-active');
    });

    $(document).on('click', '.delete-button', function () {
        const pubId = $(this).data('id');
        $.ajax({
            method: 'DELETE',
            url: `/api/panel/deletePublication/${pubId}`,
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                successfulOperation(data.success);
                setTimeout(() => $('.is-success').remove(), 3000);
                fetchPublications();
            },
            error: function (err) {
                showError(err.responseJSON.error);
            }
        });
    });

    $(document).on('click', '.delete, #cancel-edit-btn', function () {
        $('#edit-publication-modal').removeClass('is-active');
        if (editor) {
            editor.destruct();
            editor = null;
        }
    });

    $('#new-pub').on('click', function () {
        $('.container').html(`
            <div class="box">
                <h2 class="title has-text-centered has-text-white">Adicionar Nova Publicação</h2>
                <div class="field">
                    <label class="label has-text-white">Título da Publicação</label>
                    <div class="control">
                        <input class="input" type="text" id="publicationTitle" placeholder="Título da Publicação">
                    </div>
                </div>
                <div class="field">
                    <label class="label has-text-white">Conteúdo da Publicação</label>
                    <div class="control">
                        <div id="editor" class="jodit-wysiwyg"></div>
                    </div>
                </div>
                <div class="field is-grouped">
                    <div class="control">
                        <button class="button is-link" id="addPublication">Adicionar Publicação</button>
                    </div>
                    <div class="control">
                        <button class="button is-link is-light" id="cancelPublication">Cancelar</button>
                    </div>
                </div>
            </div>    
        `);

        const newEditor = new Jodit('#editor', {
            toolbar: true,
            height: 400,
            uploader: {
                insertImageAsBase64URI: true
            },
            buttons: [
                'source', '|', 'bold', 'italic', 'underline', 'strikethrough', '|', 'ul', 'ol', '|',
                'align', 'undo', 'redo',
                '|', 'image', 'video', 'link', 'symbol', '|', 'clean', 'fullsize', 'print'
            ],
            language: 'pt_BR'
        });

        $('#addPublication').on('click', function () {
            const title = $('#publicationTitle').val();
            const content = newEditor.getEditorValue();
            if (!title || !content) {
                showError('Preencha todos os campos antes de adicionar a publicação.');
                return;
            }

            const publication = { title, content };
            $.ajax({
                method: 'POST',
                url: '/api/panel/publications',
                xhrFields: {
                    withCredentials: true
                },
                data: JSON.stringify(publication),
                contentType: 'application/json; charset=utf-8',
                success: function (data) {
                    successfulOperation(data.success);
                    setTimeout(() => window.location.reload(), 3000);
                },
                error: function () {
                    showError('Erro ao adicionar publicação.');
                }
            });
        });

        $('#cancelPublication').on('click', () => window.location.reload())
    });

    function showError(message) {
        if ($('.box .is-danger')) $('.box .is-danger').remove();
        $('.box').append(`<div class="notification is-danger">${message}</div>`);
    }

    function successfulOperation(message) {
        if ($('.box .is-danger')) $('.box .is-danger').remove();
        $('.box').append(`<div class="notification is-success">${message}</div>`);
    }
});