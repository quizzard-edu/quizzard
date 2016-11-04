/* set home as the active navbar element */
$('#nav-home').addClass('active');

$('#option-accounts').click(function(evt) {
    $('#modal-accounts').modal('show');
    $.ajax({
        type: 'GET',
        url: '/studentlist',
        success: function(data) {
            $('#account-table').html(data);
        }
    });
});

$('#create-user').click(function(evt) {
    $('#modal-accounts').modal('hide');
    $('#modal-createuser').modal('show');
});

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
        }
    });
});
