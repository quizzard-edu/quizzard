/* set home as the active navbar element */
$('#nav-leaderboard').addClass('active');

var fetchLeaderboard = function() {
    $.ajax({
        type: 'GET',
        url: '/leaderboard-table',
        success: function(data) {
            $('.leaderboard-content').html(data);
        }
    });
}

fetchLeaderboard();
