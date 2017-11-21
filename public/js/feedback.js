function userFeedback() {
    $('#feedback').modal({
        dismissible: false,
        opacity: 0.5,
        complete: function() {
            var subject = $('#subject').val();
            var message = $('#feedbackArea').val();

            if(subject !== "" && message !== "") {
                $.ajax({
                    type: 'POST',
                    url: '/submitFeedback',
                    data: {
                        subject: subject,
                        message: message,
                    },
                    success: function(data) {
                        setTimeout(function(){location.reload(); }, 5500);
                        successSnackbar("Successfully submitted feedback");
                    },
                    error: function(data) {
                        setTimeout(function(){location.reload(); }, 5500);
                        failSnackbar("Something went wrong");
                    }
                });
            } else {
                failSnackbar("Please enter a subject and a message");
            }
        }
    });

    $('#feedback').modal('open');
}