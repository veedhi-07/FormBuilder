import { useLocation } from "react-router-dom";
import { useState } from "react";
import useWebRTC from "../../hooks/useWebRTC";
import ParticipantCard from "../participantCard/main";
import CallControls from "../callcontrols";

export default function MainPage() {
  const rtc = useWebRTC();

  const location = useLocation();
  const { roomId, mode } = location.state;
  // const roomId = location.state?.roomId;

  const [open, setOpen] = useState(mode === "create");
  const [copied, setCopied] = useState(false);

  const startMedia = async () => {
    if (mode === "create") {
      rtc.createCall(roomId);
    } else {
      rtc.joinCall(roomId);
    }
  };
  // console.log(roomId);
  const copyRoomId = async () => {
    await navigator.clipboard.writeText(roomId);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  // console.log("Room created", roomId);
  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 text-center">
              <div className="mb-3 text-5xl"></div>

              <h2 className="text-2xl font-bold text-gray-900">Room Created</h2>

              <p className="mt-2 text-sm text-gray-500">
                Share this Room ID with another user to join the call.
              </p>
            </div>

            <div className="mb-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="mb-2 text-xs uppercase tracking-wide text-gray-500">
                Room ID
              </p>

              <p className="break-all font-mono text-lg font-semibold text-gray-900">
                {roomId}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={copyRoomId}
                className="flex-1 rounded-xl bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700"
              >
                {copied ? "Copied ✓" : "Copy ID"}
              </button>

              <button
                onClick={() => setOpen(false)}
                className="flex-1 rounded-xl border border-gray-300 px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-100"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="min-h-screen bg-zinc-900 p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-40">
          <ParticipantCard name="You" />

          {rtc.remoteJoined && <ParticipantCard name="Remote User" />}
        </div>

        <audio ref={rtc.remoteAudioRef} autoPlay playsInline />
        <CallControls
          hangup={rtc.hangup}
          startMedia={startMedia}
          microphones={rtc.microphones}
          selectedMic={rtc.selectedMic}
          setSelectedMic={rtc.setSelectedMic}
        />
      </div>
    </>
  );
}
