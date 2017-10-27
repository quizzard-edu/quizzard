var matchAnswerCount = 3; // default number of options

// Answering Variables
answerLeft = [];
answerRight = [];
currentSelected = null;

/**
* Adds an option to the multiple choice
*/
var addMatchAnswers = function(dom) {
    matchAnswerCount++;
    var inputdiv = '<div class="row"><hr><div class="col s5"><div class="card white"><textarea class="form-control" name="matchLeft{0}" placeholder="Enter Left Side" rows="3" required="required"></textarea></div></div><div class="col s5"><div class="card white"><textarea class="form-control" name="matchRight{0}" placeholder="Enter Right Side" rows="3" required="required"></textarea></div></div><div class="col s2"><a class="btn-floating btn-tiny waves-effect waves-light red" onclick="$(this).parent().parent().remove()"><i class="tiny material-icons">close</i></a></div></div>';
    inputdiv = inputdiv.format([matchAnswerCount]);
    $('#qAnswer > div.form-group').append(inputdiv);
}

var selectAnswer = function(test) {
    //if (currentSelected) {
        // $('#' + test.attr('id').replace('match', 'text')).removeClass('white')
        // $('#' + test.attr('id').replace('match', 'text')).addClass('black')
        test.removeClass(colours.white);
        test.addClass(colours.grayLight);
    //}
}
