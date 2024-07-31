$(document).ready(function() {
    $('.navbar-burger').on('click', function() {
        const target = $(this).data('target');
        const $target = $('#' + target);

        $(this).toggleClass('is-active');
        $target.toggleClass('is-active');
    });
});