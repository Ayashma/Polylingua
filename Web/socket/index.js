const io = require('socket.io')(8900, {
    cors: {
        origin: "http://127.0.0.1:3000"
    }
});

let users = [];

const addUser = (userId, socketId) => {
    !users.some(user => user.userId === userId) && users.push({ userId, socketId });
}

const removeUser = (socketId) => {
    users = users.filter(user.user.socketId !== socketId)
}

io.on('connection', socket => {
    console.log("user connected");
    socket.on("addUser", userId => {
        addUser(userId, socket.id);
        io.emit("getUsers", users);
    })

    socket.on("sendMessage", ({user, reciever, contents})=>{

    });

    socket.on("disconnect", () => {
        console.log("user disconnected");
        removeUser(socket.id);
        io.emit("getUsers", users);
    })
});