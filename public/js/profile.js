/**
* Submits the new updates for the profile
*/
$('#editForm').submit(function(evt) {
    evt.preventDefault();

    if ($('#passwd').val() === $('#confirmpasswd').val()) {
        var id = $('#userId').html();
        editProfile(id);
    } else {
        failSnackbar('Passwords do not match');
    }
});

/**
* Changes the view to the editing page
*
* @method enableEdit
*/
var enableEdit = function() {
    $('#viewForm').addClass('hidden');
    $('#editForm').removeClass('hidden');
    $('#cancelButton').removeClass('hidden');
}

/**
* Changes the view to the display page
*
* @method disableEdit
*/
var disableEdit = function() {
    location.reload();
}

var editProfile = function(id) {
    var fields = $('#editForm').serializeArray();
    var user = {
        originalID: id
    };

    jQuery.each(fields, function(i, field) {
        if (field.value) {
            user[field.name] = field.value;
        }
    });

    $.ajax({
        type: 'POST',
        url: '/profilemod',
        data: user,
        success: function(data) {
            location.reload();
        },
        error: function(data) {
            if (data['status'] === 401) {
                window.location.href = '/';
            } else if (data['status'] === 403) {
                failSnackbar('Current Password is Incorrect');
            } else if (data.result === 'failure') {
                failSnackbar('User could not be updated. Please try again');
            } else if (data.result === 'dupid') {
                failSnackbar('User ID ' + user.id + ' is taken');
            } else {
                failSnackbar('Something went wrong, please try again later!');
            }
        }
    });
}
