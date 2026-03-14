import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type AddictionType =
  | "alcohol"
  | "cigarette"
  | "tobacco"
  | "cocaine"
  | "caffeine";

export type SubstanceDetails = {
  [questionId: string]: string;
};

export type MoodEntry = {
  id: string;
  date: string;
  mood: number;
  cravingLevel: number;
  note?: string;
};

export type CommunityPost = {
  id: string;
  author: string;
  avatar: string;
  group: string;
  content: string;
  likes: number;
  replies: number;
  timestamp: string;
  isLiked: boolean;
  daysSober?: number;
};

export type DailyTask = {
  id: string;
  label: string;
  description: string;
  icon: string;
  category: "body" | "mind" | "social" | "spirit";
  completedDates: string[];
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
  communityPosts: CommunityPost[];
  dailyTasks: DailyTask[];
  isLoading: boolean;
  setProfile: (profile: UserProfile) => void;
  addMoodEntry: (entry: Omit<MoodEntry, "id" | "date">) => void;
  resetStreak: () => void;
  clearAllData: () => Promise<void>;
  likePost: (postId: string) => void;
  addPost: (content: string, group: string) => void;
  toggleTaskComplete: (taskId: string) => void;
  buildAIContext: () => string;
};

const RecoveryContext = createContext<RecoveryContextType | null>(null);

const SAMPLE_POSTS: CommunityPost[] = [
  {
    id: "1",
    author: "AnonymousEagle",
    avatar: "E",
    group: "Alcohol Recovery",
    content:
      "Day 30! Never thought I'd make it here. The cravings were brutal last night but I called my sponsor and made it through. One day at a time.",
    likes: 47,
    replies: 12,
    timestamp: "2h ago",
    isLiked: false,
    daysSober: 30,
  },
  {
    id: "2",
    author: "QuietPhoenix",
    avatar: "P",
    group: "Night Craving Support",
    content:
      "3AM and the urge is strong. Using the breathing exercise right now. It actually works. Thank you all for being here.",
    likes: 23,
    replies: 8,
    timestamp: "4h ago",
    isLiked: false,
  },
  {
    id: "3",
    author: "RisingMorning",
    avatar: "R",
    group: "30-Day Challenge",
    content:
      "Week 2 complete. The tree is growing! Seeing those leaves fill in on my streak tracker keeps me going every single day.",
    likes: 61,
    replies: 19,
    timestamp: "6h ago",
    isLiked: false,
    daysSober: 14,
  },
  {
    id: "4",
    author: "SilentMountain",
    avatar: "S",
    group: "Nicotine Quitters",
    content:
      "100 days smoke-free today! Saved over $400. Lungs feel better. If you're on day 1, I promise it gets easier.",
    likes: 134,
    replies: 43,
    timestamp: "8h ago",
    isLiked: false,
    daysSober: 100,
  },
  {
    id: "5",
    author: "WaveSurfer",
    avatar: "W",
    group: "Drug Recovery",
    content:
      "Had a rough day at work. Old me would have used. New me went for a walk, called my sister, and journaled. The coping tools in this app saved me today.",
    likes: 89,
    replies: 27,
    timestamp: "12h ago",
    isLiked: false,
    daysSober: 67,
  },
];

