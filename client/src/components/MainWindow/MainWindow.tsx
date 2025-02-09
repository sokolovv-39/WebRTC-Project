"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import classes from "./MainWindow.module.scss";
import socket from "@/utils/socket";
import { InitType } from "@/types";
import { BsCameraVideo, BsPhone } from "react-icons/bs";

type PropsType = {
  startCall: (
    isCaller: boolean,
    remoteId: string,
    config: MediaStreamConstraints
  ) => void;
  setCallTo: Dispatch<SetStateAction<string>>;
  setParentLocalId: Dispatch<SetStateAction<string>>;
};

export function MainWindow({
  startCall,
  setCallTo,
  setParentLocalId,
}: PropsType) {
  const [localId, setLocalId] = useState("");
  const [remoteId, setRemoteId] = useState("");
  const [error, setError] = useState("");

  function callWithVideo(video: boolean) {
    if (!remoteId.trim()) {
      return setError("Your friend ID must be specified!");
    }

    const config: MediaStreamConstraints = {
      audio: true,
      video,
    };

    startCall(true, remoteId, config);
  }

  useEffect(() => {
    socket
      .on("init", ({ id }: InitType) => {
        setLocalId(id);
        setParentLocalId(id);
      })
      .emit("init");
  }, []);

  return (
    <div className={classes.wrapper}>
      <div className={classes.localId}>
        <h2>Your ID is</h2>
        <p>{localId}</p>
      </div>
      <div className={classes.remoteId}>
        <label htmlFor="remoteId">Your friend ID</label>
        <p className={classes.error}>{error}</p>
        <input
          type="text"
          spellCheck={false}
          placeholder="Enter friend ID"
          onChange={({ target: { value } }) => {
            setError("");
            setRemoteId(value);
            setCallTo(value);
          }}
        />
      </div>
      <div className={classes.control}>
        <button onClick={() => callWithVideo(true)}>
          <BsCameraVideo color="white" size={20} />
        </button>
        <button onClick={() => callWithVideo(false)}>
          <BsPhone color="white" size={20} />
        </button>
      </div>
    </div>
  );
}
