/* set home as the active navbar element */
$('#nav-home').addClass('active');

/* Display the table of user accounts. */
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
            $('#option-stats').removeClass('active');
            $('#option-settings').removeClass('active');
        }
    });
}

/* Add click events to the buttons in the account table. */
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

/* Fetch and display the account creation form. */
var displayAccountForm = function() {
    $.ajax({
        type: 'GET',
        url: '/accountform',
        success: function(data) {
            $('#admin-modal').modal('show');
            $('#admin-modal-label').html('Create Account');
            $('#admin-modal-body').html(data);
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

/* Fetch and display the table of questions. */
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
            $('.checked').change(function(evt) {
                updateVisibility(this.id.substring(8));
	    });

            $('#option-questions').addClass('active');
            $('#option-accounts').removeClass('active');
            $('#option-stats').removeClass('active');
            $('#option-settings').removeClass('active');
        }
    });
}

/* Fetch and display the question creation form. */
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

            $('#qtext').summernote({ height: 100 });
            // choose the type of question creating
            $('#qType').change(function(evt) {
                // get the answer part for the form requested
                // id to replace is qAnswer
                var form = "/" + $(this).val();
                getQuestionFormAnswer(form);
                $('#questionform').show();
            });

            $('#questionform').submit(function(evt) {
                evt.preventDefault();
                submitQuestionForm();
            });
        }
    });
}

/*String Formating option*/
String.prototype.format = function() {
  a = this;
  for (k in arguments) {
    a = a.replace("{" + k + "}", arguments[k])
  }
  return a
}

var mcAnswerCount = 4;
var addMCAnswers = function(dom){
    mcAnswerCount++;
     var newdiv = document.createElement('div');
     var inputdiv = "<p>Is Correct: <input type='radio' name='radbutton' value='mcans{0}'/><input class='form-control' type='text' name='mcans{1}' placeholder='Enter Answer Here' required='required' style='float:left;'/> <button onclick='$(this).parent().remove();'>delete</button></p>"
     newdiv.innerHTML = inputdiv.format(mcAnswerCount,mcAnswerCount);
     $('#qAnswer > div.form-group').append(newdiv);
}

// replace the answer field in Question-creation.pug for specific question
var getQuestionFormAnswer = function(form){
    $.ajax({
        type: 'GET',
        url: form,
        success: function(data){
            $('#qAnswer').html(data);
        },
        failure: function(data){
            $('#result').html('Server is down cannot pull Answer form');
        }
    });

}

/* Display the application statistics form. */
var displayStatistics = function() {
    $.ajax({
        type: 'GET',
        url: '/statistics',
        success: function(data) {
            $('#admin-label').html('Statistics');
            $('#admin-content').html(data);

            $('#option-stats').addClass('active');
            $('#option-accounts').removeClass('active');
            $('#option-questions').removeClass('active');
            $('#option-settings').removeClass('active');

            $('#admin-button').off();
            $('#admin-button').hide();
            $('#admin-back').hide();
        }
    });
}

var displaySettings = function() {
    $('#admin-label').html('Global Settings');
    $('#admin-content').html('');

    $('#option-settings').addClass('active');
    $('#option-stats').removeClass('active');
    $('#option-accounts').removeClass('active');
    $('#option-questions').removeClass('active');

    $('#admin-button').off();
    $('#admin-button').hide();
    $('#admin-back').hide();

    /*
    $.ajax({
        type: 'GET',
        url: '/statistics',
        success: function(data) {
        }
    });
    */
}

/* show the account table by default */
displayAccountsTable();

/* Set up events for the sidebar buttons. */
$('#option-accounts').click(function(evt) {
    displayAccountsTable();
});

$('#option-questions').click(function(evt) {
    displayQuestionTable();
});

$('#option-stats').click(function(evt) {
    displayStatistics();
});

$('#option-settings').click(function(evt) {
    displaySettings();
});

/*
 * Process user deletion request.
 * First, display a confirmation message and then request the user's removal.
 */
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

