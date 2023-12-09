# WebRTC Signaling

Implementation of different signaling methods for the Web (client and server)

## Installation

### Server

Go to the server folder and install the dependencies

```bash
$ cd server
$ npm install
$ node signaling-server.js
```

### Client

You need to install a server to serve the client files. You can use the server in this repository or any other server.

## Usage

Open the console to see the logs.

1) Select the transport method you want to use.
2) In the Transport section, connect Bob and Alice to the server.
3) In the WebRTC section, open the DataChannel between Bob and Alice.

To terminate the test, click on 'Close' to close the DataChannel and 'Disconnect' to disconnect Bob and Alice from the server.

Then you can start a new test.

## License

[MIT](LICENSE)


