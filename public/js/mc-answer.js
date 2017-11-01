var mcAnswerCount = 4; // default number of options

/**
* Adds an option to the multiple choice
*/
var addMCAnswers = function(type){
	mcAnswerCount++;
    var inputdiv = "<div class='row'><div class='input-field col s1'><input type='{1}' name='radbutton' value='mcans{0}' id='mcans{0}' required='required'><label for='mcans{0}'></label></div><div class='input-field col s10'><input class='form-control' type='text' name='mcans{0}' placeholder='Enter Answer Here' required='required' style='float:left;'></div><div class='input-field col s1'><a class='btn-floating btn-tiny waves-effect waves-light red' onclick='$(this).parent().parent().remove()'><i class='tiny material-icons'>close</i></a></div></div>";
    $('#qAnswer > div.form-group.col.s12').append(inputdiv.format([mcAnswerCount,type]));
}

