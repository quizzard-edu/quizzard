/**
* Changes the view to the editing page
*
* @method enableEdit
*/
var enableEdit = function() {
    $('#viewForm').addClass('hidden');
    $('#editForm').removeClass('hidden');
    $('#cancelButton').removeClass('hidden');
}

var disableEdit = function() {
    $('#viewForm').removeClass('hidden');
    $('#editForm').addClass('hidden');
    $('#cancelButton').addClass('hidden');
}
