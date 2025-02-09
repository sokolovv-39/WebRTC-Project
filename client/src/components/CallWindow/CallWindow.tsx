"use client";

import MediaDevice from "@/utils/MediaDevice";
import classes from "./CallWindow.module.scss";
import { useEffect, useRef, useState } from "react";
import { DeviceType } from "@/types";
import { BsCameraVideo, BsCameraVideoOff, BsPhone } from "react-icons/bs";
import { FiPhoneOff } from "react-icons/fi";
import { CiMicrophoneOff, CiMicrophoneOn } from "react-icons/ci";

type PropsType = {
  remoteSrc: MediaStream;
  localSrc: MediaStream;
  config: MediaStreamConstraints;
  mediaDevice: MediaDevice;
  finishCall: (isCaller: boolean) => void;
};

export function CallWindow({
  remoteSrc,
  localSrc,
  config,
  mediaDevice,
  finishCall,
}: PropsType) {
  const remoteVideo = useRef<HTMLVideoElement | null>(null);
  const localVideo = useRef<HTMLVideoElement | null>(null);
  const [video, setVideo] = useState(config.video);
  const [audio, setAudio] = useState(config.audio);
  const [isDragging, setIsDragging] = useState(false);
  const [localVideoOffset, setLocalVideoOffset] = useState({ x: 0, y: 0 });

  function toggleMediaDevice(deviceType: DeviceType) {
    if (deviceType === "Video") {
      setVideo(!video);
      mediaDevice.toggle("Video");
    }
    if (deviceType === "Audio") {
      setAudio(!audio);
      mediaDevice.toggle("Audio");
    }
  }

  function onMouseDown(event: React.MouseEvent) {
    if (!localVideo.current) return;
    setIsDragging(true);
    localVideo.current.style.cursor = "grabbing";
    const rect = localVideo.current.getBoundingClientRect();
    setLocalVideoOffset({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  }

  function onMouseMove(event: React.MouseEvent) {
    if (!isDragging || !localVideo.current) return;
    localVideo.current.style.top = `${event.clientY - localVideoOffset.y}px`;
    localVideo.current.style.left = `${event.clientX - localVideoOffset.x}px`;
  }

  function onMouseUp() {
    if (!localVideo.current) return;
    setIsDragging(false);
    localVideo.current.style.cursor = "grab";
  }

  useEffect(() => {
    if (remoteVideo.current) {
      remoteVideo.current.srcObject = remoteSrc;
    }
    if (localVideo.current) {
      localVideo.current.srcObject = localSrc;
    }
  }, [remoteSrc, localSrc]);
  useEffect(() => {
    const videoToBoolean = video as boolean;
    const audioToBoolean = audio as boolean;
    mediaDevice.toggle("Video", videoToBoolean);
    mediaDevice.toggle("Audio", audioToBoolean);
  }, [mediaDevice]);

  return (
    <div className={classes.wrapper}>
      <div className={classes.video}>
        <video className={classes.remote} ref={remoteVideo} autoPlay />
        <video
          className={classes.local}
          ref={localVideo}
          autoPlay
          muted
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
        />
      </div>
      <div className={classes.control}>
        <button onClick={() => toggleMediaDevice("Video")}>
          {video ? (
            <BsCameraVideo color="white" size={20} />
          ) : (
            <BsCameraVideoOff color="white" size={20} />
          )}
        </button>
        <button onClick={() => toggleMediaDevice("Audio")}>
          {audio ? (
            <CiMicrophoneOn color="white" size={20} />
          ) : (
            <CiMicrophoneOff color="white" size={20} />
          )}
        </button>
        <button className={classes.reject} onClick={() => finishCall(true)}>
          <FiPhoneOff color="white" size={20} />
        </button>
      </div>
    </div>
  );
}
