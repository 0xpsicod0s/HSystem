function clearPreviousResults() {
    const nextElement = $($('.field')[0].nextElementSibling);
    if (nextElement.hasClass('profile-summary') || nextElement.hasClass('notification')) {
        nextElement.remove();
    }
}

function showUserProfile(data) {
    const htmlString = $(`
        <img src="https://www.habbo.com.br/habbo-imaging/avatarimage?&user=${data.nickname}&action=std&direction=2&head_direction=2&img_format=png&gesture=sml&frame=1&headonly=0&size=m" alt="Foto do usuário" class="profile-picture">
        <div>
            <p><strong>Nick:</strong> ${data.nickname}</p>
            <p><strong>Patente:</strong> ${data.role}</p>
            <p><strong>Status:</strong> ${data.state}</p>
            <p><strong>Admissão:</strong> ${new Date(data.createdAt).toLocaleDateString()}</p>
        </div>
    `);
    $('.field').after($('<div>').addClass('profile-summary').append(htmlString));
}

function showError(message) {
    if ($('.profile-summary')) $('.profile-summary').remove();
    if ($('.is-danger')) $('.is-danger').remove();
    const errorMessage = $(`<p>${message}</p>`);
    $('.field').after($('<div>').addClass('notification is-danger').append(errorMessage));
}

$(document).ready(function () {

    $.ajax({
        method: 'GET',
        url: '/api/panel/getPublications',
        xhrFields: {
            withCredentials: true
        },
        success: function (pubs) {
            pubs.forEach(pub => {
                const formattedDate = new Date(pub.date).toLocaleDateString('pt-BR');
                $('#publications-area > p').after(`
                    <div class="publication">
                        <p style="color: #ecf0f1;">
                            <strong style="color: #251D1C;">${pub.applicant}</strong>
                            <small>${formattedDate}</small>
                            <br>
                            ${pub.title} | <a href='/pages/pub/publication.html?link=${pub.link}'>Ler</a>
                        </p>
                    </div>
                `);
            });
        }
    });

    $.ajax({
        method: 'GET',
        url: '/api/panel/getDocuments',
        xhrFields: {
            withCredentials: true
        },
        success: function (docs) {
            docs.forEach(doc => {
                const formattedDate = new Date(doc.date).toLocaleDateString('pt-BR');
                $('#documents-area > p').after(`
                    <div class="document has-text-white">
                        <p>${doc.title} | ${formattedDate}</p>
                        <a href="/pages/doc/document.html?link=${doc.link}">Ler</a>
                    </div>
                `);
            });
        }
    });

    $('#logout').on('click', function () {
        $.ajax({
            method: 'GET',
            url: '/api/auth/logout',
            xhrFields: {
                withCredentials: true
            }
        });
    });
    
    $('.search').on('click', function (event) {
        const searchUser = $(event.target.previousElementSibling).val().trim();
        if (!searchUser) {
            showError('Por favor, insira um nome de usuário');
            return;
        }
    
        $.ajax({
            method: 'GET',
            url: `/api/search?user=${searchUser}`,
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                clearPreviousResults();
                showUserProfile(data);
            },
            error: function (data) {
                clearPreviousResults();
                const response = $(document.createTextNode(data.responseJSON.error));
                $('.field').after($(document.createElement('div')).addClass('notification is-danger'));
                $('.notification').append(response);
            }
        });
    });
});

