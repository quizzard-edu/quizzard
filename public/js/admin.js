/*
Copyright (C) 2016
Developed at University of Toronto

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var usersTableActive = true;
var questionTableActive = true;
var autocompleteTopics;

$(function () {
    /* show the account table by default */
    displayQuestionTable();
});

/* set home as the active navbar element */
$('#nav-home').addClass('active');

var toggleUsersSwitch = function () {
    usersTableActive = !usersTableActive;
    displayAccountsTable();
}

var toggleQuestionSwitch = function() {
    questionTableActive = !questionTableActive;
    displayQuestionTable();
}

/* Display the table of user accounts. */
var displayAccountsTable = function () {
    $.ajax({
        type: 'GET',
        url: '/studentlist?active=' + usersTableActive,
        success: function (data) {
            $('#admin-content').html(data);

            addAccountsTableEvents();

            $('#option-accounts').addClass('active');
            $('#option-questions').removeClass('active');
            $('#option-stats').removeClass('active');
            $('#option-settings').removeClass('active');

            $('#account-creation-button').click(function () {
                displayAccountForm();
            });

            $('#account-export-button').click(function () {
                displayExportAccountsForm();
            });

            $('#account-import-button').click(function () {
                displayImportAccountsForm();
            });

            $('#account-option-button').click(() => {
                const optionDiv = $('#account-option-div');
                const optionIcon = $('#account-option-icon');
                if (optionDiv.hasClass('hidden')) {
                    optionDiv.removeClass('hidden');
                    optionIcon.html('keyboard_arrow_up');
                } else {
                    optionDiv.addClass('hidden');
                    optionIcon.html('keyboard_arrow_down');
                }
            });

            $('#usersSwitch').prop('checked', usersTableActive);

            $(document).ready(function () {
                $('#manageAcccountsTable').DataTable({
                  bLengthChange: false,
                  searching: true,
                  ordering:  true,
                  paging: true
                });
            });
        },
        error: function (data) {
            var jsonResponse = data.responseJSON;

            if (data['status'] === 401) {
                window.location.href = '/';
            } else if (data['status'] === 404) {
                window.location.href = '/page-not-found';
            } else {
                failSnackbar(getErrorFromResponse(jsonResponse));
            }
        }
    });
}

/* display Export Accounts Form */
var displayExportAccountsForm = function () {
    $.ajax({
        type: 'GET',
        url: '/accountsExportForm',
        success: function (data) {
            $('#admin-content').html(data);

            $('#account-export-back-button').click(function () {
                displayAccountsTable();
            });
        },
        error: function (data) {
            var jsonResponse = data.responseJSON;

            if (data['status'] === 401) {
                window.location.href = '/';
            } else if (data['status'] === 404) {
                window.location.href = '/page-not-found';
            } else {
                failSnackbar(getErrorFromResponse(jsonResponse));
            }
        }
    });
}

/* display Import Accounts Form */
var displayImportAccountsForm = function () {
    $.ajax({
        type: 'GET',
        url: '/accountsImportForm',
        success: function (data) {
            $('#admin-content').html(data);

            $('#account-import-back-button').click(function () {
                displayAccountsTable();
            });
        },
        error: function (data) {
            if (data['status'] === 401) {
                window.location.href = '/';
            } else if (data['status'] === 404) {
                window.location.href = '/page-not-found';
            } else {
                failSnackbar('Something went wrong, please try again later!');
            }
        }
    });
}

/* submit export form */
var submitExportForm = function () {
    var selected = [];
    $('div#exportForm input[type=checkbox]').each(function () {
        if ($(this).is(':checked')) {
            selected.push($(this).attr('id').substring(3));
        }
    });

    $('#admin-content').html(loadingAnimation);

    $.ajax({
        type: 'POST',
        url: '/accountsExportFile',
        data: {studentsList: selected},
        success: function (data) {
            $('#admin-content').html(data);

            $('#account-export-complete-back-button').click(function () {
                displayAccountsTable();
            });
        },
        error: function (data) {
            var jsonResponse = data.responseJSON;

            if (data['status'] === 401) {
                window.location.href = '/';
            } else if (data['status'] === 404) {
                window.location.href = '/page-not-found';
            } else {
                failSnackbar(getErrorFromResponse(jsonResponse));
            }
        }
    });
}

