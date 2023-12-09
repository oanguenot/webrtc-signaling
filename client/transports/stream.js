/**
 * Build a stream transport
 * @param name - the name of the transport layer (used to identify the user)
 * @returns Object
 */
export  const buildStreamTransport = (name) => {
  let callback = null;
  let reader = null;

  return {
    addListener: (cb) => {
      callback = cb;
    },

    connect: async (to) => {
      try {
        const response = await fetch(to);
        if (!response.ok || !response.body) {
          console.log(">>> error", response.statusText, response);
          return;
        }

        reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            break;
          }

          console.log("read", value.length, "bytes");
          const decodedChunk = decoder.decode(value, { stream: true });

          decodedChunk.split("\n").forEach((chunk) => {
            if(chunk.length > 0) {
              const message = JSON.parse(chunk);
              console.log(`${name}: signaling`, message);
              if (callback) {
                callback.call(this, message.data, message.from);
              }
            }
          });

        }
      } catch (error) {
        console.log(">>> error", error);
        // Handle other errors
      }
    },

    send: async (message, to) => {
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

    disconnect: () => {
      console.log(`${name}: disconnect`);
      if (reader) {
        reader.cancel("call end");
        reader = null;
      }
    },
    name: name
  }
}
