import Emitter from "./Emitter";
import MediaDevice from "./MediaDevice";
import socket from "./socket";

const CONFIG: RTCConfiguration = {
  iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }],
};

class PeerConnection extends Emitter {
  remoteId: string;
  pc: RTCPeerConnection;
  mediaDevice: MediaDevice;

  constructor(remoteId: string) {
    super();
    this.remoteId = remoteId;
    this.pc = new RTCPeerConnection(CONFIG);
    this.pc.onicecandidate = ({ candidate }) => {
      socket.emit("call", {
        to: this.remoteId,
        candidate,
      });
    };
    this.pc.ontrack = ({ streams }) => {
      this.emit("remoteStream", streams[0]);
    };
    this.mediaDevice = new MediaDevice();
    this.getDescription = this.getDescription.bind(this);
  }

  getDescription(desc: RTCLocalSessionDescriptionInit) {
    this.pc.setLocalDescription(desc);
    socket.emit("call", {
      to: this.remoteId,
      sdp: desc,
    });
    return this;
  }

  start(isCaller: boolean, config: MediaStreamConstraints) {
    this.mediaDevice
      .on("stream", (stream) => {
        stream.getTracks().forEach((t) => {
          this.pc.addTrack(t, stream);
        });

        this.emit("localStream", stream);

        isCaller
          ? socket.emit("request", { to: this.remoteId })
          : this.createOffer();
      })
      .start(config);

    return this;
  }

  stop(isCaller: boolean) {
    if (isCaller) {
      socket.emit("end", { to: this.remoteId });
    }
    this.mediaDevice.stop();
    this.pc.restartIce();
    this.off();
    return this;
  }

  createOffer() {
    this.pc.createOffer().then(this.getDescription).catch(console.error);
    return this;
  }

  createAnswer() {
    this.pc.createAnswer().then(this.getDescription).catch(console.error);
    return this;
  }

  setRemoteDescription(desc: RTCSessionDescriptionInit) {
    this.pc.setRemoteDescription(new RTCSessionDescription(desc));
    return this;
  }

  addIceCandidate(candidate: RTCIceCandidateInit) {
    if (candidate) {
      this.pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
    return this;
  }
}

export default PeerConnection;
