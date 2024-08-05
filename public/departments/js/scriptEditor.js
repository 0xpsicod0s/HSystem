$(document).ready(function () {
    const editor = new Jodit('#editor', {
        toolbar: true,
        height: 400,
        uploader: {
            insertImageAsBase64URI: true
        },
        buttons: [
            'source', 'bold', 'italic', 'underline', '|', 'align', 'ul', 'ol', '|', 'link', 'image', '|', 'undo', 'redo'
        ],
        language: 'pt_BR'
    });

    $('#saveDocument').on('click', function () {
        const dataToSend = ['adiciona_aula'];
        const departmentName = $('#departmentName').val();
        const className = $('#documentTitle').val();
        const classContent = editor.getEditorValue();
        dataToSend.push({ departmentName, className, classContent });
        $.ajax({
            method: 'POST',
            url: '/api/departments/requirements',
            xhrFields: {
                withCredentials: true
            },
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(dataToSend),
            success: function (data) {
                successfulOperation('Aula adicionada com sucesso!');
                setTimeout(() => window.location.reload(), 2000);
            },
            error: function (data) {
                showError(data.responseJSON.error);
            }
        });
    });

    $('#cancelDocument').on('click', () => window.history.back());
});

function successfulOperation(message) {
    if ($('.box .is-danger')) $('.box .is-danger').remove();
    const successMessage = $(`<p>${message}</p>`);
    $('.box').after($('<div>').addClass('notification is-success').css('margin-top', '20px').append(successMessage));
}

function showError(message) {
    if ($('.box .is-danger')) $('.box .is-danger').remove();
    const errorMessage = $(`<p>${message}</p>`);
    $('.box').after($('<div>').addClass('notification is-danger').css('margin-top', '20px').append(errorMessage));
}
