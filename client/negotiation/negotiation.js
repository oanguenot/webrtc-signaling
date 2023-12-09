/**
 * Negotiation process
 * @returns Object
 */
export  const buildNegotiationProcess = () => {
  let callback = null;
  const tmpIces = [];

  return {
    addListener: (cb) => {
      callback = cb;
    },
    process: async (pc, message) => {
      const {type} = message;
      switch (type) {
        case "negotiationneeded":
          await pc.setLocalDescription(await pc.createOffer());
          callback.call(this, pc.localDescription.toJSON());
          break;
        case "offer":
          await pc.setRemoteDescription(message);
          await pc.setLocalDescription(await pc.createAnswer());
          callback.call(this, pc.localDescription.toJSON());
          break;
        case "answer":
          await pc.setRemoteDescription(message);
          break;
        case "candidate":
          if (message.candidate) {
            callback.call(this, message.candidate);
          } else {
            callback.call(this, {type: "endofcandidates"})
          }
          break;
        case "endofcandidates":
          for (const ice of tmpIces) {
            await pc.addIceCandidate(ice);
          }
          break;
        case "connectionstatechange":
          if (message.state === "failed") {
            await pc.restartIce();
          }
          break;
        default:
          // candidate
          if (message.candidate) {
            if(pc.remoteDescription ) {
              await pc.addIceCandidate(message);
            } else {
              tmpIces.push(message);
            }
          }
          break;
      }
    },
  }
}
