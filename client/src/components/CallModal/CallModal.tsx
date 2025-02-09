import { BsCameraVideo, BsPhone } from "react-icons/bs";
import classes from "./CallModal.module.scss";
import { FiPhoneOff } from "react-icons/fi";

type BaseType = {
  isCalling: boolean;
  rejectCall: () => void;
};

type PropsType =
  | (BaseType & {
      isCalling: false;
      callFrom: string;
      startCall: (
        isCaller: boolean,
        remoteId: string,
        config: MediaStreamConstraints
      ) => void;
      rejectCall: () => void;
    })
  | (BaseType & {
      isCalling: true;
      callTo: string;
      localId: string;
    });

export default function CallModal(props: PropsType) {
  function acceptWithVideo(video: boolean) {
    const config: MediaStreamConstraints = {
      audio: true,
      video,
    };
    if (!props.isCalling) {
      props.startCall(false, props.callFrom, config);
    }
  }

  return (
    <div className={classes.wrapper}>
      <p>
        {props.isCalling
          ? `Calling to ${props.callTo}...`
          : `${props.callFrom} is calling...`}
      </p>
      <div className={classes.control}>
        {!props.isCalling && (
          <>
            <button onClick={() => acceptWithVideo(true)}>
              <BsCameraVideo color="white" size={20} />
            </button>
            <button onClick={() => acceptWithVideo(false)}>
              <BsPhone color="white" size={20} />
            </button>
          </>
        )}
        <button onClick={props.rejectCall} className={classes.reject}>
          <FiPhoneOff color="white" size={20} />
        </button>
      </div>
    </div>
  );
}
