var vote = function(icon, type) {
    //do ajax request here

    if (type === 1) {
        icon[0].style.color = colours.blueLight;
    } else {
        icon[0].style.color = colours.redBorder;
    }
}

var repliesSection = function(action) {
    if (action === 1) {
        alert('view');
    } else {
        alert('hide');
    }
}

$('#commentBox').atwho({
    at: "@",
    data:['Peter', 'Tom', 'Anne']
})
