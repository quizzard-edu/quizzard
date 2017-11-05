var voteClickComment = function(icon, vote) {
    const commentId = icon.attr('id').split('_')[1];

    $.ajax({
        type: 'POST',
        url: '/voteOnComment',
        data: {
            commentId: commentId,
            vote: vote
        },
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
            $('#numLikes_' + commentId).html(data.likesCount);
            $('#numDislikes_' + commentId).html(data.dislikesCount);
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
    const commentId = icon.attr('id').split('_')[1]; // I made it so we only need replyId
    const replyId = icon.attr('id').split('_')[2];

    $.ajax({
        type: 'POST',
        url: '/voteOnReply',
        data: {
            replyId: replyId,
            vote: vote
        },
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
            $('#numLikes_' + commentId + '_' + replyId).html(data.likesCount);
            $('#numDislikes_' + commentId + '_' + replyId).html(data.dislikesCount);
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
    const visibilityChangeId = '#replies_' + replyObject.attr('id').split('_')[1];
    const visibilityChange = $(visibilityChangeId);
    if (visibilityChange.hasClass('hidden')) {
        visibilityChange.removeClass('hidden');
        replyObject.html('Collapse replies');
        notHidden.push(visibilityChangeId);
    } else {
        visibilityChange.addClass('hidden');
        replyObject.html('View replies');
        notHidden.splice(notHidden.indexOf(visibilityChangeId), 1);
    }
}

var comment = function() {
    const commentText = $('#commentBox').val();

    if (!commentText) {
        warningSnackbar('You can\'t have an empty comment');
        return;
    }

    $.ajax({
        type: 'POST',
        url: '/addCommentToQuestion',
        data: {
            questionId: questionId,
            commentText: commentText
        },
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

var reply = function(commentId) {
    const replyText = $('#replyTo_'+commentId).val();

    if (!replyText) {
        warningSnackbar('You can\'t have an empty reply');
        return;
    }

    $.ajax({
        type: 'POST',
        url: '/addReplyToComment',
        data: {
            commentId: commentId,
            replyText: replyText
        },
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
            unCollapseReplies();
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

var unCollapseReplies = function () {
    notHidden.forEach(id => {
        $(id).removeClass('hidden');
    });
}

$('#commentBox').atwho({
    at: "@",
    data:['Petera sdf sd', 'Tom asd', 'Anne']
})
