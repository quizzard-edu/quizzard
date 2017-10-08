/* Process a user login request. */
var failedLogin = '<div class="chip white-text red darken-4">Invalid username or password<i class="close material-icons">close</i></div>';

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
            $('#invalid').html(failedLogin);
        }
    });
});
