var matchAnswerCount = 3; // default number of options

/**
* Adds an option to the multiple choice
*/
var addMCAnswers = function(dom){
    matchAnswerCount++;
    var newdiv = document.createElement('p');
    var inputdiv = '<div class="row"><hr><div class="col s5"><div class="card white"><textarea class="form-control" name="matchLeft{0}" placeholder="Enter Left Side" rows="3" required="required"></textarea></div></div><div class="col s5"><div class="card white"><textarea class="form-control" name="matchRight{1}" placeholder="Enter Right Side" rows="3" required="required"></textarea></div></div><div class="col s2"><a class="btn-floating btn-tiny waves-effect waves-light red" onclick="$(this).parent().parent().remove()"><i class="tiny material-icons">close</i></a></div></div>';
    newdiv.innerHTML = inputdiv.format(matchAnswerCount,matchAnswerCount);
    $('#qAnswer > div.form-group').append(newdiv);
}
