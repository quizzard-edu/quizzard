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
                        } else if (data['status'] === 404) {
                            window.location.href = '/page-not-found';
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
        confirmButtonColor: colours.pinkLightExtra,
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
                } else if (data['status'] === 404) {
                    window.location.href = '/page-not-found';
                } else {
                    failSnackbar(getErrorFromResponse(jsonResponse));
                }
            }
        });
    });
}