/* Upload a file of users to the server. */
var submitImportForm = function () {
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
        success: function (data) {
            successSnackbar('File uploaded successfully');
            $('#admin-content').html(data);

            $('#account-import-list-back-button').click(function () {
                displayAccountsTable();
            });
        },
        error: function (data) {
            var jsonResponse = data.responseJSON;

            if (data['status'] === 401) {
                window.location.href = '/';
            } else if (data['status'] === 404) {
                window.location.href = '/page-not-found';
            } else {
                failSnackbar(getErrorFromResponse(jsonResponse));
            }
        }
    });
}

/* submit export form */
var submitImportList = function () {
    var selected = [];
    $('#importList').find('tr').each(function (i, el) {
        if (i === 0) {
            return;
        }

        var $tds = $(this).find('td');
        var isSelected = $tds.eq(0).find('input[type=checkbox]').is(':checked');
        var userObj = {
            username: $tds.eq(1).text(),
            password: $tds.eq(2).text(),
            fname: $tds.eq(3).text(),
            lname: $tds.eq(4).text(),
            email: $tds.eq(5).text()
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
        success: function (data) {
            successSnackbar('Students\' list uploaded successfully');
            $('#admin-content').html(data);

            $('#account-import-complete-back-button').click(function () {
                displayAccountsTable();
            });
        },
        error: function (data) {
            var jsonResponse = data.responseJSON;

            if (data['status'] === 401) {
                window.location.href = '/';
            } else if (data['status'] === 404) {
                window.location.href = '/page-not-found';
            } else {
                failSnackbar(getErrorFromResponse(jsonResponse));
                displayAccountsTable();
            }
        }
    });
}


/* Add click events to the buttons in the account table. */
var addAccountsTableEvents = function () {
    $('.deactivate-button').click(function (evt) {
        /* cut off the delete- */
        deactivateUser(this.id.substring(11), this.name);
    });
    $('.activate-button').click(function (evt) {
        /* cut off the delete- */
        activateUser(this.id.substring(9), this.name);
    });
    $('.edit-button').click(function (evt) {
        /* cut off the edit- */
        editUser(this.id.substring(5), this.name);
    });
    $('.sort-table').click(function (evt) {
        sortAccountsTable(this.id.substring(5));
    });
}

/* Fetch and display the account creation form. */
var displayAccountForm = function () {
    $.ajax({
        type: 'GET',
        url: '/accountform',
        success: function (data) {
            $('#admin-content').html(data);

            $('#account-creation-back-button').click(function () {
                displayAccountsTable();
            });

            $('#userform').submit(function (evt) {
                evt.preventDefault();
                submitUserForm();
            });
        },
        error: function (data) {
            if (data['status'] === 401) {
                window.location.href = '/';
            } else if (data['status'] === 404) {
                window.location.href = '/page-not-found';
            } else {
                failSnackbar('Something went wrong, please try again later!');
            }
        }
    });
}

/* Fetch and display the table of questions. */
var displayQuestionTable = function () {
    $.ajax({
        type: 'GET',
        url: '/questionlist?active=' + questionTableActive,
        success: function(data) {
            $('#admin-content').html(data);
            addQuestionsTableEvents();

            $('#option-questions').addClass('active');
            $('#option-accounts').removeClass('active');
            $('#option-stats').removeClass('active');
            $('#option-settings').removeClass('active');

            $('#question-option-button').click(() => {
                const optionDiv = $('#question-option-div');
                const optionIcon = $('#question-option-icon');
                if (optionDiv.hasClass('hidden')) {
                    optionDiv.removeClass('hidden');
                    optionIcon.html('keyboard_arrow_up');
                } else {
                    optionDiv.addClass('hidden');
                    optionIcon.html('keyboard_arrow_down');
                }
            });

            $('.visbox').hide();
            $('#questionSwitch').prop('checked', questionTableActive);

            $('#question-creation-button').click(function (evt) {
                displayQuestionForm();
            });

            $(document).ready(function () {
                $('#questionsTable').DataTable({
                  order: [[ 1, "asc" ]],
                  bLengthChange: false,
                  searching: true,
                  ordering:  true,
                  paging: true
                });
            });
        },
        error: function (data) {
            var jsonResponse = data.responseJSON;

            if (data['status'] === 401) {
                window.location.href = '/';
            } else if (data['status'] === 404) {
                window.location.href = '/page-not-found';
            } else {
                failSnackbar(getErrorFromResponse(jsonResponse));
            }
        }
    });
}

var addQuestionsTableEvents = function () {
    $('.view-button').click(function (evt) {
        window.location.href = '/question?_id=' + this.id.substring(5);
    });
    $('.delete-button').click(function (evt) {
        deleteQuestion(this.id.substring(7), this.name);
    });
    $('.edit-button').click(function (evt) {
        editQuestion(this.id.substring(5), this.name);
    });
    $('.checked').change(function (evt) {
        updateVisibility(this.id.substring(8), this.name);
    });
}


/* Fetch and display the question creation form. */
var displayQuestionForm = function () {
    $.ajax({
        type: 'GET',
        url: '/questionform',
        success: function (data) {
            $('#admin-content').html(data);

            $('#question-creation-back-button').click(function (evt) {
                displayQuestionTable();
            });

            // choose the type of question creating
            $('#qType').change(function (evt) {
                // get the answer part for the form requested
                // id to replace is qAnswer
                const form = $(this).val();
                getQuestionFormAnswer(form);
                $('#questionform').show();
            });

            $('#questionform').submit(function (evt) {
                evt.preventDefault();
                submitQuestionForm();
            });
            $('select').material_select();

            // gets the updated topics list
            getQuestionsTopicsList();

            initSummernote();
        },
        error: function (data) {
            if (data['status'] === 401) {
                window.location.href = '/';
            } else if (data['status'] === 404) {
                window.location.href = '/page-not-found';
            } else {
                failSnackbar('Something went wrong, please try again later!');
            }
        }
    });
}

// replace the answer field in Question-creation.pug for specific question
var getQuestionFormAnswer = function (form) {
    $.ajax({
        type: 'GET',
        url: '/answerForm',
        data: {qType:form},
        success: function (data) {
            $('#qAnswer').html(data);
        },
        error: function (data) {
            var jsonResponse = data.responseJSON;

            if (data['status'] === 401) {
                window.location.href = '/';
            } else if (data['status'] === 404) {
                window.location.href = '/page-not-found';
            } else {
                failSnackbar(getErrorFromResponse(jsonResponse));
            }
        }
    });
}

/* Display the application statistics form. */
var displayStatistics = function () {
    $.ajax({
        type: 'GET',
        url: '/statistics',
        success: function (data) {
            $('#admin-content').html(data);

            $('#option-stats').addClass('active');
            $('#option-accounts').removeClass('active');
            $('#option-questions').removeClass('active');
            $('#option-settings').removeClass('active');

            $('#accounts-option-button').click(() => {
                const optionDiv = $('#accounts-option-div');
                const optionIcon = $('#accounts-option-icon');
                if (optionDiv.hasClass('hidden')) {
                    optionDiv.removeClass('hidden');
                    optionIcon.html('keyboard_arrow_up');
                } else {
                    optionDiv.addClass('hidden');
                    optionIcon.html('keyboard_arrow_down');
                }
            });

            $('#questions-option-button').click(() => {
                const optionDiv = $('#questions-option-div');
                const optionIcon = $('#questions-option-icon');
                if (optionDiv.hasClass('hidden')) {
                    optionDiv.removeClass('hidden');
                    optionIcon.html('keyboard_arrow_up');
                } else {
                    optionDiv.addClass('hidden');
                    optionIcon.html('keyboard_arrow_down');
                }
            });

            $(document).ready(function () {
                $('#questionsStatisticsTable').DataTable({
                  bLengthChange: false,
                  searching: true,
                  ordering:  true,
                  paging: true
                });
                $('#studentStatisticsTable').DataTable({
                  bLengthChange: false,
                  searching: true,
                  ordering:  true,
                  paging: true
                });
            });
        },
        error: function (data) {
            var jsonResponse = data.responseJSON;

            if (data['status'] === 401) {
                window.location.href = '/';
            } else if (data['status'] === 404) {
                window.location.href = '/page-not-found';
            } else {
                failSnackbar(getErrorFromResponse(jsonResponse));
            }
        }
    });
}

var displaySettings = function () {
    $.ajax({
        type: 'GET',
        url: '/settings',
        success: function (data) {
            $('#admin-content').html(data);

            $('#option-settings').addClass('active');
            $('#option-stats').removeClass('active');
            $('#option-accounts').removeClass('active');
            $('#option-questions').removeClass('active');
        },
        error: function (data) {
            var jsonResponse = data.responseJSON;

            if (data['status'] === 401) {
                window.location.href = '/';
            } else if (data['status'] === 404) {
                window.location.href = '/page-not-found';
            } else {
                failSnackbar(getErrorFromResponse(jsonResponse));
            }
        }
    });
}

/* Set up events for the sidebar buttons. */
$('#option-accounts').click(function (evt) {
    displayAccountsTable();
});

$('#option-questions').click(function (evt) {
    displayQuestionTable();
});

$('#option-stats').click(function (evt) {
    displayStatistics();
});

$('#option-settings').click(function (evt) {
    displaySettings();
});

/*
 * Process user deactiavtion request.
 * First, display a confirmation message and then request the user's deactivation.
 */
var deactivateUser = function (id, username) {
    swal({
        title: 'Confirm Deactivation',
        text: username + '\'s  account will be deactivated.',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: colours.pinkLightExtra,
        confirmButtonText: 'Deactivate',
        closeOnConfirm: true
    }, function () {
        $.ajax({
            type: 'POST',
            url: '/setUserStatus',
            data: { userid: id, active: false },
            success: function (data) {
                displayAccountsTable();
                warningSnackbar(username + ' account has been&nbsp;<u><b>deactivated</b></u>&nbsp;');
            },
            error: function (data) {
                var jsonResponse = data.responseJSON;

                if (data['status'] === 401) {
                    window.location.href = '/';
                } else if (data['status'] === 404) {
                    window.location.href = '/page-not-found';
                } else {
                    failSnackbar(getErrorFromResponse(jsonResponse));
                }
            }
        });
    });
}

/*
 * Process user actiavtion request.
 * First, display a confirmation message and then request the user's activation.
 */
var activateUser = function (id, username) {
    swal({
        title: 'Confirm Activation',
        text: username + '\'s  account will be activated.',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: colours.pinkLightExtra,
        confirmButtonText: 'Activate',
        closeOnConfirm: true
    }, function () {
        $.ajax({
            type: 'POST',
            url: '/setUserStatus',
            data: { userid: id, active: true },
            success: function (data) {
                displayAccountsTable();
                successSnackbar(username + '\'s account has been activated');
            },
            error: function (data) {
                var jsonResponse = data.responseJSON;

                if (data['status'] === 401) {
                    window.location.href = '/';
                } else if (data['status'] === 404) {
                    window.location.href = '/page-not-found';
                } else {
                    failSnackbar(getErrorFromResponse(jsonResponse));
                }
            }
        });
    });
}

/* Fetch data for the user editing form. */
var editUser = function (id) {
    $.ajax({
        type: 'GET',
        url: '/accounteditform',
        data: { userid: id },
        success: function (data) {
            $('#admin-content').html(data);
            $('#account-edit-back-button').click(function (evt) {
                displayAccountsTable();
            });
            $('#account-edit-form').submit(function (evt) {
                evt.preventDefault();
                submitEditForm(id);
            });
        },
        error: function (data) {
            var jsonResponse = data.responseJSON;

            if (data['status'] === 401) {
                window.location.href = '/';
            } else if (data['status'] === 404) {
                window.location.href = '/page-not-found';
            } else {
                failSnackbar(getErrorFromResponse(jsonResponse));
            }
        }
    });
}

/* Read data from user creation form and send request to create user. */
var submitUserForm = function () {
    var fields = $('#userform').serializeArray();
    var user = {};

    jQuery.each(fields, function (i, field) {
        user[field.name] = field.value;
    });

    $.ajax({
        type: 'PUT',
        url: '/useradd',
        data: user,
        success: function (data) {
            displayAccountsTable();
            successSnackbar('User ' + user.username + ' added to database');
        },
        error: function (data) {
            var jsonResponse = data.responseJSON;

            if (data['status'] === 401) {
                window.location.href = '/';
            } else if (data['status'] === 404) {
                window.location.href = '/page-not-found';
            } else if (jsonResponse.code === 2019) {
                warningSnackbar(getErrorFromResponse(jsonResponse));
            } else {
                failSnackbar(getErrorFromResponse(jsonResponse));
            }
        }
    });
}

/* Process submitted user edit form. */
var submitEditForm = function (id) {
    var fields = $('#account-edit-form').serializeArray();
    var user = {
        _id: id
    };

    jQuery.each(fields, function (i, field) {
        if (field.value) {
            user[field.name] = field.value;
        }
    });

    $.ajax({
        type: 'POST',
        url: '/usermod',
        data: user,
        success: function (data) {
            $('#admin-content').html(data.html);
            $('#account-edit-form').submit(function (evt) {
                evt.preventDefault();
                submitEditForm(user._id);
            });
            displayAccountsTable();
            successSnackbar('User ' + user.username + ' has been updated');
        },
        error: function (data) {
            var jsonResponse = data.responseJSON;

            if (data['status'] === 401) {
                window.location.href = '/';
            } else if (data['status'] === 404) {
                window.location.href = '/page-not-found';
            } else {
                failSnackbar(getErrorFromResponse(jsonResponse));
            }
        }
    });
}

/* Updates the Vilibility of a Question */
var updateVisibility = function (qid, questionNumber) {
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
                    success: function (data) {
                        // Toast notifiation
                        const msg = question['visible'] ? ' is now visible to the students' : ' is now&nbsp<u><b>not</b></u>&nbspvisible to the students';

                        if (question['visible']) {
                            successSnackbar('Question ' + questionNumber + msg);
                            $('#hiddenEye' + qid).html('visibility');
                        } else {
                            warningSnackbar('Question ' + questionNumber + msg);
                            $('#hiddenEye' + qid).html('visibility_off');
                        }
                    },
                    error: function (data) {
                        var jsonResponse = data.responseJSON;

                        if (data['status'] === 401) {
                            window.location.href = '/';
                        } else if (data['status'] === 404) {
                            window.location.href = '/page-not-found';
                        } else {
                            // Toast notification
                            $('#checked-' + qid).prop('checked', !question['visible']);
                            failSnackbar(getErrorFromResponse(jsonResponse));
                        }
                    }
                });
            // User cancels the visibility change
            } else {
                $('#checked-' + qid).prop('checked', !$('#checked-' + qid).is(':checked'));
            }
        }
    );
}

