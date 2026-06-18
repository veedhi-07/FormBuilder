import useWebRTC from "../../hooks/useWebRTC";
// import VideoPlayer from "../videoplayer";
import RoomControls from "../roomcontrols/index";
import CallControls from "../callcontrols/index";

export default function Home() {
  const rtc = useWebRTC();

  return (
    <div className="bg-black h-screen w-screen pl-5">
      <h1 className="text-amber-50 text-center text-4xl pt-3">
        <strong>Audio Calling App</strong>
      </h1>
      <br />
      <RoomControls
        roomId={rtc.roomId}
        setRoomId={rtc.setRoomId}
        createRoom={rtc.createRoom}
        joinRoom={rtc.joinRoom}
      />
      <br />
      <audio ref={rtc.remoteAudioRef} autoPlay controls />
      <CallControls startMedia={rtc.startMicrophone} hangup={rtc.hangup} />
    </div>
  );
}
