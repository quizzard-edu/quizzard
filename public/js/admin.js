/* set home as the active navbar element */
$('#nav-home').addClass('active');

var displayAccountsTable = function() {
    $.ajax({
        type: 'GET',
        url: '/studentlist',
        success: function(data) {
            $('#admin-label').html('Manage Accounts');
            $('#admin-content').html(data);
            $('#admin-button').off();
            $('#admin-button').show();
            $('#admin-button').click(function(evt) {
                displayAccountForm();
            });
            $('#admin-button').html('Add Users');
            $('#admin-back').hide();

            addAccountsTableEvents();

            $('#option-accounts').addClass('active');
            $('#option-questions').removeClass('active');
        }
    });
}

var addAccountsTableEvents = function() {
    $('.delete-button').click(function(evt) {
        /* cut off the delete- */
        deleteUser(this.id.substring(7));
    });
    $('.edit-button').click(function(evt) {
        /* cut off the edit- */
        editUser(this.id.substring(5));
    });
    $('.sort-table').click(function(evt) {
        sortAccountsTable(this.id.substring(5));
    });
}

var displayAccountForm = function() {
    $.ajax({
        type: 'GET',
        url: '/accountform',
        success: function(data) {
            $('#admin-label').html('Create Account');
            $('#admin-content').html(data);
            $('#admin-button').off();
            $('#admin-button').hide();
            $('#admin-back').show();
            $('#admin-back').click(function(evt) {
                displayAccountsTable();
            });
            $('#userform').submit(function(evt) {
                evt.preventDefault();
                submitUserForm();
            });
            $('#uploadform').submit(function(evt) {
                evt.preventDefault();
                submitUploadForm();
            });
        }
    });
}

var displayQuestionTable = function() {
    $.ajax({
        type: 'GET',
        url: '/questionlist',
        success: function(data) {
            $('#admin-label').html('Manage Questions');
            $('#admin-content').html(data);
            $('#admin-button').off();
            $('#admin-button').show();
            $('#admin-button').click(function(evt) {
                displayQuestionForm();
            });
            $('#admin-button').html('Add New Question');
            $('#admin-back').hide();
            $('.view-button').click(function(evt) {
                /* cut off the view- */
                viewQuestion(this.id.substring(5));
            });
            $('.delete-button').click(function(evt) {
                /* cut off the delete- */
                deleteQuestion(this.id.substring(7));
            });
            $('.edit-button').click(function(evt) {
                /* cut off the edit- */
                editQuestion(this.id.substring(5));
            });

            $('#option-questions').addClass('active');
            $('#option-accounts').removeClass('active');
        }
    });
}

var displayQuestionForm = function() {
    $.ajax({
        type: 'GET',
        url: '/questionform',
        success: function(data) {
            $('#admin-label').html('Add New Question');
            $('#admin-content').html(data);
            $('#admin-button').off();
            $('#admin-button').hide();
            $('#admin-back').show();
            $('#admin-back').click(function(evt) {
                displayQuestionTable();
            });
            $('#questionform').submit(function(evt) {
                evt.preventDefault();
                submitQuestionForm();
            });
        }
    });
}

/* show the account table by default */
displayAccountsTable();

$('#option-accounts').click(function(evt) {
    displayAccountsTable();
});

$('#option-questions').click(function(evt) {
    displayQuestionTable();
});

var deleteUser = function(id) {
    swal({
        title: 'Confirm deletion',
        text: 'User ' + id + ' will be removed from the database.',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#DD6B55',
        confirmButtonText: 'Delete',
        closeOnConfirm: true
    }, function() {
        $.ajax({
            type: 'POST',
            url: '/userdel',
            data: { userid: id },
            success: function(data) {
                displayAccountsTable();
            }
        });
    });
}

var editUser = function(id) {
    $.ajax({
        type: 'POST',
        url: '/accountedit',
        data: { userid: id },
        success: function(data) {
            $('#admin-label').html('Edit Account');
            $('#admin-content').html(data);
            $('#admin-button').off();
            $('#admin-button').hide();
            $('#admin-back').show();
            $('#admin-back').click(function(evt) {
                displayAccountsTable();
            });
            $('#account-edit-form').submit(function(evt) {
                evt.preventDefault();
                submitEditForm(id);
            });
        }
    });
}

var submitUserForm = function() {
    var fields = $('#userform').serializeArray();
    var user = {};

    jQuery.each(fields, function(i, field) {
        user[field.name.substring(3)] = field.value;
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
}

var submitUploadForm = function() {
    var files = $('#upload-file').get(0).files;
    var formData = new FormData();

    if (files.length > 1) {
        $('#upload-result').html('Select a single file');
        return;
    }

    formData.append('usercsv', files[0]);

    $.ajax({
        type: 'POST',
        url: '/userupload',
        data: formData,
        processData: false,
        contentType: false,
        success: function(data) {
        }
    });
}

var submitEditForm = function(id) {
    var fields = $('#account-edit-form').serializeArray();
    var user = {
        originalID: id
    };

    jQuery.each(fields, function(i, field) {
        if (field.value)
            user[field.name] = field.value;
    });

    $.ajax({
        type: 'POST',
        url: '/usermod',
        data: user,
        success: function(data) {
            if (data.result == 'failure') {
                $('#account-edit-result').html('User could not be updated. Please try again');
            } else if (data.result == 'dupid') {
                $('#account-edit-result').html('User ID ' + user.id + ' is taken');
            } else if (data.result == 'success') {
                $('#admin-content').html(data.html);
                $('#account-edit-form').submit(function(evt) {
                    evt.preventDefault();
                    submitEditForm(user.id ? user.id : id);
                });
                $('#account-edit-result').html('User ' + id + ' has been updated');
            }
        }
    });
}

var submitQuestionForm = function() {
    var fields = $('#questionform').serializeArray();
    var question = {};

    jQuery.each(fields, function(i, field) {
        question[field.name] = field.value;
    });

    $.ajax({
        type: 'POST',
        url: '/questionadd',
        data: question,
        success: function(data) {
            if (data == 'failure')
                $('#result').html('Question could not be added');
            else if (data == 'success')
                $('#result').html('Question added to database');
        }
    });
}

var viewQuestion = function(qid) {
}

var deleteQuestion = function(qid) {
    swal({
        title: 'Confirm deletion',
        text: 'Question ' + qid + ' will be removed from the database.',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#DD6B55',
        confirmButtonText: 'Delete',
        closeOnConfirm: true
    }, function() {
        $.ajax({
            type: 'POST',
            url: '/questiondel',
            data: { qid: qid },
            success: function(data) {
                displayQuestionTable();
            }
        });
    });
}

var editQuestion = function(qid) {
}

/*
 * Determines the sorting order for accounts in the accounts table.
 * false: will be sorted in ascending order
 * true: will be sorted in descending order
 */
var accountSortTypes = {
    fname: false,
    lname: false,
    id: false
};

var sortAccountsTable = function(type) {
    /* Toggle type's sort order; reset all others. */
    for (var ind in accountSortTypes) {
        if (ind == type)
            accountSortTypes[type] = !accountSortTypes[type];
        else
            accountSortTypes[ind] = false;
    }

    $.ajax({
        type: 'POST',
        url: '/sortaccountlist',
        data: {
            type: type,
            asc: accountSortTypes[type]
        },
        success: function(data) {
            $('#admin-content').html(data);
            addAccountsTableEvents();
        }
    });
}
