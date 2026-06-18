interface Props {
  startMedia: () => void;
  hangup: () => void;
}

export default function CallControls({ startMedia, hangup }: Props) {
  return (
    <div className="mt-5">
      <button className="bg-red-400 h-10 w-28 rounded" onClick={startMedia}>
        Start Mic
      </button>

      <button className="bg-red-400 h-10 w-28 ml-3 rounded" onClick={hangup}>
        Hang Up
      </button>
    </div>
  );
}
