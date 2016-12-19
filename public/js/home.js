var sortTypes;

/* Fetch the list of valid question list sort types from the server. */
$.ajax({
    type: 'GET',
    url: '/sortlist',
    success: function(data) {
        sortTypes = data;
    }
});

/* Make questions clickable. */
var setupQuestionListeners = function() {
    $('.question-block').click(function(evt) {
        var qid = this.id;

        $.ajax({
            type: 'POST',
            url: '/questionreq',
            data: { id: qid },
            success: function(data) {
                window.location.href = '/question';
            }
        });
    });
}

setupQuestionListeners();

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
        type: 'POST',
        url: '/fetchqlist',
        data: { type: which },
        success: function(data) {
            $('.question-list').html(data);
            setupQuestionListeners();
        }
    });
}

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

            /* reset listeners for the new question elements */
            setupQuestionListeners();
        }
    });
};

/*
 * Fetch the mini leaderboard table and display it in the sidebar.
 */
var fetchLeaderboard = function() {
    $.ajax({
        type: 'POST',
        url: '/leaderboard-table',
        data: {
            fullTable: false,
            longTable: false
        },
        success: function(data) {
            $('.leaderboard-small').html(data);
        }
    });
}

fetchLeaderboard();
