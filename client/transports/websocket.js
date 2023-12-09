/**
 * Build a websocket transport layer
 * @param name - the name of the transport layer (used to identify the user)
 * @returns Object
 */
export const buildWebSocketTransport = (name) => {
  let socket = null;
  let callback = null;
  let from = name;

  return {
    addListener: (cb) => {
      callback = cb;
    },
    connect: (to) => {
      socket = new WebSocket(to);

      // Connection opened
      socket.addEventListener('open', (event) => {
        // connected
        console.log(`${name} 'socket' connected`);
      });
      socket.addEventListener('message', async (event) => {
        if (event.data instanceof Blob) {
          const reader = new FileReader();

          reader.onload = async () => {
            const message = JSON.parse(reader.result);
            // Send the message back to the signaling layer
            if(callback) {
              callback.call(this, message.data, message.from);
            }
          };
          reader.readAsText(event.data);
        }
      });
    },
    send:(message, to) => {
      if(socket) {
        socket.send(JSON.stringify({data: message, to, from}));
      }
    },
    disconnect:() => {
      if(socket) {
        socket.close();
        socket = null;
      }
      console.log(`${name} disconnected`);
    },
    name: name,
  }
}
