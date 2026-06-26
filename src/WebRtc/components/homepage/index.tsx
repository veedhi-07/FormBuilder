import RoomControls from "../roomcontrols/index";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { collection, doc, getDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { db } from "../../firebase";

export default function Home() {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");

  const createRoom = () => {
    const roomRef = doc(collection(db, "calls"));
    navigate("/mainpage", {
      state: {
        mode: "create",
        roomId: roomRef.id,
      },
    });
    console.log("Navigate with room:", roomRef.id);
  };

  const joinRoom = async () => {
    if (!roomId.trim()) {
      toast.error("Enter Room ID");
      return;
    }

    const roomRef = doc(db, "calls", roomId);

    const roomSnapshot = await getDoc(roomRef);

    if (!roomSnapshot.exists()) {
      toast.error("Room does not exist");
      return;
    }

    navigate("/mainpage", {
      state: {
        mode: "join",
        roomId,
      },
    });
  };
  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-900 to-indigo-950 px-6">
      <div className="w-full max-w-5xl rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-2xl p-10">
        <h1 className="text-center text-5xl font-bold text-white">
          Audio Calling App
        </h1>

        <p className="mt-3 text-center text-gray-300">
          Create a room or join an existing call.
        </p>

        <div className="mt-12 flex justify-center">
          <RoomControls
            roomId={roomId}
            setRoomId={setRoomId}
            createCall={createRoom}
            joinCall={joinRoom}
          />
        </div>
      </div>
    </div>
  );
}
