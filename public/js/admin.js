/* set home as the active navbar element */
$('#nav-home').addClass('active');

$('#option-accounts').click(function(evt) {
    $('#modal-accounts').modal('toggle');
    $.ajax({
        type: 'GET',
        url: '/studentlist',
        success: function(data) {
            $('#account-table').html(data);
        }
    });
});
