import useWebRTC from "../../hooks/useWebRTC";
import RoomControls from "../roomcontrols/index";
import CallControls from "../callcontrols/index";

export default function Home() {
  const rtc = useWebRTC();

  return (
    <div className="bg-gray-700 h-screen w-screen pl-5 flex justify-center items-center">
      <div className="bg-black h-160 w-190 rounded-2xl">
        <h1 className="text-amber-50 text-center text-4xl pt-3">
          <strong>Audio Calling App</strong>
        </h1>
        <br />
        <div className="ml-5 flex flex-row mt-7">
          <RoomControls
            roomId={rtc.roomId}
            setRoomId={rtc.setRoomId}
            createRoom={rtc.createRoom}
            joinRoom={rtc.joinRoom}
          />
          <CallControls startMedia={rtc.startMicrophone} hangup={rtc.hangup} />
          <audio ref={rtc.remoteAudioRef} autoPlay />
        </div>
      </div>
    </div>
  );
}
