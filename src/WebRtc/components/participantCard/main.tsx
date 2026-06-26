type Props = {
  name: string;
};

export default function ParticipantCard({ name }: Props) {
  return (
    <div className="relative flex aspect-video items-center justify-center rounded-3xl bg-zinc-800">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-600 text-4xl font-bold text-white">
        {name.charAt(0).toUpperCase()}
      </div>

      <div className="absolute bottom-4 left-4 rounded-full bg-black/50 px-3 py-1 text-sm text-white">
        {name}
      </div>
    </div>
  );
}
