/**
 * Build the SSE transport layer
 * @param name - the name of the transport layer (used to identify the user)
 * @returns Object
 */
export const buildSSETransport = (name) => {
  let callback = null;
  let source = null;

  return {
    addListener: (cb) => {
      callback = cb;
    },
    connect: (to) => {
      source = new EventSource(to);
      source.onmessage = (event) => {
        console.log(`${name}: message`, event.data);
      }
      source.onopen = (event) => {
        // connected
        console.log(`${name} 'sse' connected`);
      }
      source.onerror = (event) => {
        // on error
        console.log(`${name} 'sse' error`);
      }

      source.addEventListener('ping', function(e) {
        console.log(`${name}: ping`);
      });

      source.addEventListener('connected', function(e) {
        console.log(`${name}: connected`);
      });

      source.addEventListener('signaling', function(e) {
        const message = JSON.parse(e.data);
        console.log(`${name}: signaling`, message);
        // Send the message back to the signaling layer
        if (callback) {
          callback.call(this, message.data, message.from);
        }
      });
    },
    send: async (message, to) => {
      // Send REST request to the server
      await fetch(`http://localhost:3001/api/signaling`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to,
          from: name,
          data: message,
        })
      });
    },
    disconnect:() => {
      console.log(`${name}: disconnect`);
      if(source) {
        source.close();
        source = null;
      }
    },
    name: name,
  }
}
