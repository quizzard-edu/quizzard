/* This is the index for referencing colours for the snackbars */
var colours = Object.freeze({
    SUCCESS_GREEN: '#4BB543',
    FAIL_RED: '#D93232',
});

/* set home as the active navbar element */
$('#nav-home').addClass('active');

$(function(){
    /* show the account table by default */
    displayAccountsTable();
});

/* Display the table of user accounts. */
var displayAccountsTable = function() {
    $.ajax({
        type: 'GET',
        url: '/studentlist',
        success: function(data) {
            $('#admin-content').html(data);

            addAccountsTableEvents();

            $('#option-accounts').addClass('active');
            $('#option-questions').removeClass('active');
            $('#option-stats').removeClass('active');
            $('#option-settings').removeClass('active');

            $('#account-creation-button').click(function(){
                displayAccountForm();
            });
        },
        error: function(data){
            if (data['status'] === 401) {
                window.location.href = '/';
            }
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
            $('#admin-content').html(data);

            $('#account-creation-back-button').click(function(){
                displayAccountsTable();
            });

            $('#userform').submit(function(evt) {
                evt.preventDefault();
                submitUserForm();
            });
        },
        error: function(data){
            if (data['status'] === 401) {
                window.location.href = '/';
            }
        }
    });
}

/* Fetch and display the table of questions. */
var displayQuestionTable = function() {
    $.ajax({
        type: 'GET',
        url: '/questionlist',
        success: function(data) {
            $('#admin-content').html(data);

            addQuestionsTableEvents();

            $('#option-questions').addClass('active');
            $('#option-accounts').removeClass('active');
            $('#option-stats').removeClass('active');
            $('#option-settings').removeClass('active');

            $('#question-creation-button').click(function(evt) {
                displayQuestionForm();
            });            
        },
        error: function(data){
            if (data['status'] === 401) {
                window.location.href = '/';
            }
        }
    });
}

var addQuestionsTableEvents = function(){
    $('.view-button').click(function(evt) {
        viewQuestion(this.id.substring(5));
    });
    $('.delete-button').click(function(evt) {
        deleteQuestion(this.id.substring(7));
    });
    $('.edit-button').click(function(evt) {
        editQuestion(this.id.substring(5));
    });
    $('.checked').change(function(evt) {
        updateVisibility(this.id.substring(8));
    });
}


