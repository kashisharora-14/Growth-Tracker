import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export type AddictionType = "alcohol" | "cigarette" | "tobacco" | "cocaine" | "caffeine";
export type SubstanceDetails = { [questionId: string]: string };

export type MoodEntry = {
  id: string;
  date: string;
  mood: number;
  cravingLevel: number;
  note?: string;
};

export type UserProfile = {
  name: string;
  addictionType: AddictionType;
  sobrietyStartDate: string;
  emergencyContacts: Array<{ name: string; phone: string }>;
  isOnboarded: boolean;
  yearsUsing: number;
  dailySpend: number;
  motivations: string[];
  currentFeeling: string;
  substanceDetails: SubstanceDetails;
  cravingLevel: number;
  commitmentLevel: number;
};

type RecoveryContextType = {
  profile: UserProfile | null;
  streak: number;
  longestStreak: number;
  moodHistory: MoodEntry[];
  isLoading: boolean;
  setProfile: (profile: UserProfile) => Promise<void>;
  addMoodEntry: (entry: Omit<MoodEntry, "id" | "date">) => void;
  resetStreak: () => Promise<void>;
  clearAllData: () => Promise<void>;
};

const RecoveryContext = createContext<RecoveryContextType | null>(null);

function getLS<T>(key: string): T | null {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : null;
  } catch { return null; }
}
function setLS(key: string, val: unknown) {
  localStorage.setItem(key, JSON.stringify(val));
}

export function RecoveryProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const p = getLS<UserProfile>("@profile");
    const s = getLS<number>("@streak");
    const ls = getLS<number>("@longestStreak");
    const m = getLS<MoodEntry[]>("@moodHistory");
    if (p) setProfileState(p);
    if (s != null) setStreak(s);
    if (ls != null) setLongestStreak(ls);
    if (m) setMoodHistory(m);
    else {
      const sample: MoodEntry[] = Array.from({ length: 7 }, (_, i) => ({
        id: `mood-${i}`,
        date: new Date(Date.now() - (6 - i) * 86400000).toISOString(),
        mood: 3 + Math.floor(Math.random() * 3),
        cravingLevel: 1 + Math.floor(Math.random() * 4),
      }));
      setMoodHistory(sample);
    }
    setIsLoading(false);
  }, []);

  const setProfile = useCallback(async (p: UserProfile) => {
    const start = new Date(p.sobrietyStartDate);
    const now = new Date();
    const days = Math.max(0, Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    setProfileState(p);
    setStreak(days);
    setLongestStreak(days);
    setLS("@profile", p);
    setLS("@streak", days);
    setLS("@longestStreak", days);
  }, []);

  const addMoodEntry = useCallback((entry: Omit<MoodEntry, "id" | "date">) => {
    const newEntry: MoodEntry = {
      ...entry,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };
    const updated = [newEntry, ...moodHistory].slice(0, 30);
    setMoodHistory(updated);
    setLS("@moodHistory", updated);
  }, [moodHistory]);

  const resetStreak = useCallback(async () => {
    setStreak(0);
    const newStart = new Date().toISOString();
    if (profile) {
      const updated = { ...profile, sobrietyStartDate: newStart };
      setProfileState(updated);
      setLS("@profile", updated);
    }
    setLS("@streak", 0);
  }, [profile]);

  const clearAllData = useCallback(async () => {
    localStorage.removeItem("@profile");
    localStorage.removeItem("@streak");
    localStorage.removeItem("@longestStreak");
    localStorage.removeItem("@moodHistory");
    setProfileState(null);
    setStreak(0);
    setLongestStreak(0);
    setMoodHistory([]);
  }, []);

  return (
    <RecoveryContext.Provider value={{
      profile, streak, longestStreak, moodHistory, isLoading,
      setProfile, addMoodEntry, resetStreak, clearAllData,
    }}>
      {children}
    </RecoveryContext.Provider>
  );
}

export function useRecovery() {
  const ctx = useContext(RecoveryContext);
  if (!ctx) throw new Error("useRecovery must be used inside RecoveryProvider");
  return ctx;
}
