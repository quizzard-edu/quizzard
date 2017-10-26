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

var sendAnswerRequest = function(ans) {
    $.ajax({
        type: 'POST',
        url: '/submitanswer',
        data: { questionId: questionId, answer: ans },
        success: function(data) {
            swal({
                html:true,
                title: 'Correct',
                text: 'Congratulations! You gained ' + data.points + ' points!<br><br>Please rate the difficulty of this question:<br><div class="rating"><i class="medium material-icons" id="0" onmouseover="highlight(0)" onmouseout="highlight(rating)" onclick="setRating(1)">star_border</i><i class="medium material-icons" id="1" onmouseover="highlight(1)" onmouseout="highlight(rating)" onclick="setRating(2)">star_border</i><i class="medium material-icons" id="2" onmouseover="highlight(2)" onmouseout="highlight(rating)" onclick="setRating(3)">star_border</i><i class="medium material-icons" id="3" onmouseover="highlight(3)" onmouseout="highlight(rating)" onclick="setRating(4)">star_border</i><i class="medium material-icons" id="4" onmouseover="highlight(4)" onmouseout="highlight(rating)" onclick="setRating(5)">star_border</i></div>',
                type: 'success'
            }, function (isConfirm) {
                if(isConfirm) {
                    alert(getRating() + " " + questionId)
                    submitQuestionRating(getRating(), questionId);
                    window.location.href = '/';
                }
            });
        },
        error: function(data){
            $('#hint').removeClass('hidden');
            swal('Incorrect', 'Sorry, that\'s the wrong answer', 'error');
        }
    });
}
