var sortTypes;

$.ajax({
    type: 'GET',
    url: '/sortlist',
    success: function(data) {
        sortTypes = data;
    }
});

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

$('#sort-topic').click(function(evt) {
    sortRequest(sortTypes.TOPIC);
});

$('#sort-point').click(function(evt) {
    sortRequest(sortTypes.POINTS);
});

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
            case sortTypes.TOPIC:
                s = 'Topic';
                break;
            case sortTypes.POINTS:
                s = 'Points';
                break;
            }
            $('.question-list').html(data);
            $('#sort').html(s + '<span class="caret"></span>');
        }
    });
};
