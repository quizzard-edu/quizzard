/* set home as the active navbar element */
$('#nav-leaderboard').addClass('active');

/* Get HTML for the complete leaderboard table from the server and display it. */
var fetchLeaderboard = function() {
    $.ajax({
        type: 'GET',
        url: '/leaderboard-table',
        data: {
            fullTable: true,
            longTable: true
        },
        success: function(data) {
            $('.leaderboard-content').html(data);
        }
    });
}

fetchLeaderboard();
