// type Props = {
//   name: string;
// };

// export default function ParticipantCard({ name }: Props) {
//   return (
//     <div className="relative flex aspect-video items-center justify-center rounded-3xl bg-zinc-800">
//       <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-600 text-4xl font-bold text-white">
//         {name.charAt(0).toUpperCase()}
//       </div>

//       <div className="absolute bottom-4 left-4 rounded-full bg-black/50 px-3 py-1 text-sm text-white">
//         {name}
//       </div>
//     </div>
//   );
// }
type Props = {
  name: string;
};

export default function ParticipantCard({ name }: Props) {
  return (
    <div className="relative aspect-video overflow-hidden rounded-3xl border border-slate-700 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl">
      {/* Decorative circles */}
      <div className="absolute -top-20 -left-20 h-60 w-60 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />

      <div className="relative flex h-full flex-col items-center justify-center">
        {/* Avatar */}
        <div className="flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 text-6xl font-bold text-white shadow-[0_10px_40px_rgba(59,130,246,0.5)]">
          {name[0].toUpperCase()}
        </div>

        {/* Name */}
        <h2 className="mt-6 text-2xl font-semibold text-white">{name}</h2>

        {/* Status */}
        <div className="mt-2 flex items-center gap-2 rounded-full bg-green-500/10 px-4 py-1">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-green-400"></span>

          <span className="text-sm text-green-300">In Call</span>
        </div>
      </div>
    </div>
  );
}
