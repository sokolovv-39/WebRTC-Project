type EventType = "stream" | "remoteStream" | "localStream";
type EventHandlerType = (stream: MediaStream) => void;

class Emitter {
  events: Partial<Record<EventType, EventHandlerType[]>>;

  constructor() {
    this.events = {};
  }

  emit(e: EventType, stream: MediaStream) {
    if (this.events[e]) {
      this.events[e].forEach((fn) => fn(stream));
    }
    return this;
  } //???

  on(e: EventType, fn: EventHandlerType) {
    this.events[e] ? this.events[e].push(fn) : (this.events[e] = [fn]);
    return this;
  }

  off(e?: EventType, fn?: Function) {
    if (!e) {
      this.events = {};
      return;
    }
    if (fn) {
      const listeners = this.events[e];
      if (listeners)
        listeners.splice(
          listeners.findIndex((_fn) => _fn === fn),
          1
        );
    } else {
      this.events[e] = [];
    }
    return this;
  }
}

export default Emitter;
