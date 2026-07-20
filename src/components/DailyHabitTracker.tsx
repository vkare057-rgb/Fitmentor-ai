import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Check, Activity, Award, Trophy, Info, Flame, AlertCircle, 
  HelpCircle, Coffee, ShieldAlert, CheckCircle2, Circle
} from 'lucide-react';
import { DailyLog } from '../types';

interface DailyHabitTrackerProps {
  currentLog: DailyLog;
  onUpdateLog: (updatedFields: Partial<DailyLog>) => void;
}

export interface HabitItem {
  id: string;
  label: string;
  description: string;
  icon: string;
  category: string;
  color: string;
  textColor: string;
}

const DEFAULT_HABITS: HabitItem[] = [
  { 
    id: 'ate_slowly', 
    label: 'Ate slowly (20+ chews)', 
    description: 'Chewed intentionally to support digestive enzymes and satiety cues.',
    icon: '🐢', 
    category: 'Mindful Nutrition',
    color: 'from-emerald-50 to-teal-50 border-emerald-100 hover:border-emerald-300',
    textColor: 'text-emerald-700'
  },
  { 
    id: 'no_phone_eating', 
    label: 'No screen distraction', 
    description: 'No phones or TV while eating to stay present with flavor and volume cues.',
    icon: '📵', 
    category: 'Mindful Nutrition',
    color: 'from-indigo-50 to-blue-50 border-indigo-100 hover:border-indigo-300',
    textColor: 'text-indigo-700'
  },
  { 
    id: 'sunlight_exposure', 
    label: 'Sunlight exposure (10-15m)', 
    description: 'Direct morning light to suppress melatonin and tune biological clock.',
    icon: '☀️', 
    category: 'Circadian Sync',
    color: 'from-amber-50 to-orange-50 border-amber-100 hover:border-amber-300',
    textColor: 'text-amber-700'
  },
  { 
    id: 'no_dinner_snack', 
    label: 'Post-dinner fasting window', 
    description: 'Avoided solid foods after your final meal to give gut lining rest.',
    icon: '🌙', 
    category: 'Metabolic Rest',
    color: 'from-purple-50 to-fuchsia-50 border-purple-100 hover:border-purple-300',
    textColor: 'text-purple-700'
  },
  { 
    id: 'gentle_stretches', 
    label: 'Gentle stretching / mobility', 
    description: 'Relieved muscle tension and supported joint lubrication for 5-10 minutes.',
    icon: '🧘', 
    category: 'Physical Well-being',
    color: 'from-sky-50 to-cyan-50 border-sky-100 hover:border-sky-300',
    textColor: 'text-sky-700'
  }
];