const DEFAULT_TASKS: Omit<DailyTask, "completedDates">[] = [
  {
    id: "t1",
    label: "Morning check-in",
    description: "Rate your mood and set an intention for the day",
    icon: "sun",
    category: "mind",
  },
  {
    id: "t2",
    label: "Drink 8 glasses of water",
    description: "Hydration helps your body heal and reduces cravings",
    icon: "droplet",
    category: "body",
  },
  {
    id: "t3",
    label: "10-min walk or exercise",
    description: "Physical movement reduces stress hormones naturally",
    icon: "activity",
    category: "body",
  },
  {
    id: "t4",
    label: "Call or text a loved one",
    description: "Connection is one of the strongest shields against relapse",
    icon: "phone",
    category: "social",
  },
  {
    id: "t5",
    label: "5-min breathing exercise",
    description: "Box breathing calms the nervous system in minutes",
    icon: "wind",
    category: "mind",
  },
  {
    id: "t6",
    label: "Write 3 gratitude lines",
    description: "Gratitude rewires the brain toward hope and stability",
    icon: "edit-3",
    category: "spirit",
  },
  {
    id: "t7",
    label: "Avoid high-risk places",
    description: "Stay away from bars, old hangouts, or triggering spots",
    icon: "map-pin",
    category: "mind",
  },
  {
    id: "t8",
    label: "Eat a proper meal",
    description: "Blood sugar stability reduces cravings significantly",
    icon: "coffee",
    category: "body",
  },
];

const YEARS_LABELS = [
  "Less than 1 year",
  "1–3 years",
  "3–7 years",
  "7–15 years",
  "15+ years",
];

