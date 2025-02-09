export type CallType = {
  from: string;
  to: string;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit | null;
};
export type InitType = {
  id: string;
};
export type DeviceType = "Audio" | "Video";
