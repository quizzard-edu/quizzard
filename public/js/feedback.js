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

            // if the user submitted content, and if the user didnt hit the cancel button
            if(subject !== '' && message !== '' && !cancelling) {
                $.ajax({
                    type: 'POST',
                    url: '/submitFeedback',
                    data: {
                        subject: subject,
                        message: message,
                    },
                    success: function(data) {
                        successSnackbar("Successfully submitted feedback");
                    },
                    error: function(data){
                        var jsonResponse = data.responseJSON;
            
                        if (data['status'] === 401) {
                            window.location.href = '/';
                        } else {
                            failSnackbar(getErrorFromResponse(jsonResponse));
                        }
                    }
                });
            } else if(cancelling) { // if they hit the cancel button, clear stuff, dont go anywhere
                cancelling = false;

                $('#subject').val('');
                $('#feedbackArea').val('');
                $('#email').val('');
                $('#feedbackArea').trigger('autoresize');
                $('#modal-content').scrollTop(0);
            } else { // if their content was empty, do nothing and notify them
                $('#subject').val(subject);
                $('#feedbackArea').val(message);
                failSnackbar("Please enter a subject and a message");
            }
        }
    });

    $('#feedback').modal('open');
}

function removeAllFeedback() {
    swal({
        title: 'Remove All Feedback',
        text: 'You are about to remove all the student feedback',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: colours.pinkLight,
        confirmButtonText: 'Confirm',
        closeOnConfirm: true
    }, function() {
        $.ajax({
            type: 'POST',
            url: '/removeAllFeedback',
            success: function(data) {
                successSnackbar("Successfully removed all feedback");
                window.location.href = '/';
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