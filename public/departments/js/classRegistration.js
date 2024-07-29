$(document).ready(function () {
    const departmentName = $('input[type="hidden"]').val();
    $.ajax({
        method: 'GET',
        url: `/api/departments/getClassPosting?departmentName=${departmentName}`,
        xhrFields: {
            withCredentials: true
        },
        success: function (data) {
            data.forEach(({ data: classInformation, classInstructor }) => {
                $('#classListBody').append(`
                    <tr>
                        <td>${classInstructor.nickname}</td>
                        <td>${classInformation.militaryNickname}</td>
                        <td>${classInformation.typeOfClass}</td>
                        <td>Pendente</td>
                    </tr>
                `);
            });
        },
        error: function (data) {
            if (data.status === 400 ||
                data.status === 403 ||
                data.status === 404) {
                showError(data.responseJSON.error);
            }
        }
    });

    $('#return').on('click', () => window.history.back());

    function showError(message) {
        if ($('.is-danger')) $('.is-danger').remove();
        const errorMessage = $(`<p>${message}</p>`);
        $($('.box')[0]).after($('<div>').addClass('notification is-danger').css('margin-top', '20px').append(errorMessage));
    }
});