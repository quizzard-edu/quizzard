// Set of colour variables to be unified
const colours = Object.freeze({
    blackLight     : 'rgb(51, 51, 51)',
    blue           : 'rgb(54, 162, 235)',
    blueBack       : '#90CAF9',
    blueBackO      : 'rgba(168, 216, 255, 0.3)',
    blueLight      : 'rgb(51, 102, 255)',
    blueLightExtra : 'rgb(51, 102, 155)',
    blueMatt       : '#42A5F5',
    cyan           : '#00bcd4',
    cyanLight      : '#44e8ff',
    cyanLightO     : 'rgba(68, 232, 255, 0.2)',
    grayDark       : '#424242',
    grayDarkO      : 'rgba(0, 0, 0, 0.2)',
    grayLight      : 'rgb(115, 124, 140)',
    green          : 'green',
    greenBorder    : 'rgba(43, 163, 0, 1)',
    greenLight     : 'rgba(43, 244, 33, 0.5)',
    lime           : '#CDDC39',
    limeLight      : '#f7ffb2',
    limeLightO     : 'rgba(247, 255, 178, 0.2)',
    orange         : '#ff6e40',
    orangeDark     : 'orange accent-4',
    orangeLight    : '#fcab92',
    orangeLightO   : 'rgba(252, 171, 146, 0.2)',
    pink           : 'rgb(255, 99, 132)',
    pinkLightExtra : '#DD6B55',
    pinkHot        : '#F06292',
    pinkLight      : '#F8BBD0',
    pinkLightO     : 'rgba(255, 150, 185, 0.3)',
    purple         : '#673AB7',
    purpleLight    : '#b691f7',
    purpleLightO   : 'rgba(182, 145, 247, 0.2)',
    redBorder      : 'rgb(243, 13, 20)',
    redDark        : 'red darken-4',
    redLight       : 'rgba(243, 13, 20, 0.5)',
    teal           : '#00bfa5',
    tealLight      : '#93fff0',
    tealLightO     : 'rgba(147, 255, 240, 0.2)',
    transparent    : 'rgba(0, 0, 0, 0)',
    white          : 'white'
});

const snack = Object.freeze({
    success     :   '<i class="material-icons">check</i>&nbsp&nbsp&nbsp',
    warning     :   '<i class="material-icons">warning</i>&nbsp&nbsp&nbsp',
    fail        :   '<i class="material-icons">block</i>&nbsp&nbsp&nbsp',
    visibility  :   '<i class="material-icons" onclick="toggleButtonVisibility(true)">edit</i>&nbsp&nbsp&nbsp',
    close       :   '&nbsp&nbsp&nbsp<i id=closeSnack class="material-icons">close</i>'
});

const sortTypes = Object.freeze({
    SORT_TITLE      :   {value: 'title', display: 'Title'},
    SORT_TOPIC      :   {value: 'topic', display: 'Topic'},
    SORT_TYPE       :   {value: 'type', display: 'Type'},
    SORT_DATE       :   {value: 'ctime', display: 'Date'},
    SORT_ATTEMPT    :   {value: 'totalAttemptsCount', display: 'Attempts'}
});

const loadingAnimation = '<div class="progress"><div class="indeterminate"></div></div>';

const leaderboardTypes = Object.freeze({
    OVERALLBOARD  : {name: 'overall', displayName: 'Overall'},
    POINTSBOARD   : {name: 'points', displayName: 'Points'},
    ACCURACYBOARD : {name: 'accuracy', displayName: 'Accuracy'},
    ATTEMPTBOARD  : {name: 'attempt', displayName: 'Points Per Attempt'}
});

