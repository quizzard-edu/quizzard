var usersTableActive = true;
var autocompleteTopics;

$(function(){
    /* show the account table by default */
    displayQuestionTable();
});

/* set home as the active navbar element */
$('#nav-home').addClass('active');

var toggleUsersSwitch = function() {
    usersTableActive = !usersTableActive;
    displayAccountsTable();
}

/* Display the table of user accounts. */
var displayAccountsTable = function() {
    //var status = $('#userStatusSwitch').is(':checked');
    $.ajax({
        type: 'GET',
        url: '/studentlist?active=' + usersTableActive,
        success: function(data) {
            $('#admin-content').html(data);

            addAccountsTableEvents();

            $('#option-accounts').addClass('active');
            $('#option-questions').removeClass('active');
            $('#option-stats').removeClass('active');
            $('#option-settings').removeClass('active');

            $('#account-creation-button').click(function() {
                displayAccountForm();
            });

            $('#account-export-button').click(function() {
                displayExportAccountsForm();
            });

            $('#account-import-button').click(function() {
                displayImportAccountsForm();
            });

            $('#usersSwitch').prop('checked', usersTableActive);
        },
        error: function(data) {
            if (data['status'] === 401) {
                window.location.href = '/';
            } else {
                failSnackbar('Something went wrong, please try again later!');
            }
        }
    });
}

/* display Export Accounts Form */
var displayExportAccountsForm = function() {
    $.ajax({
        type: 'GET',
        url: '/accountsExportForm',
        success: function(data) {
            $('#admin-content').html(data);

            $('#account-export-back-button').click(function() {
                displayAccountsTable();
            });
        },
        error: function(data) {
            if (data['status'] === 401) {
                window.location.href = '/';
            } else {
                failSnackbar('Something went wrong, please try again later!');
            }
        }
    });
}

/* display Import Accounts Form */
var displayImportAccountsForm = function() {
    $.ajax({
        type: 'GET',
        url: '/accountsImportForm',
        success: function(data) {
            $('#admin-content').html(data);

            $('#account-import-back-button').click(function() {
                displayAccountsTable();
            });
        },
        error: function(data) {
            if (data['status'] === 401) {
                window.location.href = '/';
            } else {
                failSnackbar('Something went wrong, please try again later!');
            }
        }
    });
}

/* submit export form */
var submitExportForm = function() {
    var selected = [];
    $('div#exportForm input[type=checkbox]').each(function() {
        if ($(this).is(':checked')) {
            selected.push($(this).attr('id').substring(3));
        }
    });

    $.ajax({
        type: 'POST',
        url: '/accountsExportFile',
        data: {studentsList: selected},
        success: function(data) {
            $('#admin-content').html(data);

            $('#account-export-complete-back-button').click(function() {
                displayAccountsTable();
            });
        },
        error: function(data) {
            if (data['status'] === 401) {
                window.location.href = '/';
            } else {
                failSnackbar('Something went wrong, please try again later!');
            }
        }
    });
}

/* Upload a file of users to the server. */
var submitImportForm = function() {
    var files = $('#import-form-input').get(0).files;
    var formData = new FormData();

    if (files.length !== 1) {
        warningSnackbar('You can only import one file!');
        return;
    }

    formData.append('usercsv', files[0]);

    $.ajax({
        type: 'POST',
        url: '/accountsImportFile',
        processData: false,
        contentType: false,
        data: formData,
        success: function(data) {
            successSnackbar('File uploaded successfully');
            $('#admin-content').html(data);

            $('#account-import-list-back-button').click(function() {
                displayAccountsTable();
            });
        },
        error: function(data) {
            if (data['status'] === 401) {
                window.location.href = '/';
            } else {
                failSnackbar('Upload failed');
            }
        }
    });
}

/* submit export form */
var submitImportList = function() {
    var selected = [];
    $('#importList').find('tr').each(function (i, el) {
        if (i === 0) {
            return;
        }

        var $tds = $(this).find('td'),
            isSelected = $tds.eq(0).find('input[type=checkbox]').is(':checked'),
            fname = $tds.eq(1).text(),
            lname = $tds.eq(2).text(),
            username = $tds.eq(3).text(),
            email = $tds.eq(4).text();

        var userObj = {
            fname: fname,
            lname: lname,
            username: username,
            email: email
        };

        if (isSelected) {
            selected.push(userObj);
        }
    });

    $.ajax({
        type: 'POST',
        url: '/accountsImportList',
        data: {selectedList: selected},
        success: function(data) {
            successSnackbar('Students\' list uploaded successfully');
            $('#admin-content').html(data);

            $('#account-import-complete-back-button').click(function() {
                displayAccountsTable();
            });
        },
        error: function(data) {
            if (data['status'] === 401) {
                window.location.href = '/';
            } else {
                failSnackbar('Upload failed');
            }
        }
    });
}


