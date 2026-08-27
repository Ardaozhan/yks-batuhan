"use client";

import { useEffect, useRef, useState } from "react";
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
import { AiThinkingOrb } from "@/components/ui/ai-thinking-orb";
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
    desc: "Eksik tespiti, net artırma taktikleri ve sınav analizi",
    quickPrompts: [
      "Bugün ne çalışmalıyım?",
      "Eksiklerimi ve zayıf alanlarımı analiz et",
      "TYT'de süre yetiştiremiyorum, taktik ver",
      "Hedefime göre haftalık soru hedefim ne olmalı?",
      "Matematikte en hızlı net kazandıracak konular hangileri?",
    ],
  },
  tutor: {
    label: "Konu Anlatıcı",
    icon: GraduationCap,
    desc: "Zorlandığın formülleri ve soru kalıplarını açıklar",
    quickPrompts: [
      "Fonksiyonlar konusunun temel mantığını özetle",
      "Permütasyon ve kombinasyon farkını soruyla anlat",
      "Türevde geometrik yorum ne anlama gelir?",
      "Optikte kırılma ve Snell yasasını açıkla",
      "Paragrafta ana düşünceyi bulmanın püf noktası nedir?",
    ],
  },
  motivation: {
    label: "Motivasyon",
    icon: Flame,
    desc: "Sınav kaygısı, odaklanma ve zihinsel dayanıklılık",
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
    desc: "Kalan zamanına göre saatlik blok program yapar",
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
  const [expandedReason, setExpandedReason] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m-init-1",
      sender: "coach",
      text: "Merhaba! DeepSeek V3 destekli YKS Koçun olarak yanındayım. Eksik konularını, deneme netlerini ve çalışma hedeflerini analiz edip sana özel stratejiler sunmaya hazırım. Aklındaki soruyu sorabilir veya aşağıdaki önerilen konulardan başlayabilirsin!",
    },
  ]);

  // Personalize welcome message after client mount without hydration mismatch
  useEffect(() => {
    const timer = window.setTimeout(() => {
    const profile = getProfile();
    if (profile.name && profile.name !== "Öğrenci") {
      const targetInfo = profile.targetDepartment
        ? ` Hedefin: ${profile.targetDepartment}${profile.targetUniversity ? ` (${profile.targetUniversity})` : ""}.`
        : "";
      setMessages((prev) => {
        if (prev.length === 1 && prev[0].id === "m-init-1") {
          return [
            {
              id: "m-init-1",
              sender: "coach",
              text: `Merhaba ${profile.name}! DeepSeek V3 destekli YKS Koçun olarak yanındayım.${targetInfo} Eksik konularını, deneme netlerini ve çalışma hedeflerini analiz edip sana özel stratejiler sunmaya hazırım. Aklındaki soruyu sorabilir veya aşağıdaki önerilen konulardan başlayabilirsin!`,
            },
          ];
        }
        return prev;
      });
    }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

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
    const profile = getProfile();
    const name = profile.name ? profile.name : "Öğrenci";

    setMessages([
      {
        id: createMsgId("coach"),
        sender: "coach",
        text: `Yeni sohbet oturumu başlatıldı. Hazırım ${name}, aklındaki soruyu veya merak ettiğin konuyu sorabilirsin!`,
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
    } catch (error) {
      console.error("Coach fetch error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: createMsgId("coach-error"),
          sender: "coach",
          text: "AI Koç şu anda yanıt veremiyor. Lütfen internet bağlantınızı kontrol edip kısa süre sonra tekrar deneyin.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const activeModeData = modeConfig[mode];

  return (
    <div className="mx-auto max-w-4xl px-3 py-4 sm:px-6 sm:py-6 md:px-8 flex flex-col h-[calc(100dvh-64px)] sm:h-[calc(100vh-80px)]">
      {/* 1. Header Bar */}
      <header className="surface-panel relative mb-3 flex items-center justify-between gap-3 overflow-hidden rounded-2xl p-3 sm:p-4 shrink-0">
        <div className="pointer-events-none absolute -right-10 -top-12 h-28 w-28 rounded-full bg-[var(--primary-soft)]/60 blur-2xl" />
        <div className="relative flex items-center gap-2.5 min-w-0">
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--surface-ai)] text-[var(--primary)] shadow-xs border border-[#d7e8cb]">
            <Bot size={22} className="sm:size-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="font-display text-lg sm:text-xl font-bold tracking-tight text-[var(--ink)] truncate">
                AI Koçum
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] sm:text-[11px] font-bold text-emerald-800 shrink-0">
                <Sparkles size={10} /> DeepSeek V3
              </span>
            </div>
            <p className="text-[11px] text-[var(--muted)] truncate">
              ÖSYM müfredatı ve çalışma verilerine göre rehberlik
            </p>
          </div>
        </div>

        {/* Clear Chat Button */}
        <button
          type="button"
          onClick={handleClearChat}
          title="Yeni Sohbet Başlat"
          className="relative inline-flex items-center gap-1.5 rounded-xl border border-[var(--outline)] bg-white/90 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-semibold text-[var(--muted)] hover:text-[var(--ink)] hover:border-[var(--primary)] transition-all shrink-0 active:scale-95 touch-manipulation shadow-2xs"
        >
          <RotateCcw size={13} />
          <span className="hidden sm:inline">Yeni Sohbet</span>
        </button>
      </header>

      {/* 2. Coach Role / Mode Selector (Horizontal swipe on mobile, clean grid on tablet/desktop) */}
      <div className="mb-3 shrink-0">
        <div className="flex gap-2 overflow-x-auto pb-1.5 sm:pb-0 scrollbar-none sm:grid sm:grid-cols-4">
          {(Object.keys(modeConfig) as CoachMode[]).map((mKey) => {
            const mData = modeConfig[mKey];
            const Icon = mData.icon;
            const isSelected = mode === mKey;
            return (
              <button
                key={mKey}
                type="button"
                onClick={() => setMode(mKey)}
                className={`flex items-center sm:items-start sm:flex-col p-2 sm:p-2.5 rounded-xl border text-left transition-all active:scale-95 touch-manipulation shrink-0 sm:shrink min-h-[42px] sm:min-h-[50px] ${
                  isSelected
                    ? "border-[var(--primary)] bg-[var(--surface-ai)] shadow-2xs font-bold text-[var(--primary)]"
                    : "border-[var(--outline)] bg-white hover:border-[var(--primary)] text-[var(--ink)]"
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs">
                  <Icon
                    size={14}
                    className={isSelected ? "text-[var(--primary)]" : "text-[var(--muted)]"}
                  />
                  <span className="whitespace-nowrap">{mData.label}</span>
                </div>
                <span className="hidden sm:block text-[10px] text-[var(--muted)] line-clamp-1 mt-0.5 font-normal">
                  {mData.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Main Chat Container */}
      <div className="paper-card flex-1 flex flex-col justify-between p-3 sm:p-4 md:p-5 bg-white/90 overflow-hidden min-h-0">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto space-y-3.5 sm:space-y-5 pr-1 sm:pr-2 custom-scrollbar">
          {messages.map((m) => (
            <div key={m.id} className="space-y-2.5 animate-scale-in-spring">
              {m.sender === "user" ? (
                /* User Message */
                <div className="flex justify-end">
                  <div className="max-w-[90%] sm:max-w-[80%] rounded-2xl rounded-tr-xs bg-[var(--primary)] px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm text-white shadow-2xs leading-relaxed break-words hover-lift">
                    {m.text}
                  </div>
                </div>
              ) : (
                /* Coach Message */
                <div className="flex items-start gap-2.5 sm:gap-3 max-w-[100%] sm:max-w-[95%]">
                  <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)] text-[var(--primary)] mt-0.5 shadow-2xs animate-spring-pop">
                    <Bot size={15} />
                  </div>
                  <div className="min-w-0 flex-1 space-y-2.5">
                    {/* Main text bubble */}
                    <div className="rounded-2xl rounded-tl-xs border border-[#d7e8cb] bg-[#f4f8f2] p-3 sm:p-4 text-xs sm:text-sm text-[var(--ink)] leading-relaxed shadow-2xs relative group hover-lift">
                      {/* Text-to-speech button */}
                      <button
                        type="button"
                        onClick={() => handleToggleSpeech(m.id, m.text)}
                        title={speakingId === m.id ? "Okumayı Durdur" : "Sesli Dinle"}
                        className="absolute right-2 top-2 p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--primary)] hover:bg-white/80 transition-colors touch-manipulation mobile-tap"
                      >
                        {speakingId === m.id ? (
                          <VolumeX size={15} className="text-red-600 animate-badge-pulse" />
                        ) : (
                          <Volume2 size={15} />
                        )}
                      </button>

                      <div className="whitespace-pre-line pr-6 break-words">{m.text}</div>
                    </div>

                    {/* Action Cards (if generated by AI) */}
                    {m.cards && m.cards.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {m.cards.map((c, i) => {
                          const cardKey = `${m.id}-${i}`;
                          const isAdded = !!addedCards[cardKey];
                          return (
                            <div
                              key={i}
                              className="rounded-xl border border-[var(--outline)] bg-white p-3 sm:p-3.5 flex flex-col justify-between hover:border-[var(--primary)] transition-all shadow-2xs"
                            >
                              <div>
                                <div className="flex items-start justify-between gap-2 mb-1.5">
                                  <h4 className="font-display text-xs sm:text-sm font-semibold text-[var(--ink)] flex items-center gap-1.5 truncate">
                                    {c.iconType === "timer" ? (
                                      <Timer size={14} className="text-[var(--primary)] shrink-0" />
                                    ) : (
                                      <Layers size={14} className="text-[var(--primary)] shrink-0" />
                                    )}
                                    <span className="truncate">{c.title}</span>
                                  </h4>
                                  <span
                                    className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider shrink-0 ${
                                      c.priority === "Öncelikli"
                                        ? "bg-[#ffdad6]/70 text-[#93000a]"
                                        : "bg-[var(--surface-muted)] text-[var(--muted)]"
                                    }`}
                                  >
                                    {c.priority}
                                  </span>
                                </div>
                                <p className="text-[11px] text-[var(--muted)] leading-relaxed line-clamp-3">
                                  {c.description}
                                </p>
                              </div>

                              <div className="mt-3 pt-2 border-t border-dashed border-[var(--outline)] flex items-center justify-between gap-2 text-xs">
                                <button
                                  type="button"
                                  onClick={() => handleAddCardToToday(cardKey, c)}
                                  className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg transition-all touch-manipulation ${
                                    isAdded
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-[var(--surface-ai)] text-[var(--primary)] hover:bg-[#d7e8cb]"
                                  }`}
                                >
                                  {isAdded ? (
                                    <>
                                      <Check size={11} strokeWidth={3} />
                                      <span>Plana Eklendi</span>
                                    </>
                                  ) : (
                                    <>
                                      <Plus size={11} />
                                      <span>Bugüne Ekle</span>
                                    </>
                                  )}
                                </button>

                                <Link
                                  href={c.actionHref}
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--primary)] hover:underline ml-auto"
                                >
                                  <span>{c.actionText}</span>
                                  <ArrowRight size={12} />
                                </Link>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Accordion Reasoning */}
                    {m.explanation && (
                      <div className="rounded-xl border border-[var(--outline)] bg-[#fbf9f5] overflow-hidden text-xs">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedReason(expandedReason === m.id ? null : m.id)
                          }
                          className="w-full flex items-center justify-between p-2.5 sm:p-3 text-left font-medium text-[var(--muted)] hover:text-[var(--ink)] touch-manipulation"
                        >
                          <span className="flex items-center gap-1.5 text-[11px] sm:text-xs">
                            <Lightbulb size={14} className="text-[var(--primary)] shrink-0" />
                            <span>{m.explanation.summary || "Koçluk Gerekçesi"}</span>
                          </span>
                          <ChevronDown
                            size={14}
                            className={`transition-transform duration-200 ${
                              expandedReason === m.id ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {expandedReason === m.id && (
                          <div className="p-3 border-t border-[var(--outline)] bg-white text-[var(--muted)] text-[11px] sm:text-xs space-y-1">
                            <ul className="list-disc list-inside space-y-1">
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
            <AiThinkingOrb label="AI Koç stratejini ve analizi hazırlıyor..." />
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 4. Bottom Prompts & Input Area */}
        <div className="mt-2.5 pt-2.5 border-t border-[var(--outline)] shrink-0">
          {/* Quick Prompts Carousel */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-xs">
            <span className="text-[10px] sm:text-[11px] font-semibold text-[var(--muted)] shrink-0 mr-0.5 flex items-center gap-1">
              <Sparkles size={11} className="text-[var(--primary)]" />
              Öneriler:
            </span>
            {activeModeData.quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handleSend(prompt)}
                disabled={loading}
                className="shrink-0 rounded-full border border-[var(--outline)] bg-[#fbf9f5] px-2.5 py-1 text-[11px] text-[var(--muted)] hover:border-[var(--primary)] hover:text-[var(--primary)] hover:bg-[var(--surface-ai)] transition-all disabled:opacity-50 touch-manipulation"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Form Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="mt-1"
          >
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  mode === "tutor"
                    ? "Merak ettiğin formülü veya konuyu sor..."
                    : mode === "motivation"
                    ? "Nasıl hissettiğini veya kaygını yaz..."
                    : mode === "planner"
                    ? "Zamanını belirt (örn: 3 saatim var)..."
                    : "Koçuna sınav stratejisi veya taktik sor..."
                }
                className="w-full rounded-full border border-[var(--outline)] bg-[#fbf9f5] py-2.5 sm:py-3 pl-3.5 sm:pl-4 pr-11 sm:pr-12 text-xs sm:text-sm text-[var(--ink)] outline-none focus:border-[var(--primary)] focus:bg-white transition-all placeholder:text-[var(--muted)] min-h-[44px]"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                aria-label="Soruyu gönder"
                className="absolute right-1 sm:right-1.5 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-2xs hover:bg-[var(--primary-strong)] active:scale-95 disabled:opacity-40 transition-all touch-manipulation"
              >
                <Send size={14} className="sm:size-4" />
              </button>
            </div>
            <p className="mt-1.5 text-center text-[9px] sm:text-[10px] text-[var(--muted)]">
              ÖSYM/MEB müfredatına ve kişisel verilerine göre özelleştirilmiştir.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
