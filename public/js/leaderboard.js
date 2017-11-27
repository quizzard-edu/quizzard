/* set home as the active navbar element */
$('#nav-leaderboard').addClass('active');

var boardType = leaderboardTypes.OVERALLBOARD;
var leaderboardRow;
var leaderboardTable;
var studentLeaderList;
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
            setPodiumImages();
            leaderboardTable = $(data.leaderboardTableHTML);
            leaderboardRow = $(data.leaderboardRowHTML);
            studentLeaderList = data.leaderboardList;
            $('.leaderboard-content').html(leaderboardTable);
            displayNewLeaderboard(boardType);
        },
        error: function(data){
            failSnackbar('Something went wrong the leaderboard, please try again later!');
        }
    });
}

fetchLeaderboard();

var displayLeaderboard = function(studentLeaderList) {
    var prevRank;
    var rank;

    $('#leaderboardBody').html('');
    $('#criteriaName').html(boardType.displayName);
    podiumScore = studentLeaderList[0][boardType.name];
    $('#topScore').html(podiumScore + ((boardType === leaderboardTypes.ACCURACYBOARD) ? '%' : ''));
    studentLeaderList.forEach((studentObject, index) => {
        // Students with the same number of points get the same rank
        if (index === 0) {
            rank = 1;
            prevRank = rank;
            leaderboardRow.find('#rank').html(rank);
        } else {
            if (studentLeaderList[index - 1][boardType.name] === studentObject[boardType.name]) {
                rank = prevRank;
                leaderboardRow.find('#rank').html(rank);
            } else {
                rank = index + 1;
                prevRank = rank;
                leaderboardRow.find('#rank').html(rank);
            }
        }
        // This give colour to rows where the student's rank is in the top 3       
        leaderboardRow.attr('class', `rank-${rank <= 3 ? rank : 'default'}`);
        leaderboardRow.find('#displayName').html(studentObject.displayName);

        // If the accuracy leaderboard is being displayed, add a % sign
        leaderboardRow.find('#criteria').html(studentObject[boardType.name] + 
            ((boardType === leaderboardTypes.ACCURACYBOARD) ? '%' : ''));
                    
        $('#leaderboardBody').append(leaderboardRow[0].outerHTML);
    });
}

// Sort the list of students based on the citeria (Overall, Points, Accuracy, or Attempts)
var sortLeaderBoard = function(citeria) {
    studentLeaderList = studentLeaderList.sort(function(student1,student2){
        return student2[citeria] - student1[citeria];
    });
}

$('#option-overall').click(function(evt) {
    displayNewLeaderboard(leaderboardTypes.OVERALLBOARD);
});

$('#option-points').click(function(evt) {
    displayNewLeaderboard(leaderboardTypes.POINTSBOARD);
});

$('#option-accuracy').click(function(evt) {
    displayNewLeaderboard(leaderboardTypes.ACCURACYBOARD);
});

$('#option-attempt').click(function(evt) {
    displayNewLeaderboard(leaderboardTypes.ATTEMPTBOARD);
});

// Change leaderboard based on type (Overall, Points, Accuracy, Attemtps)
var displayNewLeaderboard = function(type) {
    boardType = type;
    sortLeaderBoard(type.name);
    displayLeaderboard(studentLeaderList);
}

var setPodiumImages = function() {
    $('#first').attr('src','img/logo.png');
    $('#second').attr('src','img/logo.png');
    $('#third').attr('src','img/logo.png');
}