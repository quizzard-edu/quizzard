var comments = [1, 2, 3];

var voteClickComment = function(icon, vote) {
    const commentId = icon.attr('id').split('_')[1];

    $.ajax({
        type: 'POST',
        url: '/voteOnComment',
        data: { questionId: questionId,
                commentId: commentId,
                vote: vote},
        success: function(data) {
            if (data === 1) {
                icon[0].style.color = colours.blueLight;
            } else if (data === -1) {
                icon[0].style.color = colours.redBorder;
            } else {
                $('#like_' + commentID)[0].style.color = '';
                $('#dislike_' + commentID)[0].style.color = '';
            }
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

var voteClickReply = function(icon, vote) {
    const commentId = icon.attr('id').split('_')[1];
    const replyId = icon.attr('id').split('_')[2];

    $.ajax({
        type: 'POST',
        url: '/voteOnComment',
        data: { questionId: questionId,
                commentId: commentId,
                vote: vote,
                replyId: replyId},
        success: function(data) {
            if (data === 1) {
                icon[0].style.color = colours.blueLight;
            } else if (data === -1) {
                icon[0].style.color = colours.redBorder;
            } else {
                $('#like_' + commentID)[0].style.color = '';
                $('#dislike_' + commentID)[0].style.color = '';
            }
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

var reply = function() {
     alert('reply');
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

$('#commentBox').atwho({
    at: "@",
    data:['Petera sdf sd', 'Tom asd', 'Anne']
})
