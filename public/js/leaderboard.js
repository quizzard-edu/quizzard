/* set home as the active navbar element */
$('#nav-leaderboard').addClass('active');

/* Get HTML for the complete leaderboard table from the server and display it. */
var fetchLeaderboard = function(path, t) {
    $.ajax({
        type: 'GET',
        url: path,
        data: {
            fullTable: true,
            longTable: true,
            type: t
        },
        success: function(data) {
            $('.leaderboard-content').html(data);
        }
    });
}

fetchLeaderboard('/leaderboard-table');

$('#option-overall').click(function(evt) {
    $('#points-board-card').addClass('hidden');
    $('#overall-board-card').removeClass('hidden');
    fetchLeaderboard('/leaderboard-table', 'overall');
});

$('#option-points').click(function(evt) {
    $('#overall-board-card').addClass('hidden');
    $('#points-board-card').removeClass('hidden');
    fetchLeaderboard('/points-leaderboard', 'points');
});


