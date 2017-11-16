// Set of colour variables to be unified
const colours = Object.freeze({
    blackLight     : 'rgb(51, 51, 51)',
    blue           : 'rgb(54, 162, 235)',
    blueLight      : 'rgb(51, 102, 255)',
    blueLightExtra : 'rgb(51, 102, 155)',
    grayLight      : 'rgb(115, 124, 140)',
    green          : 'green',
    greenBorder    : 'rgba(43, 163, 0, 1)',
    greenLight     : 'rgba(43, 244, 33, 0.5)',
    orange         : 'orange accent-4',
    pink           : 'rgb(255, 99, 132)',
    redBorder      : 'rgb(243, 13, 20)',
    redDark        : 'red darken-4',
    redLight       : 'rgba(243, 13, 20, 0.5)',
    white          : 'white'
});

const snack = Object.freeze({
    success     :   '<i class="material-icons">check</i>&nbsp&nbsp&nbsp',
    warning     :   '<i class="material-icons">warning</i>&nbsp&nbsp&nbsp',
    fail        :   '<i class="material-icons">block</i>&nbsp&nbsp&nbsp',
    close       :   '&nbsp&nbsp&nbsp<i id=closeSnack class="material-icons">close</i>'
})

// This is the function.
String.prototype.format = function (args) {
    var str = this;
    return str.replace(String.prototype.format.regex, function(item) {
        var intVal = parseInt(item.substring(1, item.length - 1));
        var replace;
        if (intVal >= 0) {
            replace = args[intVal];
        } else if (intVal === -1) {
            replace = '{';
        } else if (intVal === -2) {
            replace = '}';
        } else {
            replace = '';
        }
        return replace;
    });
};

String.prototype.format.regex = new RegExp('{-?[0-9]+}', 'g');

/* This function slides down a success snakbar */
function successSnackbar(msg) {
    // runs the toast function for 5s with given msg and colour
    Materialize.toast(snack.success + msg + snack.close, 5000, 'rounded ' + colours.green);
}

/* This function slides down a warning snakbar */
function warningSnackbar(msg) {
    // runs the toast function for 5s with given msg and colour
    Materialize.toast(snack.warning + msg + snack.close, 5000, 'rounded ' + colours.orange);
}

/* This function slides down a fail snakbar */
function failSnackbar(msg) {
    // runs the toast function for 5s with given msg and colour
    Materialize.toast(snack.fail + msg + snack.close, 5000, 'rounded ' + colours.redDark);
}

/* Listener for the `x` on the snackbar/toasts */
$(document).on('click', '#closeSnack', function() {
    $(this).parent().fadeOut();
});

function userFeedback() {
    $('#modalFeedback').modal({
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
                        
                    },
                    error: function(data) {
                        
                    }
                });
            } else {
                failSnackbar("Please enter a valid subject and message");
            }
        }
    });

    $('#modalFeedback').modal('open');
}