/* set home as the active navbar element */
$('#nav-leaderboard').addClass('active');

var boardType = leaderboardTypes.OVERALL;
var leaderboardRow;
var studentLeaderList;
/* Get HTML for the complete leaderboard table from the server and display it. */
var fetchLeaderboard = function() {
    
    $.ajax({
        type: 'GET',
        url: '/leaderboard-table',
        data: {
            longTable: true
        },
        success: function(data) {
            $('.leaderboard-content').html(data.leaderboardTableHTML);
            leaderboardRow = $(data.leaderboardRowHTML);
            studentLeaderList = data.leader;
            displayNewLeaderboard(boardType);
        }
    });
}

fetchLeaderboard();

var displayTable = function(studentLeaderList) {
    $('#leaderboardBody').html('');
    $('#criteriaName').html(boardType.displayName);
    
    studentLeaderList.forEach((studentObject, index) => {
        leaderboardRow.find('#rank').html(index + 1);
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