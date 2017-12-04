//var sortTypes;
var leaderboardRow;
var leaderboardTable;
var studentLeaderList;

$(function () {
    fetchQList('unanswered');
    fetchLeaderboard();
});

/* set home as the active navbar element */
$('#nav-home').addClass('active');

$('#sort-topic').click(function(evt) {
    alert('Sort by ' + sortTypes.SORT_TOPIC);
});

$('#sort-type').click(function(evt) {
    alert('Sort by ' + sortTypes.SORT_TYPE);
});

$('#sort-date').click(function(evt) {
    alert('Sort by ' + sortTypes.SORT_DATE);
});

$('#sort-attempt').click(function(evt) {
    alert('Sort by ' + sortTypes.SORT_ATTEMPT);
});

$('#qlist-unanswered').click(function(evt) {
    fetchQList('unanswered');
});

$('#qlist-answered').click(function(evt) {
    fetchQList('answered');
});

var fetchQList = function(which) {
    $.ajax({
        type: 'GET',
        url: '/questionlist',
        data: { type: which },
        success: function(data) {
            debugger;
            alert(data.questions);
            $('.question-list').html(data.questionListHTML);
            //$('.question-list').html(html);
        },
        error: function(data){
            debugger;
            var jsonResponse = data.responseJSON;

            if (data['status'] === 401) {
                window.location.href = '/';
            } else {
                failSnackbar(getErrorFromResponse(jsonResponse));
            }
        }
    });
}

// chenge the href to point to the questoin page with the given id
var goToQuestion = function (questionId) {
    window.location.href = '/question?_id=' + questionId;
}

/*
 * Fetch the mini leaderboard table and display it in the sidebar.
 */
var fetchLeaderboard = function() {
    $.ajax({
        type: 'GET',
        url: '/leaderboard-table',
        data: {
            smallBoard: true
        },
        success: function(data) {
            leaderboardTable = $(data.leaderboardTableHTML);
            leaderboardRow = $(data.leaderboardRowHTML);
            studentLeaderList = data.leaderboardList;
            $('.leaderboard-small').html(leaderboardTable);
            displayLeaderboard(studentLeaderList, data.userId);
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
}

// Adds the students information to the leaderboard
var displayLeaderboard = function(studentLeaderList, userId) {
    $('#criteriaName').html('Points');
    studentLeaderList.forEach((studentObject, index) => {
        // This give colour to rows where the student's rank is in the top 3 and the current student.
        leaderboardRow.attr('class', `rank-${studentObject.userRank <= 3 ? studentObject.userRank : 'user'}`);
        leaderboardRow.find('#rank').html(studentObject.userRank);
        leaderboardRow.find('#displayName').html(studentObject.displayName);
        leaderboardRow.find('#criteria').html(studentObject.points);
        $('#leaderboardBody').append(leaderboardRow[0].outerHTML);
    });
}
