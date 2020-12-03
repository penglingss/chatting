const express = require('express') // require로 모듈을 불러옴
const socket = require('socket.io')
const http = require('http')
const fs = require('fs')
const app = express() // express 객체 생성
const server = http.createServer(app) // express http 서버 생성
const io = socket(server) // 생성된 서버를 socket.io에 바인딩

app.use('/css', express.static('./static/css')) // use를 사용하여 미들웨어 사용
app.use('/js', express.static('./static/js'))

// Get 방식으로 / 경로에 접속하면 실행 됨
app.get('/', function(request, response) {
    // console.log('유저가 / 으로 접속하였습니다!')
    // response.send('Hello, Express Server!!')

    fs.readFile('./static/index.html', function(err, data) {
        if(err) {
            response.send('에러')
        } else {
            response.writeHead(200, {'Content-Type':'text/html'})
            response.write(data)
            response.end()
        }
    })
})

/* 소켓에서 해당 이벤트를 받으면 콜백함수 실행 ('connection'이라는 이벤트 발생 시 실행) */
io.sockets.on('connection', function(socket) {
  
    /* 새로운 유저가 접속했을 경우 다른 소켓에도 알려줌 */
    socket.on('newUser', function(name) {
      console.log(name + '님이 접속하였습니다.')

      /* 소켓에 이름 저장해두기 */
      socket.name = name

      /* 모든 소켓에게 전송 */
      io.sockets.emit('update', {type: "connect", name: 'SERVER', message: name + '님이 접속하였습니다.'})
    })
  
    /* 전송한 메세지 받기 */
    socket.on('message', function(data) {
        /* 받은 데이터에 누가 보냈는지 이름을 추가 */
        data.name = socket.name

        console.log(data)

        /* 보낸 사람을 제외한 나머지 유저에게 메세지를 전송 */
        socket.broadcast.emit('update', data);
    })

    /* 접속 종료 */
    socket.on('disconnect', function() {
      console.log(socket.name + '님이 나가셨습니다.')

      /* 나가는 사람을 제외한 나머지 유저에게 메세지 전송 */
      socket.broadcast.emit('update', {type: 'disconnect', name: 'SERVER', message: socket.name + '님이 나가셨습니다.'})
    })
})

// 서버를 8080 포트로 listen
server.listen(8080, function(){ 
    console.log('서버 실행중..')
})