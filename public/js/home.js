var sortTypes;
var leaderboardRow;
var leaderboardTable;
var studentLeaderList;

/* Fetch the list of valid question list sort types from the server.
$.ajax({
    type: 'GET',
    url: '/sortlist',
    success: function(data) {
        sortTypes = data;
    }
});*/

/* set home as the active navbar element */
$('#nav-home').addClass('active');

$('#sort-topic').click(function(evt) {
    sortRequest(sortTypes.SORT_TOPIC);
});

$('#sort-point').click(function(evt) {
    sortRequest(sortTypes.SORT_POINTS);
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
            $('.question-list').html(data);
        },
        error: function(data){
            if (data['status'] === 401) {
                window.location.href = '/';
            }
        }
    });
}

fetchQList('unanswered');

/*
 * Send a request to sort the question list in a given order.
 */
var sortRequest = function(type) {
    $.ajax({
        type: 'POST',
        url: '/sortlist',
        data: { sort: type },
        success: function(data) {
            var s;

            switch (type) {
            case sortTypes.SORT_TOPIC:
                s = 'Topic';
                break;
            case sortTypes.SORT_POINTS:
                s = 'Points';
                break;
            }
            $('.question-list').html(data);
            $('#sort').html(s + '<span class="caret"></span>');
        },
        error: function(data){
            if (data['status'] === 401) {
                window.location.href = '/';
            }
        }
    });
};

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
            studentLeaderList = data.leader;
            $('.leaderboard-small').html(leaderboardTable);
            $('#userRank').html('Current Rank: ' + data.displayRank);            
            displayLeaderboard(studentLeaderList, data.userId);
        }
    });
}

fetchLeaderboard();

// Adds the students information to the leaderboard
var displayLeaderboard = function(studentLeaderList, userId) {
    $('.podium').hide();
    $('#criteriaName').html('Points');
    studentLeaderList.forEach((studentObject, index) => {
        // This give colour to rows where the student's rank is in the top 3
        leaderboardRow.attr('class', `rank-${studentObject.userRank <= 3 ? studentObject.userRank : 'default'}`);
        leaderboardRow.find('#rank').html(studentObject.userRank);
        leaderboardRow.find('#displayName').html(studentObject.displayName);
        leaderboardRow.find('#criteria').html(studentObject.points);       
        $('#leaderboardBody').append(leaderboardRow[0].outerHTML);
        // if (userId === studentObject.id){
        //     $('#userRank').html('Your rank is ' + rank);
        // }   
    });
}