//socket to set up /conect to root path(thata where its set up) socket connects to root path
const socket = io('/')

//set up video call connection...render our own video on the screen-
//this is where we place all of our new vids
const videoGrid = document.getElementById('video-grid')


//we pass it undefined because we're going to let the server handle generating 
//our own id
//peer server takes all the webrtc info for a user and turns it into a easy to use id
//which we can pass between diff places and use with peer lbrary to connect with other peers
//on the network
const myPeer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '3001'
})

let myVideoStream; //could remove
//get reference to a video
const myVideo = document.createElement('video')
///this ensures we mute ourselvers (so we dont have to hear our own mic playback)
myVideo.muted = true

//we need to save some variable which tells us what call we made to that user to remove it
const peers = {}

//connect our video
navigator.mediaDevices.getUserMedia({
    //takes options parameter
    video: true,
    audio: true
    //promise .then (streamis going to be our video and audio)
}).then(stream => {
    myVideoStream = stream; //could remove
    addVideoStream(myVideo, stream)

    //we need to listen to when someone tries to call us 
    //when someone calls, we answer call and send current stream
    myPeer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    //we need to allow ourselves to be connected with other users(user connected event)
    //when a new user connects we're going to call a function connectTonewuser, we pass it
    //userid and video stream we want to send to that user we're trying to connect to
    //new user has joined our room so we send our current video stream to that user
    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream)
    })
    // input text value
    let text = $('input');
    // when the user presses enter send message
    //we are using jquery we are calling the html file in ejs to listen to
    //keydown press... 13 is equal to the enter key(enter key is 13)
    //we want to check if value of input is 1 value or more so when we press enter messg will send
    //socket.emit will send ...send from front end message the value of input which is the message the 
    //user types and after use presses enter the input field clears
    $('html').keydown((event) => {
        if (event.which == 13 && text.val().length !== 0) {
//            console.log(text.val())
            socket.emit('message', text.val());
            text.val('')
        }
    });
    //we need to receive the message that we send when we hit enter that goes to the server
    //to be displayed on the frontend for the user
    //takes same argument from server.js
    //we want our messages displayed in the ul tag in room.ejs
    socket.on('createMessage', message => {
        console.log('this is comigng from server messahge', message);
        $('.messages').append(`<li class='message'><b>user</b><br/>${message}</li>`);
        scrollToBottom()
    })
})
        

//we will append the to ul child and when message comes in we will add the li tag which will
//have a class of message inside we will have the user and the message
//we should see video appendd to our page using that function addvideostream
//we want to tell myvideo object to use that stream using function 



//listening to disconnect event
socket.on('user-disconnected', userId => {
//    console.log(userId)
    //close connection if we have a user leave the same room
    if (peers[userId]) peers[userId].close()
})

//as soon as we connect with our peer server and get back an id, we want to run this code
//passing us to the id of our user
myPeer.on('open', id => {
    //send event to servr...roomId prints out on backend whenever user joins room
    socket.emit('join-room', ROOM_ID, id)
})
//now we have ids where we can connect between diff users and make calls between them


//how will be handle hard coded connections -peerjs (gives us the ability to create
// connections between different users using webrtc and have server setup that we can use
//that allows us to create these dynamic Ids for connecting between different users)

//listen for the connection event-we have this set up on server
//socket.on('user-connected', userId => {
//    console.log('user conected: ' + userId)
//})
//call is coming from our peer object, call a function called call

function connectToNewUser(userId, stream) {
    //call a user we give a certain userid to and pass it stream we want to send to that user
    const call = myPeer.call(userId, stream)
    //taking stream from other user we're calling and we're adding it into our own custon video element on our page
    const video = document.createElement('video')
    //listen to event-stream (when we call this user we're sending them our video stream and
    //when they send back their stream we will take in their video stream 
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    //listens to when someone leaves video call so it can close the call
    //and we want to make sure we remove the video
    call.on('close', () => {
        video.remove()
    })
    //when we connect to user, every user id is linked to call that we make
    peers[userId] = call
}

//we want to tell myvideo object to use that stream
function addVideoStream(video, stream) {
    //allows us to play our video
    video.srcObject = stream
    //once it loads this sstream and video is loaded on our page we want to play that video
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    //append our videos onto the grid of videos we already have
    videoGrid.append(video)
}

//we have main chat window in ejs
// d is div, instead of var we do let
const scrollToBottom = () => {
    let d = $('.main__chat_window');
    d.scrollTop(d.prop('scrollHeight'));
}

//unmute and mute our video chat
const muteUnmute = () => {
    //get audio tracks that stream(mychatstream) and we get current enabled version
    //of audio track... if enabled we will disable, else if disabled we will enable it
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

// start or stop my video, if video enabled we disable, else if disabled we enable
const playStop = () => {
    //console.log('object')
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo()
    } else {
        setStopVideo()
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

//set mute and unmute button
//when mute we want to change the text to unmute and microphone slash

const setMuteButton = () => {
    const html = `
    <i class='fas fa-microphone'></i>
    <span>Mute</span>
    `
    document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
    const html = `
    <i class='unmute fas fa-microphone-slash'></i>
    <span>Unmute</span>
    `
    document.querySelector('.main__mute_button').innerHTML = html;
}

const setStopVideo = () => {
    const html = `
    <i class='fas fa-video'></i>
    <span>Stop Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
    const html = `
    <i class='stop fas fa-video-slash'></i>
    <span>Play Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
}

// leave meeting 

function close_window() {
    if (confirm("Are You Sure to leave this meeting ?")) {
      window.close();
    }
  }