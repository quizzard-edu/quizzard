var comments = [1, 2, 3];

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

var comment = function() {
    const comment = $('#commentBox').val();

    if (!comment) {
        warningSnackbar('You can\'t have an empty comment');
    }

    $.ajax({
        type: 'POST',
        url: '/addCommentToQuestion',
        data: { questionId: questionId,
                comment: comment},
        success: function(data) {
            getDiscussionBoard();
        },
        error: function(data){
            if (data['status'] === 401) {
                window.location.href = '/';
            } else {
                failSnackbar('Something went wrong');
            }
        }
    });
}

var getDiscussionBoard = function () {
    $.ajax({
        type: 'GET',
        url: '/getDiscussionBoard',
        data: { questionId: questionId },
        success: function(data) {
            $('#discussion').html(data);
        },
        error: function(data){
            if (data['status'] === 401) {
                window.location.href = '/';
            } else {
                failSnackbar('Something went wrong');
            }
        }
    });
}

var reply = function() {
     alert('reply');
}

$('#commentBox').atwho({
    at: "@",
    data:['Petera sdf sd', 'Tom asd', 'Anne']
})
