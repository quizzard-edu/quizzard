// Set of colour variables to be unified
const colours = Object.freeze({
    blue          : 'rgb(54, 162, 235)',
    grayLight     : 'rgb(115, 124, 140)',
    green         : 'green',
    greenBorder   : 'rgba(43, 163, 0, 1)',
    greenLight    : 'rgba(43, 244, 33, 0.5)',
    orange        : 'orange accent-4',
    pink          : 'rgb(255, 99, 132)',
    redBorder     : 'rgba(243, 13, 20, 1)',
    redDark       : 'red darken-4',
    redLight      : 'rgba(243, 13, 20, 0.5)',
    white         : 'white'
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
