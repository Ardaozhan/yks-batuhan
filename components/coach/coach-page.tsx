"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Calendar,
  Check,
  ChevronDown,
  Flame,
  GraduationCap,
  Layers,
  Lightbulb,
  Plus,
  RotateCcw,
  Send,
  Sparkles,
  Target,
  Timer,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  addDailyTask,
  getExams,
  getMistakes,
  getProfile,
  getTopics,
} from "@/lib/study-store";
import { getNextCurriculumTopic } from "@/lib/curriculum-knowledge";

type CoachMode = "strategy" | "tutor" | "motivation" | "planner";

type Message = {
  id: string;
  sender: "user" | "coach";
  text: string;
  cards?: Array<{
    title: string;
    priority: "Öncelikli" | "Orta Seviye" | "Tavsiye";
    description: string;
    actionText: string;
    actionHref: string;
    iconType: "calc" | "layers" | "timer";
  }>;
  explanation?: {
    summary: string;
    points: string[];
  };
};

const modeConfig: Record<
  CoachMode,
  { label: string; icon: typeof Target; desc: string; quickPrompts: string[] }
> = {
  strategy: {
    label: "Net & Strateji",
    icon: Target,
    desc: "Eksik konu tespiti, net artırma taktikleri ve sınav analizi",
    quickPrompts: [
      "Bugün ne çalışmalıyım?",
      "Eksiklerimi ve zayıf alanlarımı analiz et",
      "TYT'de süre yetiştiremiyorum, taktik ver",
      "Hedefime göre haftalık soru hedefim ne olmalı?",
      "Matematikte en hızlı net kazandıracak konular hangileri?",
    ],
  },
  tutor: {
    label: "Konu Anlatıcı (Hoca)",
    icon: GraduationCap,
    desc: "Zorlandığın formülleri, soru tiplerini ve kavramları adım adım açıklar",
    quickPrompts: [
      "Fonksiyonlar konusunun temel mantığını özetle",
      "Permütasyon ve kombinasyon farkını soruyla anlat",
      "Türevde geometrik yorum ne anlama gelir?",
      "Optikte kırılma ve Snell yasasını açıkla",
      "Paragrafta ana düşünceyi bulmanın püf noktası nedir?",
    ],
  },
  motivation: {
    label: "Motivasyon & Disiplin",
    icon: Flame,
    desc: "Sınav kaygısı, odaklanma ve zihinsel dayanıklılık koçluğu",
    quickPrompts: [
      "Bugün hiç ders çalışma isteğim yok, beni motive et",
      "Sınav kaygımı ve net stresimi nasıl yönetirim?",
      "Sürekli erteleme alışkanlığımı nasıl kırarım?",
      "Yoruldum ve yetiştiremeyeceğimi hissediyorum",
      "Verimli bir pomodoro rutini nasıl kurarım?",
    ],
  },
  planner: {
    label: "Hızlı Planlayıcı",
    icon: Calendar,
    desc: "Kalan zamanına ve enerjine göre saatlik blok çalışma programı yapar",
    quickPrompts: [
      "Bugün için 4 saatlik blok çalışma programı hazırla",
      "Akşam 18:00 - 23:00 arası için verimli bir plan çıkar",
      "Haftalık TYT ve AYT dengesini nasıl kurmalıyım?",
      "Pazar günü genel deneme ve analiz programı yap",
      "Günde kaç farklı ders çalışmalıyım?",
    ],
  },
};

let msgSeq = 0;
const createMsgId = (prefix: string) => `${prefix}-${++msgSeq}`;

