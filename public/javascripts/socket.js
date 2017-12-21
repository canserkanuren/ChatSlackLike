var socket = io('http://localhost:3000');

socket.on('new-message', (data) => {
    var old = document.getElementById('messagesList').innerHTML;
    document.getElementById('messagesList').innerHTML = old 
                                +"<li>" 
                                + data.user.username 
                                + " : " + data.content 
                                + "</li>" ;
});

socket.on('new-channel', (data) => {
    var old = document.getElementById('channelsList').innerHTML;
    document.getElementById('channelsList').innerHTML = old 
                                + "<li>" 
                                + "<a class='btn' href='/channel/ " + data._id + "'>" + data.name + "</a>"
                                + "<a class='btn btn-danger' href='/channel/" + data._id + "'> X </a>"
                                + "</li>"; 
});

socket.on('delete-not-authorized', () => {
    document.getElementById('errorMessage').innerHTML = "You cannot delete a message that is not yours."
});

socket.on('new-user', (data) => {
    var old = document.getElementById('userList').innerHTML;
    if(!old.includes(data)) {
        document.getElementById('userList').innerHTML = old 
                                    + "<strong>" 
                                    + data
                                    + "</strong>";
    }
});