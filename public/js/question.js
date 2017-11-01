var questionId = window.location.href.split('?id=')[1];

$('#re_answerform').submit(function(evt) {
    evt.preventDefault();
    var ans = $('#answer').val();
    sendAnswerRequest(ans);
});

$('#mc_answerform').submit(function(evt) {
    evt.preventDefault();
    var ans = $("input[name=answer]:checked").val();
    sendAnswerRequest(ans);
});

$('#match_answerform').submit(function(evt) {
    evt.preventDefault();
    var leftAnswers = [];
    var rightAnswers = [];

    for (i=0; i<answerList.length; i++) {
      leftAnswers.push($('#ansLeft' + answerList[i]).text());
      rightAnswers.push($('#ansRight' + answerList[i]).text());
    }

    sendAnswerRequest([leftAnswers,rightAnswers]);
});

var sendAnswerRequest = function(ans) {
    $.ajax({
        type: 'POST',
        url: '/submitanswer',
        data: { questionId: questionId, answer: ans },
        success: function(data) {

            $('#modalAlert').modal({
                dismissible: false,
                opacity: 0.5,
                complete: function() {
                    if(getRating() > 0) {
                        submitQuestionRating(getRating(), questionId);
                    }                    
                    window.location.href = '/';
                }
            });

            $('#modalAlertMsg').html('Congratulations! You gained ' + data.points + ' points!<br><br><br>Please rate the difficulty of this question:');

            $('#modalAlert').modal('open');
        },
        error: function(data){
            $('#hint').removeClass('hidden');
            swal('Incorrect', 'Sorry, that\'s the wrong answer', 'error');
        }
    });
}