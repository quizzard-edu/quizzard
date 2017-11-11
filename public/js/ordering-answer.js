/*Initializes the movability of sort*/
$(function(){
    $('#sortable').sortable({
        revert:true,
        start: function(event,ui) {
            $('#icon1',ui.item).hide();
            $('#icon2',ui.item).show();
        },
        stop: function(event,ui) {
            $('#icon2',ui.item).hide();
            $('#icon1',ui.item).show();
        }
    });
});

/*Default value of question options*/
var orderAnswerCount = 4;
var addOrderingAnswer = function(){
    orderAnswerCount++;
    var inputdiv = "<div class='row'><li class='input-field col s10'><i class='material-icons prefix' id='icon1'>swap_vert</i><i class='material-icons prefix' id='icon2'>swap_vertical_circle</i><input class='validate' id='icon_prefix' type='text' name='orderItem{0}' placeholder='Enter Answer Here' required='required'></li><div class='input-field col s2'><a class='btn-floating btn-tiny waves-effect waves-light red' onclick='$(this).parent().parent().remove()'><i class='tiny material-icons'>close</i></a></div></div>";
    $('#sortable').append(inputdiv.format([orderAnswerCount]));
}

