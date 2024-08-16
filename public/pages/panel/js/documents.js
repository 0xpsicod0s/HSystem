$(document).ready(function () {
    const csrfToken = document.cookie.split('; ').find(row => row.startsWith('XSRFTOKEN=')).split('=')[1];
    $.ajaxSetup({
        headers: {
            'CSRF-Token': csrfToken
        }
    });
    const fetchDocuments = () => {
        $.ajax({
            method: 'GET',
            url: '/api/panel/getDocuments',
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                console.log(data);
                $('#documents-list').empty();
                data.forEach((doc, index) => {
                    $('#documents-list').append(`
                        <tr>
                            <td data-label="ID">${index}</td>
                            <td data-label="Postador">${doc.applicant}</td>
                            <td data-label="Título">${doc.title}</td>
                            <td data-label="Ações">
                                <button class="button is-small is-info edit-button" data-id="${doc._id}">Editar</button>
                                <button class="button is-small is-danger delete-button" data-id="${doc._id}">Excluir</button>
                            </td>
                        </tr>
                    `);
                });
            },
            error: function (err) {
                showError(err.responseJSON.error);
            }
        });
    }
    fetchDocuments();

    let editor;
    $(document).on('click', '.edit-button', function () {
        const docId = $(this).data('id');

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
            url: `/api/panel/getDocument/${docId}`,
            xhrFields: {
                withCredentials: true
            },
            success: function (doc) {
                $('#edit-document-id').val(doc._id);
                $('#edit-document-title').val(doc.title);
                editor.value = doc.details;
            }
        });

        $('#save-document-btn').off('click').on('click', function () {
            const id = $('#edit-document-id').val();
            const title = $('#edit-document-title').val();
            const content = editor.value;

            if (!title || !content) {
                $('.modal-card-foot').append('<div class="notification is-danger">Preencha todos os campos antes de salvar o documento.</div>');
                return;
            }

            const document = { id, title, content };

            $.ajax({
                method: 'PUT',
                url: `/api/panel/editDocument/${id}`,
                data: JSON.stringify(document),
                contentType: 'application/json; charset=utf-8',
                success: function (data) {
                    $('#edit-document-modal').removeClass('is-active');
                    successfulOperation(data.success);
                    setTimeout(() => $('.is-success').remove(), 3000);
                    fetchDocuments();
                },
                error: function (error) {
                    $('.modal-card-foot').append(`<div class="notification is-danger">${error.responseJSON.error}</div>`);
                }
            });

        });

        $('#edit-document-modal').addClass('is-active');
    });

    $(document).on('click', '.delete-button', function () {
        const docId = $(this).data('id');
        $.ajax({
            method: 'DELETE',
            url: `/api/panel/deleteDocument/${docId}`,
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                successfulOperation(data.success);
                setTimeout(() => $('.is-success').remove(), 3000);
                fetchDocuments();
            },
            error: function (err) {
                showError(err.responseJSON.error);
            }
        });
    });

    $(document).on('click', '.delete, #cancel-edit-btn', function () {
        $('#edit-document-modal').removeClass('is-active');
        if (editor) {
            editor.destruct();
            editor = null;
        }
    });

    $('#new-doc').on('click', function () {
        $('.container').html(`
            <div class="box">
                <h2 class="title has-text-centered has-text-white">Adicionar Novo Documento</h2>
                <div class="field">
                    <label class="label has-text-white">Título do Documento</label>
                    <div class="control">
                        <input class="input" type="text" id="documentTitle" placeholder="Título do Documento">
                    </div>
                </div>
                <div class="field">
                    <label class="label has-text-white">Conteúdo do Documento</label>
                    <div class="control">
                        <div id="editor" class="jodit-wysiwyg"></div>
                    </div>
                </div>
                <div class="field is-grouped">
                    <div class="control">
                        <button class="button is-link" id="addDocument">Adicionar Documento</button>
                    </div>
                    <div class="control">
                        <button class="button is-link is-light" id="cancelDocument">Cancelar</button>
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

        $('#addDocument').on('click', function () {
            const title = $('#documentTitle').val();
            const content = newEditor.getEditorValue();
            if (!title || !content) {
                showError('Preencha todos os campos antes de adicionar o documento.');
                return;
            }

            const document = { title, content };
            $.ajax({
                method: 'POST',
                url: '/api/panel/addDocument',
                xhrFields: {
                    withCredentials: true
                },
                data: JSON.stringify(document),
                contentType: 'application/json; charset=utf-8',
                success: function (data) {
                    successfulOperation(data.success);
                    setTimeout(() => window.location.reload(), 3000);
                },
                error: function () {
                    showError('Erro ao adicionar documento.');
                }
            });
        });

        $('#cancelDocument').on('click', () => window.location.reload())
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