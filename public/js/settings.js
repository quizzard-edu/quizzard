$(function() {
    getQuestionsTopicsList();
});


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
        successSnackbar('Changes canceled')
    });
}

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
        //TODO: call the reset to default function
        displaySettings();
        successSnackbar('Default settings have been applied')
    });
}

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
        displaySettings();
        successSnackbar('Changes have been updated')
    });
}
