import { NextResponse } from "next/server";
import { CURRICULUM_AI_TRAINING_PROMPT } from "@/lib/curriculum-knowledge";

export async function POST(req: Request) {
  try {
    const { context } = await req.json();

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
    const targetRank = context?.profile?.targetRank || 10000;
    const examTargetNet = context?.profile?.examTargetNet || 85;

    const completedTopics = Array.isArray(context?.completedTopics) ? context.completedTopics : [];
    const uncompletedTopics = Array.isArray(context?.uncompletedTopics) ? context.uncompletedTopics : [];
    const mistakes = Array.isArray(context?.mistakes) ? context.mistakes : [];
    const exams = Array.isArray(context?.recentExams) ? context.recentExams : [];
    const subjects = Array.isArray(context?.subjects) ? context.subjects : [];

    const subjectsSummary = subjects
      .map((s: { name: string; progress: number; completedTopics: number; topicCount: number }) =>
        `${s.name}: %${s.progress} (${s.completedTopics}/${s.topicCount} Konu)`
      )
      .join("; ") || "Ders ilerlemesi başlangıç seviyesinde";

    const examsSummary = exams
      .map((e: { name: string; type: string; date: string; totalNet?: number }) =>
        `${e.name} (${e.type}, ${e.date}): ${e.totalNet !== undefined ? `${e.totalNet} Net` : "Kayıtlı"}`
      )
      .join("; ") || "Henüz deneme kaydı girilmedi";

    const mistakesSummary = mistakes
      .slice(0, 8)
      .map((m: { subject: string; topic: string; reason: string }) => `${m.subject}: ${m.topic} (${m.reason})`)
      .join("; ") || "Henüz hata defteri kaydı yok";

    const systemPrompt = `Sen Türkiye YKS (TYT ve AYT) sınavına hazırlanan öğrencilerin performans verilerini, deneme netlerini ve ders ilerlemelerini analiz eden uzman bir "YKS Yapay Zeka Baş Veri Analisti ve Ölçme-Değerlendirme Uzmanı"sın.

${CURRICULUM_AI_TRAINING_PROMPT}

ÖĞRENCİNİN VERİLERİ:
- Öğrenci: ${studentName}
- Hedef: ${targetDept} ${targetUni ? `(${targetUni})` : ""} (Hedeflenen Sıralama: #${targetRank}, Hedef Net: ${examTargetNet})
- Sınav Türü: ${examType}
- Çalışma Serisi: ${streak} Gün | Çözülen Soru: ${solvedQuestions} | Toplam Çalışma Süresi: ${hoursStudied} Saat
- Tamamlanan Konu Sayısı: ${completedTopics.length} / ${completedTopics.length + uncompletedTopics.length}
- Ders İlerleme Durumu: ${subjectsSummary}
- Girilen Deneme Sınavları: ${examsSummary}
- Hata Defteri Analizi: ${mistakesSummary}

GÖREVİN:
Öğrencinin tüm verilerini derinlemesine analiz et; hedefine ne kadar yakın olduğunu, güçlü yönlerini, en çok net kaybettiği darboğazları ve netini en hızlı artıracak 3 stratejik hamleyi belirle.

MUTLAKA aşağıdaki JSON şemasında yanıt ver:
{
  "readinessScore": 65, // Hedefe yakınlık ve hazırlık puanı (0-100 arası sayı)
  "executiveSummary": "Öğrencinin genel performansını ve hedefine göre durumunu özetleyen 2-3 cümlelik samimi ve profesyonel analizi",
  "projectedNet": "Tahmini net aralığı veya net potansiyeli (Örn: 75 - 82 Net)",
  "tempoEvaluation": "Öğrencinin çalışma temposu değerlendirmesi (Örn: Güçlü ve istikrarlı tempo, ancak fen dersleri hızlandırılmalı)",
  "strengths": [
    "Öğrencinin iyi gittiği veya güçlü olduğu alan 1",
    "Öğrencinin iyi gittiği veya güçlü olduğu alan 2"
  ],
  "bottlenecks": [
    "Öğrencinin en çok net kaybettiği veya ihmal ettiği darboğaz 1",
    "Öğrencinin en çok net kaybettiği veya ihmal ettiği darboğaz 2"
  ],
  "actionRoadmap": [
    {
      "step": 1,
      "title": "Öncelikli Eylem 1 (Örn: TYT Paragraf Rutini)",
      "description": "Neden ve nasıl yapması gerektiği",
      "expectedGain": "+2-3 Net"
    },
    {
      "step": 2,
      "title": "Öncelikli Eylem 2 (Örn: Problemler ve Fonksiyonlar)",
      "description": "Neden ve nasıl yapması gerektiği",
      "expectedGain": "+4-5 Net"
    },
    {
      "step": 3,
      "title": "Öncelikli Eylem 3",
      "description": "Neden ve nasıl yapması gerektiği",
      "expectedGain": "+2 Net"
    }
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
          { role: "user", content: "Lütfen yukarıdaki öğrenci verilerine göre kapsamlı YKS performans ve net analiz raporumu oluştur." },
        ],
        response_format: { type: "json_object" },
        temperature: 0.5,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("DeepSeek Analytics API error:", response.status, err);
      return NextResponse.json(
        { error: "DeepSeek analiz oluştururken bir hata verdi." },
        { status: response.status }
      );
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(rawContent);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Analytics AI Route error:", error);
    return NextResponse.json(
      { error: "Analiz servisinde bir hata oluştu." },
      { status: 500 }
    );
  }
}
