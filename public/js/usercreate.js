$('#userform').submit(function(evt) {
    evt.preventDefault();

    var fields = $('#userform').serializeArray();
    var user = {};

    jQuery.each(fields, function(i, field) {
        user[field.name] = field.value;
    });

    $.ajax({
        type: 'POST',
        url: '/useradd',
        data: user,
        success: function(data) {
            if (data == 'failure')
                $('#result').html('User could not be added');
            else if (data == 'exists')
                $('#result').html('User ' + user.id + ' already exists');
            else if (data == 'success')
                $('#result').html('User ' + user.id + ' added to database');
        },
        error: function(data){
            if (data['status'] === 401) {
                window.location.href = '/';
            }
        }
    });
});
