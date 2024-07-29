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

async function registerUser(data) {
    try {
        const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
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
                window.location = '/index.html';
            }, 3000);
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
    event.preventDefault();
    $('.help').remove();

    if (!validateForm()) {
        const error = $('<p class="help is-danger">Preencha todos os campos!</p>');
        form.append(error);
        return;
    }

    const inputEmail = $('input[type="email"]').val().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inputEmail)) {
        const error = $('<p class="help is-danger">Digite um e-mail valido</p>');
        form.append(error);
        return;
    }

    const inputPassword = $('input[name="password"]').val().trim();
    const inputRepeatPassword = $('input[name="confirm-password"]').val().trim();
    if (inputPassword !== inputRepeatPassword) {
        const error = $('<p class="help is-danger">As senhas não coincidem</p>');
        form.append(error);
        return;
    }
    
    const inputNickname = $('input[name="nickname"]').val().trim();
    const dataToBeSent = {
        nickname: inputNickname,
        email: inputEmail,
        password: inputPassword
    }
    
    const loadingMessage = $('<div class="notification is-info">Carregando...</div>');
    $('.login-box').append(loadingMessage);

    registerUser(dataToBeSent);
});
