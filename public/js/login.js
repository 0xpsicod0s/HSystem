function validateForm() {
    let inputValid = true;

    $(':input').each(function (index, element) {
        const $element = $(element);
        if (!$element.val() && !$element.hasClass('button')) {
            inputValid = false;
            return false;
        }
    });
    return inputValid;
}

async function loginUser(data) {
    try {
        const csrfToken = document.cookie.split('; ').find(row => row.startsWith('XSRFTOKEN=')).split('=')[1];
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'CSRF-Token': csrfToken
            },
            credentials: 'include',
            body: JSON.stringify(data)
        });

        const responseData = await response.json();

        $('.notification.is-info').remove();

        if (response.ok) {
            const message = $(`
                <div class="notification is-success">
                    ${responseData.success}<br>
                    Aguarde enquanto lhe redirecionamos...
                </div>
            `);
            $('.login-box').append(message);

            setTimeout(() => {
                window.location = '/pages/index.html';
            }, 2000);
        } else {
            throw new Error(responseData.error);
        }
    } catch (error) {
        const message = $(`<p class="help is-danger">${error.message}</p>`);
        $('.login-box').append(message);
    }
}

const form = $('form');
form.on('submit', function (event) {
    console.log('aaa');
    event.preventDefault();
    $('.help').remove();

    if (!validateForm()) {
        const error = $('<p class="help is-danger">Preencha todos os campos!</p>');
        form.append(error);
        return;
    }

    const inputNickname = $('input[name="nickname"]').val().trim();
    const inputPassword = $('input[name="password"').val().trim();
    const dataToBeSent = {
        nickname: inputNickname,
        password: inputPassword
    }

    const loadingMessage = $('<div class="notification is-info">Carregando...</div>');
    $('.login-box').append(loadingMessage);
    loginUser(dataToBeSent);
});
