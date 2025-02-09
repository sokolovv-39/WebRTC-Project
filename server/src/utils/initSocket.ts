import { nanoid } from "nanoid";
import { Socket } from "socket.io";
import { EventEnum } from "../types/types.js";

const users: Record<string, Socket> = {};

type CallDataType = {
  from: string;
  to: string;
} & (
  | { sdp: RTCSessionDescriptionInit; candidate?: never }
  | { sdp?: never; candidate: RTCIceCandidateInit | null }
);

type EventDataMap = {
  [EventEnum.Request]: { from: string };
  [EventEnum.Call]: CallDataType;
};

export function initSocket(socket: Socket) {
  let id: string = "";

  function emit(
    userId: string,
    event: EventEnum.End | EventEnum.Disconnect
  ): void;
  function emit<T extends keyof EventDataMap>(
    userId: string,
    event: T,
    data: EventDataMap[T]
  ): void;

  function emit(userId: string, event: EventEnum, data?: any) {
    const receiver = users[userId];
    if (receiver) {
      receiver.emit(event, data);
    }
  }

  socket
    .on(EventEnum.Init, () => {
      id = nanoid(5);
      users[id] = socket;
      socket.emit("init", { id });
      console.log("init", id);
    })
    .on(EventEnum.Request, (data) => {
      emit(data.to, EventEnum.Request, { from: id });
    })
    .on(EventEnum.Call, (data) => {
      emit(data.to, EventEnum.Call, { ...data, from: id });
    })
    .on(EventEnum.End, (data) => {
      console.log("end", data);
      emit(data.to, EventEnum.End);
    })
    .on(EventEnum.Disconnect, () => {
      delete users[id];
    });
}
