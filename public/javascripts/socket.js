var socket = io('http://localhost:3000');

socket.on('EHLO', (data) => {
    // alert("I received data ! - " + data.hello);
});

socket.on('new-message', (data) => {
    var old = document.getElementById('messagesList').innerHTML;
    document.getElementById('messagesList').innerHTML = old 
                                +"<li>" 
                                + data.user.username 
                                + " : " + data.content 
                                + "</li>" ;
});

socket.on('new-channel', (data) => {
    var temp = document.getElementById('channelsList').innerHTML;
    document.getElementById('channelsList').innerHTML = old 
                                + "<li>" 
                                + "<a class='btn' href='/channel/ " + data._id + "'>" + data.name + "</a>"
                                + "<a class='btn btn-danger' href='/channel/" + data._id + "'> X </a>"
                                + "</li>"; 
})