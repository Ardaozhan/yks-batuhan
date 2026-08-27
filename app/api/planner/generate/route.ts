import { NextResponse } from "next/server";
import { CURRICULUM_AI_TRAINING_PROMPT } from "@/lib/curriculum-knowledge";
import { checkRateLimit } from "@/lib/security";

export async function POST(req: Request) {
  try {
    const rateLimit = checkRateLimit(req, "planner", { limit: 12, windowMs: 60 * 1000 });
    if (!rateLimit.success && rateLimit.response) {
      return rateLimit.response;
    }

    const { hours = 4, energy = "normal", focus = "", style = "balanced", context } = await req.json();

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "DeepSeek API anahtarı tanımlanmamış." },
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
    const completedTopics = Array.isArray(context?.completedTopics) ? context.completedTopics : [];
    const uncompletedTopics = Array.isArray(context?.uncompletedTopics) ? context.uncompletedTopics : [];
    const mistakes = Array.isArray(context?.mistakes) ? context.mistakes : [];
    const recentExams = Array.isArray(context?.recentExams) ? context.recentExams : [];

    const uncompletedSample = uncompletedTopics.slice(0, 15).join(", ") || "Temel müfredat konuları";
    const completedSample = completedTopics.slice(0, 10).join(", ") || "Henüz tamamlanan konu yok";
    const curriculumNextSteps = Array.isArray(context?.curriculumNextSteps) && context.curriculumNextSteps.length > 0
      ? context.curriculumNextSteps.join("; ")
      : "Müfredat başlangıcı";
    const mistakesSample = mistakes
      .slice(0, 5)
      .map((m: { subject: string; topic: string; reason: string }) => `${m.subject}: ${m.topic} (${m.reason})`)
      .join("; ") || "Hata kaydı yok";

    const systemPrompt = `Sen Türkiye YKS (TYT ve AYT) sınavına hazırlanan öğrenciler için pedagojik, bilimsel ve ultra verimli günlük ders çalışma programları hazırlayan uzman bir "YKS AI Baş Planlayıcısı"sın.

${CURRICULUM_AI_TRAINING_PROMPT}

ÖĞRENCİNİN MEVCUT DURUMU:
- İsim: ${studentName}
- Hedef Bölüm: ${targetDept} ${targetUni ? `(${targetUni})` : ""}
- Sınav Türü: ${examType}
- Çalışma Serisi: ${streak} Gün | Çözülen Soru: ${solvedQuestions} | Toplam Saat: ${hoursStudied}
- Tamamlanan Konular: ${completedSample}
- Müfredat Sırasına Göre Sırada Bekleyen Öncelikli Konular: ${curriculumNextSteps}
- Genel Eksik Konular: ${uncompletedSample}
- Hata Defteri Eksikleri: ${mistakesSample}
- Son Denemeler: ${
      recentExams.length > 0
        ? recentExams.map((e: { name: string; totalNet?: number }) => `${e.name} (${e.totalNet || 0} Net)`).join(", ")
        : "Henüz deneme kaydı yok"
    }

BUGÜNKÜ PLAN PARAMETRELERİ:
- Çalışılabilir Toplam Süre: ${hours} Saat
- Enerji Seviyesi: ${energy === "low" ? "Düşük (Tekrar ve hafif soru çözümü ağırlıklı olmalı)" : energy === "high" ? "Yüksek (Zorlayıcı konular, derin problem ve deneme çözümleri)" : "Normal (Dengeli konu ve test ritmi)"}
- Çalışma Stili: ${style === "weakness" ? "Eksik Kapatma ve Zayıf Alan Odaklı" : style === "speed" ? "Hız ve Soru Çözüm Kampı" : "Dengeli TYT ve AYT Dağılımı"}
${focus ? `- Öğrencinin Özel Odak / İstek Notu: "${focus}"` : ""}

KURALLAR:
1. Öğrencinin toplam ${hours} saatlik süresini aşmayacak şekilde 2 ila 4 adet net, spesifik çalışma bloğu (görev) oluştur.
2. Eğer öğrenci özel bir odak konusu belirttiyse mutlaka plana dahil et. Belirtmediyse öğrencinin eksik olduğu sıradaki YKS müfredat konularından ve hata defterinden seç.
3. Her göreve gerçekçi dakika süreleri (örn: "60 dk", "45 dk", "90 dk") ve mantıklı soru hedefleri (örn: 25, 30, 40) ata.
4. Çıktıyı MUTLAKA aşağıdaki JSON şemasında oluştur:
{
  "aiRationale": "Öğrenciye hitaben, bugünkü planı neden bu şekilde kurguladığını anlatan 2-3 cümlelik samimi ve motive edici açıklama (sen diliyle)",
  "totalPlannedQuestions": 90,
  "tasks": [
    {
      "subject": "Ders Adı (Örn: TYT Matematik, TYT Türkçe, AYT Fizik)",
      "topic": "Net Konu Adı (Örn: Problemler - Hız ve Hareket, Fonksiyonlar)",
      "description": "Öğrencinin ne yapacağına dair kısa net yönerge (Örn: Konu özet videosu + soru bankasından 2 test)",
      "duration": "75 dk",
      "priority": "high" veya "normal" veya "low",
      "plannedQuestions": 30
    }
  ],
  "tips": [
    "Bugünkü çalışma için pedagojik ve taktiksel ipucu 1",
    "Bugünkü çalışma için pedagojik ve taktiksel ipucu 2"
  ]
}`;

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Lütfen ${hours} saatlik ve ${energy} enerjili günlük planımı hazırla.` },
        ],
        response_format: { type: "json_object" },
        temperature: 0.6,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("DeepSeek Planner API error:", response.status, err);
      return NextResponse.json(
        { error: "DeepSeek plan oluştururken bir hata verdi." },
        { status: response.status }
      );
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(rawContent);

    return NextResponse.json({
      aiRationale: parsed.aiRationale || "Hedeflerine ve bugünkü enerjine göre sana özel günlük çalışma programı hazırlandı.",
      totalPlannedQuestions: parsed.totalPlannedQuestions || 75,
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
      tips: Array.isArray(parsed.tips) ? parsed.tips : [],
    });
  } catch (error) {
    console.error("Planner API Route error:", error);
    return NextResponse.json(
      { error: "Plan oluşturma servisinde bir hata oluştu." },
      { status: 500 }
    );
  }
}
