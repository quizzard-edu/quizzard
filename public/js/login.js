/* Process a user login request. */
var failedLoginTemplate = '<div class="chip white-text red darken-4">{0}<i class="close material-icons">close</i></div>';

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
            var jsonResponse = data.responseJSON;
            $('#invalid').html(failedLoginTemplate.format([getErrorFromResponse(jsonResponse)]));
        },
        complete: function(data) {
            $('#passwd').val('').focus();
        }
    });
});
