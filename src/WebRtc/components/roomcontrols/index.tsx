interface Props {
  roomId: string;
  setRoomId: (value: string) => void;
  createRoom: () => void;
  joinRoom: () => void;
}

export default function RoomControls({
  roomId,
  setRoomId,
  createRoom,
  joinRoom,
}: Props) {
  return (
    <div className="flex flex-col">
      <div>
        <label className="text-amber-50">Room ID:</label>
        <input
          className=" borders-2 ml-3 border-amber-50 text-amber-50 h-7 w-50"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          placeholder="Room ID"
        />
      </div>
      <div className="mt-3">
        <button className="bg-blue-400 h-10 w-28 rounded" onClick={createRoom}>
          Create Room
        </button>
        <button
          className="bg-blue-400 h-10 w-28 ml-3 rounded"
          onClick={joinRoom}
        >
          Join Room
        </button>
      </div>
    </div>
  );
}
