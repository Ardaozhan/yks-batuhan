"use client";

const storageKey = "yks-master.pending-records.v1";
type LocalRecord = { id:string; type:string; createdAt:string; data:Record<string,unknown> };

export function savePendingRecord(type:string, data:Record<string,unknown>) {
  const record:LocalRecord = { id:crypto.randomUUID(), type, createdAt:new Date().toISOString(), data };
  try { const raw = localStorage.getItem(storageKey); const current:LocalRecord[] = raw ? JSON.parse(raw) : []; localStorage.setItem(storageKey, JSON.stringify([...current,record])); return record; } catch { return record; }
}
