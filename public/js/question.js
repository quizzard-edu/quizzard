var questionId = window.location.href.split('?_id=')[1];
var notHidden = [];

$(function () {
    $.ajax({
        type: 'GET',
        url: '/getDiscussionBoard',
        data: { questionId: questionId },
        success: function(data) {
            $('#discussion').html(data);
        },
        error: function(data){
            if (data['status'] === 401) {
                window.location.href = '/';
            } else {
                failSnackbar('something went wrong');
            }
        }
    });
});

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
$('#tf_answerform').submit(function(evt) {
    evt.preventDefault();
    var ans = $("input[name=tfbutton]:checked").val();
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

$('#chooseAll_answerForm').submit(function(evt) {
    evt.preventDefault();
    var answer = [];
    var fields = $('#chooseAll_answerForm').serializeArray();
    jQuery.each(fields, function(i, field) {
        if(field.name.startsWith('checkButton') ){
           answer.push(field.value);
        }
    });
    sendAnswerRequest(answer);
})

$('#order_answerform').submit(function(evt) {
    evt.preventDefault();
    var answer = $("#sortable > div > li > #questionItem").map(function() { return $(this).text() }).get();
    sendAnswerRequest(answer);
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
                    if(getRating()  > 0 && getRating()  < 6) {
                        submitQuestionRating(getRating(), questionId);
                    }
                    location.reload();
                }
            });

            $('#modalAlertMsg').html('Congratulations! You gained ' + data.points + ' points!<br>Please rate the difficulty of this question:');

            $('#modalAlert').modal('open');
        },
        error: function(data) {
            if (data['status'] === 401) {
                window.location.href = '/';
            } else if (data['status'] === 423 || data['status'] === 400){
                failSnackbar(data['responseText']);
            } else if (data['status'] === 500) {
                failSnackbar('Something went wrong!');
            } else if (data['status'] === 405) {            
                $('#hint').removeClass('hidden');
                swal('Incorrect', 'Sorry, that\'s the wrong answer', 'error');
            }
        },
        complete: function(data) {
            const numberOfAttempts = $('#attempts');
            numberOfAttempts.html(parseInt(numberOfAttempts.html()) + 1);
        }
    });
}

/* Listener for the `rate` button */
$(document).on('click', '#rateQuestion', function() {
    if(getRating()  > 0 && getRating()  < 6) {
        submitQuestionRating(getRating(), questionId);
    }
    location.reload();
});