/* Add click events to the buttons in the account table. */
var addAccountsTableEvents = function() {
    $('.deactivate-button').click(function(evt) {
        /* cut off the delete- */
        deactivateUser(this.id.substring(11));
    });
    $('.activate-button').click(function(evt) {
        /* cut off the delete- */
        activateUser(this.id.substring(9));
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

            $('#account-creation-back-button').click(function() {
                displayAccountsTable();
            });

            $('#userform').submit(function(evt) {
                evt.preventDefault();
                submitUserForm();
            });
        },
        error: function(data) {
            if (data['status'] === 401) {
                window.location.href = '/';
            } else {
                failSnackbar('Something went wrong, please try again later!');
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

            $('.visbox').hide();

            $('#question-creation-button').click(function(evt) {
                displayQuestionForm();
            });
        },
        error: function(data) {
            if (data['status'] === 401) {
                window.location.href = '/';
            } else {
                failSnackbar('Something went wrong, please try again later!');
            }
        }
    });
}

var addQuestionsTableEvents = function() {
    $('.view-button').click(function(evt) {
        window.location.href = '/question?_id=' + this.id.substring(5);
    });
    $('.delete-button').click(function(evt) {
        deleteQuestion(this.id.substring(7));
    });
    $('.edit-button').click(function(evt) {
        editQuestion(this.id.substring(5), this.name);
    });
    $('.checked').change(function(evt) {
        updateVisibility(this.id.substring(8), this.name);
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
                const form = $(this).val();
                getQuestionFormAnswer(form);
                $('#questionform').show();
            });

            $('#questionform').submit(function(evt) {
                evt.preventDefault();
                submitQuestionForm();
            });
            $('select').material_select();

            // gets the updated topics list
            getQuestionsTopicsList();
        },
        error: function(data) {
            if (data['status'] === 401) {
                window.location.href = '/';
            } else {
                failSnackbar('Something went wrong, please try again later!');
            }
        }
    });
}

