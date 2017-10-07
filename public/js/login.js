/* Process a user login request. */
$('#login').submit(function(evt) {
    evt.preventDefault();
    $.ajax({
        type: 'POST',
        url: '/login',
        data: $('#login').serialize(),
        success: function(data) {
            window.location.href = '/home';
        },
        error: function(data) {
            $('#invalid').html('Invalid username or password');
        }
    });
});