export function RecoveryProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [communityPosts, setCommunityPosts] =
    useState<CommunityPost[]>(SAMPLE_POSTS);
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>(
    DEFAULT_TASKS.map((t) => ({ ...t, completedDates: [] }))
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profileData, streakData, longestData, moodData, tasksData] =
        await Promise.all([
          AsyncStorage.getItem("@profile"),
          AsyncStorage.getItem("@streak"),
          AsyncStorage.getItem("@longestStreak"),
          AsyncStorage.getItem("@moodHistory"),
          AsyncStorage.getItem("@dailyTasks"),
        ]);

      if (profileData) setProfileState(JSON.parse(profileData));
      if (streakData) setStreak(parseInt(streakData, 10));
      if (longestData) setLongestStreak(parseInt(longestData, 10));
      if (moodData) setMoodHistory(JSON.parse(moodData));
      else {
        const sampleMood: MoodEntry[] = Array.from({ length: 7 }, (_, i) => ({
          id: `mood-${i}`,
          date: new Date(Date.now() - (6 - i) * 86400000).toISOString(),
          mood: 3 + Math.floor(Math.random() * 3),
          cravingLevel: 1 + Math.floor(Math.random() * 4),
        }));
        setMoodHistory(sampleMood);
      }
      if (tasksData) {
        const saved: DailyTask[] = JSON.parse(tasksData);
        setDailyTasks(
          DEFAULT_TASKS.map((dt) => {
            const found = saved.find((s) => s.id === dt.id);
            return { ...dt, completedDates: found?.completedDates ?? [] };
          })
        );
      }
    } catch (e) {
      console.error("Failed to load data", e);
    } finally {
      setIsLoading(false);
    }
  };

  const setProfile = useCallback(async (p: UserProfile) => {
    const start = new Date(p.sobrietyStartDate);
    const now = new Date();
    const days = Math.floor(
      (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    const currentStreak = Math.max(0, days);
    setProfileState(p);
    setStreak(currentStreak);
    setLongestStreak(currentStreak);
    await Promise.all([
      AsyncStorage.setItem("@profile", JSON.stringify(p)),
      AsyncStorage.setItem("@streak", currentStreak.toString()),
      AsyncStorage.setItem("@longestStreak", currentStreak.toString()),
    ]);
  }, []);

  const addMoodEntry = useCallback(
    async (entry: Omit<MoodEntry, "id" | "date">) => {
      const newEntry: MoodEntry = {
        ...entry,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString(),
      };
      const updated = [newEntry, ...moodHistory].slice(0, 30);
      setMoodHistory(updated);
      await AsyncStorage.setItem("@moodHistory", JSON.stringify(updated));
    },
    [moodHistory]
  );

  const clearAllData = useCallback(async () => {
    await AsyncStorage.multiRemove([
      "@profile",
      "@streak",
      "@longestStreak",
      "@moodHistory",
      "@dailyTasks",
    ]);
    setProfileState(null);
    setStreak(0);
    setLongestStreak(0);
    setMoodHistory([]);
    setDailyTasks(DEFAULT_TASKS.map((t) => ({ ...t, completedDates: [] })));
  }, []);

  const resetStreak = useCallback(async () => {
    setStreak(0);
    const newStart = new Date().toISOString();
    if (profile) {
      const updated = { ...profile, sobrietyStartDate: newStart };
      setProfileState(updated);
      await AsyncStorage.setItem("@profile", JSON.stringify(updated));
    }
    await AsyncStorage.setItem("@streak", "0");
  }, [profile]);

  const likePost = useCallback((postId: string) => {
    setCommunityPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              isLiked: !p.isLiked,
              likes: p.isLiked ? p.likes - 1 : p.likes + 1,
            }
          : p
      )
    );
  }, []);

  const addPost = useCallback(
    (content: string, group: string) => {
      const newPost: CommunityPost = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        author: "You",
        avatar: "Y",
        group,
        content,
        likes: 0,
        replies: 0,
        timestamp: "just now",
        isLiked: false,
        daysSober: streak,
      };
      setCommunityPosts((prev) => [newPost, ...prev]);
    },
    [streak]
  );

  const toggleTaskComplete = useCallback(
    async (taskId: string) => {
      const today = new Date().toISOString().split("T")[0];
      const updated = dailyTasks.map((t) => {
        if (t.id !== taskId) return t;
        const alreadyDone = t.completedDates.includes(today);
        return {
          ...t,
          completedDates: alreadyDone
            ? t.completedDates.filter((d) => d !== today)
            : [...t.completedDates, today],
        };
      });
      setDailyTasks(updated);
      await AsyncStorage.setItem("@dailyTasks", JSON.stringify(updated));
    },
    [dailyTasks]
  );

  const buildAIContext = useCallback((): string => {
    if (!profile) return "";
    const today = new Date().toISOString().split("T")[0];
    const completedToday = dailyTasks
      .filter((t) => t.completedDates.includes(today))
      .map((t) => t.label);

    const details = Object.entries(profile.substanceDetails ?? {})
      .map(([k, v]) => `  - ${k}: ${v}`)
      .join("\n");

    return `
=== SECOND CHANCE USER PROFILE ===

Name: ${profile.name}
Recovering from: ${profile.addictionType}
Sobriety streak: ${streak} days
Longest streak: ${longestStreak} days
Using for: ${YEARS_LABELS[profile.yearsUsing] ?? "unknown"}
Daily spend on substance: $${profile.dailySpend}
Current feeling: ${profile.currentFeeling}
Motivations to quit: ${(profile.motivations ?? []).join(", ")}

Substance-specific details:
${details || "  (none provided)"}

Tasks completed today (${today}):
${completedToday.length > 0 ? completedToday.map((t) => `  ✓ ${t}`).join("\n") : "  (none yet)"}

Recent mood trend (last 7 entries):
${moodHistory
  .slice(0, 7)
  .map((m) => `  ${new Date(m.date).toLocaleDateString()} — mood: ${m.mood}/5, craving: ${m.cravingLevel}/5`)
  .join("\n")}

===================================
`.trim();
  }, [profile, streak, longestStreak, moodHistory, dailyTasks]);

  return (
    <RecoveryContext.Provider
      value={{
        profile,
        streak,
        longestStreak,
        moodHistory,
        communityPosts,
        dailyTasks,
        isLoading,
        setProfile,
        addMoodEntry,
        resetStreak,
        clearAllData,
        likePost,
        addPost,
        toggleTaskComplete,
        buildAIContext,
      }}
    >
      {children}
    </RecoveryContext.Provider>
  );
}

export function useRecovery() {
  const ctx = useContext(RecoveryContext);
  if (!ctx) throw new Error("useRecovery must be used inside RecoveryProvider");
  return ctx;
}
