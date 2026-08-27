export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "streak" | "questions" | "exams" | "subjects";
  unlocked: boolean;
  progressText: string;
}

export function calculateUserBadges(stats: {
  streakDays: number;
  totalQuestions: number;
  completedTopicsCount: number;
  examCount: number;
}): Badge[] {
  return [
    {
      id: "first_step",
      title: "İlk Adım",
      description: "İlk çalışma görevini veya konusunu başarıyla tamamla.",
      icon: "🎯",
      category: "subjects",
      unlocked: stats.completedTopicsCount >= 1 || stats.totalQuestions > 0,
      progressText: stats.completedTopicsCount >= 1 ? "Kazanıldı" : "0 / 1 Görev",
    },
    {
      id: "streak_3",
      title: "Seri Başlangıcı",
      description: "3 gün boyunca kesintisiz çalışma serisini koru.",
      icon: "🔥",
      category: "streak",
      unlocked: stats.streakDays >= 3,
      progressText: `${Math.min(stats.streakDays, 3)} / 3 Gün`,
    },
    {
      id: "streak_7",
      title: "7 Günlük Disiplin",
      description: "Tam 1 hafta boyunca her gün hedeflerini tamamla.",
      icon: "🛡️",
      category: "streak",
      unlocked: stats.streakDays >= 7,
      progressText: `${Math.min(stats.streakDays, 7)} / 7 Gün`,
    },
    {
      id: "questions_500",
      title: "Soru Ustası",
      description: "Sistemde toplam 500 çözülmüş soru kaydına ulaş.",
      icon: "⚡",
      category: "questions",
      unlocked: stats.totalQuestions >= 500,
      progressText: `${Math.min(stats.totalQuestions, 500)} / 500 Soru`,
    },
    {
      id: "questions_1000",
      title: "1.000 Soru Kulübü",
      description: "1.000 soru barajını aşarak soru çözme alışkanlığını pekiştir.",
      icon: "💎",
      category: "questions",
      unlocked: stats.totalQuestions >= 1000,
      progressText: `${Math.min(stats.totalQuestions, 1000)} / 1000 Soru`,
    },
    {
      id: "exam_3",
      title: "Deneme Avcısı",
      description: "En az 3 deneme sınavı çözerek net gelişimini takip et.",
      icon: "🏆",
      category: "exams",
      unlocked: stats.examCount >= 3,
      progressText: `${Math.min(stats.examCount, 3)} / 3 Deneme`,
    },
    {
      id: "topics_10",
      title: "Müfredat Canavarı",
      description: "ÖSYM müfredatından en az 10 konuyu %100 tamamla.",
      icon: "📚",
      category: "subjects",
      unlocked: stats.completedTopicsCount >= 10,
      progressText: `${Math.min(stats.completedTopicsCount, 10)} / 10 Konu`,
    },
    {
      id: "master_yks",
      title: "YKS Şampiyonu",
      description: "14 gün seri ve 5 deneme barajını aşarak zirveye yerleş.",
      icon: "👑",
      category: "streak",
      unlocked: stats.streakDays >= 14 && stats.examCount >= 5,
      progressText: stats.streakDays >= 14 && stats.examCount >= 5 ? "Kazanıldı" : "14 Gün + 5 Deneme",
    },
  ];
}
