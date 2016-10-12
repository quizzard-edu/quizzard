$('#questionform').submit(function(evt) {
    evt.preventDefault();

    var fields = $('#questionform').serializeArray();
    var question = {};

    jQuery.each(fields, function(i, field) {
        question[field.name] = field.value;
    });

    $.ajax({
        type: 'POST',
        url: '/questionadd',
        data: question,
        success: function(data) {
            if (data == 'failure')
                $('#result').html('question could not be added');
            else if (data == 'success')
                $('#result').html('question ' + question.id + ' added to database');
        }
    });
});
