"use client";

import { CallType } from "@/types";
import PeerConnection from "@/utils/PeerConnection";
import socket from "@/utils/socket";
import { useEffect, useState } from "react";
import classes from "./page.module.scss";
import { MainWindow } from "@/components/MainWindow/MainWindow";
import CallModal from "@/components/CallModal/CallModal";
import { CallWindow } from "@/components/CallWindow/CallWindow";

export default function Home() {
  const [callFrom, setCallFrom] = useState("");
  const [calling, setCalling] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [localSrc, setLocalSrc] = useState<MediaStream | null>(null);
  const [remoteSrc, setRemoteSrc] = useState<MediaStream | null>(null);
  const [pc, setPc] = useState<PeerConnection | null>(null);
  const [config, setConfig] = useState<MediaStreamConstraints | null>(null);
  const [callTo, setCallTo] = useState("");
  const [localId, setLocalId] = useState("");
  const [currentCall, setCurrentCall] = useState("");

  function startCall(
    isCaller: boolean,
    remoteId: string,
    config: MediaStreamConstraints
  ) {
    setCurrentCall(remoteId);
    setShowModal(false);
    setCalling(true);
    setConfig(config);

    const _pc = new PeerConnection(remoteId)
      .on("localStream", (stream) => {
        setLocalSrc(stream);
      })
      .on("remoteStream", (stream) => {
        setRemoteSrc(stream);
        setCalling(false);
      })
      .start(isCaller, config);
    setPc(_pc);
  }

  function rejectCall() {
    socket
      .emit("end", { to: callFrom })
      .emit("end", { to: localId })
      .emit("end", { to: callTo });
    setShowModal(false);
  }

  function finishCall(isCaller: boolean) {
    pc?.stop(isCaller);
    setCurrentCall("");
    setPc(null);
    setConfig(null);
    setCalling(false);
    setShowModal(false);
    setLocalSrc(null);
    setRemoteSrc(null);
  }

  useEffect(() => {
    socket.on("request", ({ from }) => {
      setCallFrom(from);
      setShowModal(true);
    });
  }, []);

  useEffect(() => {
    function handleUnload() {
      if (currentCall) {
        socket.emit("end", { to: currentCall });
      }
    }

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [currentCall]);

  useEffect(() => {
    function callHandler(data: CallType) {
      if (pc) {
        if (data.sdp) {
          pc.setRemoteDescription(data.sdp);
          if (data.sdp.type === "offer") {
            pc.createAnswer();
          }
        } else if (data.candidate) {
          pc.addIceCandidate(data.candidate);
        }
      }
    }

    function endHandler() {
      finishCall(false);
    }

    socket.on("call", callHandler).on("end", endHandler);

    return () => {
      socket.off("call", callHandler).off("end", endHandler);
    };
  }, [pc]);

  return (
    <div className={classes.wrapper}>
      <h1 className={classes.title}>WebRTC</h1>
      <MainWindow
        startCall={startCall}
        setCallTo={setCallTo}
        setParentLocalId={setLocalId}
      />
      {calling && (
        <CallModal
          isCalling={true}
          localId={localId}
          callTo={callTo}
          rejectCall={rejectCall}
        />
      )}
      {showModal && (
        <CallModal
          isCalling={false}
          callFrom={callFrom}
          startCall={startCall}
          rejectCall={rejectCall}
        />
      )}
      {remoteSrc && localSrc && config && pc && (
        <CallWindow
          localSrc={localSrc}
          remoteSrc={remoteSrc}
          config={config}
          mediaDevice={pc.mediaDevice}
          finishCall={finishCall}
        />
      )}
    </div>
  );
}
