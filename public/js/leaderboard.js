/* set home as the active navbar element */
$('#nav-leaderboard').addClass('active');

var boardType = leaderboardTypes.OVERALL;
var leaderboardRow;
var leaderboardTable;
var studentLeaderList;
var prevRank;
var rank;
var podiumScore;

/* Get HTML for the complete leaderboard table from the server and display it. */
var fetchLeaderboard = function() {
    
    $.ajax({
        type: 'GET',
        url: '/leaderboard-table',
        data: {
            smallBoard: false
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
    $('#leaderboardBody').html('');
    $('#criteriaName').html(boardType.displayName);
    podiumScore = studentLeaderList[0][boardType.name];
    setPodiumImages();
    leaderboardTable.find('#topScore').html(podiumScore);
    studentLeaderList.forEach((studentObject, index) => {
        if (index === 0) {
            leaderboardRow.find('#rank').html(index + 1);
            rank = 1;
            prevRank = rank;
        } else {
            if (studentLeaderList[index - 1][boardType.name] === studentObject[boardType.name]) {
                leaderboardRow.find('#rank').html(prevRank);
                rank = prevRank;
            } else {
                leaderboardRow.find('#rank').html(index + 1);
                rank = index + 1;
                prevRank = rank;
            }
        }       
        leaderboardRow.attr('class', `rank-${rank <= 3 ? rank : 'default'}`);
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

var setPodiumImages = function() {
    $('#first').attr('src','img/logo.png');
    $('#second').attr('src','img/logo.png');
    $('#third').attr('src','img/logo.png');
}