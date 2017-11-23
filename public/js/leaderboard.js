/* set home as the active navbar element */
$('#nav-leaderboard').addClass('active');

var boardType = leaderboardTypes.OVERALL;
var leaderboardRow;
var leaderboardTable;
var studentLeaderList;
var topScore;

/* Get HTML for the complete leaderboard table from the server and display it. */
var fetchLeaderboard = function() {
    
    $.ajax({
        type: 'GET',
        url: '/leaderboard-table',
        data: {
            longTable: true
        },
        success: function(data) {
            leaderboardTable = $(data.leaderboardTableHTML);
            leaderboardRow = $(data.leaderboardRowHTML);
            studentLeaderList = data.leader;
            $('.leaderboard-content').html(leaderboardTable);
            displayNewLeaderboard(boardType);
        }
    });
}

fetchLeaderboard();

var displayTable = function(studentLeaderList) {
    var bestScore = -1;
    var bestIndex = 0;
    $('#leaderboardBody').html('');
    $('#criteriaName').html(boardType.displayName);
    topScore = studentLeaderList[0][boardType.name];
    leaderboardTable.find('#topScore').html(topScore);
    studentLeaderList.forEach((studentObject, index) => {
        
        if (studentObject[boardType.name] !== bestScore) {
            bestIndex = index;
            bestScore = studentObject[boardType.name];            
            leaderboardRow.find('#rank').html(bestIndex + 1);
        }
        else {
            leaderboardRow.find('#rank').html(bestIndex + 1);            
        }
        leaderboardRow.attr('class', topThree(bestIndex));
        leaderboardRow.find('#displayName').html(studentObject.displayName);
        leaderboardRow.find('#criteria').html(studentObject[boardType.name] + 
            ((boardType === leaderboardTypes.ACCURACY) ? '%' : ''));        
        $('#leaderboardBody').append(leaderboardRow[0].outerHTML);
    });
}

var sortLeaderBoard = function(citeria) {
    studentLeaderList = studentLeaderList.sort(function(student1,student2){
        return student2[citeria] - student1[citeria];
    });
}

$('#option-overall').click(function(evt) {
    displayNewLeaderboard(leaderboardTypes.OVERALL);
});

$('#option-points').click(function(evt) {
    displayNewLeaderboard(leaderboardTypes.POINTS);
});

$('#option-accuracy').click(function(evt) {
    displayNewLeaderboard(leaderboardTypes.ACCURACY);
});

$('#option-attempt').click(function(evt) {
    displayNewLeaderboard(leaderboardTypes.ATTEMPT);
});

var displayNewLeaderboard = function(type) {
    boardType = type;
    sortLeaderBoard(type.name);
    displayTable(studentLeaderList);
}

var topThree = function(rank){
    if (rank === 0) {
        return 'col-gold';
    } else if (rank === 1) {
        return 'col-silver';
    } else if (rank === 2) {
        return 'col-bronze';
    } else {
        return 'col-default';
    }
}