export function CoachPage() {
  const [mode, setMode] = useState<CoachMode>("strategy");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [addedCards, setAddedCards] = useState<Record<string, boolean>>({});
  const [expandedReason, setExpandedReason] = useState<string | null>("m-init-1");

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m-init-1",
      sender: "coach",
      text: "Merhaba! DeepSeek yapay zekasıyla güçlendirilmiş YKS Koçun olarak yanındayım. Hedeflerini, tamamladığın konuları ve deneme netlerini inceleyerek sana özel stratejiler, konu anlatımları ve çalışma planları sunuyorum. Üstteki modlardan birini seçebilir veya aklındaki soruyu hemen sorabilirsin!",
      cards: [
        {
          title: "Hedef ve Çalışma Planı",
          priority: "Öncelikli",
          description:
            "Günlük çalışma saatlerini ve hedeflerini belirleyerek güne organize başla.",
          actionText: "Planlayıcıya Git",
          actionHref: "/planner",
          iconType: "timer",
        },
        {
          title: "Ders ve Konu Müfredatı",
          priority: "Tavsiye",
          description:
            "TYT ve AYT ders müfredatındaki konuları incele ve çalıştıklarını tikle.",
          actionText: "Dersleri İncele",
          actionHref: "/subjects",
          iconType: "layers",
        },
      ],
      explanation: {
        summary: "YKS Koçun senin için neler yapabilir?",
        points: [
          "Net & Strateji: Deneme netlerini ve konu eksiklerini analiz eder.",
          "Konu Anlatıcı: Anlamadığın formülleri ve soru kalıplarını özel ders gibi anlatır.",
          "Motivasyon: Zorlandığın anlarda enerjini ve disiplinini yükseltir.",
          "Hızlı Planlayıcı: Kalan saatlerine göre net bir günlük program çıkarır.",
        ],
      },
    },
  ]);

  // Handle Speech synthesis cleanup
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleToggleSpeech = (msgId: string, text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (speakingId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`[\]()]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "tr-TR";
    utterance.rate = 1.0;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    setSpeakingId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleAddCardToToday = async (
    cardKey: string,
    card: { title: string; description: string }
  ) => {
    const parts = card.title.split(":");
    const sub = parts[0]?.trim() || "Öncelikli Ders";
    const top = parts[1]?.trim() || card.title;

    await addDailyTask({
      subject: sub,
      topic: top,
      description: card.description || "AI Koç Tavsiyesi Çalışması",
      duration: "45 dk",
      status: "pending",
      priority: "high",
      plannedQuestions: 25,
    });

    setAddedCards((prev) => ({ ...prev, [cardKey]: true }));
    setTimeout(() => {
      setAddedCards((prev) => ({ ...prev, [cardKey]: false }));
    }, 3000);
  };

  const handleClearChat = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
    }
    setMessages([
      {
        id: createMsgId("coach"),
        sender: "coach",
        text: "Yeni sohbet oturumu başlatıldı. Hazırım, aklındaki soruyu veya merak ettiğin konuyu sorabilirsin!",
      },
    ]);
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg: Message = {
      id: createMsgId("user"),
      sender: "user",
      text: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    const profile = getProfile();
    const topics = getTopics();
    const completedTopics = topics.filter((t) => t.status === "completed").map((t) => t.name);
    const uncompletedTopics = topics.filter((t) => t.status !== "completed").map((t) => t.name);
    const exams = getExams();
    const mistakes = getMistakes();

    const nextMath = getNextCurriculumTopic("tyt-matematik", completedTopics);
    const nextPhysics = getNextCurriculumTopic("tyt-fizik", completedTopics);
    const nextAytMath = getNextCurriculumTopic("ayt-matematik", completedTopics);
    const nextAytPhysics = getNextCurriculumTopic("ayt-fizik", completedTopics);

    const curriculumNextSteps = [
      nextMath.nextTopic ? `TYT Matematik: ${nextMath.nextTopic.name} (Sıra: ${nextMath.nextTopic.order}, ÖSYM: ${nextMath.nextTopic.osymWeight})` : null,
      nextPhysics.nextTopic ? `TYT Fizik: ${nextPhysics.nextTopic.name} (Sıra: ${nextPhysics.nextTopic.order}, ÖSYM: ${nextPhysics.nextTopic.osymWeight})` : null,
      nextAytMath.nextTopic ? `AYT Matematik: ${nextAytMath.nextTopic.name} (Sıra: ${nextAytMath.nextTopic.order}, ÖSYM: ${nextAytMath.nextTopic.osymWeight})` : null,
      nextAytPhysics.nextTopic ? `AYT Fizik: ${nextAytPhysics.nextTopic.name} (Sıra: ${nextAytPhysics.nextTopic.order}, ÖSYM: ${nextAytPhysics.nextTopic.osymWeight})` : null,
    ].filter(Boolean);

    try {
      const res = await fetch("/api/coach/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          mode,
          history: messages.slice(-6),
          context: {
            profile,
            completedTopicsCount: completedTopics.length,
            totalTopicsCount: topics.length,
            completedTopics,
            uncompletedTopics,
            curriculumNextSteps,
            mistakes,
            recentExams: exams.slice(0, 3).map((e) => ({
              name: e.name,
              type: e.type,
              date: e.date,
              totalNet: e.results?.reduce((acc, r) => acc + (r.correct - r.wrong / 4), 0),
            })),
          },
        }),
      });

      if (!res.ok) {
        throw new Error(`API hatası: ${res.status}`);
      }

      const data = await res.json();
      const coachReply: Message = {
        id: createMsgId("coach"),
        sender: "coach",
        text: data.text || "Sorunu inceledim, hedefin doğrultusunda çalışmaya devam etmelisin!",
        cards: Array.isArray(data.cards) ? data.cards : undefined,
        explanation: data.explanation || undefined,
      };

      setMessages((prev) => [...prev, coachReply]);
    } catch (err) {
      console.error("Coach fetch error:", err);
      const targetDept =
        profile?.targetDepartment && profile.targetDepartment !== "Hedef Belirle"
          ? profile.targetDepartment
          : "üniversite hedefin";

      const coachReply: Message = {
        id: createMsgId("coach"),
        sender: "coach",
        text: `"${query}" sorunu ${targetDept} hedefin doğrultusunda inceledim. YKS hazırlığında başarının anahtarı; her gün düzenli soru çözmek, yanlış yaptığın soruları 'Hata Defteri'ne kaydedip tekrar etmek ve haftalık deneme sürelerini disiplinle ölçmektir.`,
        cards: [
          {
            title: "Ders Müfredatı",
            priority: "Tavsiye",
            description: "Çalıştığın konuları tikleyerek ilerlemeni güncel tut.",
            actionText: "Dersleri İncele",
            actionHref: "/subjects",
            iconType: "timer",
          },
        ],
      };
      setMessages((prev) => [...prev, coachReply]);
    } finally {
      setLoading(false);
    }
  };

  const activeModeData = modeConfig[mode];

  return (
    <div className="mx-auto max-w-[880px] px-4 py-6 md:px-10 md:py-8 flex flex-col min-h-[calc(100vh-80px)]">
      {/* Header */}
      <header className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--outline)] pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--surface-ai)] text-[var(--primary)] shadow-xs border border-[#d7e8cb]">
            <Bot size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--ink)]">
                AI Koçum
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                <Sparkles size={11} /> DeepSeek V3
              </span>
            </div>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Canlı çalışma istatistiklerine ve hedeflerine göre özelleştirilmiş rehberlik
            </p>
          </div>
        </div>

        {/* Clear Chat Button */}
        <button
          type="button"
          onClick={handleClearChat}
          title="Sohbeti Temizle"
          className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--outline)] bg-white px-3 py-2 text-xs font-semibold text-[var(--muted)] hover:text-[var(--ink)] hover:border-[var(--primary)] transition-all self-start sm:self-auto active:scale-95"
        >
          <RotateCcw size={14} />
          <span>Yeni Sohbet</span>
        </button>
      </header>

      {/* Coach Role / Mode Selector Tabs */}
      <div className="mb-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(Object.keys(modeConfig) as CoachMode[]).map((mKey) => {
            const mData = modeConfig[mKey];
            const Icon = mData.icon;
            const isSelected = mode === mKey;
            return (
              <button
                key={mKey}
                type="button"
                onClick={() => setMode(mKey)}
                className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all active:scale-95 ${
                  isSelected
                    ? "border-[var(--primary)] bg-[var(--surface-ai)] shadow-xs"
                    : "border-[var(--outline)] bg-white hover:border-[var(--primary)]"
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--ink)]">
                  <Icon
                    size={15}
                    className={isSelected ? "text-[var(--primary)]" : "text-[var(--muted)]"}
                  />
                  <span>{mData.label}</span>
                </div>
                <span className="text-[10px] text-[var(--muted)] line-clamp-1 mt-1">
                  {mData.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Chat Box */}
      <div className="paper-card flex-1 flex flex-col justify-between p-4 md:p-6 bg-white overflow-hidden shadow-xs">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-1 max-h-[58vh]">
          {messages.map((m) => (
            <div key={m.id} className="space-y-3">
              {m.sender === "user" ? (
                /* User Message */
                <div className="flex justify-end">
                  <div className="max-w-[82%] rounded-2xl rounded-tr-xs bg-[var(--primary)] px-4 py-3 text-sm text-white shadow-xs leading-relaxed">
                    {m.text}
                  </div>
                </div>
              ) : (
                /* Coach Message */
                <div className="flex items-start gap-3 max-w-[96%]">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)] text-[var(--primary)] mt-1 shadow-2xs">
                    <Bot size={18} />
                  </div>
                  <div className="min-w-0 flex-1 space-y-3.5">
                    {/* Main text container */}
                    <div className="rounded-2xl rounded-tl-xs border border-[#d7e8cb] bg-[#f4f8f2] p-4 text-sm text-[var(--ink)] leading-relaxed shadow-2xs relative group">
                      {/* Text-to-speech button */}
                      <button
                        type="button"
                        onClick={() => handleToggleSpeech(m.id, m.text)}
                        title={speakingId === m.id ? "Okumayı Durdur" : "Sesli Dinle"}
                        className="absolute right-2.5 top-2.5 p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--primary)] hover:bg-white/80 transition-colors"
                      >
                        {speakingId === m.id ? (
                          <VolumeX size={16} className="text-red-600 animate-pulse" />
                        ) : (
                          <Volume2 size={16} />
                        )}
                      </button>

                      <div className="whitespace-pre-line pr-6">{m.text}</div>
                    </div>

                    {/* Insight & Action Cards */}
                    {m.cards && m.cards.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {m.cards.map((c, i) => {
                          const cardKey = `${m.id}-${i}`;
                          const isAdded = !!addedCards[cardKey];
                          return (
                            <div
                              key={i}
                              className="rounded-xl border border-[var(--outline)] bg-white p-4 flex flex-col justify-between hover:border-[var(--primary)] transition-all shadow-2xs"
                            >
                              <div>
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <h4 className="font-display text-sm font-semibold text-[var(--ink)] flex items-center gap-1.5">
                                    {c.iconType === "timer" ? (
                                      <Timer size={16} className="text-[var(--primary)]" />
                                    ) : (
                                      <Layers size={16} className="text-[var(--primary)]" />
                                    )}
                                    {c.title}
                                  </h4>
                                  <span
                                    className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                      c.priority === "Öncelikli"
                                        ? "bg-[#ffdad6]/70 text-[#93000a]"
                                        : "bg-[var(--surface-muted)] text-[var(--muted)]"
                                    }`}
                                  >
                                    {c.priority}
                                  </span>
                                </div>
                                <p className="text-xs text-[var(--muted)] leading-relaxed">
                                  {c.description}
                                </p>
                              </div>

                              <div className="mt-4 pt-3 border-t border-dashed border-[var(--outline)] flex items-center justify-between gap-2">
                                {/* Quick Add to Plan Button */}
                                <button
                                  type="button"
                                  onClick={() => handleAddCardToToday(cardKey, c)}
                                  className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg transition-all ${
                                    isAdded
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-[var(--surface-ai)] text-[var(--primary)] hover:bg-[#d7e8cb]"
                                  }`}
                                >
                                  {isAdded ? (
                                    <>
                                      <Check size={12} strokeWidth={3} />
                                      <span>Plana Eklendi</span>
                                    </>
                                  ) : (
                                    <>
                                      <Plus size={12} />
                                      <span>Bugüne Ekle</span>
                                    </>
                                  )}
                                </button>

                                <Link
                                  href={c.actionHref}
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)] hover:underline ml-auto"
                                >
                                  <span>{c.actionText}</span>
                                  <ArrowRight size={13} />
                                </Link>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Accordion: Why did I make this inference? */}
                    {m.explanation && (
                      <div className="rounded-xl border border-[var(--outline)] bg-[#fbf9f5] overflow-hidden text-xs">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedReason(expandedReason === m.id ? null : m.id)
                          }
                          className="w-full flex items-center justify-between p-3 text-left font-medium text-[var(--muted)] hover:text-[var(--ink)]"
                        >
                          <span className="flex items-center gap-1.5">
                            <Lightbulb size={15} className="text-[var(--primary)]" />
                            <span>{m.explanation.summary || "Neden bu çıkarımı yaptım?"}</span>
                          </span>
                          <ChevronDown
                            size={16}
                            className={`transition-transform duration-200 ${
                              expandedReason === m.id ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {expandedReason === m.id && (
                          <div className="p-3 border-t border-[var(--outline)] bg-white text-[var(--muted)] space-y-1.5">
                            <ul className="list-disc list-inside space-y-1 pl-1">
                              {m.explanation.points.map((pt, idx) => (
                                <li key={idx} className="leading-relaxed">
                                  {pt}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 text-xs text-[var(--muted)] py-3 px-2 animate-in fade-in">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-ai)] text-[var(--primary)] animate-spin">
                <Sparkles size={16} />
              </div>
              <span>AI Koç DeepSeek ile verilerini analiz ediyor ve yanıt hazırlıyor...</span>
            </div>
          )}
        </div>

        {/* Dynamic Quick Prompt Suggestions */}
        <div className="mt-4 pt-3 border-t border-[var(--outline)]">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-xs">
            <span className="text-[11px] font-semibold text-[var(--muted)] shrink-0 mr-1 flex items-center gap-1">
              <Sparkles size={12} className="text-[var(--primary)]" />
              Önerilen Sorular:
            </span>
            {activeModeData.quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handleSend(prompt)}
                disabled={loading}
                className="shrink-0 rounded-full border border-[var(--outline)] bg-[#fbf9f5] px-3 py-1 text-xs text-[var(--muted)] hover:border-[var(--primary)] hover:text-[var(--primary)] hover:bg-[var(--surface-ai)] transition-all disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="mt-2"
          >
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  mode === "tutor"
                    ? "Merak ettiğin formülü veya konuyu sor (örn: Türev alma kuralları)..."
                    : mode === "motivation"
                    ? "Nasıl hissettiğini veya kaygını yaz..."
                    : mode === "planner"
                    ? "Bugünkü zamanını belirt (örn: 3 saatim var ne yapmalıyım)..."
                    : "Koçuna sınav stratejisi veya taktik sor..."
                }
                className="w-full rounded-full border border-[var(--outline)] bg-[#fbf9f5] py-3 pl-4 pr-12 text-sm text-[var(--ink)] outline-none focus:border-[var(--primary)] focus:bg-white transition-all placeholder:text-[var(--muted)]"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                aria-label="Soruyu gönder"
                className="absolute right-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-xs hover:bg-[var(--primary-strong)] active:scale-95 disabled:opacity-40 transition-all"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] text-[var(--muted)]">
              AI Koç DeepSeek V3 altyapısını kullanır. ÖSYM/MEB müfredatına ve kişisel verilerine göre eğitilmiştir.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
