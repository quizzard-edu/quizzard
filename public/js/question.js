/* set current question as the active navbar element */
$('#nav-question').addClass('active');

$('#answerform').submit(function(evt) {
    evt.preventDefault();
    var ans = $('#answer').val();
    $.ajax({
        type: 'POST',
        url: '/submitanswer',
        data: { answer: ans },
        success: function(data) {
            if (data == 'incorrect') {
            } else if (data == 'correct') {
            }
        }
    });
});
