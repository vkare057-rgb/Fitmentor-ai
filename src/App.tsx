import React, { useState, useEffect } from 'react';
import { Profile, DailyLog, WeightHistoryRecord, ChatMessage } from './types';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import CoachChat from './components/CoachChat';
import DietWorkouts from './components/DietWorkouts';
import { Scale, MessageSquare, ChefHat, Sparkles } from 'lucide-react';

export default function App() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [weightHistory, setWeightHistory] = useState<WeightHistoryRecord[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat' | 'diet-workouts'>('dashboard');
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Initial State Loading from Cache
  useEffect(() => {
    try {
      const cachedProfile = localStorage.getItem('fitmentor_profile_v1');
      const cachedLogs = localStorage.getItem('fitmentor_logs_v1');
      const cachedWeight = localStorage.getItem('fitmentor_weight_history_v1');
      const cachedChat = localStorage.getItem('fitmentor_chat_history_v1');

      if (cachedProfile) {
        setProfile(JSON.parse(cachedProfile));
      }
      if (cachedLogs) {
        setDailyLogs(JSON.parse(cachedLogs));
      }
      if (cachedWeight) {
        setWeightHistory(JSON.parse(cachedWeight));
      }
      if (cachedChat) {
        setChatHistory(JSON.parse(cachedChat));
      }
    } catch (e) {
      console.error("Failed to load fitmentor cache:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // 2. Profile Complete Handler
  const handleOnboardingComplete = (completedProfile: Profile) => {
    setProfile(completedProfile);
    localStorage.setItem('fitmentor_profile_v1', JSON.stringify(completedProfile));

    // Initialize first record of weight history if empty
    const initialWeightRecord: WeightHistoryRecord = {
      date: new Date().toISOString().split('T')[0],
      weight: completedProfile.weight
    };
    const updatedHistory = [initialWeightRecord];
    setWeightHistory(updatedHistory);
    localStorage.setItem('fitmentor_weight_history_v1', JSON.stringify(updatedHistory));

    // Initialize daily logs with empty today record if empty
    const todayStr = new Date().toISOString().split('T')[0];
    const initialLog: DailyLog = {
      date: todayStr,
      waterCups: 0,
      steps: 0,
      sleepHours: 0,
      foodItems: [],
      exercises: [],
      mood: 'good',
      stressLevel: 'low',
      energyLevel: 'medium',
      cravings: 'None',
      hungerLevel: 5
    };
    const updatedLogs = [initialLog];
    setDailyLogs(updatedLogs);
    localStorage.setItem('fitmentor_logs_v1', JSON.stringify(updatedLogs));

    // Add first warm welcoming coach message to chat history
    const welcomeMsg: ChatMessage = {
      id: 'welcome',
      role: 'model',
      text: `Hello ${completedProfile.name}! I am **FitMentor AI**, your scientific, evidence-based healthy lifestyle & weight loss coach. 

I have reviewed your physical profile, lifestyle audit, and goals. Based on your BMR and steps, we have targeted a daily limit of **${completedProfile.calculatedStats?.weightLossCalories} kcal** for healthy, sustained fat loss while preserving your muscle mass.

Here is what we should focus on today:
* Aim to hit **${completedProfile.calculatedStats?.proteinG}g of protein** to keep your muscle fibers dense.
* Drink at least **${completedProfile.waterGoalCups || 8} cups of pure water** (I've enabled a custom water ripple tracker on your dashboard!).
* Complete your step target of **${completedProfile.dailyStepsGoal || 8000} steps**.

How are you feeling today? Let me know if you have any questions or would like me to compile a shopping grocery list! 🏃`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatHistory([welcomeMsg]);
    localStorage.setItem('fitmentor_chat_history_v1', JSON.stringify([welcomeMsg]));
  };

  // State update callbacks mapped directly to persistence to avoid HMR / render sync latency
  const handleUpdateLogs = (newLogs: DailyLog[]) => {
    setDailyLogs(newLogs);
    localStorage.setItem('fitmentor_logs_v1', JSON.stringify(newLogs));
  };

  const handleUpdateWeightHistory = (newHistory: WeightHistoryRecord[]) => {
    setWeightHistory(newHistory);
    localStorage.setItem('fitmentor_weight_history_v1', JSON.stringify(newHistory));
  };

  const handleUpdateChatHistory = (newHistory: ChatMessage[]) => {
    setChatHistory(newHistory);
    localStorage.setItem('fitmentor_chat_history_v1', JSON.stringify(newHistory));
  };

  const handleResetProfile = () => {
    setProfile(null);
    setDailyLogs([]);
    setWeightHistory([]);
    setChatHistory([]);
    setActiveTab('dashboard');
    localStorage.removeItem('fitmentor_profile_v1');
    localStorage.removeItem('fitmentor_logs_v1');
    localStorage.removeItem('fitmentor_weight_history_v1');
    localStorage.removeItem('fitmentor_chat_history_v1');
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Syncing FitMentor AI cache...</p>
        </div>
      </div>
    );
  }

  // If no profile exists, direct the user to the onboarding wizard
  if (!profile) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      
      {/* Top Application Header */}
      <header className="bg-white border-b border-slate-100 py-4 px-6 lg:px-8 flex items-center justify-between shadow-sm shrink-0 z-20">
        <div className="flex items-center space-x-2.5">
          <span className="text-3xl">🏃</span>
          <div>
            <h2 className="font-extrabold text-sm sm:text-base text-slate-800 flex items-center gap-1.5 leading-none">
              <span>AI Weight Loss Coach</span>
              <span className="inline-block bg-emerald-100 text-emerald-800 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                FitMentor AI
              </span>
            </h2>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-1">Science-Driven Habit & Macro Companion</p>
          </div>
        </div>

        {/* Global tab navigator */}
        <nav className="flex space-x-1 bg-slate-50 border p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span className="hidden sm:inline">My Trackers</span>
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all relative ${
              activeTab === 'chat'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">FitMentor Chat</span>
          </button>
          <button
            onClick={() => setActiveTab('diet-workouts')}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'diet-workouts'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <ChefHat className="w-4 h-4" />
            <span className="hidden sm:inline">Diet & Workouts</span>
          </button>
        </nav>
      </header>

      {/* Main tab viewer panel */}
      <main className="flex-1 overflow-y-auto bg-slate-50/50">
        {activeTab === 'dashboard' && (
          <Dashboard 
            profile={profile}
            dailyLogs={dailyLogs}
            weightHistory={weightHistory}
            onUpdateLogs={handleUpdateLogs}
            onUpdateWeightHistory={handleUpdateWeightHistory}
            onReset={handleResetProfile}
          />
        )}

        {activeTab === 'chat' && (
          <CoachChat 
            profile={profile}
            dailyLogs={dailyLogs}
            chatHistory={chatHistory}
            onUpdateChatHistory={handleUpdateChatHistory}
          />
        )}

        {activeTab === 'diet-workouts' && (
          <DietWorkouts 
            profile={profile}
          />
        )}
      </main>

    </div>
  );
}
