/* Process a user login request. */
var failedLoginTemplate = '<div class="chip white-text red darken-4">{0}<i class="close material-icons">close</i></div>';

$('#login').submit(function(evt) {
    evt.preventDefault();
    $.ajax({
        type: 'POST',
        url: '/login',
        data: $('#login').serialize(),
        success: function(data) {
            window.location.href = '/home';
        },
        error: function(data) {
            var msg = 'Invalid username or password';
            if (data['responseText'] === 'notActive') {
                msg = 'Account has been deactivated'
            }
            $('#invalid').html(failedLoginTemplate.format([msg]));
        },
        complete: function(data) {
            $('#passwd').val('').focus();
        }
    });
});

// This is the function.
String.prototype.format = function (args) {
    var str = this;
    return str.replace(String.prototype.format.regex, function(item) {
        var intVal = parseInt(item.substring(1, item.length - 1));
        var replace;
        if (intVal >= 0) {
            replace = args[intVal];
        } else if (intVal === -1) {
            replace = "{";
        } else if (intVal === -2) {
            replace = "}";
        } else {
            replace = "";
        }
        return replace;
    });
};

String.prototype.format.regex = new RegExp("{-?[0-9]+}", "g");