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

var leaderboardRow;
var leaderboardTable;
var studentLeaderList;

// Variables for question list
var questionsList;
var questionsListHTML;

var currentCriteria = sortTypes.SORT_DATE;

$(function () {
    fetchQList('unanswered');
    fetchLeaderboard();
});

/* set home as the active navbar element */
$('#nav-home').addClass('active');

var sortQuestionsList = function(criteria = currentCriteria) {
    $('#sortButton').html(`Sort By: ${criteria.display}`);
    currentCriteria = criteria;

    var ordering = -1;
    if ($('#order').is(':checked')) {
        ordering = 1;
    }

    displayQuestionList(questionsList.sort((a, b) => {
        var item1 = a[criteria.value];
        var item2 = b[criteria.value];

        if (typeof item1 === 'string') {
            item1 = item1.toLowerCase();
            item2 = item2.toLowerCase();
        }

        if(item1 < item2) return ordering;
        if(item1 > item2) return ordering*-1;
        return 0;
    }));
}

$('#sort-title').click(function(evt) {
    sortQuestionsList(sortTypes.SORT_TITLE);
});

$('#sort-topic').click(function(evt) {
    sortQuestionsList(sortTypes.SORT_TOPIC);
});

$('#sort-type').click(function(evt) {
    sortQuestionsList(sortTypes.SORT_TYPE);
});

$('#sort-date').click(function(evt) {
    sortQuestionsList(sortTypes.SORT_DATE);
});

$('#sort-attempt').click(function(evt) {
    sortQuestionsList(sortTypes.SORT_ATTEMPT);
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
            questionsList = data.questionsList;
            questionsListHTML = $(data.html);
            sortQuestionsList();
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

var displayQuestionList = function(qList) {
    $('#questionsList').html('');
    qList.forEach((questionObject, index) => {
        questionsListHTML[0].id = questionObject._id;
        questionsListHTML.find('#icon').html(questionTypes[questionObject.type].icon);
        questionsListHTML.find('#title').html(questionObject.title);
        questionsListHTML.find('#topic').html(`Topic: ${questionObject.topic}`);
        questionsListHTML.find('#type').html(`Type: ${questionTypes[questionObject.type].value}`);
        questionsListHTML.find('#time').html(`Created On: ${questionObject.ctime}`);
        questionsListHTML.find('#attempts').html(`Attempts: ${questionObject.totalAttemptsCount}`);
        $('#questionsList').append(questionsListHTML[0].outerHTML);
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
