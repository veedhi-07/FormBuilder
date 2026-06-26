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
  // return (
  //   <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 rounded-full px-8 py=4 backdrop-blur-xl shadow-2xl">
  //     <button
  //       className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl transition hover:scale-110 hover:bg-blue-500"
  //       onClick={startMedia}
  //     >
  //       🎙
  //     </button>
  //     <select
  //       value={selectedMic}
  //       onChange={(e) => setSelectedMic(e.target.value)}
  //       className="rounded border-amber-50 p-2 bg-blue-300"
  //     >
  //       {microphones.map((mic) => (
  //         <option key={mic.deviceId} value={mic.deviceId}>
  //           {mic.label}
  //         </option>
  //       ))}
  //     </select>
  //     <button
  //       className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-2xl transition hover:scale-110 hover:bg-red-500"
  //       onClick={hangup}
  //     >
  //       📞
  //     </button>
  //   </div>
  // );
  return (
    <div className="fixed bottom-8 left-1/2 z-50 flex -translate-x-1/2 items-center gap-5 rounded-2xl border border-white/10 bg-slate-900/70 px-6 py-4 shadow-2xl backdrop-blur-xl">
      {/* Microphone Selection */}
      <div className="flex flex-col">
        <label className="mb-1 text-xs font-medium tracking-wide text-slate-300">
          Microphone
        </label>

        <select
          value={selectedMic}
          onChange={(e) => setSelectedMic(e.target.value)}
          className="w-72 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white outline-none transition focus:border-blue-500"
        >
          {microphones.length === 0 ? (
            <option>No microphone found</option>
          ) : (
            microphones.map((mic, index) => (
              <option key={mic.deviceId} value={mic.deviceId}>
                {mic.label || `Microphone ${index + 1}`}
              </option>
            ))
          )}
        </select>
      </div>

      {/* Divider */}
      <div className="h-12 w-px bg-slate-700" />

      {/* Start Mic */}
      <button
        onClick={startMedia}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-2xl text-white shadow-lg transition duration-200 hover:scale-110 hover:shadow-blue-500/40 active:scale-95"
        title="Start microphone"
      >
        🎙️
      </button>

      {/* Hang Up */}
      <button
        onClick={hangup}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-rose-600 text-2xl text-white shadow-lg transition duration-200 hover:scale-110 hover:shadow-red-500/40 active:scale-95"
        title="Hang up"
      >
        📞
      </button>
    </div>
  );
}
