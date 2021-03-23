const express = require('express')
const app = express()
//allows us to create a server to be used with socketio
const server = require('http').Server(app) 
//creates a server for us based on our express server then passes that to socket io
//so socketio knows what server we are using and how to interact with it
const io = require('socket.io')(server)

//function v4 rename to uuidv4
const { v4: uuidv4 } = require('uuid')

//set up express server so we actually have a route at the homepage
//we need to set up how we will render our views-we do this thorugh ejs
app.set('view engine', 'ejs')
//we are going to put all javascript/css in this public folder 
app.use(express.static('public'))

//we want to create a brand new room and redirect user to that room because
//we dont have a homepage (yet), so if we go to homepage it will create a brand new room
app.get('/', (req, res) => {
    //take our response and redirect our user to /room with dynamic room usinguuid
    //instead of passing /${roomId} ...we call uuidv4 function
    res.redirect(`/${uuidv4()}`)
})
//we get a random uuid(that links to a different room everytime we visit the homepage)
//we currently dont have a view called room so we can create it -#render all code we need for room view 



//create route for our rooms
//using dynamic parameter we wil pass into our url
//we need to give room id to frontend code, using script tag
//const ROOM_ID = "<%= roomId %>" renders cod from this server
//we get roomid we're currently in and pass it through ROOM_ID variable
app.get('/:room', (req, res) => {
    //we get room from room param above
    res.render('room', { roomId: req.params.room })
})

//below loads all socket.io javascript code into our front end and servers it in our own server
//<script src="/socket.io/socket.io.js" defer></script>
//set up custom script <script src="script.js" defer></script> from public folder 

//what do we want to handle on our server usng socket.io?
//runs anytime someone connects to our webpage, set up events to listen to
//roomId prints out on backend whenever user joins room
//need to tell all the users in the same room that a new user has joined because
//we need to set up the video connection-we're joining new room with current user
io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
//        console.log(roomId, userId)
        socket.join(roomId)
        //send message to room we're currently in-sends to everyone else in the same room but not me
        //        socket.to(roomId).broadcast.emit('user-connected', userId) -dont need to use broadcast property
        socket.to(roomId).emit('user-connected', userId)

        //occurs whenever user disconnects from server
        socket.on('disconnect', () => {
            socket.to(roomId).emit('user-disconnected', userId)
        })
    })
})

//starts server on port 3000
server.listen(3000)

//video chat does not communicate thru the server it communicates directly through persons computer
//even if we shut it down on host 3000 it will still work
//server is purely just to set up our rooms
