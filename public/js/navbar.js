$('#nav-changepass').click(function(evt) {
    $('#modal-password').modal('show');
});

$('#nav-logout').click(function(evt) {
    $.ajax({
        type: 'GET',
        url: '/logout',
        success: function(data) {
            window.location.href = '/';
        }
    });
});
