$.ajax({
    method: 'GET',
    url: `/api/departmentParticipant`,
    xhrFields: {
        withCredentials: true
    },
    success: function (data) {
        if (!data.length) return;
        data.forEach(function({ name, img, pathname }) {
            $('.main-box .columns').append(
                $('<div>').addClass('column is-one-quarter has-text-centered').append(
                    $('<a>').attr('href', `${pathname}`).addClass('department-icon').append(
                        $('<img>').attr('src', `${img}`).css({ 'max-width': '100%', 'height': 'auto' })
                    )
                ).append(
                    $('<p>').addClass('has-text-white').text(`${name}`)
                )
            );
        });
    },
    error: function (data) {
        if (data.status === 404) {
            $('.main-box .columns').append('<div>').addClass('column is-full has-text-centered')
                .append('<p>').addClass('has-text-white').text(data.responseJSON.error);
        }
    }
})