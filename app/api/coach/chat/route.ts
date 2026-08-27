import { NextResponse } from "next/server";
import { CURRICULUM_AI_TRAINING_PROMPT } from "@/lib/curriculum-knowledge";
import { checkRateLimit } from "@/lib/security";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const rateLimit = checkRateLimit(req, "coach", { limit: 20, windowMs: 60 * 1000 });
    if (!rateLimit.success && rateLimit.response) {
      return rateLimit.response;
    }

    // Defense-in-depth: verify session inside the route, not only in middleware
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
    }

    const { message, history, context, mode = "strategy" } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Mesaj gerekli." }, { status: 400 });
    }

    // Input length guard: prevent oversized prompt injection / token exhaustion
    if (message.length > 2000) {
      return NextResponse.json({ error: "Mesaj çok uzun (maks. 2000 karakter)." }, { status: 400 });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          text: "DeepSeek API anahtarı tanımlanmamış. Lütfen ortam değişkenlerini kontrol edin.",
        },
        { status: 500 }
      );
    }

    const studentName = context?.profile?.name || "Öğrenci";
    const targetDept = context?.profile?.targetDepartment || "Hedef Belirle";
    const targetUni = context?.profile?.targetUniversity || "";
    const examType = context?.profile?.examType || "TYT+AYT";
    const streak = context?.profile?.streakDays || 0;
    const solvedQuestions = context?.profile?.totalQuestionsSolved || 0;
    const hoursStudied = context?.profile?.totalHoursStudied || 0;
    const completedTopicsCount = context?.completedTopicsCount || 0;
    const totalTopicsCount = context?.totalTopicsCount || 160;

    const completedSample = Array.isArray(context?.completedTopics) && context.completedTopics.length > 0
      ? context.completedTopics.slice(0, 10).join(", ")
      : "Henüz tamamlanan konu işaretlenmedi";

    const uncompletedSample = Array.isArray(context?.uncompletedTopics) && context.uncompletedTopics.length > 0
      ? context.uncompletedTopics.slice(0, 12).join(", ")
      : "Müfredat başlangıç seviyesinde";

    const mistakesSummary = Array.isArray(context?.mistakes) && context.mistakes.length > 0
      ? context.mistakes
          .slice(0, 5)
          .map(
            (m: { subject: string; topic: string; reason: string }) =>
              `${m.subject} - ${m.topic} (${m.reason})`
          )
          .join("; ")
      : "Henüz hata defterinde kayıt yok";

    const recentExams = Array.isArray(context?.recentExams) && context.recentExams.length > 0
      ? context.recentExams
          .map(
            (e: { name: string; type: string; date: string; totalNet?: number }) =>
              `${e.name} (${e.type}, ${e.date}): ${e.totalNet !== undefined ? `${e.totalNet} Net` : "Kayıtlı"}`
          )
          .join(", ")
      : "Henüz deneme sınavı kaydı girilmedi";

    // Mode-specific instructions
    let modePersona = "";
    if (mode === "tutor") {
      modePersona = `MOD: 🧠 KONU ANLATICI VE HOCA MODU
Öğrenciye bir özel ders hocası gibi yaklaş. Sorduğu konuyu, formülü veya kavramı en anlaşılır, sade ve akılda kalıcı yöntemlerle açıkla. Gerektiğinde formül şeması, mantıksal türetim veya ÖSYM'nin çıkmış soru kalıbı örnekleri ver.`;
    } else if (mode === "motivation") {
      modePersona = `MOD: 🔥 MOTİVASYON VE ZİHİNSEL DİSİPLİN KOÇU
Öğrencinin sınav kaygısını, çalışma isteksizliğini veya yorgunluğunu anla. Onu hem duygusal olarak ayağa kaldır hem de pratik aksiyon almasını sağla (örneğin 25 dakikalık tek bir pomodoro başlatma taktiği, küçük hedefler koyma).`;
    } else if (mode === "planner") {
      modePersona = `MOD: 📅 SAATLİK GÜNLÜK PLANLAYICI
Öğrencinin bugünkü çalışma programını saat saat veya blok blok (örneğin 45 dk çalışma + 15 dk mola) optimize et. Hangi derse ne kadar süre ayırması gerektiğini net sürelerle yaz.`;
    } else {
      modePersona = `MOD: 🎯 NET ARTIRMA VE STRATEJİ KOÇU (VARSAYILAN)
Öğrencinin eksik konularını, deneme sonuçlarını ve ÖSYM soru ağırlıklarını gözeterek en hızlı net kazandıracak taktikleri, soru bankası çalışma sırasını ve deneme süresi yönetimi taktiklerini sun.`;
    }

    const systemPrompt = `Sen Türkiye YKS (Yükseköğretim Kurumları Sınavı: TYT ve AYT) hazırlık sürecinde öğrencilere eşlik eden, son derece yetkin, sıcak, pedagojik ve doğrudan sonuç odaklı uzman bir "AI YKS Koçu"sun.

${modePersona}

${CURRICULUM_AI_TRAINING_PROMPT}

ÖĞRENCİ PROFİLİ VE GÜNCEL VERİLERİ:
- İsim: ${studentName}
- Hedef Bölüm: ${targetDept} ${targetUni ? `(${targetUni})` : ""}
- Sınav Türü: ${examType}
- Çalışma Serisi: ${streak} Gün
- Çözülen Soru Sayısı: ${solvedQuestions}
- Çalışılan Süre: ${hoursStudied} Saat
- Konu İlerlemesi: ${completedTopicsCount} / ${totalTopicsCount} tamamlandı
- Tamamlanan Konulardan Bazıları: ${completedSample}
- Sıradaki / Çalışılmamış Konulardan Bazıları: ${uncompletedSample}
- Hata Defteri Kayıtları: ${mistakesSummary}
- Son Denemeler: ${recentExams}

KURALLAR VE FORMAT:
1. Doğrudan "sen" diliyle, samimi ve enerjik bir üslupla konuş.
2. Öğrencinin sorusuna göre yanıtını MUTLAKA geçerli bir JSON objesi olarak oluştur. Şema:
{
  "text": "Öğrenciye hitap eden ana koçluk analizi, açıklamaları veya ders anlatımı (gerekirse madde imleri ve paragraflar ile zenginleştir)",
  "cards": [
    {
      "title": "Aksiyon veya Konu Kartı (Örn: TYT Paragraf Hız Kampı)",
      "priority": "Öncelikli" veya "Orta Seviye" veya "Tavsiye",
      "description": "Neden bu adımı atması gerektiğine dair 1-2 cümle",
      "actionText": "Buton Metni (Örn: Plana Ekle, Konuyu İncele, Deneme Ekle)",
      "actionHref": "/today veya /subjects veya /planner veya /exams",
      "iconType": "calc" veya "timer" veya "layers"
    }
  ],
  "explanation": {
    "summary": "Özet veya Stratejik Dayanak",
    "points": [
      "Önemli çıkarım veya pratik taktik 1",
      "Önemli çıkarım veya pratik taktik 2"
    ]
  }
}
Not: "cards" alanında en fazla 2 kart yer alabilir. Özel bir yönlendirme yoksa boş [] dizi dönebilirsin.`;

    const chatMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      { role: "system", content: systemPrompt },
    ];

    if (Array.isArray(history)) {
      for (const msg of history.slice(-8)) {
        if (msg.sender === "user") {
          chatMessages.push({ role: "user", content: msg.text });
        } else if (msg.sender === "coach" && msg.text) {
          chatMessages.push({ role: "assistant", content: msg.text });
        }
      }
    }

    chatMessages.push({ role: "user", content: message });

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: chatMessages,
        response_format: { type: "json_object" },
        temperature: mode === "tutor" ? 0.4 : 0.7,
        max_tokens: 1800,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("DeepSeek API error:", response.status, errText);
      return NextResponse.json(
        {
          text: `Yapay zeka yanıt oluştururken geçici bir sunucu sorunu oluştu (${response.status}). Lütfen bir an sonra tekrar dene.`,
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || "{}";

    try {
      const parsed = JSON.parse(rawContent);
      return NextResponse.json({
        text: parsed.text || "Sorunu inceledim, hedefine doğru kararlılıkla çalışmaya devam et!",
        cards: Array.isArray(parsed.cards) ? parsed.cards : undefined,
        explanation: parsed.explanation || undefined,
      });
    } catch {
      return NextResponse.json({
        text: rawContent,
      });
    }
  } catch (error) {
    console.error("Coach API route error:", error);
    return NextResponse.json(
      { text: "Bağlantı hatası oluştu. Lütfen internet bağlantını kontrol et." },
      { status: 500 }
    );
  }
}
