$('#login').submit(function(evt) {
    evt.preventDefault();
    $.ajax({
        type: 'POST',
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
