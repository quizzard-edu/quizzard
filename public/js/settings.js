$(function() {
    getQuestionsTopicsList();
});

/**
 * get questions topics list
 *
 */
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
            }
        }
    });
}

/**
 * remove the modification done on the settings page
 *
 */
var cancel = function() {
    swal({
        title: 'Confirm Cancel',
        text: 'Your current changes will not be applied',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#DD6B55',
        confirmButtonText: 'Confirm',
        closeOnConfirm: true
    }, function() {
        displaySettings();
        successSnackbar('Changes canceled');
    });
}

/**
 * reset the settings to their default value
 *
 */
var resetDefault = function() {
    swal({
        title: 'Reset to Default',
        text: 'All the settings will be reverted to their default value',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#DD6B55',
        confirmButtonText: 'Confirm',
        closeOnConfirm: true
    }, function() {
        $.ajax({
            type: 'POST',
            url: '/resetSettings',
            success: function(data) {
                displaySettings();
                successSnackbar('Default settings have been applied');
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
    });
}


/**
 * save the new set of settings
 *
 */
var save = function() {
    swal({
        title: 'Confirm Save',
        text: 'Are you sure you would like to save the current changes',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#DD6B55',
        confirmButtonText: 'Confirm',
        closeOnConfirm: true
    }, function() {
        $.ajax({
            type: 'POST',
            url: '/updateSettings',
            data: {
                settings: {
                    classActive: $('#classActive').is(':checked'),
                    studentsOnLeaderboard: $('#leaderboardStudents').val(),
                    allowEditName: $('#allowEditName').is(':checked'),
                    allowEditEmail: $('#allowEditEmail').is(':checked'),
                    allowEditPassword: $('#allowEditPassword').is(':checked'),
                    topic: $('#qtopic').val(),
                    minPoints: $('#qMinPoints').val(),
                    maxPoints: $('#qMaxPoints').val(),
                    allowTimeout: $('#allowTimeout').is(':checked'),
                    timeoutPeriod: $('#qtimeout').val(),
                    discussionView: $("input[name='discussionView']:checked").val(),
                    allowDislikes: $('#allowDislikes').is(':checked')
                }
            },
            success: function(data) {
                successSnackbar('Changes have been updated');
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
    });
}
