$(document).ready(function () {
    $('#requirementType').on('change', function () {
        const selectedType = $(this).val();
        let formHtml = '';

        switch (selectedType) {
            case 'promocao':
                formHtml = `
                    <div class="field">
                        <label class="label has-text-white">Nome do Militar</label>
                        <div class="control">
                            <input class="input" type="text" placeholder="Nome do Militar">
                        </div>
                    </div>
                    <div class="field">
                        <label class="label has-text-white">Nova Patente</label>
                        <div class="control">
                            <input class="input" type="text" placeholder="Nova Patente">
                        </div>
                    </div>
                    <div class="field">
                        <label class="label has-text-white">Motivo</label>
                        <div class="control">
                            <textarea class="textarea" placeholder="Descreva o motivo da promoção"></textarea>
                        </div>
                    </div>
                    <div class="field">
                        <div class="control">
                            <button class="button is-primary is-fullwidth" id="sendBtn">Enviar</button>
                        </div>
                    </div>
                `;
                break;
            case 'rebaixamento':
                formHtml = `
                    <div class="field">
                        <label class="label has-text-white">Nome do Militar</label>
                        <div class="control">
                            <input class="input" type="text" placeholder="Nome do Militar">
                        </div>
                    </div>
                    <div class="field">
                        <label class="label has-text-white">Patente Atual</label>
                        <div class="control">
                            <input class="input" type="text" placeholder="Patente Atual">
                        </div>
                    </div>
                    <div class="field">
                        <label class="label has-text-white">Nova Patente</label>
                        <div class="control">
                            <input class="input" type="text" placeholder="Nova Patente">
                        </div>
                    </div>
                    <div class="field">
                        <label class="label has-text-white">Motivo</label>
                        <div class="control">
                            <textarea class="textarea" placeholder="Descreva o motivo do rebaixamento"></textarea>
                        </div>
                    </div>
                    <div class="field">
                        <div class="control">
                            <button class="button is-primary is-fullwidth" id="sendBtn">Enviar</button>
                        </div>
                    </div>
                `;
                break;
            case 'advertencia':
                formHtml = `
                    <div class="field">
                        <label class="label has-text-white">Nome do Militar</label>
                        <div class="control">
                            <input class="input" type="text" placeholder="Nome do Militar">
                        </div>
                    </div>
                    <div class="field">
                        <label class="label has-text-white">Motivo</label>
                        <div class="control">
                            <textarea class="textarea" placeholder="Descreva o motivo da advertência"></textarea>
                        </div>
                    </div>
                    <div class="field">
                        <div class="control">
                            <button class="button is-primary is-fullwidth" id="sendBtn">Enviar</button>
                        </div>
                    </div>
                `;
                break;
            case 'contrato':
                formHtml = `
                    <div class="field">
                        <label class="label has-text-white">Nome do Militar</label>
                        <div class="control">
                            <input class="input" type="text" placeholder="Nome do Militar">
                        </div>
                    </div>
                    <div class="field">
                        <label class="label has-text-white">Patente do Militar</label>
                        <div class="control">
                            <input class="input" type="text" placeholder="Patente do Militar">
                        </div>
                    </div>
                    <div class="field">
                        <label class="label has-text-white">Motivo do Contrato</label>
                        <div class="control">
                            <textarea class="textarea" placeholder="Descreva o motivo do contrato"></textarea>
                        </div>
                    </div>
                    <div class="field">
                        <div class="control">
                            <button class="button is-primary is-fullwidth" id="sendBtn">Enviar</button>
                        </div>
                    </div>
                `;
                break;
            case 'demissao':
                formHtml = `
                    <div class="field">
                        <label class="label has-text-white">Nome do Militar</label>
                        <div class="control">
                            <input class="input" type="text" placeholder="Nome do Militar">
                        </div>
                    </div>
                    <div class="field">
                        <label class="label has-text-white">Motivo</label>
                        <div class="control">
                            <textarea class="textarea" placeholder="Descreva o motivo da demissão"></textarea>
                        </div>
                    </div>
                    <div class="field">
                        <div class="control">
                            <button class="button is-primary is-fullwidth" id="sendBtn">Enviar</button>
                        </div>
                    </div>
                `;
                break;
            case 'vendaDeCargo':
                formHtml = `
                    <div class="field">
                        <label class="label has-text-white">Nome do Militar</label>
                        <div class="control">
                            <input class="input" type="text" placeholder="Nome do Militar">
                        </div>
                    </div>
                    <div class="field">
                        <label class="label has-text-white">Cargo a Ser Vendido</label>
                        <div class="control">
                            <input class="input" type="text" placeholder="Cargo a Ser Vendido">
                        </div>
                    </div>
                    <div class="field">
                        <label class="label has-text-white">Preço</label>
                        <div class="control">
                            <input class="input" type="text" placeholder="Preço">
                        </div>
                    </div>
                    <div class="field">
                        <div class="control">
                            <button class="button is-primary is-fullwidth" id="sendBtn">Enviar</button>
                        </div>
                    </div>
                `;
                break;
            case 'avaliacao':
                formHtml = `
                    <div class="field">
                        <label class="label has-text-white">Nome do Militar</label>
                        <div class="control">
                            <input class="input" type="text" placeholder="Nome do Militar">
                        </div>
                    </div>
                    <div class="field">
                        <label class="label has-text-white">Calendário</label>
                        <div class="calendar-container">
                            <div class="calendar"></div>
                        </div>
                    </div>
                    <div class="field">
                        <div class="control">
                            <button class="button is-primary is-fullwidth" id="sendBtn">Enviar</button>
                        </div>
                    </div>
                `;
                break;
            default:
                formHtml = '';
        }

        if ($('.box .is-danger')) $('.box .is-danger').remove();
        $('#requirementForm').html(formHtml);
        if (selectedType === 'avaliacao') {
            const element = $('.calendar');
            const year = new Date().getFullYear();
            const month = new Date().getMonth();
            const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
            const date = new Date(year, month, 1);
            
            element.empty();
            days.forEach(day => {
                element.append(`<div class="header has-text-white">${day}</div>`);
            });
            
            while (date.getMonth() === month) {
                element.append(`<div class="day has-text-white">${date.getDate()}</div>`);
                date.setDate(date.getDate() + 1);
            }
        }

        $('#sendBtn').on('click', function () {
            const dataToSend = [selectedType];
            $('#requirementForm .control').each(function(index, element) {
                const inputElement = $($(element)[0].firstElementChild)
                if (inputElement.hasClass('button')) return;
                const inputValue = inputElement.val();
                dataToSend.push({ inputValue });
            });

            $.ajax({
                method: 'POST',
                url: '/api/requirements',
                xhrFields: {
                    withCredentials: true
                },
                data: JSON.stringify(dataToSend),
                contentType: 'application/json; charset=utf-8',
                success: function (data) {
                    if (data.success) {
                        successfulOperation(data.success);
                        setTimeout(() => window.location.reload(), 2000);
                    }
                },
                error: function (data) {
                    if (data.status === 400 ||
                        data.status === 403 ||
                        data.status === 404) {
                            showError(data.responseJSON.error);
                    }
                }
            });

            function successfulOperation(message) {
                if ($('.box .is-danger')) $('.box .is-danger').remove();
                const successMessage = $(`<p>${message}</p>`);
                $('#requirementForm').after($('<div>').addClass('notification is-success').css('margin-top', '20px').append(successMessage));
            }

            function showError(message) {
                if ($('.box .is-danger')) $('.box .is-danger').remove();
                const errorMessage = $(`<p>${message}</p>`);
                $('#requirementForm').after($('<div>').addClass('notification is-danger').css('margin-top', '20px').append(errorMessage));            
            }
        });
    });
});