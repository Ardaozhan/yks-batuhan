import type { Exam, ExamResult } from "@/types/study";

export const calculateNet = ({ correct, wrong }: ExamResult) => correct - wrong / 4;
export const formatNet = (value:number) => value.toLocaleString("tr-TR", { minimumFractionDigits:0, maximumFractionDigits:2 });
export const totalNet = (exam:Exam) => exam.results.reduce((sum, result) => sum + calculateNet(result), 0);
export const totalQuestions = (exam:Exam) => exam.results.reduce((sum, result) => sum + result.correct + result.wrong + result.blank, 0);
