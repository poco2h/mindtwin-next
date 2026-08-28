import ParticleBackground from "@/components/app/LazyParticleBackground";

const MESSAGES = [
  { who: "MindTwin", time: "09:14", text: "Hello! I am your Teacher MindTwin. What English skill would you like to practice today?" },
  {
    who: "Estudiante",
    time: "09:15",
    text: "I have an international meeting this afternoon and I want to practice technical business vocabulary.",
  },
  {
    who: "MindTwin",
    time: "09:15",
    text: "Excellent! Let's do a quick role-play simulation. I will ask questions and provide real-time phonetic and phrasing tips.",
  },
];

export default function ConversarPreview() {
  return (
    <div className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-3xl border border-black/10 shadow-2xl">
      <div className="relative h-[420px] bg-[#000003] [transform:translateZ(0)]">
        <ParticleBackground />
        <div className="relative z-10 flex h-full flex-col gap-3 overflow-hidden p-6">
          {MESSAGES.map((m, i) => {
            const isTwin = m.who === "MindTwin";
            return (
              <div key={i} className={isTwin ? "flex flex-col items-start" : "flex flex-col items-end"}>
                <span
                  className={
                    "mb-1 text-[10px] font-extrabold " + (isTwin ? "text-[#1abc9c]" : "text-white")
                  }
                >
                  {m.who} <span className="ml-1 font-normal text-white/30">{m.time}</span>
                </span>
                <div
                  className={
                    "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed " +
                    (isTwin
                      ? "rounded-bl-sm bg-[#1abc9c]/[0.07] text-white/90 border border-[#1abc9c]/20"
                      : "rounded-br-sm bg-white/[0.11] text-white")
                  }
                >
                  {m.text}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
