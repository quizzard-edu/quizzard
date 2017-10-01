$('#re_answerform').submit(function(evt) {
    evt.preventDefault();
    var ans = $('#answer').val();
    $.ajax({
        type: 'POST',
        url: '/submitREanswer',
        data: $('#re_answerform').serialize(),
        success: function(data) {
            if (data.result == 'incorrect') {
                $('#hint').removeClass('hidden');
                swal('Incorrect', 'Sorry, that\'s the wrong answer', 'error');
            } else if (data.result == 'correct') {
                swal({
                    title: 'Correct',
                    text: 'Congratulations! You gained ' + data.points + ' points!',
                    type: 'success'
                }, function () {
                    window.location.href = '/home';
                });
            }
        }
    });
});



$('#mc_answerform').submit(function(evt) {
    evt.preventDefault();
    var ans = $("input[name=answer]:checked").val();
    $.ajax({
        type: 'POST',
        url: '/submitREanswer',
        data: $('#mc_answerform').serialize(),
        success: function(data) {
            if (data.result == 'incorrect') {
                swal('Incorrect', 'Sorry, that\'s the wrong answer', 'error');
            } else if (data.result == 'correct') {
                swal({
                    title: 'Correct',
                    text: 'Congratulations! You gained ' + data.points + ' points!',
                    type: 'success'
                }, function () {
                    window.location.href = '/question';
                });
            }
        }
    });
});
