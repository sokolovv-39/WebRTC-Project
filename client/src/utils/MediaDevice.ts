import { DeviceType } from "@/types";
import Emitter from "./Emitter";

class MediaDevice extends Emitter {
  stream: MediaStream | null;

  constructor() {
    super();
    this.stream = null;
  }

  start(config: MediaStreamConstraints) {
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: true,
      })
      .then((stream) => {
        this.stream = stream;
        this.stream.getTracks().forEach((t) => {
          if (t.kind === "video" && config.video === false) t.enabled = false;
          if (t.kind === "audio" && config.audio === false) t.enabled = false;
        });
        this.emit("stream", stream);
      })
      .catch(console.error);
    return this;
  }

  toggle(type: DeviceType, on?: boolean) {
    if (this.stream) {
      this.stream[`get${type}Tracks`]().forEach((t) => {
        if (typeof on === "undefined") {
          t.enabled = !t.enabled;
        } else if (on) {
          t.enabled = true;
        } else {
          t.enabled = false;
        }
      });
    }

    return this;
  }

  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach((t) => {
        t.stop();
      });
    }
    this.off();
    return this;
  }
}

export default MediaDevice;
