// var express = require("express");
// var path = require("path");

// var app = express();
// var server = require("http").Server(app);
const io = require("socket.io")();
const r = require("rethinkdb");

function createDrawing({ connection, name }) {
	r.table("drawings")
	.insert({
		name, 
		timestamp: new Date(),
	})
	.run(connection)
	.then(() => {
		console.log('Created a drawing with name', name)
	})
}

function subscribeToDrawings({ client, connection }) {
	r.table("drawings")
	.changes({ include_initial: true })
	.run(connection)
	.then(cursor => {
		cursor.each((err, drawingRow) => {
			client.emit("drawing", drawingRow.new_val)
		})
	})
} 

function handleLinePublish({ connection, line }){
	console.log("saving line to the db");
	r.table('lines')
	.insert(Object.assign(line, { timestamp: new Date() }))
	.run(connection)
}

function subscribeToDrawingLines({ client, connection, drawingId, from }){
	let query = r.row("drawingId").eq(drawingId)

	if(from){
		query = query.and(
			r.row("timestamp").ge(new Date(from))
		)
	}

	return r.table("lines")
	.filter(query)
	.changes({ include_initial: true })
	.run(connection)
	.then(cursor => {
		cursor.each((err, lineRow) => {
			client.emit(`drawingLine:${drawingId}`, lineRow.new_val)
		})
	})
}

r.connect({
	host: 'localhost',
	port: 28015,
	db: "socket_rocket"
}).then(connection => {
	io.on("connection", (client) => {
		client.on("createDrawing", ({ name }) => {
			createDrawing({ connection, name })
		})
		client.on('subscribeToDrawings', () => {
			subscribeToDrawings({ client, connection })
		})
		client.on('publishLine', (line) => {
			handleLinePublish({ line, connection })
		})
		client.on('subscribeToDrawingLines', ({ drawingId, from }) => {
			subscribeToDrawingLines({ client, connection, drawingId, from })
		})
	})
})



// app.use(express.static(path.join(__dirname, 'public')));

const port = parseInt(process.argv[2], 10) || 8000;
io.listen(port);
console.log("Listening on port", port);

// io.on('connection', function(socket){
// 	console.log('new connection has been made!')

// 	socket.emit('message-from-server', {
// 		greeting: "Hello from Server"
// 	});

// 	socket.on('message-from-client', function(message){
// 		console.log(message)
// 	})
// })

// server.listen(port, function(){
// 	console.log(`listening on ${port}!`)