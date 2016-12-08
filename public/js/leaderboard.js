/* set home as the active navbar element */
$('#nav-leaderboard').addClass('active');

var fetchLeaderboard = function() {
    $.ajax({
        type: 'POST',
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
