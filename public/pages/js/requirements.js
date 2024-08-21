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
                            <div class="select is-fullwidth">
                                <select>
                                    <option value="" disabled selected>Selecione um cargo</option>
                                    <option value="Soldado">Soldado</option>
                                    <option value="Cabo">Cabo</option>
                                    <option value="Sargento">Sargento</option>
                                    <option value="Suboficial">Suboficial</option>
                                    <option value="Aspirante">Aspirante</option>
                                    <option value="Tenente">Tenente</option>
                                    <option value="Capitão">Capitão</option>
                                    <option value="Major">Major</option>
                                    <option value="Tenente-coronel">Tenente-coronel</option>
                                    <option value="Coronel">Coronel</option>
                                    <option value="General">General</option>
                                    <option value="Marechal">Marechal</option>
                                    <option value="Subcomandante">Subcomandante</option>
                                    <option value="Comandante">Comandante</option>
                                </select>
                            </div>
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
                            <div class="select is-fullwidth">
                                <select>
                                    <option value="" disabled selected>Selecione um cargo</option>
                                    <option value="Estagiário">Estagiário</option>
                                    <option value="Agente">Agente</option>
                                    <option value="Sócio">Sócio</option>
                                    <option value="Analista">Analista</option>
                                    <option value="Supervisor">Supervisor</option>
                                    <option value="Inspetor">Inspetor</option>
                                    <option value="Inspetor-Chefe">Inspetor-Chefe</option>
                                    <option value="Coordenador">Coordenador</option>
                                    <option value="Administrador">Administrador</option>
                                    <option value="Escrivão">Escrivão</option>
                                    <option value="Ministro">Ministro</option>
                                    <option value="Conselheiro">Conselheiro</option>
                                    <option value="Acionista">Acionista</option>
                                    <option value="Chanceler">Chanceler</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="field">
                        <label class="label has-text-white">Preço</label>
                        <div class="control">
                            <input class="input" type="text" placeholder="Formato: R$50,00 ou 500c">
                        </div>
                    </div>
                    <div class="field">
                        <div class="control">
                            <button class="button is-primary is-fullwidth" id="sendBtn">Enviar</button>
                        </div>
                    </div>
                `;
                break;
            case 'cursoInicial':
                formHtml = `
                        <div class="field">
                            <label class="label has-text-white">Nome do Soldado</label>
                            <div class="control">
                                <input class="input" type="text" placeholder="Nome do Soldado">
                            </div>
                        </div>
                        <div class="field">
                            <label class="label has-text-white">Observações</label>
                            <div class="control">
                                <textarea class="textarea" placeholder="Descreva observações sobre a aula"></textarea>
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
            const csrfToken = document.cookie.split('; ').find(row => row.startsWith('XSRFTOKEN=')).split('=')[1];
            $('#requirementForm .control').each(function (_, element) {
                const inputElement = $($(element)[0].firstElementChild);
                if (inputElement.hasClass('select')) {
                    const inputValue = inputElement.children().val();
                    dataToSend.push({ inputValue });
                    return;
                }
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
                headers: {
                    'CSRF-Token': csrfToken
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
                    showError(data.responseJSON.error);
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