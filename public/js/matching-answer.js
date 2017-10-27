var matchAnswerCount = 3; // default number of options

// Answering Variables
var answeredId = 0;
var answerLeft = [];
var answerRight = [];
var currentSelected = null;

/**
* Adds an option to the multiple choice
*/
var addMatchAnswers = function(dom) {
    matchAnswerCount++;
    var inputdiv = '<div class="row"><hr><div class="col s5"><div class="card white"><textarea class="form-control" name="matchLeft{0}" placeholder="Enter Left Side" rows="3" required="required"></textarea></div></div><div class="col s5"><div class="card white"><textarea class="form-control" name="matchRight{0}" placeholder="Enter Right Side" rows="3" required="required"></textarea></div></div><div class="col s2"><a class="btn-floating btn-tiny waves-effect waves-light red" onclick="$(this).parent().parent().remove()"><i class="tiny material-icons">close</i></a></div></div>';
    inputdiv = inputdiv.format([matchAnswerCount]);
    $('#qAnswer > div.form-group').append(inputdiv);
}

var selectAnswer = function(newItem) {
    var location = null;

    if (currentSelected) {
        // If selecting the same item
        if (currentSelected.attr('id') === newItem.attr('id')) {
            newItem[0].style.backgroundColor = colours.white;
            currentSelected = null;
            return;
        }

        // Which side was selected
        if (newItem.attr('id').indexOf('Left') !== -1) {
            location = 'Left';
        } else {
            location = 'Right';
        }

        currentSelected[0].style.backgroundColor = colours.white;

        // Is it the same side as the one previously selected
        if (currentSelected.attr('id').indexOf(location) !== -1) {
            newItem[0].style.backgroundColor = colours.grayLight;
            currentSelected = newItem;
        } else {
            newItem[0].style.backgroundColor = colours.white;

            if (location === 'Left') {
                createMatch(newItem, currentSelected);
            } else {
                createMatch(currentSelected, newItem);
            }
        }



        // $('#' + newItem.attr('id').replace('match', 'text')).removeClass('white')
        // $('#' + newItem.attr('id').replace('match', 'text')).addClass('black')




        //newItem.removeClass(colours.white);
        //newItem.addClass(colours.grayLight);
    } else {
      newItem[0].style.backgroundColor = colours.grayLight;
      currentSelected = newItem;
    }
}

var createMatch = function(item1, item2) {
    currentSelected = null;
    item1.addClass('hidden');
    item2.addClass('hidden');
    answeredId++;
    var inputdiv = '<div class="row"><div class="col s5"><div class="card white"><p name="originalLeft{3}" id="ansLeft{0}">{1}</p></div></div><div class="col s5"><div class="card white"><p name="originalRight{4}" id="ansRight{0}">{2}</p></div></div><div class="col s2"><a class="btn-floating btn-tiny waves-effect waves-light red" id="delete{0}" onclick="deleteMatch($(this))"><i class="tiny material-icons">close</i></a></div></div>';
    inputdiv = inputdiv.format([answeredId, item1.text(), item2.text(), item1.attr('id'), item2.attr('id')]);
    $('#answers').append(inputdiv);
}

var deleteMatch = function(deleteButton) {
    $('#' + $('#ansLeft' + deleteButton.attr('id').replace('delete', '')).attr('name').replace('originalLeft', '')).removeClass('hidden');
    $('#' + $('#ansRight' + deleteButton.attr('id').replace('delete', '')).attr('name').replace('originalRight', '')).removeClass('hidden');
    deleteButton.parent().parent().remove();
}
