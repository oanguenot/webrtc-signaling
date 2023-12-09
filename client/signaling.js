'use strict';
import  {createTransport, getURLFromTransport} from "./transports/transport.js";
import {buildSignalingLayer} from "./signaling/signaling.js";
import {buildNegotiationProcess} from "./negotiation/negotiation.js";

const ready = () => {
  const connect1Button = document.querySelector('#connect1Button');
  const connect2Button = document.querySelector('#connect2Button');
  const startButton = document.querySelector('#startButton');
  const endButton = document.querySelector('#endButton');
  const disconnectButton = document.querySelector('#disconnectButton');
  const inputSelect = document.querySelector('#signaling');

  let transport1, transport2 = null;
  let signaling1, signaling2 = null;
  let negotiator1, negotiator2 = null;

  let value = inputSelect.value;
  console.log("default signaling to use", value);

  inputSelect.onchange = async (e) => {
    value = e.target.value;
    console.log("new signaling to use", value);
  }

  connect1Button.onclick = () => {
    transport1 = createTransport(value, "bob");
    transport1.connect(getURLFromTransport(value, "bob"));
  }

  connect2Button.onclick = () => {
    transport2 = createTransport(value, "alice");
    transport2.connect(getURLFromTransport(value, "alice"));
  }

  startButton.onclick = () => {
    negotiator1 = buildNegotiationProcess();
    signaling1 = buildSignalingLayer(transport1, negotiator1);
    negotiator2 = buildNegotiationProcess();
    signaling2 = buildSignalingLayer(transport2, negotiator2);

    signaling1.createPeerConnection();
    signaling2.createPeerConnection();

    signaling1.addDataChannel("test", {}, "alice");
  }

  endButton.onclick = () => {
    signaling1.close();
    signaling2.close();
  }

  disconnectButton.onclick = () => {
    if(transport1) {
      transport1.disconnect();
    }
    if(transport2) {
      transport2.disconnect();
    }
  }
}

document.addEventListener("DOMContentLoaded", ready);
