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

/**
 * submit data to update the profile information
 *
 * @param {string} id
 */
var editProfile = function(id) {
    var fields = $('#editForm').serializeArray();
    var user = {};

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
            uploadProfilePicture();
        },
        error: function(data) {
            var jsonResponse = data.responseJSON;

            if (data['status'] === 401) {
                window.location.href = '/';
            } else {
                failSnackbar(getErrorFromResponse(jsonResponse));
            }
        }
    });
}

/**
 * upload profile picture
 */
var uploadProfilePicture = function () {
    var files = $('#profile-picture-input').get(0).files;

    if (files.length < 1) {
        location.reload();
        return;
    }

    if (files.length !== 1) {
        warningSnackbar('You can only upload one picture!');
        return;
    }

    var formData = new FormData();
    formData.append('userpicture', files[0]);

    $.ajax({
        type: 'POST',
        url: '/updateUserPicture',
        processData: false,
        contentType: false,
        data: formData,
        success: function (data) {
            location.reload();
        },
        error: function (data) {
            var jsonResponse = data.responseJSON;

            if (data['status'] === 401) {
                window.location.href = '/';
            } else {
                failSnackbar(getErrorFromResponse(jsonResponse));
            }
        }
    });
}