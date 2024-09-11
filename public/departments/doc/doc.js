$(document).ready(function () {
    const urlParams = new URLSearchParams(window.location.search);
    const departmentName = decodeURIComponent(urlParams.get('departmentName'));
    const documentName = decodeURIComponent(urlParams.get('documentName'));
    const csrfToken = document.cookie.split('; ').find(row => row.startsWith('XSRFTOKEN=')).split('=')[1];
    $.ajaxSetup({
        headers: {
            'CSRF-Token': csrfToken
        }
    });

    if (departmentName) {
        $.ajax({
            method: 'GET',
            url: `/api/departments/getDocuments?departmentName=${departmentName}`,
            xhrFields: {
                withCredentials: true
            },
            success: function (doc) {
                console.log(doc);
                const { data: findDocument } = doc.find(({ data }) => data.title === documentName);
                if (!findDocument) showError('Documento nao encontrado');
                $('#document-title').text(findDocument.title);
                $('#document-details').html(findDocument.content);
            },
            error: function (err) {
                $('.main-box').html(`<div class="notification is-danger">${err.responseJSON.error}</div>`);
            }
        });
    } else {
        $('.main-box').html('<div class="notification is-danger">Nenhum documento especificado.</div>');
    }
});