/* Fetch data for the user editing form. */
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

/* Read data from user creation form and send request to create user. */
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
            if (data == 'failure') {
                $('#result').html('User could not be added');
            } else if (data == 'exists') {
                $('#result').html('User ' + user.id + ' already exists');
            } else if (data == 'success') {
                $('#result').html('User ' + user.id + ' added to database');
                setTimeout(displayAccountsTable(), 1000);
		$('#admin-modal').modal('hide');
            }
        }
    });
}

/* Upload a file of users to the server. */
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
            if (data == 'uploaded') {
                $('#upload-result').html('File successfully uploaded');
                setTimeout(displayAccountsTable, 3000);
            } else {
                $('#upload-result').html('Upload failed');
            }
        }
    });
}

/* Process submitted user edit form. */
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

var updateVisibility = function(qid) {
    var question = {};

    question['visible'] = $('#checked-' + qid).is(':checked');

    $.ajax({
        type: 'POST',
        url: '/questionmod',
        data: {
            question: question,
            id: qid
        },
        success: function(data) {
            if (data == 'failure') {
		displayQuestionTable();
            } else if (data == 'success') {
                displayQuestionTable();
            }
        }
    });
}

/* Process submitted question edit form. */
var submitQuestionForm = function() {
    var fields = $('#questionform').serializeArray();
    var question = {};

    jQuery.each(fields, function(i, field) {
        question[field.name] = field.value;
    });
    if ($('#qtext').summernote('isEmpty')) {
        $('#result').html('Please enter a question body in the editor.');
        return;
    }
    question['text'] = $('#qtext').summernote('code');
    question['type'] = $('#qType').select().val();
    question['visible'] = $('#visible').is(':checked');

    $.ajax({
        type: 'POST',
        url: '/questionadd',
        data: question,
        success: function(data) {
            if (data == 'failure') {
                $('#result').html('Question could not be added');
            } else if (data == 'success') {
                $('#result').html('Question added to database');
                setTimeout(displayQuestionTable, 1000);
            }
        }
    });
}

var viewQuestion = function(qid) {
    $.ajax({
        type: 'GET',
        url: '/questionpreview',
        data: {
            qid: qid
        },
        success: function(data) {
            if (data != 'failure' && data != 'invalid') {
                $('#admin-label').html('Question Preview');
                $('#admin-content').html(data);
                $('#admin-button').off();
                $('#admin-button').hide();
                $('#admin-back').show();
                $('#admin-back').click(function(evt) {
                    displayQuestionTable();
                });
                $('#answerform').submit(function(evt) {
                    evt.preventDefault();
                });
            }
        }
    });
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
    $.ajax({
        type: 'POST',
        url: '/questionedit',
        data: { questionid: qid },
        success: function(data) {
            $('#admin-label').html('Edit Question');
            $('#admin-content').html(data.html);
            $('#admin-button').off();
            $('#admin-button').hide();
            $('#admin-back').show();
            $('#admin-back').click(function(evt) {
                displayQuestionTable();
            });
            $('#qtext').summernote({ height: 150 });
            $('#qtext').summernote('code', data.qtext);
            $('#question-edit-form').submit(function(evt) {
                evt.preventDefault();
                submitQEditForm(qid);
            });
        }
    });
}

var submitQEditForm = function(qid) {
    var fields = $('#question-edit-form').serializeArray();
    var question = {};
    var qbody;

    jQuery.each(fields, function(i, field) {
        question[field.name] = field.value;
    });
    question['text'] = $('#qtext').summernote('code');

    $.ajax({
        type: 'POST',
        url: '/questionmod',
        data: {
            question: question,
            id: qid
        },
        success: function(data) {
            if (data == 'failure') {
                $('#question-edit-result').html('Question could not be edited.');
            } else if (data == 'success') {
                $('#question-edit-result').html('Question ' + qid + ' has been modified.');
            }
        }
    });
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
