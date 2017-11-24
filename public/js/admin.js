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

        var $tds = $(this).find('td');
        var isSelected = $tds.eq(0).find('input[type=checkbox]').is(':checked');
        var userObj = {
            username: $tds.eq(1).text(),            
            fname: $tds.eq(2).text(),
            lname: $tds.eq(3).text(),
            email: $tds.eq(4).text()
        };

        if (isSelected) {
            selected.push(userObj);
        }
    });

    $('#admin-content').html(loadingAnimation);

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
                failSnackbar('Importing failed');
                displayAccountsTable();                
            }
        }
    });
}


/* Add click events to the buttons in the account table. */
var addAccountsTableEvents = function() {
    $('.deactivate-button').click(function(evt) {
        /* cut off the delete- */
        deactivateUser(this.id.substring(11), this.name);
    });
    $('.activate-button').click(function(evt) {
        /* cut off the delete- */
        activateUser(this.id.substring(9), this.name);
    });
    $('.edit-button').click(function(evt) {
        /* cut off the edit- */
        editUser(this.id.substring(5), this.name);
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
        deleteQuestion(this.id.substring(7), this.name);
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

            initSummernote();
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
            $('#admin-content').html(data);

            $('#option-stats').addClass('active');
            $('#option-accounts').removeClass('active');
            $('#option-questions').removeClass('active');
            $('#option-settings').removeClass('active');
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
    $.ajax({
        type: 'GET',
        url: '/settings',
        success: function(data) {
            $('#admin-content').html(data);

            $('#option-settings').addClass('active');
            $('#option-stats').removeClass('active');
            $('#option-accounts').removeClass('active');
            $('#option-questions').removeClass('active');
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
var deactivateUser = function(id, username) {
    swal({
        title: 'Confirm Deactivation',
        text: username + '\'s  account will be deactivated.',
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
                warningSnackbar(username + ' account has been&nbsp;<u><b>deactivated</b></u>&nbsp;');
            },
            error: function(data) {
                if (data['status'] === 401) {
                    window.location.href = '/';
                } else {
                    failSnackbar('Failed to deactivate ' + username + '\'s account');
                }
            }
        });
    });
}

/*
 * Process user actiavtion request.
 * First, display a confirmation message and then request the user's activation.
 */
var activateUser = function(id, username) {
    swal({
        title: 'Confirm Activation',
        text: username + '\'s  account will be activated.',
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
                successSnackbar(username + '\'s account has been activated');
            },
            error: function(data) {
                if (data['status'] === 401) {
                    window.location.href = '/';
                } else {
                    failSnackbar('Failed to activate ' + username + '\'s account');
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
                            // Toast notification
                            $('#checked-' + qid).prop('checked', !question['visible']);
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

    if (parseInt($('#qminpoints').val()) > parseInt($('#qmaxpoints').val())) {
        failSnackbar('Minimum points must be less than or equal to max points');
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

var deleteQuestion = function(qid, questionNumber) {
    swal({
        title: 'Confirm deletion',
        text: 'Question ' + questionNumber + ' will be removed from the database.',
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
                successSnackbar('Question ' + questionNumber + ' was removed from the database');
                displayQuestionTable();
            },
            error: function(data) {
                if (data['status'] === 401) {
                    window.location.href = '/';
                } else {
                    failSnackbar('Coud not remove question ' + questionNumber + ' from the database');
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
            $('#admin-content').html(data.html);
            $('#question-edit-back-button').click(function(evt) {
                displayQuestionTable();
            });
            initSummernote();
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

    if (getRating() > 0 && getRating() < 6) {
        submitQuestionRating(getRating(), qid);
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
        success: function(data) { },
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
}

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

/* Initialize the summernote and all its sub modal */
var initSummernote = function () {
    $('#qtext').summernote({ height: 100 });
    $('div.note-btn-group.btn-group.note-insert button').unbind();
    $('div.note-btn-group.btn-group.note-view button:nth-child(3)').unbind();
    $('div.note-btn-group.btn-group.note-insert button:nth-child(1)').click(function () {
        $('#mediaModal0').modal('open');
        $('#mediaModal0 > div > div > div.modal-footer > button')
        .unbind()
        .removeClass('disabled')
        .removeAttr('href')
        .prop('disabled', false)
        .prop('type', 'button')
        .click(function () {
            var text = $('#mediaModal0 > div > div > div.modal-body > div:nth-child(1) > input').val();
            var url = $('#mediaModal0 > div > div > div.modal-body > div:nth-child(2) > input').val();
            $('#qtext').summernote('createLink', {
                text: text,
                url: url,
                isNewWindow: true
            });
            $('#mediaModal0').modal('close');
        });
        $('#mediaModal0 > div > div > div.modal-header > button').click(function () {
            $('#mediaModal0').modal('close');
        });
    });
    $('div.note-btn-group.btn-group.note-insert button:nth-child(2)').click(function () {
        $('#mediaModal1').modal('open');
        $('#mediaModal1 > div > div > div.modal-body > div.form-group.note-group-select-from-files').hide();
        $('#mediaModal1 > div > div > div.modal-footer > button')
        .unbind()
        .removeClass('disabled')
        .removeAttr('href')
        .prop('disabled', false)
        .prop('type', 'button')
        .click(function () {
            var url = $('#mediaModal1 > div > div > div.modal-body > div.form-group.note-group-image-url > input').val();
            $('#qtext').summernote('insertImage', url);
            $('#mediaModal1').modal('close');
        });
        $('#mediaModal1 > div > div > div.modal-header > button').click(function () {
            $('#mediaModal1').modal('close');
        });
    });
    $('div.note-btn-group.btn-group.note-insert button:nth-child(3)').prop('disabled', true)
    $('div.note-btn-group.btn-group.note-view button:nth-child(3)').click(function () {
        $('#mediaModal3').modal('open');
        $('#mediaModal3 > div > div > div.modal-header > button').click(function () {
            $('#mediaModal3').modal('close');
        });
    });
    $('.modal').modal({
        dismissible: false
    });
    $('.modal').each(function( i ) {
        $(this).attr('id', 'mediaModal' + i);
        $('#mediaModal' + i +'> div > div').removeClass('modal-content');
    });
}
