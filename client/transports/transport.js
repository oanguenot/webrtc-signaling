import {buildSSETransport} from "./sse.js";
import {buildWebSocketTransport} from "./websocket.js";
import {buildStreamTransport} from "./stream.js";

/**
 * Create a transport layer
 * @param method - the method to use for the transport layer
 * @param name - the name of the user
 * @returns Object
 */
export const createTransport = (method, name) => {
  switch (method) {
    case "sse":
      return buildSSETransport(name);
    case "websocket":
      return buildWebSocketTransport(name);
    case "stream":
      return buildStreamTransport(name);
    default:
      return null;
  }
}

export  const getURLFromTransport = (method, name) => {
  switch (method) {
    case "sse":
      return `http://localhost:3001/api/events?name=${name}`;
    case "websocket":
      return `ws://localhost:3001`;
    case "stream":
      return `http://localhost:3001/stream?name=${name}`;
    default:
      return null;
  }
}
