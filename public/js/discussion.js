/**
* Sets the vote when the user clicks the thumbs-up/thumb-down icon on a comment
*
* @method voteClickComment
*/
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

/**
* Sets the vote when the user clicks the thumbs-up/thumb-down icon on a reply
*
* @method voteClickReply
*/
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

/**
* Changes the color of the voting icon when the user hovers over it
*
* @method voteHover
*/
var voteHover = function(icon, type) {
    if (type === 1 && !icon.hasClass('liked')) {
        icon.addClass('liked-hover');
    } else if (type === -1 && !icon.hasClass('disliked')) {
        icon.addClass('disliked-hover');
    }
    $(this).css('cursor','pointer');
}

/**
* Changes the color of the voting icon when the user hover away from it
*
* @method voteLeave
*/
var voteLeave = function(icon, type) {
    if ((type === 1 && !icon.hasClass('liked')) || (type === -1 && !icon.hasClass('disliked'))) {
        icon.removeClass('liked-hover');
        icon.removeClass('disliked-hover');
    }
}

/**
* Shows/hides the reply section for each comment
*
* @method repliesSection
*/
var repliesSection = function(replyObjectId) {
    const replyObject = $(replyObjectId);
    const visibilityChangeId = '#replies_' + replyObject.attr('id').split('_')[1];
    const visibilityChange = $(visibilityChangeId);

    if (visibilityChange.hasClass('hidden')) {
        visibilityChange.removeClass('hidden');
        visibilityChange.addClass('fadeInDown');
        visibilityChange.removeClass('fadeOutUp');
        replyObject.html('expand_less');
        notHidden.push(visibilityChangeId);
    } else {
        visibilityChange.removeClass('fadeInDown');
        visibilityChange.addClass('fadeOutUp');

        setTimeout(function() {
            visibilityChange.addClass('hidden');
        }, 350);

        replyObject.html('hexpand_more');
        notHidden.splice(notHidden.indexOf(visibilityChangeId), 1);
    }
}

/**
* Registers the comment that the user has written
*
* @method voteClickReply
*/
var comment = function() {
    const commentText = $('#commentBox').val();

    if (commentText.replace(/\s/g, '').length === 0) {
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

/**
* Registers the reply that the user has written to the specified comment
*
* @method reply
*/
var reply = function(commentId) {
    const replyText = $('#replyTo_'+commentId).val();

    if (replyText.replace(/\s/g, '').length === 0) {
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

/**
* Reloads the discussion board to obtain the latest updates
*
* @method getDiscussionBoard
*/
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

/**
* unCollapses the replies sections after the page has been reloaded in order
* for it to save the user preferences
*
* @method unCollapseReplies
*/
var unCollapseReplies = function () {
    notHidden.forEach(id => {
        $(id).removeClass('hidden');
    });
}

$(function () {
    // Sets up the functionality of the @username
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
