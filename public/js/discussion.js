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
                $('#like_' + commentId).removeClass('liked-hover');
                $('#like_' + commentId).addClass('liked');
                $('#dislike_' + commentId).removeClass('disliked');
            } else if (data.voteValue === -1) {
                $('#dislike_' + commentId).removeClass('disliked-hover');
                $('#like_' + commentId).removeClass('liked');
                $('#dislike_' + commentId).addClass('disliked');
            } else {
                $('#like_' + commentId).removeClass('liked');
                $('#dislike_' + commentId).removeClass('disliked');
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
    const replyId = icon.attr('id').split('_')[1];

    $.ajax({
        type: 'POST',
        url: '/voteOnReply',
        data: {
            replyId: replyId,
            vote: vote
        },
        success: function(data) {
            if (data.voteValue === 1) {
                $('#like_' + replyId).removeClass('liked-hover');
                $('#like_' + replyId).addClass('liked');
                $('#dislike_' + replyId).removeClass('disliked');
            } else if (data.voteValue === -1) {
                $('#dislike_' + replyId).removeClass('disliked-hover');
                $('#like_' + replyId).removeClass('liked');
                $('#dislike_' + replyId).addClass('disliked');
            } else {
                $('#like_' + replyId).removeClass('liked');
                $('#dislike_' + replyId).removeClass('disliked');
            }
            $('#numLikes_' + replyId).html(data.likesCount);
            $('#numDislikes_' + replyId).html(data.dislikesCount);
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
    if (type === 1 && !icon.hasClass('liked')) {
        icon.addClass('liked-hover');
    } else if (type === -1 && !icon.hasClass('disliked')) {
        icon.addClass('disliked-hover');
    }
    $(this).css('cursor','pointer');
}

var voteLeave = function(icon, type) {
    if ((type === 1 && !icon.hasClass('liked')) || (type === -1 && !icon.hasClass('disliked'))) {
        icon.removeClass('liked-hover');
        icon.removeClass('disliked-hover');
    }
}

var repliesSection = function(replyObjectId) {
    const replyObject = $(replyObjectId);
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



$(function () {
    $.ajax({
        type: 'GET',
        url: '/usersToMentionInDiscussion',
        data: { questionId: questionId },
        success: function(data) {
            $('.comment-box').atwho({
                at: "@",
                data: data
            })
        },
        error: function(data){
            if (data['status'] === 401) {
                window.location.href = '/';
            } else {
                failSnackbar('something went wrong');
            }
        }
    });
});
