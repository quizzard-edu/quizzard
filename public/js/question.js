var questionId = window.location.href.split('?id=')[1];

$('#re_answerform').submit(function(evt) {
    evt.preventDefault();
    var ans = $('#answer').val();
    $.ajax({
        type: 'POST',
        url: '/submitanswer',
        data: { questionId: questionId, answer: ans },
        success: function(data) {
            swal({
                title: 'Correct',
                text: 'Congratulations! You gained ' + data.points + ' points!',
                type: 'success'
            }, function () {
                window.location.href = '/';
            });
        },
        error: function(data){
            $('#hint').removeClass('hidden');
            swal('Incorrect', 'Sorry, that\'s the wrong answer', 'error');
        }
    });
});



$('#mc_answerform').submit(function(evt) {
    evt.preventDefault();
    var ans = $("input[name=answer]:checked").val();
    $.ajax({
        type: 'POST',
        url: '/submitanswer',
        data: { questionId: questionId, answer: ans },
        success: function(data) {
            swal({
                title: 'Correct',
                text: 'Congratulations! You gained ' + data.points + ' points!',
                type: 'success'
            }, function () {
                window.location.href = '/';
            });
        },
        error: function(data){
            $('#hint').removeClass('hidden');
            swal('Incorrect', 'Sorry, that\'s the wrong answer', 'error');
        }
    });
});
