interface Props {
  startMedia: () => void;
  hangup: () => void;
  microphones: MediaDeviceInfo[];
  selectedMic: string;
  setSelectedMic: (id: string) => void;
}

export default function CallControls({
  startMedia,
  hangup,
  microphones,
  selectedMic,
  setSelectedMic,
}: Props) {
  return (
    <div className="mt-12 flex gap-3 items-center">
      <button className="bg-red-400 h-10 w-28 rounded" onClick={startMedia}>
        Start Mic
      </button>
      <select
        value={selectedMic}
        onChange={(e) => setSelectedMic(e.target.value)}
        className="rounded border-amber-50 p-2 bg-blue-300"
      >
        {microphones.map((mic) => (
          <option key={mic.deviceId} value={mic.deviceId}>
            {mic.label}
          </option>
        ))}
      </select>
      <button className="bg-red-400 h-10 w-28 ml-3 rounded" onClick={hangup}>
        Hang Up
      </button>
    </div>
  );
}