/* Fetch and display the question creation form. */
var displayQuestionForm = function() {
    $.ajax({
        type: 'GET',
        url: '/questionform',
        success: function(data) {
            $('#admin-content').html(data);

            $('#question-creation-back-button').click(function(evt) {
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
            $('select').material_select();
        },
        error: function(data){
            if (data['status'] === 401) {
                window.location.href = '/';
            }
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
    var inputdiv = '<p><input type="radio" name="radbutton" value="mcans{0}" id="mcans{1}" required/><label for="mcans{2}">Is Correct</label><input type="text" name="mcans{3}" placeholder="Enter Answer Here" required style="float:left;" class="form-control"/><a onclick="$(this).parent().remove()" class="btn-floating btn-tiny waves-effect waves-light red"><i class="tiny material-icons">close</i></a></p>';
    newdiv.innerHTML = inputdiv.format(mcAnswerCount,mcAnswerCount,mcAnswerCount,mcAnswerCount);
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

        error: function(data){
            if (data['status'] === 401) {
                window.location.href = '/';
            } else {
                $('#result').html('Server is down cannot pull Answer form');
            }
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
        },
        error: function(data){
            if (data['status'] === 401) {
                window.location.href = '/';
            }
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
                dropSnack(colours.SUCCESS_GREEN, 'User ' + id + ' was removed from the database');
            },
            error: function(data){
                if (data['status'] === 401) {
                    window.location.href = '/';
                } else {
                    dropSnack(colours.FAIL_RED, 'Failed to remove user ' + id + ' from the database');
                }
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
        },
        error: function(data){
            if (data['status'] === 401) {
                window.location.href = '/';
            }
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
        type: 'PUT',
        url: '/useradd',
        data: user,
        success: function(data) {
            displayAccountsTable();
            dropSnack(colours.SUCCESS_GREEN, 'User ' + user.id + ' added to database');
        },
        error: function(data){
            if (data['status'] === 401) {
                window.location.href = '/';
            } else if (data['responseText'] === 'failure') {
                dropSnack(colours.FAIL_RED, 'User could not be added');
            } else if (data['responseText'] === 'exists') {
                dropSnack(colours.FAIL_RED, 'User ' + user.id + ' already exists');
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
            dropSnack(colours.SUCCESS_GREEN, 'File successfully uploaded');
            setTimeout(displayAccountsTable, 3000);
        },
        error: function(data){
            if (data['status'] === 401) {
                window.location.href = '/';
            } else {
                dropSnack(colours.FAIL_RED, 'Upload failed');
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
            $('#admin-content').html(data.html);
            $('#account-edit-form').submit(function(evt) {
                evt.preventDefault();
                submitEditForm(user.id ? user.id : id);
            });
            displayAccountsTable();		
            dropSnack(colours.SUCCESS_GREEN, 'User ' + id + ' has been updated');
        },
        error: function(data){
            if (data['status'] === 401) {
                window.location.href = '/';
            } else if (data.result === 'failure') {
                dropSnack(colours.FAIL_RED, 'User could not be updated. Please try again');
            } else if (data.result === 'dupid') {
                dropSnack(colours.FAIL_RED, 'User ID ' + user.id + ' is taken');
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
            displayQuestionTable();
            dropSnack(colours.SUCCESS_GREEN, 'Question ' + qid + ' is now visible to the students');
        },
        error: function(data){
            if (data['status'] === 401) {
                window.location.href = '/';
            } else {
                displayQuestionTable();
                dropSnack(colours.FAIL_RED, 'Could not change visibility of question');
            }
        }
    });
}

/* Process submitted question edit form. */
var submitQuestionForm = function() {
    var fields = $('#questionform').serializeArray();
    var question = {};
    question['choices'] = [];

    jQuery.each(fields, function(i, field) {
        if(field.name.startsWith('radbutton')){
            question['answer'] = fields[i+1].value;
        }

        if(field.name.startsWith('mcans')){
            question['choices'].push(field.value);
        }

        question[field.name] = field.value;
    });

    if ($('#qtext').summernote('isEmpty')) {
        dropSnack(colours.FAIL_RED, 'Please enter a question body in the editor.');
        return;
    }

    question['text'] = $('#qtext').summernote('code');
    question['type'] = $('#qType').select().val();
    question['visible'] = $('#visible').is(':checked');

    $.ajax({
        type: 'PUT',
        url: '/questionadd',
        data: question,
        success: function(data) {
            dropSnack(colours.SUCCESS_GREEN, 'Question added to database');
            displayQuestionTable();
        },
        error: function(data){
            if (data['status'] === 401) {
                window.location.href = '/';
            } else {
                dropSnack(colours.FAIL_RED, 'Question could not be added');
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
        },
        error: function(data){
            if (data['status'] === 401) {
                window.location.href = '/';
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
                dropSnack(colours.SUCCESS_GREEN, 'Question ' + qid + ' was removed from the database');
                displayQuestionTable();
            },
            error: function(data){
                if (data['status'] === 401) {
                    window.location.href = '/';
                } else {
                    dropSnack(colours.FAIL_RED, 'Coud not remove question ' + qid + ' from the database');
                }
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
        },
        error: function(data){
            if (data['status'] === 401) {
                window.location.href = '/';
            }
        }
    });
}

var submitQEditForm = function(qid) {
    var fields = $('#question-edit-form').serializeArray();
    var question = {};
    var qbody;

    if ($('#qtext').summernote('isEmpty')) {
        dropSnack(colours.FAIL_RED, 'Please enter a question body in the editor.');
        return;
    }

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
            dropSnack(colours.SUCCESS_GREEN, 'Question ' + qid + ' has been modified.');
            displayQuestionTable();
        },
        error: function(data){
            if (data['status'] === 401) {
                window.location.href = '/';
            } else {
                dropSnack(colours.FAIL_RED, 'Question could not be edited.');
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
        },
        error: function(data){
            if (data['status'] === 401) {
                window.location.href = '/';
            }
        }
    });
}

//toggles the view of Visiblility button in the Question-Table View
var toggleButtonVisibility = function(){
    if (document.getElementById('sw').checked === true) {
        $('.visbox').show();
    } else{
        $('.visbox').hide();
    }
} 

/* This function slides down a snakbar */
function dropSnack(colour, msg) {
    var x = document.getElementById("snackbar");
    x.style.backgroundColor=colour;
    x.innerHTML=msg;
    x.className = "show";
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
}
