var rank;
var prevRank;
var sortTypes;
var leaderboardRow;
var leaderboardTable;
var studentLeaderList;
var userRank;

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
            displayTable(studentLeaderList, data.userId);
        }
    });
}

fetchLeaderboard();

var displayTable = function(studentLeaderList, userId) {
    $('.podium').hide();
    topPoints = -1;
    bestIndex = 0;
    $('#criteriaName').html('Points');
    studentLeaderList.forEach((studentObject, index) => {
        if (index === 0) {
            leaderboardRow.find('#rank').html(index + 1);
            rank = 1;
            prevRank = rank;
        } else {
            if (studentLeaderList[index - 1].points === studentObject.points) {
                rank = prevRank;
                leaderboardRow.find('#rank').html(rank);
            } else {
                rank = index + 1;
                prevRank = rank;
                leaderboardRow.find('#rank').html(rank);
            }
        } 
        leaderboardRow.attr('class', `rank-${rank <= 3 ? rank : 'default'}`);
        leaderboardRow.attr('class', `rank-${index + 1 <= 3 ? index + 1 : 'default'}`);
        leaderboardRow.find('#displayName').html(studentObject.displayName);
        leaderboardRow.find('#criteria').html(studentObject.points);       
        $('#leaderboardBody').append(leaderboardRow[0].outerHTML);
        if (userId === studentObject.id){
            $('#userRank').html('Your rank is ' + rank);
        }   
    });
}