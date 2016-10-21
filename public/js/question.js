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