/*Collects form fields for Question-Creation and Question-Edit*/
var collectQuestionFormData = function (form) {
    var fields = $(form).serializeArray();
    var question = {};
    question['choices'] = [];
    question['leftSide'] = [];
    question['rightSide'] = [];
    question['answer'] = [];

    jQuery.each(fields, function (i, field) {
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

        if(field.name.startsWith('checkButton') ) {
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

/* Process submiting new question */
var submitQuestionForm = function () {
    if ($('#qtext').summernote('isEmpty')) {
        failSnackbar('Please enter a question body in the editor.');
        return;
    }

    if (parseInt($('#qminpoints').val()) > parseInt($('#qmaxpoints').val())) {
        warningSnackbar('Minimum points must be less than or equal to max points');
        return;
    }

    var question = collectQuestionFormData('#questionform');

    question['type'] = $('#qType').select().val();
    $.ajax({
        type: 'PUT',
        url: '/questionadd',
        data: question,
        success: function (data) {
            successSnackbar('Question added to database');
            displayQuestionTable();
        },
        error: function (data) {
            var jsonResponse = data.responseJSON;

            if (data['status'] === 401) {
                window.location.href = '/';
            } else if (data['status'] === 404) {
                window.location.href = '/page-not-found';
            } else if ([3022,3024,3025,3026].indexOf(jsonResponse['code'])) {
                warningSnackbar(getErrorFromResponse(jsonResponse));
            } else {
                failSnackbar(getErrorFromResponse(jsonResponse));
            }
        }
    });
}

var deleteQuestion = function (qid, questionNumber) {
    swal({
        title: 'Confirm deletion',
        text: 'Question ' + questionNumber + ' will be removed from the database.',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: colours.pinkLightExtra,
        confirmButtonText: 'Delete',
        closeOnConfirm: true
    }, function () {
        $.ajax({
            type: 'POST',
            url: '/questiondel',
            data: { qid: qid },
            success: function (data) {
                successSnackbar('Question ' + questionNumber + ' was removed from the database');
                displayQuestionTable();
            },
            error: function (data) {
                if (data['status'] === 401) {
                    window.location.href = '/';
                } else if (data['status'] === 404) {
                    window.location.href = '/page-not-found';
                } else {
                    failSnackbar('Coud not remove question from the database');
                }
            }
        });
    });
}

var editQuestion = function (qid, questionNumber) {
    $.ajax({
        type: 'GET',
        url: '/questionedit',
        data: { questionid: qid },
        success: function (data) {
            $('#admin-content').html(data.html);
            $('#question-edit-back-button').click(function (evt) {
                displayQuestionTable();
            });
            initSummernote();
            $('#qtext').summernote('code', data.qtext);
            $('#question-edit-form').submit(function (evt) {
                evt.preventDefault();
                submitQEditForm(qid, questionNumber);
            });
            setRating(data.qrating);

            // gets the updated topics list
            getQuestionsTopicsList();
        },
        error: function (data) {
            var jsonResponse = data.responseJSON;

            if (data['status'] === 401) {
                window.location.href = '/';
            } else if (data['status'] === 404) {
                window.location.href = '/page-not-found';
            } else {
                failSnackbar(getErrorFromResponse(jsonResponse));
            }
        }
    });
}

var submitQEditForm = function (qid, questionNumber) {
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
        success: function (data) {
            successSnackbar('Question ' + questionNumber + ' has been modified.');
            displayQuestionTable();
        },
        error: function (data) {
            var jsonResponse = data.responseJSON;
            if (data['status'] === 401) {
                window.location.href = '/';
            } else if (data['status'] === 404) {
                window.location.href = '/page-not-found';
            } else if ([3022,3024,3025,3026].indexOf(jsonResponse['code'])) {
                warningSnackbar(getErrorFromResponse(jsonResponse));
            } else {
                failSnackbar(getErrorFromResponse(jsonResponse));
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
        success: function (data) { },
        error: function (data) {
            var jsonResponse = data.responseJSON;

            if (data['status'] === 401) {
                window.location.href = '/';
            } else if (data['status'] === 404) {
                window.location.href = '/page-not-found';
            } else {
                failSnackbar(getErrorFromResponse(jsonResponse));
            }
        }
    });
}

/**
 * Toggles the view of the Visibility Checkboxes in the Question-Table View
 * @param {boolean} toggle only usesd so the visibily snackbar can turn on display mode
 */
var toggleButtonVisibility = function(toggle) {
    if ($('#sw').is(':checked') || toggle) {
        $('.visbox').show();
        $('.hiddenEye').hide();
        $('#sw').prop('checked', true);
    } else {
        $('.visbox').hide();
        $('.hiddenEye').show();
    }
}

// get questions topics list
var getQuestionsTopicsList = function () {
    $.ajax({
        async: false,
        type: 'GET',
        url: '/questionsListofTopics',
        success: function (data) {
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
        error: function (data) {
            if (data['status'] === 401) {
                window.location.href = '/';
            } else if (data['status'] === 404) {
                window.location.href = '/page-not-found';
            }
        }
    });

}

/* Initialize the summernote and all its sub modal */
var initSummernote = function () {
    $('#qtext').summernote({ height: 100 });
    $('div.note-btn-group.btn-group button').unbind('mouseenter mouseleave').addClass('customSummernoteButton');
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
    $('div.note-btn-group.btn-group.note-insert button:nth-child(3)').remove();
    $('div.note-btn-group.btn-group.note-view button:nth-child(3)').click(function () {
        $('#mediaModal3').modal('open');
        $('#mediaModal3 > div > div > div.modal-header > button').click(function () {
            $('#mediaModal3').modal('close');
        });
    });
    $('.modal').modal({
        dismissible: false
    });
    $('div.note-editor.note-frame.panel.panel-default .modal').each(function ( i ) {
        $(this).attr('id', 'mediaModal' + i);
        $('#mediaModal' + i +'> div > div').removeClass('modal-content');
    });
}

/**
 * Updates the visibility of all questions, based on the changeValue
 * @param {boolean} changeValue true if user is showing all questions, false if user is hiding all questions
 */
var updateAllVisibility = function (changeValue) {
    swal({
        type: 'warning',
        title: 'Visibilty Change',
        text: 'You are about to change the visibility of ALL the questions.',
        showCancelButton: true,
        showConfirmButton: true,
        // User can only close the swal if they click one of the buttons
        allowEscapeKey: false,
        allowClickOutside: false,
        },
        function (isConfirm) {
            // User confirms the visiblity change
            if (isConfirm) {
                $.ajax({
                    type: 'POST',
                    url: '/changeAllVisibility',
                    data: {
                        changeValue: changeValue
                    },
                    success: function(data) {
                        // Changes the checkboxes and icons match the new visibility
                        $('.checked').prop('checked', changeValue);
                        if (changeValue) {
                            $('.hiddenEye').html('visibility');
                            warningSnackbar('All questions are now VISIBLE.');
                        } else {
                            $('.hiddenEye').html('visibility_off');
                            warningSnackbar('All questions are now HIDDEN.');
                        }
                    },
                    error: function(data) {
                        var jsonResponse = data.responseJSON;
                        if (data['status'] === 401) {
                            window.location.href = '/';
                        } else if (data['status'] === 404) {
                            window.location.href = '/page-not-found';
                        } else {
                            failSnackbar(getErrorFromResponse(jsonResponse));
                        }
                    }
                });
            }
        }
    );
}
