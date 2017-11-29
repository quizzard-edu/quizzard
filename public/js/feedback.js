var cancelling = false;

function userFeedback() {
    $('.collapsible').collapsible();
    
    $('#feedback').modal({
        dismissible: false,
        opacity: 0.5,
        complete: function() {
            var subject = $('#subject').val();
            var message = $('#feedbackArea').val();

            $('#subject').val('');
            $('#feedbackArea').val('');
            $('#feedbackArea').trigger('autoresize');
            $('#modal-content').scrollTop(0);
            $('.collapsible').collapsible('close', 0);

            if(subject !== "" && message !== "" && !cancelling) { // if all is good, make call
                $.ajax({
                    type: 'POST',
                    url: '/submitFeedback',
                    data: {
                        subject: subject,
                        message: message,
                    },
                    success: function(data) {
                        
                        // wait for snackbar to finish, then reload page
                        setTimeout(function(){location.reload(); }, 5500);
                        successSnackbar("Successfully submitted feedback");
                    },
                    error: function(data) {

                        // wait for snackbar to finish, then reload the page
                        setTimeout(function(){location.reload(); }, 5500);
                        failSnackbar("Something went wrong");
                    }
                });
            } else if(cancelling) { // if they hit the cancel button, clear stuff, dont go anywhere
                cancelling = false;

                $('#subject').val('');
                $('#feedbackArea').val('');
                $('#email').val('');
                $('#feedbackArea').trigger('autoresize');
                $('#modal-content').scrollTop(0);
                $('.collapsible').collapsible('close', 0);
                $('.collapsible').collapsible('close', 1);

            } else { // if their content was empty, do nothing and notify them
                $('#subject').val(subject);
                $('#feedbackArea').val(message);
                failSnackbar("Please enter a subject and a message");
            }
        }
    });

    $('#feedback').modal('open');
}