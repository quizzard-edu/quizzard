$(".button-collapse").sideNav();

$('#nav-logout').click(function(evt) {
    $.ajax({
        type: 'GET',
        url: '/logout',
        complete: function(data) {
            window.location.href = '/';
        }
    });
});
