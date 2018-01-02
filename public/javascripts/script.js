function showModalForEmoji(){
    $('#emojiModal').modal('show')
}

$('#checkboxIsAdmin').on('change', function() {
    var val = this.checked ? true : false;
    $('#inputIsAdmin').val(val);
})

// document.getElementById('checkBoxIsAdmin').onchange

$('#checkboxIsSuperAdmin').on('change', function() {
    var val = this.checked ? true : false;
    $('#inputIsSuperAdmin').val(val);
})