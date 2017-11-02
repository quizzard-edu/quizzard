var vote = function(icon, type) {
    //do ajax request here

    if (type === 1) {
        icon[0].style.color = colours.blueLight;
    } else {
        icon[0].style.color = colours.redBorder;
    }
}
