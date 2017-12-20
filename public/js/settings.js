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
            } else if (data['status'] === 404) {
                window.location.href = '/page-not-found';
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
        confirmButtonColor: colours.pinkLightExtra,
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
        confirmButtonColor: colours.pinkLightExtra,
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
                } else if (data['status'] === 404) {
                    window.location.href = '/page-not-found';
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
        confirmButtonColor: colours.pinkLightExtra,
        confirmButtonText: 'Confirm',
        closeOnConfirm: true
    }, function() {
        $.ajax({
            type: 'POST',
            url: '/updateSettings',
            data: {
                settings: {
                    classActive: $('#classActive').is(':checked'),
                    limitedLeaderboard: $('#limitedLeaderboard').is(':checked'),
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
                } else if (data['status'] === 404) {
                    window.location.href = '/page-not-found';
                } else {
                    failSnackbar(getErrorFromResponse(jsonResponse));
                }
            }
        });
    });
}
