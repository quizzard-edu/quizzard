/*
Copyright (C) 2016
Developed at University of Toronto

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

/* set home as the active navbar element */
$('#nav-leaderboard').addClass('active');

var boardType = leaderboardTypes.OVERALLBOARD;
var leaderboardRow;
var leaderboardTable;
var studentLeaderList;
var podiumScore;
var leaderboardLimit;
// Row full of ... to show that student is not in leaderboard
var emptyStudent = {
    displayName:'...',
    points:'...',
    points:'...',
    accuracy:'...',
    attempt:'...',
    overall:'...'
}
var currentStudentId;
var currentStudent;
var currentStudentIndex;
var prevRank;
var rank;

/* Get HTML for the complete leaderboard table from the server and display it. */
var fetchLeaderboard = function() {

    $.ajax({
        type: 'GET',
        url: '/leaderboard-table',
        data: {
            smallBoard: false
        },
        success: function(data) {
            currentStudentId = data.userId;
            leaderboardLimit = data.leaderboardLimit;
            leaderboardTable = $(data.leaderboardTableHTML);
            leaderboardRow = $(data.leaderboardRowHTML);
            studentLeaderList = data.leaderboardList;
            $('.leaderboard-content').html(leaderboardTable);
            displayNewLeaderboard(boardType);
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

fetchLeaderboard();

var displayLeaderboard = function(studentLeaderList) {
    

    getCurrentStudent();
    $('#leaderboardBody').html('');
    $('#criteriaName').html(boardType.displayName);
    podiumScore = studentLeaderList[0][boardType.name];
    $('#topScore').html(podiumScore + ((boardType === leaderboardTypes.ACCURACYBOARD) ? '%' : ''));
    //studentLeaderList.forEach((studentObject, index) => {
    for (var index = 0; index < studentLeaderList.length; index++){
        studentObject = studentLeaderList[index];
        
        if (index + 1 > leaderboardLimit) {
            if (currentStudentIndex  + 1 > leaderboardLimit) {
                if (rank !== studentLeaderList[currentStudentIndex - 1].userRank){
                    fillRow(-1, emptyStudent, studentLeaderList);
                }

                fillRow(currentStudentIndex, currentStudent, studentLeaderList);
                leaderboardRow.attr('class', '.currentUser');
            }
            break;
        }
        fillRow(index, studentObject, studentLeaderList);
    }
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
    $('#leaderboardName').html(`${boardType.displayName} Leaderboard`);
    sortLeaderBoard(type.name);
    setPodiumImages();
    displayLeaderboard(studentLeaderList);
}

var setPodiumImages = function() {
    var date = new Date();
    $('#first').attr('src','/profilePicture/' + studentLeaderList[0].picture + '?' + date);
    $('#firstPlaceName').html(studentLeaderList[0].displayName);
    $('#second').attr('src','/profilePicture/' + studentLeaderList[1].picture + '?' + date);
    $('#secondPlaceName').html(studentLeaderList[1].displayName);
    $('#third').attr('src','/profilePicture/' + studentLeaderList[2].picture + '?' + date);
    $('#thirdPlaceName').html(studentLeaderList[2].displayName);
}

var getCurrentStudent = function () {
    studentLeaderList.forEach((studentObject, index) => {
        if (studentObject.id === currentStudentId){
            currentStudent = studentObject;
            currentStudentIndex = index;
            return false;
        }
    });
    
}

var fillRow = function (index, studentObject, leaderboardList) {
    // Students with the same number of points get the same rank
    if (index === 0) {
        rank = 1;
        prevRank = rank;
        studentObject.userRank = rank;
        leaderboardRow.find('#rank').html(rank);
    } else if (index === -1) {
        rank = '...';
        leaderboardRow.find('#rank').html(rank);
    } else {
        if (leaderboardList[index - 1][boardType.name] === studentObject[boardType.name]) {
            rank = prevRank;
            studentObject.userRank = rank;
            leaderboardRow.find('#rank').html(rank);
        } else {
            rank = index + 1;
            prevRank = rank;
            studentObject.userRank = rank;
            leaderboardRow.find('#rank').html(rank);
        }
    }
    // This give colour to rows where the student's rank is in the top 3
    if (studentObject.id === currentStudentId && rank > 3){
        leaderboardRow.attr('class', 'currentUser');
    } else {
        leaderboardRow.attr('class', `rank-${(rank <= 3 || rank === '...') ? rank : 'default'}`);
    }
    
    leaderboardRow.find('#displayName').html(studentObject.displayName);

    // If the accuracy leaderboard is being displayed, add a % sign
    leaderboardRow.find('#criteria').html(studentObject[boardType.name] +
        ((boardType === leaderboardTypes.ACCURACYBOARD) ? '%' : ''));

    $('#leaderboardBody').append(leaderboardRow[0].outerHTML);
}