export default function DailyHabitTracker({ currentLog, onUpdateLog }: DailyHabitTrackerProps) {
  // Extract currently logged habits
  const completedHabits = currentLog.completedHabits || [];

  // Toggle habit handler
  const handleToggleHabit = (habitId: string) => {
    let updated: string[];
    if (completedHabits.includes(habitId)) {
      updated = completedHabits.filter(id => id !== habitId);
    } else {
      updated = [...completedHabits, habitId];
    }
    onUpdateLog({ completedHabits: updated });
  };

  const totalCount = DEFAULT_HABITS.length;
  const completedCount = completedHabits.length;
  const scorePercent = Math.round((completedCount / totalCount) * 100);

  // Motivational message and level
  const getHabitFeedback = () => {
    if (scorePercent === 100) {
      return {
        title: 'Perfect Circadian Harmony! 🌟',
        desc: 'You executed all mindful biological habits today. Your metabolic efficiency and parasympathetic nervous system are prime.',
        badge: 'Zen Overlord',
        badgeColor: 'bg-emerald-500 text-white shadow-emerald-500/20'
      };
    }
    if (scorePercent >= 60) {
      return {
        title: 'Outstanding Mindful Progress! 🔥',
        desc: 'Great job maintaining structure. Every small biological trigger compound together for significant visceral fat adaptation.',
        badge: 'Habit Hero',
        badgeColor: 'bg-sky-500 text-white shadow-sky-500/20'
      };
    }
    if (scorePercent >= 20) {
      return {
        title: 'Steady Catalyst Steps ⏳',
        desc: 'Good start. Try ticking off just one more habit—like eating without a phone—to boost mindfulness and lower stress.',
        badge: 'Rising Star',
        badgeColor: 'bg-amber-500 text-white shadow-amber-500/20'
      };
    }
    return {
      title: 'A New Day Awaits! 🌱',
      desc: 'No pressure. Habits are designed to serve you, not stress you. Choose one easy action to complete right now.',
      badge: 'Seed Phase',
      badgeColor: 'bg-slate-400 text-white'
    };
  };

  const feedback = getHabitFeedback();

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
      
      {/* Header section with cumulative score badge */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 w-max border border-indigo-100">
            <Activity className="w-3.5 h-3.5" />
            <span>Behavioral Habit Loop</span>
          </span>
          <h4 className="font-black text-slate-800 text-base sm:text-lg mt-1">Daily Habit Tracker</h4>
          <p className="text-xs text-slate-400">Micro-habits dictate weight loss longevity. Toggle your completed routines.</p>
        </div>

        {/* Dynamic score block */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 px-4 py-2 rounded-2xl">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="24" cy="24" r="20" stroke="#e2e8f0" strokeWidth="4" fill="transparent" />
              <circle 
                cx="24" 
                cy="24" 
                r="20" 
                stroke="#6366f1" 
                strokeWidth="4" 
                fill="transparent"
                strokeDasharray={125.6}
                strokeDashoffset={125.6 - (125.6 * scorePercent) / 100}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <span className="absolute text-xs font-black text-slate-800">{scorePercent}%</span>
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Habit Score</span>
            <span className="text-xs font-black text-slate-700">{completedCount} of {totalCount} Done</span>
          </div>
        </div>
      </div>

      {/* Habit List */}
      <div className="space-y-3">
        {DEFAULT_HABITS.map((habit) => {
          const isDone = completedHabits.includes(habit.id);
          return (
            <button
              key={habit.id}
              onClick={() => handleToggleHabit(habit.id)}
              className={`w-full text-left p-3.5 rounded-2xl border transition duration-300 flex items-start gap-4 cursor-pointer relative overflow-hidden bg-gradient-to-br ${habit.color} ${
                isDone 
                  ? 'ring-2 ring-indigo-500/10 border-indigo-200' 
                  : 'hover:bg-slate-50/80'
              }`}
            >
              {/* Highlight bar for completed habit */}
              {isDone && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />
              )}

              {/* Habit icon bubble */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 transition ${
                isDone ? 'bg-indigo-100 shadow-sm' : 'bg-white shadow-xs border'
              }`}>
                {habit.icon}
              </div>

              {/* Text label details */}
              <div className="flex-1 space-y-0.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-[10px] font-black uppercase tracking-wider ${habit.textColor}`}>
                    {habit.category}
                  </span>
                  {isDone && (
                    <span className="bg-indigo-50 text-indigo-700 text-[8px] font-extrabold px-1.5 py-0.5 rounded-full border border-indigo-100 flex items-center gap-0.5">
                      <Check className="w-2 h-2 stroke-[3]" /> Completed
                    </span>
                  )}
                </div>
                <h5 className="font-bold text-slate-800 text-xs sm:text-sm">{habit.label}</h5>
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{habit.description}</p>
              </div>

              {/* Beautiful toggle indicator */}
              <div className="shrink-0 pt-1">
                {isDone ? (
                  <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 scale-110 transition-all duration-300">
                    <Check className="w-3 h-3 stroke-[3.5]" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-200 bg-white hover:border-slate-400 transition-all duration-200" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Motivational / Status Insight Banner */}
      <div className="bg-gradient-to-r from-indigo-50/30 to-slate-50/50 p-4 rounded-2xl border border-indigo-50 flex items-start gap-3 text-xs">
        <div className={`p-1.5 rounded-xl shrink-0 ${feedback.badgeColor} text-[10px] uppercase font-black tracking-wider flex items-center gap-1 shadow-sm`}>
          <Trophy className="w-3.5 h-3.5" />
          <span>{feedback.badge}</span>
        </div>
        <div className="space-y-1">
          <p className="font-black text-slate-800">{feedback.title}</p>
          <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{feedback.desc}</p>
        </div>
      </div>

    </div>
  );
}