const questionTypes = Object.freeze({
    mc         : {value: 'Multiple Choice', icon: 'format_list_bulleted'},
    re         : {value: 'Regular', icon: 'font_download'},
    tf         : {value: 'True and False', icon: 'check_circle'},
    matching   : {value: 'Matching', icon: 'dashboard'},
    ca         : {value: 'Choose All', icon: 'format_list_bulleted'},
    ordering   : {value: 'Ordering', icon: 'format_list_bulleted'}
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
}

String.prototype.format.regex = new RegExp('{-?[0-9]+}', 'g');

/* This function slides down a success snakbar */
function successSnackbar(msg) {
    // runs the toast function for 5s with given msg and colour
    Materialize.toast(snack.success + msg + snack.close, 5000, 'rounded ' + colours.green);
}

/* This function slides down a warning snakbar */
function warningSnackbar(msg) {
    // runs the toast function for 5s with given msg and colour
    Materialize.toast(snack.warning + msg + snack.close, 5000, 'rounded ' + colours.orangeDark);
}

/* This function slides down a fail snakbar */
function failSnackbar(msg) {
    // runs the toast function for 5s with given msg and colour
    Materialize.toast(snack.fail + msg + snack.close, 5000, 'rounded ' + colours.redDark);
}

/* This function slides down a visibility snakbar */
function visibilitySnackbar() {
    // runs the toast function for 5s with given msg and colour
    Materialize.toast(`${snack.visibility}  You are currently in display mode, please enable edit mode or click the icon on the left.  ${snack.close}`, 5000, `rounded ${colours.orange}`);
}

/* Listener for the `x` on the snackbar/toasts */
$(document).on('click', '#closeSnack', function() {
    $(this).parent().fadeOut();
});


/*
These errors are only for UI use
Error codes and their corresponding message. Error codes are under different
categories:
1000 -> system
2000 -> user
3000 -> question
4000 -> class
5000 -> analytics
6000 -> import/export
7000 -> settings
8000 -> feedback
*/

const errors = Object.freeze({
    //1000 system
    1000: 'A system error has occured',
    1001: 'Missing Requirement',
    1002: 'Permission Denied',
    1003: 'Confirm password doesn\'t match',
    1004: 'Database connection failed',
    1005: 'Database Error',
    1006: 'Invalid username or password',
    1007: 'A system error has occured',
    1008: 'A system error has occured',
    1009: 'A system error has occured',
    1010: 'A system error has occured',
    1011: 'A system error has occured',
    1012: 'A system error has occured',
    1013: 'A system error has occured',

    //2000 user
    2000: 'Invalid username or password',
    2001: 'Failed to get student',
    2002: 'Failed to get student list',
    2003: 'Failed to get student list',
    2004: 'Failed to get data',
    2005: 'Failed to add admin',
    2006: 'Failed to get user',
    2007: 'Failed to add student',
    2008: 'Failed to change student account status',
    2009: 'User cannot be found',
    2010: 'Password is incorrect',
    2011: 'Failed to update profile',
    2012: 'Failed to update',
    2013: 'Failed to get users list',
    2014: 'Failed to check if user exists',
    2015: 'Failed to get student list',
    2016: 'Failed to remove users',
    2017: 'Failed to find user',
    2018: 'Failed to update user',
    2019: 'User already exists',
    2020: 'Failed to get leaderboard',

    //3000 question
    3000: 'Failed to get question list',
    3001: 'Failed to get question',
    3002: 'Failed to find question',
    3003: 'Question not found',
    3004: 'Failed to get questions list',
    3005: 'Question is not available',
    3006: 'Failed to submit answer',
    3007: 'Failed to add question',
    3008: 'Invalid rating',
    3009: 'Failed to submit rating',
    3010: 'Failed to get discussion board visibility',
    3011: 'Discussion board is not available',
    3012: 'Failed to add comment',
    3013: 'Failed to add reply',
    3014: 'Invalid vote',
    3015: 'Failed to vote on comment',
    3016: 'Failed to vote on reply',
    3017: 'Failed to get question list',
    3018: 'Failed to add question',
    3019: 'Failed to find question',
    3020: 'Failed to update question',
    3021: 'Failed to get question data',
    3022: 'Invalid question attributes',
    3023: 'Failed to remove question',

    //4000 class
    4000: 'A system error has occured',

    //5000 analytics
    5000: 'Graphs not available',

    //6000 import/export
    6000: 'Failed to find student from export list',
    6001: 'Export job failed',
    6002: 'Invalid file format',
    6003: 'Failed to upload file',
    6004: 'Failed to parse file',
    6005: 'Invalid student list',
    6006: 'File cannot be found',
    6007: 'Failed to download',

    //7000 setting
    7000: 'Failed to reset settings',
    7001: 'Failed to update settings',
    7002: 'Failed to add setting',
    7003: 'Failed to get settings',
    7004: 'Settings not found',
    7005: 'Failed to get settings',
    7006: 'Class is not active',

    //8000 feedback
    8000: 'Failed to add feedback',
    8001: 'Failed to get feedback',
    8002: 'Failed to remove all feedback',

    //9000 virtual file system
    9000: 'A system error has occured',
    9001: 'Failed to upload',
    9002: 'Failed to upload',
    9003: 'Failed to find file',
    9004: 'Failed to upload',
    9005: 'Permission denied',
    9006: 'Permission denied'
});

const defaultError = 'A system error has occured';

function getErrorFromResponse(data) {
    return errors[data['code']] || defaultError;
}
