var voteClickComment = function(icon, vote) {
    const commentId = icon.attr('id').split('_')[1];

    $.ajax({
        type: 'POST',
        url: '/voteOnComment',
        data: { questionId: questionId,
                commentId: commentId,
                vote: vote},
        success: function(data) {
            if (data.voteValue === 1) {
                $('#like_' + commentId)[0].style.color = colours.blueLight;
                $('#dislike_' + commentId)[0].style.color = '';
            } else if (data.voteValue === -1) {
                $('#like_' + commentId)[0].style.color = '';
                $('#dislike_' + commentId)[0].style.color = colours.redBorder;
            } else {
                $('#like_' + commentId)[0].style.color = '';
                $('#dislike_' + commentId)[0].style.color = '';
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
        url: '/voteOnReply',
        data: { questionId: questionId,
                commentId: commentId,
                vote: vote,
                replyId: replyId},
        success: function(data) {
            if (data.voteValue === 1) {
                $('#like_' + commentId + '_' + replyId)[0].style.color = colours.blueLight;
                $('#dislike_' + commentId + '_' + replyId)[0].style.color = '';
            } else if (data.voteValue === -1) {
                $('#like_' + commentId + '_' + replyId)[0].style.color = '';
                $('#dislike_' + commentId + '_' + replyId)[0].style.color = colours.redBorder;
            } else {
                $('#like_' + commentId + '_' + replyId)[0].style.color = '';
                $('#dislike_' + commentId + '_' + replyId)[0].style.color = '';
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

var repliesSection = function(replyObject) {
    const visibilityChange = $('#replies_' + replyObject.attr('id').split('_')[1]);
    if (visibilityChange.hasClass('hidden')) {
        visibilityChange.removeClass('hidden');
        replyObject.html('Collapse replies');
    } else {
        visibilityChange.addClass('hidden');
        replyObject.html('View replies');
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

var reply = function(replyObject) {
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
