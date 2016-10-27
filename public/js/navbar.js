$('#nav-logout').click(function(evt) {
    $.ajax({
        type: 'GET',
        url: '/logout',
        success: function(data) {
            window.location.href = '/';
        }
    });
});
