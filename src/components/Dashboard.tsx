import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Droplet, Flame, Footprints, Moon, Scale, Plus, Trash2, Award, 
  Sparkles, Smile, Heart, Calendar, Compass, User, RefreshCw, LogIn, ChevronRight, Check
} from 'lucide-react';
import { Profile, DailyLog, Badge, FoodLogItem, ExerciseLogItem, WeightHistoryRecord } from '../types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Badges from './Badges';
import InteractiveWeightChart from './InteractiveWeightChart';
import DailyHabitTracker from './DailyHabitTracker';

interface DashboardProps {
  profile: Profile;
  dailyLogs: DailyLog[];
  weightHistory: WeightHistoryRecord[];
  onUpdateLogs: (newLogs: DailyLog[]) => void;
  onUpdateWeightHistory: (newHistory: WeightHistoryRecord[]) => void;
  onReset: () => void;
}

export default function Dashboard({ 
  profile, 
  dailyLogs, 
  weightHistory, 
  onUpdateLogs, 
  onUpdateWeightHistory,
  onReset
}: DashboardProps) {
  
  // Get current date in YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // Quick states for log forms
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [newFood, setNewFood] = useState({
    name: '',
    calories: 250,
    protein: 15,
    carbs: 25,
    fat: 5,
    mealType: 'breakfast' as FoodLogItem['mealType']
  });

  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [newExercise, setNewExercise] = useState({
    name: '',
    durationMinutes: 30,
    caloriesBurned: 200,
    type: 'strength'
  });

  const [weightInput, setWeightInput] = useState(profile.weight);
  const [waistInput, setWaistInput] = useState('');
  const [hipsInput, setHipsInput] = useState('');

  // Find or create daily log for selected date
  const currentLog = dailyLogs.find(log => log.date === selectedDate) || {
    date: selectedDate,
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

  const updateCurrentLog = (updatedFields: Partial<DailyLog>) => {
    const existingLogIndex = dailyLogs.findIndex(log => log.date === selectedDate);
    let updatedLogs = [...dailyLogs];

    if (existingLogIndex >= 0) {
      updatedLogs[existingLogIndex] = { ...updatedLogs[existingLogIndex], ...updatedFields };
    } else {
      updatedLogs.push({
        ...currentLog,
        ...updatedFields
      });
    }
    onUpdateLogs(updatedLogs);
  };

  // Water tracking increment
  const handleAddWater = () => {
    const currentWater = currentLog.waterCups || 0;
    updateCurrentLog({ waterCups: Math.min(20, currentWater + 1) });
  };

  const handleSubWater = () => {
    const currentWater = currentLog.waterCups || 0;
    updateCurrentLog({ waterCups: Math.max(0, currentWater - 1) });
  };

  // Steps tracking
  const handleStepsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const steps = parseInt(e.target.value) || 0;
    updateCurrentLog({ steps });
  };

  // Sleep tracking
  const handleSleepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sleepHours = parseFloat(e.target.value) || 0;
    updateCurrentLog({ sleepHours });
  };

  // Log Food item
  const handleAddFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFood.name.trim()) return;

    const item: FoodLogItem = {
      id: Math.random().toString(36).substr(2, 9),
      ...newFood
    };

    const updatedFood = [...(currentLog.foodItems || []), item];
    updateCurrentLog({ foodItems: updatedFood });
    setShowFoodModal(false);
    setNewFood({ name: '', calories: 250, protein: 15, carbs: 25, fat: 5, mealType: 'breakfast' });
  };

  const handleDeleteFood = (id: string) => {
    const updatedFood = (currentLog.foodItems || []).filter(item => item.id !== id);
    updateCurrentLog({ foodItems: updatedFood });
  };

  // Log Exercise
  const handleAddExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExercise.name.trim()) return;

    const item: ExerciseLogItem = {
      id: Math.random().toString(36).substr(2, 9),
      ...newExercise
    };

    const updatedExercises = [...(currentLog.exercises || []), item];
    updateCurrentLog({ exercises: updatedExercises });
    setShowExerciseModal(false);
    setNewExercise({ name: '', durationMinutes: 30, caloriesBurned: 200, type: 'strength' });
  };

  const handleDeleteExercise = (id: string) => {
    const updatedExercises = (currentLog.exercises || []).filter(item => item.id !== id);
    updateCurrentLog({ exercises: updatedExercises });
  };

  // Log weight / waist / hips
  const handleLogMeasurements = () => {
    // Update daily log
    const waistNum = parseFloat(waistInput) || undefined;
    const hipsNum = parseFloat(hipsInput) || undefined;
    
    updateCurrentLog({
      weight: weightInput,
      waistCm: waistNum,
      hipsCm: hipsNum
    });

    // Add or update weight history record
    const existingIndex = weightHistory.findIndex(rec => rec.date === selectedDate);
    let updatedHistory = [...weightHistory];

    const record: WeightHistoryRecord = {
      date: selectedDate,
      weight: weightInput,
      waist: waistNum,
      hips: hipsNum
    };

    if (existingIndex >= 0) {
      updatedHistory[existingIndex] = record;
    } else {
      updatedHistory.push(record);
    }
    // Sort chronologically
    updatedHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    onUpdateWeightHistory(updatedHistory);
    alert("Measurements logged successfully!");
  };

  // Math helper for daily progress
  const stats = profile.calculatedStats!;
  const consumedCalories = (currentLog.foodItems || []).reduce((sum, item) => sum + item.calories, 0);
  const burnedExerciseCalories = (currentLog.exercises || []).reduce((sum, item) => sum + item.caloriesBurned, 0);
  const netCalories = consumedCalories - burnedExerciseCalories;
  
  const targetCalories = stats.weightLossCalories;
  const calPercent = Math.min(100, Math.round((consumedCalories / targetCalories) * 100));
  const remainingCal = targetCalories - consumedCalories;

  const consumedProtein = (currentLog.foodItems || []).reduce((sum, item) => sum + item.protein, 0);
  const proteinPercent = Math.min(100, Math.round((consumedProtein / stats.proteinG) * 100));

  const consumedCarbs = (currentLog.foodItems || []).reduce((sum, item) => sum + item.carbs, 0);
  const carbsPercent = Math.min(100, Math.round((consumedCarbs / stats.carbG) * 100));

  const consumedFat = (currentLog.foodItems || []).reduce((sum, item) => sum + item.fat, 0);
  const fatPercent = Math.min(100, Math.round((consumedFat / stats.fatG) * 100));

  // Calculating Scores (Hydration, Steps, Nutrition, Sleep)
  const hydrationScore = Math.min(100, Math.round(((currentLog.waterCups || 0) / (profile.waterGoalCups || 8)) * 100));
  const stepsScore = Math.min(100, Math.round(((currentLog.steps || 0) / (profile.dailyStepsGoal || 8000)) * 100));
  const sleepScore = Math.min(100, Math.round(((currentLog.sleepHours || 0) / 8) * 100));
  
  // Nutrition Score: penalty for overeating, bonus for hitting protein within 15% range
  let nutritionScore = 100;
  if (consumedCalories > targetCalories) {
    const overPct = (consumedCalories - targetCalories) / targetCalories;
    nutritionScore = Math.max(20, Math.round(100 - (overPct * 100)));
  } else if (consumedCalories === 0) {
    nutritionScore = 0;
  } else {
    // good calorie deficit range
    const underPct = (targetCalories - consumedCalories) / targetCalories;
    if (underPct > 0.4) nutritionScore = 70; // too low deficit warning
  }
  // Protein adjustment
  const proteinDiff = Math.abs(consumedProtein - stats.proteinG);
  if (proteinDiff > 25 && consumedCalories > 0) {
    nutritionScore = Math.max(20, nutritionScore - 15);
  }

  // Habit Score: average of trackers
  const habitScore = Math.round((hydrationScore + stepsScore + sleepScore + (consumedCalories > 0 ? nutritionScore : 0)) / (consumedCalories > 0 ? 4 : 3));

  // Determine streaks: calculate how many consecutive days in dailyLogs have either steps, water or food logged
  const calculateStreak = () => {
    if (dailyLogs.length === 0) return 0;
    
    // Sort logs descending
    const sortedLogs = [...dailyLogs]
      .filter(l => l.steps > 0 || l.waterCups > 0 || l.foodItems?.length > 0)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (sortedLogs.length === 0) return 0;

    let streak = 0;
    let expectedDate = new Date(); // start today
    // Let's allow yesterday as well in case they didn't log yet today
    const mostRecentLogDate = new Date(sortedLogs[0].date);
    const diffTime = Math.abs(expectedDate.getTime() - mostRecentLogDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 2) {
      return 0; // broken streak
    }

    let checkDate = mostRecentLogDate;
    for (let i = 0; i < sortedLogs.length; i++) {
      const logDate = new Date(sortedLogs[i].date);
      // Strip time
      logDate.setHours(0,0,0,0);
      checkDate.setHours(0,0,0,0);

      const dayDiff = Math.round((checkDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
      if (dayDiff === 0) {
        streak++;
        // Set next expected checkDate to yesterday
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (dayDiff === 1) {
        streak++;
        checkDate = logDate;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break; // streak broke
      }
    }
    return streak;
  };

  const logStreak = calculateStreak();

  // Badges Definitions
  const availableBadges: Badge[] = [
    { id: 'b1', title: 'Hydration Hero', description: `Drank ${profile.waterGoalCups || 8} glasses of water in a day`, icon: '💧' },
    { id: 'b2', title: 'Fiber Champion', description: 'Hit daily goal of healthy fiber sources', icon: '🥗' },
    { id: 'b3', title: 'Step Master', description: `Walked over ${profile.dailyStepsGoal || 8000} steps in a single day`, icon: '🚶' },
    { id: 'b4', title: 'Lean Muscle Guard', description: `Hit full target protein goal of ${stats.proteinG}g`, icon: '💪' },
    { id: 'b5', title: 'Sleep Sage', description: 'Logged 8+ hours of deep, restful sleep', icon: '😴' },
    { id: 'b6', title: 'Consistency King', description: 'Maintained a 3+ day weight logging streak', icon: '🔥' },
  ];

  // Logic to calculate unlocked badges
  const getUnlockedBadges = (): Badge[] => {
    let unlocked: Badge[] = [];
    
    // Checked across all historical logs
    const hitWater = dailyLogs.some(l => l.waterCups >= (profile.waterGoalCups || 8));
    if (hitWater) unlocked.push({ ...availableBadges[0], unlockedAt: 'Unlocked!' });

    // Fiber (assumed if carbs & veggies or high scores)
    if (dailyLogs.some(l => l.foodItems?.length >= 3 && l.waterCups >= 8)) {
      unlocked.push({ ...availableBadges[1], unlockedAt: 'Unlocked!' });
    }

    const hitSteps = dailyLogs.some(l => l.steps >= (profile.dailyStepsGoal || 8000));
    if (hitSteps) unlocked.push({ ...availableBadges[2], unlockedAt: 'Unlocked!' });

    const hitProtein = dailyLogs.some(l => {
      const p = l.foodItems?.reduce((s, i) => s + i.protein, 0) || 0;
      return p >= stats.proteinG;
    });
    if (hitProtein) unlocked.push({ ...availableBadges[3], unlockedAt: 'Unlocked!' });

    const hitSleep = dailyLogs.some(l => l.sleepHours >= 8);
    if (hitSleep) unlocked.push({ ...availableBadges[4], unlockedAt: 'Unlocked!' });

    if (logStreak >= 3) {
      unlocked.push({ ...availableBadges[5], unlockedAt: 'Unlocked!' });
    }

    return unlocked;
  };

  const unlockedBadges = getUnlockedBadges();

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 lg:px-8 py-6 pb-20 font-sans text-slate-800">
      
      {/* Top Banner Greeting */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-6 lg:p-8 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-lg shadow-teal-600/10 border border-teal-500">
        <div>
          <div className="flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full text-xs font-semibold w-max backdrop-blur-sm mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Coaching Active</span>
          </div>
          <h1 className="text-3xl font-bold font-sans">Welcome back, {profile.name}!</h1>
          <p className="text-emerald-100 text-sm mt-1 max-w-xl">
            FitMentor AI calculated your safe weight loss target as <strong>{stats.weightLossCalories} kcal/day</strong>. You have unlocked <strong>{unlockedBadges.length} of {availableBadges.length}</strong> fitness badges!
          </p>
        </div>

        <div className="flex items-center space-x-6 shrink-0 bg-white/10 px-6 py-4 rounded-2xl border border-white/10 backdrop-blur-md">
          <div className="text-center border-r border-white/20 pr-6">
            <span className="block text-[10px] text-emerald-200 uppercase font-black tracking-wider">Logging Streak</span>
            <span className="text-3xl font-black mt-0.5 block flex items-center justify-center gap-1">
              🔥 {logStreak} <span className="text-sm font-medium text-emerald-200">days</span>
            </span>
          </div>
          <div className="text-center">
            <span className="block text-[10px] text-emerald-200 uppercase font-black tracking-wider">Habit Score</span>
            <span className="text-3xl font-black mt-0.5 block">
              ⭐ {habitScore}<span className="text-sm font-medium text-emerald-200">%</span>
            </span>
          </div>
        </div>
      </div>

      {/* Bento Grid: Calorie Tracker, Loggers, Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Daily Progress Ring & Macro Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                <span>Daily Calories & Energy</span>
              </h3>
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Visual Calorie Counter */}
            <div className="flex flex-col items-center justify-center my-6">
              <div className="relative w-44 h-44 flex items-center justify-center">
                {/* Simulated circle stroke */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="88" cy="88" r="76" stroke="#f1f5f9" strokeWidth="12" fill="transparent" />
                  <circle cx="88" cy="88" r="76" stroke="#10b981" strokeWidth="12" fill="transparent"
                    strokeDasharray={477}
                    strokeDashoffset={477 - (477 * calPercent) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="block text-3xl font-black text-slate-800">{consumedCalories}</span>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wide">Eaten kcal</span>
                  <div className="w-12 h-px bg-slate-100 my-1 mx-auto" />
                  <span className={`block text-xs font-bold ${remainingCal >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {remainingCal >= 0 ? `${remainingCal} left` : `${Math.abs(remainingCal)} over`}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-3 font-medium text-center">Target limit: {targetCalories} kcal/day</p>
            </div>
          </div>

          {/* Macro Progress Bars */}
          <div className="space-y-4 pt-4 border-t border-slate-50">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-500 flex items-center gap-1">💪 Protein <span className="text-[10px] text-slate-400">(Preserve Muscle)</span></span>
                <span>{consumedProtein}g / {stats.proteinG}g</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${proteinPercent}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-500">🍞 Carbohydrates</span>
                <span>{consumedCarbs}g / {stats.carbG}g</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${carbsPercent}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-500">🥑 Healthy Fats</span>
                <span>{consumedFat}g / {stats.fatG}g</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full" style={{ width: `${fatPercent}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Center Column: Interactive Water, Step, Sleep Logging */}
        <div className="space-y-6 lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Water Tracker Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div>
                <span className="text-2xl mb-1 block">💧</span>
                <h4 className="font-bold text-slate-700 text-sm">Water Tracker</h4>
                <p className="text-xs text-slate-400">Aim for {profile.waterGoalCups || 8} cups/day</p>
                <div className="my-4 text-center">
                  <span className="text-4xl font-black text-sky-600">{currentLog.waterCups || 0}</span>
                  <span className="text-xs text-slate-400 font-medium ml-1">cups</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 z-10">
                <button 
                  onClick={handleSubWater}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl transition text-xs"
                >
                  - 1 Cup
                </button>
                <button 
                  onClick={handleAddWater}
                  className="flex-1 bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 rounded-xl transition text-xs shadow-md shadow-sky-500/15"
                >
                  + Log Cup
                </button>
              </div>

              {/* Water wave decoration background */}
              <div 
                className="absolute bottom-0 left-0 right-0 bg-sky-100/50 transition-all duration-500" 
                style={{ height: `${Math.min(100, ((currentLog.waterCups || 0) / (profile.waterGoalCups || 8)) * 100)}%`, opacity: 0.25, zIndex: 0 }}
              />
            </div>

            {/* Steps Tracker Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-2xl mb-1 block">🚶</span>
                <h4 className="font-bold text-slate-700 text-sm">Step Tracker</h4>
                <p className="text-xs text-slate-400">Target: {profile.dailyStepsGoal || 8000} steps</p>
                <div className="my-4 text-center">
                  <span className="text-3xl font-black text-emerald-600">{(currentLog.steps || 0).toLocaleString()}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">steps logged</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Update steps</label>
                <input 
                  type="number"
                  placeholder="e.g. 8420"
                  value={currentLog.steps || ''}
                  onChange={handleStepsChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Sleep Logger Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-2xl mb-1 block">😴</span>
                <h4 className="font-bold text-slate-700 text-sm">Sleep Tracker</h4>
                <p className="text-xs text-slate-400">Aim for 7 to 8 hours daily</p>
                <div className="my-4 text-center">
                  <span className="text-4xl font-black text-indigo-600">{currentLog.sleepHours || 0}</span>
                  <span className="text-xs text-slate-400 font-medium ml-1">hours</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Hours slept</label>
                <input 
                  type="number"
                  step="0.5"
                  placeholder="e.g. 7.5"
                  value={currentLog.sleepHours || ''}
                  onChange={handleSleepChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

          </div>

          <DailyHabitTracker 
            currentLog={currentLog}
            onUpdateLog={updateCurrentLog}
          />

          {/* Logging lists: Foods eaten and workout done */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Food Logging card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between border-b pb-3 mb-4">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
                  <Plus className="w-4 h-4 text-emerald-500" />
                  <span>Logged Meals ({consumedCalories} kcal)</span>
                </h4>
                <button 
                  onClick={() => setShowFoodModal(true)}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Food</span>
                </button>
              </div>

              <div className="space-y-2 max-h-52 overflow-y-auto">
                {currentLog.foodItems?.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6 font-medium">No meals logged yet for this date.</p>
                ) : (
                  currentLog.foodItems?.map((food) => (
                    <div key={food.id} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-700 block">{food.name}</span>
                        <span className="text-[10px] text-slate-400 font-semibold capitalize bg-white border px-1.5 py-0.5 rounded-full mt-1 inline-block">
                          {food.mealType}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <span className="font-black text-slate-700 block">{food.calories} kcal</span>
                          <span className="text-[10px] text-slate-400">P:{food.protein}g C:{food.carbs}g F:{food.fat}g</span>
                        </div>
                        <button 
                          onClick={() => handleDeleteFood(food.id)}
                          className="text-slate-400 hover:text-rose-500 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Exercise Logging card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between border-b pb-3 mb-4">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>Logged Exercises (-{burnedExerciseCalories} kcal)</span>
                </h4>
                <button 
                  onClick={() => setShowExerciseModal(true)}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Workout</span>
                </button>
              </div>

              <div className="space-y-2 max-h-52 overflow-y-auto">
                {currentLog.exercises?.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6 font-medium">No exercises logged yet for this date.</p>
                ) : (
                  currentLog.exercises?.map((ex) => (
                    <div key={ex.id} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-700 block">{ex.name}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">{ex.durationMinutes} minutes</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="font-black text-rose-600">-{ex.caloriesBurned} kcal</span>
                        <button 
                          onClick={() => handleDeleteExercise(ex.id)}
                          className="text-slate-400 hover:text-rose-500 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Progress Charts & Measurements Logging (Tiny details most coaches miss) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Progress Charts (Weight, Waist, Hips over time) */}
        <div className="lg:col-span-2">
          <InteractiveWeightChart 
            profile={profile}
            weightHistory={weightHistory}
          />
        </div>

        {/* Logging Panel (Weight, Waist, Hips Logger) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-slate-800 flex items-center gap-2 text-sm border-b pb-3 mb-4">
              <Plus className="w-5 h-5 text-teal-500" />
              <span>Log Measurements</span>
            </h4>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Today's Weight (kg)</label>
                <input 
                  type="number"
                  step="0.1"
                  value={weightInput}
                  onChange={(e) => setWeightInput(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Today's Waist (cm) <span className="text-slate-400">(Optional)</span></label>
                <input 
                  type="number"
                  placeholder="e.g. 88"
                  value={waistInput}
                  onChange={(e) => setWaistInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Today's Hips (cm) <span className="text-slate-400">(Optional)</span></label>
                <input 
                  type="number"
                  placeholder="e.g. 102"
                  value={hipsInput}
                  onChange={(e) => setHipsInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          <button 
            onClick={handleLogMeasurements}
            className="w-full mt-6 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-md shadow-slate-900/10"
          >
            Update Body Metrics Chart
          </button>
        </div>

      </div>

      {/* Badges and Milestones Section */}
      <Badges 
        profile={profile}
        dailyLogs={dailyLogs}
        weightHistory={weightHistory}
        logStreak={logStreak}
      />

      {/* Reset Account Option */}
      <div className="flex justify-center pt-4">
        <button 
          onClick={() => {
            if (confirm("Are you sure you want to completely reset your profile and restart onboarding? This cannot be undone.")) {
              onReset();
            }
          }}
          className="text-xs text-rose-500 hover:text-rose-700 hover:underline flex items-center gap-1.5 font-medium"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Profile & Re-Onboard</span>
        </button>
      </div>

      {/* FOOD MODAL */}
      {showFoodModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100"
          >
            <h5 className="font-bold text-slate-800 border-b pb-2 mb-4">Add Meal to Logger</h5>
            <form onSubmit={handleAddFood} className="space-y-3">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Meal Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Scrambled Eggs with Toast"
                  value={newFood.name}
                  onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Calories (kcal)</label>
                  <input 
                    type="number" 
                    required
                    value={newFood.calories}
                    onChange={(e) => setNewFood({ ...newFood, calories: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Protein (g)</label>
                  <input 
                    type="number" 
                    required
                    value={newFood.protein}
                    onChange={(e) => setNewFood({ ...newFood, protein: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Carbs (g)</label>
                  <input 
                    type="number" 
                    required
                    value={newFood.carbs}
                    onChange={(e) => setNewFood({ ...newFood, carbs: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Fat (g)</label>
                  <input 
                    type="number" 
                    required
                    value={newFood.fat}
                    onChange={(e) => setNewFood({ ...newFood, fat: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Meal Type</label>
                <select
                  value={newFood.mealType}
                  onChange={(e) => setNewFood({ ...newFood, mealType: e.target.value as FoodLogItem['mealType'] })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                  <option value="dessert">Dessert</option>
                </select>
              </div>

              <div className="flex gap-2 pt-3">
                <button 
                  type="button" 
                  onClick={() => setShowFoodModal(false)}
                  className="flex-1 border bg-slate-50 text-slate-600 font-bold py-2 rounded-xl text-xs hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-xs"
                >
                  Save Food
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* EXERCISE MODAL */}
      {showExerciseModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100"
          >
            <h5 className="font-bold text-slate-800 border-b pb-2 mb-4">Add Workout to Logger</h5>
            <form onSubmit={handleAddExercise} className="space-y-3">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Workout Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Walking / Dumbbell Squats"
                  value={newExercise.name}
                  onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Duration (mins)</label>
                  <input 
                    type="number" 
                    required
                    value={newExercise.durationMinutes}
                    onChange={(e) => setNewExercise({ ...newExercise, durationMinutes: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Calories Burned</label>
                  <input 
                    type="number" 
                    required
                    value={newExercise.caloriesBurned}
                    onChange={(e) => setNewExercise({ ...newExercise, caloriesBurned: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button 
                  type="button" 
                  onClick={() => setShowExerciseModal(false)}
                  className="flex-1 border bg-slate-50 text-slate-600 font-bold py-2 rounded-xl text-xs hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-xs"
                >
                  Save Workout
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
