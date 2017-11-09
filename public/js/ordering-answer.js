/*Initializes the movability of sort*/
$(function(){
	$('#sortable').sortable();
});

/*Default value of question options*/
var orderAnswerCount = 4;
var addOrderingAnswer = function(){
	orderAnswerCount++;
    var inputdiv = "<div class='row ui-sortable-handle'><li class='input-field col s10'><input class='form-control' type='text' name='orderItem{0}' placeholder='Enter Answer Here' required='required'></li><div class='input-field col s2'><a class='btn-floating btn-tiny waves-effect waves-light red' onclick='$(this).parent().parent().remove()'><i class='tiny material-icons'>close</i></a></div></div>";
    $('#sortable').append(inputdiv.format([orderAnswerCount]));
}

