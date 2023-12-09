/**
 * Signaling layer
 * @param transport - the transport layer to use
 * @param negotiator - the negotiator layer to use
 * @returns Object
 */
export const buildSignalingLayer = (transport, negotiator) => {
  let pc =  null;
  let dt = null;
  let tp = transport;
  let np = negotiator;
  let to = null;

  tp.addListener((message, from) => {
    if(!to) {
      to = from;
    }
    console.log("TP <-- message:", message, from);
    np.process(pc, message);
  });

  np.addListener((message) => {
    console.log("TP --> message:", message);
    tp.send(message, to);
  });

  return {
    createPeerConnection: (config) => {
      pc = new RTCPeerConnection(config  || {});

      pc.onnegotiationneeded = (event) => {
        np.process(pc, {type: "negotiationneeded"});
      }
      pc.onicecandidate = (event) => {
        np.process(pc, {type: "candidate", candidate: event.candidate});
      }

      pc.onconnectionstatechange = (event) => {
        console.log(`${tp.name} 'onconnectionstatechange' to ${pc.connectionState}`);
        np.process(pc, {type: "connectionstatechange", state: pc.connectionState});
      }

      pc.ondatachannel = (event) => {
        console.log(`${tp.name} 'datachannel' opened`);
        const dt = event.channel;
        dt.onclose = (event) => {
          console.log(`${tp.name} 'datachannel' closed`);
        }
      }
    },

    addDataChannel: (label, options, recipient) => {
      to = recipient;
      dt = pc.createDataChannel(label, options);
      dt.onopen = (event) => {
        console.log(`${tp.name} 'datachannel' opened`);
      }

      dt.onclose = (event) => {
        console.log(`${tp.name} 'datachannel' closed`);
      }
    },

    close: () => {
      if(dt) {
        dt.close();
        dt = null;
      }
      if(pc) {
        pc.close();
        pc = null;
      }
    }
  }
}
