/* Process a user login request. */
$('#login').submit(function(evt) {
    evt.preventDefault();
    $.ajax({
        type: 'GET',
        url: '/login',
        data: $('#login').serialize(),
        success: function(data) {
            if (data == 'invalid')
                $('#invalid').html('Invalid username or password');
            else if (data == 'success')
                window.location.href = '/home';
        }
    });
});
