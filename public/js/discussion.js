var voteClick = function(icon, type) {
    //do ajax request here

    if (type === 1) {
        icon[0].style.color = colours.blueLight;
    } else {
        icon[0].style.color = colours.redBorder;
    }
}

var voteHover = function(icon, type) {
    if (type === 1 && icon[0].style.color !== colours.blueLight) {
        icon[0].style.color = colours.blueLightExtra;
    } else if (type === -1 && icon[0].style.color !== colours.redBorder) {
        icon[0].style.color = colours.redLight;
    }
    $(this).css('cursor','pointer');
}

var voteLeave = function(icon, type) {
    if ((type === 1 && icon[0].style.color !== colours.blueLight) || (type === -1 && icon[0].style.color !== colours.redBorder)) {
        icon[0].style.color = colours.blackLight;
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
    data:['Petera sdf sd', 'Tom asd', 'Anne']
})
