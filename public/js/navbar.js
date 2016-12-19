/* Password changing form. */
$('#nav-changepass').click(function(evt) {
    $('#changepass-currpass-group').removeClass('has-danger');
    $('#currpass').removeClass('form-control-danger');
    $('#modal-password').modal('show');
});

$('#changepass-form').submit(function(evt) {
    evt.preventDefault();
    var passreq = $('#changepass-form').serializeArray();
    $.ajax({
        type: 'POST',
        url: '/changepass',
        data: passreq,
        success: function(data) {
            if (data == 'invalid') {
                $('#changepass-result').html('Invalid password');
                $('#changepass-currpass-group').addClass('has-danger');
                $('#currpass').addClass('form-control-danger');
            } else if (data == 'mismatch') {
                $('#changepass-result').html('Passwords do not match');
            } else if (data == 'success') {
                $('#changepass-result').html('Your password has been changed.');
            }
        }
    });
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
