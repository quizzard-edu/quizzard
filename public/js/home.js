var sortTypes;

/* set home as the active navbar element */
$('#nav-home').addClass('active');

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
            fullTable: false,
            longTable: false
        },
        success: function(data) {
            $('.leaderboard-small').html(data);
        },
        error: function(data){
            if (data['status'] === 401) {
                window.location.href = '/';
            }
        }
    });
}

fetchLeaderboard();