// replace the answer field in Question-creation.pug for specific question
var getQuestionFormAnswer = function(form) {
    $.ajax({
        type: 'GET',
        url: '/answerForm',
        data: {qType:form},
        success: function(data) {
            $('#qAnswer').html(data);
        },

        error: function(data) {
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
        error: function(data) {
            if (data['status'] === 401) {
                window.location.href = '/';
            } else {
                failSnackbar('Something went wrong, please try again later!');
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
 * Process user deactiavtion request.
 * First, display a confirmation message and then request the user's deactivation.
 */
var deactivateUser = function(id) {
    swal({
        title: 'Confirm Deactivation',
        text: id + '\'s  account will be deactivated.',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#DD6B55',
        confirmButtonText: 'Deactivate',
        closeOnConfirm: true
    }, function() {
        $.ajax({
            type: 'POST',
            url: '/setUserStatus',
            data: { userid: id, active: false },
            success: function(data) {
                displayAccountsTable();
                const msg = ' has been&nbsp;<u><b>deactivated</b></u>&nbsp;';
                warningSnackbar(id + ' account' + msg);
            },
            error: function(data) {
                if (data['status'] === 401) {
                    window.location.href = '/';
                } else {
                    failSnackbar('Failed to deactivate ' + id + '\'s account');
                }
            }
        });
    });
}

/*
 * Process user actiavtion request.
 * First, display a confirmation message and then request the user's activation.
 */
var activateUser = function(id) {
    swal({
        title: 'Confirm Activation',
        text: id + '\'s  account will be activated.',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#DD6B55',
        confirmButtonText: 'Activate',
        closeOnConfirm: true
    }, function() {
        $.ajax({
            type: 'POST',
            url: '/setUserStatus',
            data: { userid: id, active: true },
            success: function(data) {
                displayAccountsTable();
                successSnackbar(id + '\'s account has been activated');
            },
            error: function(data) {
                if (data['status'] === 401) {
                    window.location.href = '/';
                } else {
                    failSnackbar('Failed to activate ' + id + '\'s account');
                }
            }
        });
    });
}

/* Fetch data for the user editing form. */
var editUser = function(id) {
    $.ajax({
        type: 'GET',
        url: '/accounteditform',
        data: { userid: id },
        success: function(data) {
            $('#admin-content').html(data);
            $('#account-edit-back-button').click(function(evt) {
                displayAccountsTable();
            });
            $('#account-edit-form').submit(function(evt) {
                evt.preventDefault();
                submitEditForm(id);
            });
        },
        error: function(data) {
            if (data['status'] === 401) {
                window.location.href = '/';
            } else {
                failSnackbar('Something went wrong, please try again later!');
            }
        }
    });
}

/* Read data from user creation form and send request to create user. */
var submitUserForm = function() {
    var fields = $('#userform').serializeArray();
    var user = {};

    jQuery.each(fields, function(i, field) {
        user[field.name] = field.value;
    });

    $.ajax({
        type: 'PUT',
        url: '/useradd',
        data: user,
        success: function(data) {
            displayAccountsTable();
            successSnackbar('User ' + user.username + ' added to database');
        },
        error: function(data) {
            if (data['status'] === 401) {
                window.location.href = '/';
            } else if (data['responseText'] === 'failure') {
                failSnackbar('User could not be added');
            } else if (data['responseText'] === 'exists') {
                failSnackbar('User ' + user.username + ' already exists');
            } else {
                failSnackbar('Something went wrong, please try again later!');
            }
        }
    });
}

/* Process submitted user edit form. */
var submitEditForm = function(id) {
    var fields = $('#account-edit-form').serializeArray();
    var user = {
        _id: id
    };

    jQuery.each(fields, function(i, field) {
        if (field.value) {
            user[field.name] = field.value;
        }
    });

    $.ajax({
        type: 'POST',
        url: '/usermod',
        data: user,
        success: function(data) {
            $('#admin-content').html(data.html);
            $('#account-edit-form').submit(function(evt) {
                evt.preventDefault();
                submitEditForm(user._id);
            });
            displayAccountsTable();
            successSnackbar('User ' + user.username + ' has been updated');
        },
        error: function(data) {
            if (data['status'] === 401) {
                window.location.href = '/';
            } else if (data.result === 'failure') {
                failSnackbar('User could not be updated. Please try again');
            } else if (data.result === 'dupid') {
                failSnackbar('Username ' + user.username + ' is taken');
            } else {
                failSnackbar('Something went wrong, please try again later!');
            }
        }
    });
}

/* Updates the Vilibility of a Question */
var updateVisibility = function(qid, questionNumber) {
    var question = {};
    swal({
        type: 'warning',
        title: 'Visibilty Change',
        text: 'You are about to change the visibility status of question ' + questionNumber,
        showCancelButton: true,
        showConfirmButton: true,
        // User can only close the swal if they click one of the buttons
        allowEscapeKey: false,
        allowClickOutside: false,
        },
        function (isConfirm) {
            // User confirms the visiblity change
            if (isConfirm) {
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
                        // Toast notifiation
                        const msg = question['visible'] ? ' is now visible to the students' : ' is now&nbsp<u><b>not</b></u>&nbspvisible to the students';

                        if (question['visible']) {
                            successSnackbar('Question ' + questionNumber + msg);
                        } else {
                            warningSnackbar('Question ' + questionNumber + msg);
                        }
                    },
                    error: function(data) {
                        if (data['status'] === 401) {
                            window.location.href = '/';
                        } else {
                            displayQuestionTable();
                            // Toast notification
                            failSnackbar('Could not change visibility of question');
                        }
                    }
                });
            // User cancels the visibility change
            } else {
                displayQuestionTable();
            }
        }
    );
}

/*Collects form fields for Question-Creation and Question-Edit*/
var collectQuestionFormData = function(form){
    var fields = $(form).serializeArray();
    var question = {};
    question['choices'] = [];
    question['leftSide'] = [];
    question['rightSide'] = [];
    question['answer'] = [];

    jQuery.each(fields, function(i, field) {
        if(field.name.startsWith('radbutton')) {
            question['answer'] = fields[i+1].value;
        }

        if(field.name.startsWith('option')) {
            question['choices'].push(field.value);
        }

        if(field.name.startsWith('matchLeft')) {
            question['leftSide'].push(field.value);
        }

        if(field.name.startsWith('matchRight')) {
            question['rightSide'].push(field.value);
        }

        if(field.name.startsWith('tfbutton')) {
            question['answer'] = field.value;
        }

        if(field.name.startsWith('checkButton') ){
           question['answer'].push(fields[i+1].value);
        }

        if(field.name.startsWith('orderItem')) {
            question['answer'].push(field.value);
        }
        question[field.name] = field.value;
    });
    question['rating'] = getRating();
    question['text'] = $('#qtext').summernote('code');
    question['visible'] = $('#visible').is(':checked');
    return question;
}

/* Process submitted question edit form. */
var submitQuestionForm = function() {
    if ($('#qtext').summernote('isEmpty')) {
        failSnackbar('Please enter a question body in the editor.');
        return;
    }
    var question = collectQuestionFormData('#questionform');

    question['type'] = $('#qType').select().val();
    $.ajax({
        type: 'PUT',
        url: '/questionadd',
        data: question,
        success: function(data) {
            successSnackbar('Question added to database');
            displayQuestionTable();
        },
        error: function(data) {
            if (data['status'] === 401) {
                window.location.href = '/';
            } else if (data['status'] === 400) {
                warningSnackbar(data['responseText']);
            } else {
                failSnackbar('Question could not be added.');
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
                successSnackbar('Question ' + qid + ' was removed from the database');
                displayQuestionTable();
            },
            error: function(data) {
                if (data['status'] === 401) {
                    window.location.href = '/';
                } else {
                    failSnackbar('Coud not remove question ' + qid + ' from the database');
                }
            }
        });
    });
}

var editQuestion = function(qid, questionNumber) {
    $.ajax({
        type: 'GET',
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
                submitQEditForm(qid, questionNumber);
            });
            setRating(data.qrating);

            // gets the updated topics list
            getQuestionsTopicsList();
        },
        error: function(data) {
            if (data['status'] === 401) {
                window.location.href = '/';
            } else {
                failSnackbar('Something went wrong, please try again later!');
            }
        }
    });
}

