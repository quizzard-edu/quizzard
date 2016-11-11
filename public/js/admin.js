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
            $('#admin-button').html('Create User');
            $('#admin-back').hide();
            $('#admin-back').click(function(evt) {
                displayAccountsTable();
            });
        }
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
            $('#userform').submit(function(evt) {
                evt.preventDefault();
                submitUserForm();
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
            });
            $('#admin-button').html('Add New Question');
            $('#admin-back').hide();
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

var submitUserForm = function() {
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
}
