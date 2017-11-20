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