var submitQEditForm = function(qid, questionNumber) {
    if ($('#qtext').summernote('isEmpty')) {
        failSnackbar('Please enter a question body in the editor.');
        return;
    }

    var question = collectQuestionFormData('#question-edit-form');

    if (rating > 0 && rating < 6) {
        submitQuestionRating(rating, qid);
    }
    $.ajax({
        type: 'POST',
        url: '/questionmod',
        data: {
            question: question,
            id: qid
        },
        success: function(data) {
            successSnackbar('Question ' + questionNumber + ' has been modified.');
            displayQuestionTable();
        },
        error: function(data) {
            if (data['status'] === 401) {
                window.location.href = '/';
            } else if (data['status'] === 400){
                warningSnackbar(data['responseText']);
            } else {
                failSnackbar('Question could not be edited.');
            }
        }
    });
}

// submit question rating
var submitQuestionRating = function (rating, qid) {
    $.ajax({
        type: 'POST',
        url: '/submitQuestionRating',
        data: {
            rating: rating,
            qId: qid
        },
        async: false,
        success: function(data) {
            successSnackbar('Question ' + qid + ' rating has been updated.');
        },
        error: function(data) {
            if (data['status'] === 401) {
                window.location.href = '/';
            } else {
                failSnackbar('Question could not be updated.');
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
        error: function(data) {
            if (data['status'] === 401) {
                window.location.href = '/';
            } else {
                failSnackbar('Something went wrong, please try again later!');
            }
        }
    });
}

// Toggles the view of the Visibility Checkboxes in the Question-Table View
var toggleButtonVisibility = function() {
    if ($('#sw').is(':checked')) {
        $('.visbox').show();
    } else {
        $('.visbox').hide();
    }
}

// get questions topics list
var getQuestionsTopicsList = function () {
    $.ajax({
        async: false,
        type: 'GET',
        url: '/questionsListofTopics',
        success: function(data) {
            autocompleteTopics = {};

            for (var t in data) {
                autocompleteTopics[data[t]] = null;
            }

            // Setting up the autocomplete search for topics
            $('#qtopic').autocomplete({
              data: autocompleteTopics,
              limit: 20,
              minLength: 0
            });
        },
        error: function(data) {
            if (data['status'] === 401) {
                window.location.href = '/';
            } else {
                failSnackbar('Sorry, something went wrong, please try again');
            }
        }
    });

}
