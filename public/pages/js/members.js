$(document).ready(function () {
    $('#bodyOptions').on('change', function() {
        const selectedOption = $(this).val();
        if (!selectedOption) return;

        $.ajax({
            method: 'GET',
            url: `/api/members?body=${selectedOption}`,
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                $('#bodyContent').empty();
                if (data.length === 0) {
                    $('#bodyContent').append('<p class="has-text-white">Nenhum militar encontrado para esta opção.</p>');
                    return;
                }

                const profileContainer = $('<div class="columns is-multiline"></div>');
                data.forEach(member => {
                    const profileColumn = $('<div class="column is-one-quarter"></div>');
                    const profileBox = $(`
                        <div class="box has-background-dark">
                            <article class="media">
                                <figure class="media-left">
                                    <p class="image">
                                        <img src="https://www.habbo.com.br/habbo-imaging/avatarimage?&user=${member.nickname}&action=std&direction=2&head_direction=2&img_format=png&gesture=sml&frame=1&headonly=0&size=m" alt="Avatar" style="width: 64px; height: auto;">
                                    </p>
                                </figure>
                                <div class="media-content">
                                    <div class="content">
                                        <p>
                                            <strong class="has-text-white">${member.nickname}</strong><br>
                                            <small class="has-text-white">${member.role}</small>
                                        </p>
                                    </div>
                                </div>
                            </article>
                        </div>
                    `);
                    profileColumn.append(profileBox);
                    profileContainer.append(profileColumn);
                });

                $('#bodyContent').append(profileContainer);
            },
            error: function (data) {
                $('#bodyContent').empty();
                $('#bodyContent').append(`<p class="notification is-danger">${data.responseJSON.error}</p>`);
            }
        });
    });
});