import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, Flame, TrendingDown, Target, Lock, Unlock, Sparkles, CheckCircle2, 
  Droplet, Footprints, Zap, HelpCircle, Trophy, ShieldAlert, Check, HeartPulse, Info
} from 'lucide-react';
import { Profile, DailyLog, WeightHistoryRecord } from '../types';

interface BadgesProps {
  profile: Profile;
  dailyLogs: DailyLog[];
  weightHistory: WeightHistoryRecord[];
  logStreak: number;
}

interface DynamicBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'weight' | 'streak' | 'habit';
  targetValue: number;
  currentValue: number;
  unit: string;
  unlocked: boolean;
  scienceTip: string;
}

export default function Badges({ profile, dailyLogs, weightHistory, logStreak }: BadgesProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'unlocked' | 'locked' | 'weight' | 'streak' | 'habit'>('all');
  const [selectedBadge, setSelectedBadge] = useState<DynamicBadge | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  // 1. Calculations for Milestones
  const startingWeight = weightHistory[0]?.weight || profile.weight;
  const currentWeight = weightHistory[weightHistory.length - 1]?.weight || profile.weight;
  const weightLost = Math.max(0, parseFloat((startingWeight - currentWeight).toFixed(1)));
  const weightGoalDifference = Math.max(0.1, parseFloat((startingWeight - profile.targetWeight).toFixed(1)));
  const isTargetWeightReached = currentWeight <= profile.targetWeight;

  // Habit milestones counters
  const waterTarget = profile.waterGoalCups || 8;
  const stepsTarget = profile.dailyStepsGoal || 8000;
  const proteinTarget = profile.calculatedStats?.proteinG || 100;
  const calorieLimit = profile.calculatedStats?.weightLossCalories || 1800;

  const daysMetWater = dailyLogs.filter(log => log.waterCups >= waterTarget).length;
  const daysMetSteps = dailyLogs.filter(log => log.steps >= stepsTarget).length;
  
  const daysMetProtein = dailyLogs.filter(log => {
    const totalProtein = (log.foodItems || []).reduce((sum, item) => sum + item.protein, 0);
    return totalProtein >= proteinTarget;
  }).length;

  const perfectDaysCount = dailyLogs.filter(log => {
    const totalCalories = (log.foodItems || []).reduce((sum, item) => sum + item.calories, 0);
    const totalProtein = (log.foodItems || []).reduce((sum, item) => sum + item.protein, 0);
    const isUnderCalories = totalCalories > 0 && totalCalories <= calorieLimit;
    const isStepsMet = log.steps >= stepsTarget;
    const isWaterMet = log.waterCups >= waterTarget;
    return isUnderCalories && isStepsMet && isWaterMet;
  }).length;

  // 2. Define the dynamically evaluated badges
  const badgesData: DynamicBadge[] = [
    {
      id: 'weight_first_log',
      title: 'Body Logger',
      description: 'Initialize your weight history by entering your weight',
      icon: '⚖️',
      category: 'weight',
      targetValue: 1,
      currentValue: weightHistory.length,
      unit: 'log',
      unlocked: weightHistory.length >= 1,
      scienceTip: 'Consistency in measurement is the foundation of change. Research shows people who weigh themselves regularly are 60% more likely to keep weight off long-term.'
    },
    {
      id: 'weight_loss_1kg',
      title: 'First Victory',
      description: 'Achieve a safe weight loss of 1.0 kg',
      icon: '📉',
      category: 'weight',
      targetValue: 1,
      currentValue: weightLost,
      unit: 'kg',
      unlocked: weightLost >= 1,
      scienceTip: 'Losing your first kilogram signals that your body has shifted from energy storage to fat oxidation. Continue with this steady, non-restrictive approach!'
    },
    {
      id: 'weight_loss_3kg',
      title: 'Steady Burner',
      description: 'Shed 3.0 kg of visceral & subcutaneous body mass',
      icon: '🏆',
      category: 'weight',
      targetValue: 3,
      currentValue: weightLost,
      unit: 'kg',
      unlocked: weightLost >= 3,
      scienceTip: 'A 3 kg fat loss significantly relieves pressure on knee and hip joints, and improves systemic insulin sensitivity by reducing adipose inflammatory cytokines.'
    },
    {
      id: 'weight_loss_5kg',
      title: 'Metabolic Reboot',
      description: 'Reach a milestone of 5.0 kg total weight loss',
      icon: '🥇',
      category: 'weight',
      targetValue: 5,
      currentValue: weightLost,
      unit: 'kg',
      unlocked: weightLost >= 5,
      scienceTip: 'Losing 5 kg (often 5-10% of starting weight) is clinically proven to reduce liver fat accumulation, decrease blood pressure, and improve LDL cholesterol profiles.'
    },
    {
      id: 'weight_target_reached',
      title: 'Bullseye Champion',
      description: 'Complete your journey and hit your target body weight!',
      icon: '🎯',
      category: 'weight',
      targetValue: weightGoalDifference,
      currentValue: weightLost,
      unit: 'kg',
      unlocked: isTargetWeightReached && weightHistory.length > 0,
      scienceTip: 'Congratulations! Reaching your target weight requires permanent metabolic changes. Maintain a slightly increased energy intake to enter the muscle preservation & weight maintenance phase.'
    },
    {
      id: 'streak_3_days',
      title: 'Habit Starter',
      description: 'Log steps, food, or water for 3 consecutive days',
      icon: '🔥',
      category: 'streak',
      targetValue: 3,
      currentValue: logStreak,
      unit: 'days',
      unlocked: logStreak >= 3,
      scienceTip: 'Neuronal pathways for habits take shape via repetition. The first 3 days are the hardest because they require conscious behavioral override. Keep it up!'
    },
    {
      id: 'streak_5_days',
      title: 'Consistency King',
      description: 'Maintain an active lifestyle log streak of 5 days',
      icon: '⚡',
      category: 'streak',
      targetValue: 5,
      currentValue: logStreak,
      unit: 'days',
      unlocked: logStreak >= 5,
      scienceTip: 'At 5 days, logging is moving from an active chore to an automated trigger-response habit loop in your brain\'s basal ganglia.'
    },
    {
      id: 'streak_7_days',
      title: 'Week on Fire',
      description: 'Complete a full 7-day logging streak of healthy habits',
      icon: '👑',
      category: 'streak',
      targetValue: 7,
      currentValue: logStreak,
      unit: 'days',
      unlocked: logStreak >= 7,
      scienceTip: 'A 7-day consecutive streak demonstrates high dietary flexibility and psychological resilience, meaning you stayed consistent even through the weekend!'
    },
    {
      id: 'habit_hydration_3d',
      title: 'Hydration Hero',
      description: 'Hit your water target on 3 separate days',
      icon: '💧',
      category: 'habit',
      targetValue: 3,
      currentValue: daysMetWater,
      unit: 'days',
      unlocked: daysMetWater >= 3,
      scienceTip: 'Proper hydration increases resting energy expenditure (mild thermogenesis) and fills stomach volume, suppressing artificial hunger cues triggered by dehydration.'
    },
    {
      id: 'habit_steps_3d',
      title: 'Active Pathmaker',
      description: 'Hit your target steps on 3 separate days',
      icon: '🚶',
      category: 'habit',
      targetValue: 3,
      currentValue: daysMetSteps,
      unit: 'days',
      unlocked: daysMetSteps >= 3,
      scienceTip: 'Hitting step targets boosts your NEAT (Non-Exercise Activity Thermogenesis), which plays a greater role in cumulative daily energy burn than dedicated gym sessions.'
    },
    {
      id: 'habit_protein_3d',
      title: 'Protein Guard',
      description: 'Hit your target protein goal on 3 separate days',
      icon: '💪',
      category: 'habit',
      targetValue: 3,
      currentValue: daysMetProtein,
      unit: 'days',
      unlocked: daysMetProtein >= 3,
      scienceTip: 'Protein has the highest Thermic Effect of Food (TEF) - your body burns 20-30% of its calories just digesting it. It also preserves lean mass during a caloric deficit!'
    },
    {
      id: 'habit_perfect_day',
      title: 'The Golden Day',
      description: 'Hit steps, water, and calorie limits on the same day',
      icon: '🌟',
      category: 'habit',
      targetValue: 1,
      currentValue: perfectDaysCount,
      unit: 'day',
      unlocked: perfectDaysCount >= 1,
      scienceTip: 'A perfect day aligns your hydration, activity, and metabolic intake. Repeating perfect days builds a fortress of energy, keeping hunger hormones like ghrelin flat.'
    }
  ];

  // 3. Filtered badges
  const filteredBadges = badgesData.filter(badge => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unlocked') return badge.unlocked;
    if (activeFilter === 'locked') return !badge.unlocked;
    return badge.category === activeFilter;
  });

  const unlockedCount = badgesData.filter(b => b.unlocked).length;
  const xpEarned = unlockedCount * 100;
  const currentLevel = Math.floor(xpEarned / 300) + 1;
  const xpForNextLevel = 300;
  const xpProgress = xpEarned % 300;
  const progressPercent = Math.min(100, Math.round((xpProgress / xpForNextLevel) * 100));

  const handleBadgeClick = (badge: DynamicBadge) => {
    setSelectedBadge(badge);
    if (badge.unlocked) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Gamified Level & XP Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-md relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-12 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5" />
                <span>Gamified Journey Dashboard</span>
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black flex items-center gap-2">
              <span>Level {currentLevel} Fitness Explorer</span>
              <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              Unlock achievements by logging daily weight, food macros, hydration, and steps. Every unlocked badge grants **100 XP** to level up your biological progress indicator!
            </p>
          </div>

          <div className="w-full md:w-72 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/50">
            <div className="flex justify-between items-center text-xs font-bold mb-1.5">
              <span className="text-slate-300">Total XP: {xpEarned} / {badgesData.length * 100}</span>
              <span className="text-emerald-400">{progressPercent}% to Level {currentLevel + 1}</span>
            </div>
            <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
              <motion.div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.6 }}
              />
            </div>
            <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider text-right mt-1.5">
              Unlocked {unlockedCount} of {badgesData.length} Achievements
            </span>
          </div>
        </div>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center space-x-3">
          <span className="text-2xl bg-amber-50 p-2 rounded-xl text-amber-500 shrink-0">🔥</span>
          <div>
            <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Logging Streak</span>
            <span className="text-sm font-black text-slate-800">{logStreak} consecutive days</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center space-x-3">
          <span className="text-2xl bg-emerald-50 p-2 rounded-xl text-emerald-600 shrink-0">📉</span>
          <div>
            <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Weight Loss</span>
            <span className="text-sm font-black text-slate-800">{weightLost} kg lost</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center space-x-3">
          <span className="text-2xl bg-blue-50 p-2 rounded-xl text-blue-500 shrink-0">💧</span>
          <div>
            <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Water Goals Met</span>
            <span className="text-sm font-black text-slate-800">{daysMetWater} days total</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center space-x-3">
          <span className="text-2xl bg-purple-50 p-2 rounded-xl text-purple-500 shrink-0">🌟</span>
          <div>
            <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Perfect Days</span>
            <span className="text-sm font-black text-slate-800">{perfectDaysCount} perfect log days</span>
          </div>
        </div>
      </div>

      {/* Filter and Achievements Grid */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
        
        {/* Header and Filter Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
          <div className="flex items-center space-x-2">
            <div className="bg-yellow-500 text-white p-1.5 rounded-xl">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-800 text-sm sm:text-base">Achievements & Milestone Progress</h4>
              <p className="text-xs text-slate-400 font-semibold">Click any badge card to view its clinical metabolic & lifestyle science tips!</p>
            </div>
          </div>

          {/* Filter badges */}
          <div className="flex flex-wrap gap-1.5 bg-slate-50 border p-1 rounded-2xl self-start">
            {[
              { id: 'all', label: 'All' },
              { id: 'unlocked', label: 'Unlocked' },
              { id: 'locked', label: 'Locked' },
              { id: 'weight', label: 'Weight' },
              { id: 'streak', label: 'Streaks' },
              { id: 'habit', label: 'Habits' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold transition ${
                  activeFilter === f.id
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-100'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Achievements Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {filteredBadges.map((badge) => {
            const progress = badge.unlocked ? 100 : Math.min(100, Math.round((badge.currentValue / badge.targetValue) * 100));
            return (
              <div
                key={badge.id}
                onClick={() => handleBadgeClick(badge)}
                className={`relative overflow-hidden cursor-pointer p-4 rounded-2xl border text-left transition-all hover:shadow-md duration-300 flex flex-col justify-between min-h-[160px] ${
                  badge.unlocked
                    ? 'bg-gradient-to-b from-amber-50/40 via-white to-white border-amber-200'
                    : 'bg-slate-50/50 border-slate-100 opacity-80'
                }`}
              >
                {/* Celebrate Animation Glow */}
                {badge.unlocked && (
                  <div className="absolute -top-12 -right-12 w-24 h-24 bg-yellow-400/10 rounded-full blur-xl" />
                )}

                <div>
                  {/* Badge Top Header */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-3xl ${badge.unlocked ? 'animate-bounce' : 'grayscale filter contrast-75'}`}>
                      {badge.icon}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      {badge.category}
                    </span>
                  </div>

                  {/* Title & Desc */}
                  <h5 className="font-extrabold text-xs sm:text-sm text-slate-800 leading-tight">
                    {badge.title}
                  </h5>
                  <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                    {badge.description}
                  </p>
                </div>

                {/* Progress bar and numeric tracking */}
                <div className="mt-4 pt-3 border-t border-slate-100/60">
                  <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider mb-1">
                    <span className={badge.unlocked ? 'text-amber-600' : 'text-slate-400'}>
                      {badge.unlocked ? 'COMPLETED' : 'IN PROGRESS'}
                    </span>
                    <span className="text-slate-600 font-bold">
                      {badge.unlocked 
                        ? `${badge.targetValue} ${badge.unit}` 
                        : `${badge.currentValue} / ${badge.targetValue} ${badge.unit}`
                      }
                    </span>
                  </div>

                  {/* Custom progress line */}
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        badge.unlocked ? 'bg-amber-500' : 'bg-emerald-500'
                      }`} 
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Lock Overlay */}
                {!badge.unlocked && (
                  <div className="absolute top-2.5 right-2.5 text-slate-300 hover:text-slate-400 transition" title="Achievement Locked">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                )}
                {badge.unlocked && (
                  <div className="absolute top-2.5 right-2.5 text-amber-500" title="Achievement Unlocked!">
                    <Unlock className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}

          {filteredBadges.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400">
              <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-semibold">No achievements fit this active filter.</p>
              <p className="text-[10px]">Track stats in your Logger to unlock more awards!</p>
            </div>
          )}
        </div>
      </div>

      {/* Science-based detail Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            {/* Celebrate Floating Confetti Effect (Simple CSS and Motion particles) */}
            {showCelebration && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                {[...Array(25)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'][i % 5],
                      left: `${30 + Math.random() * 40}%`,
                      top: '40%'
                    }}
                    animate={{
                      y: [-10, 150 + Math.random() * 200],
                      x: [0, (Math.random() - 0.5) * 120],
                      scale: [1, 1.5, 0],
                      rotate: [0, 360]
                    }}
                    transition={{
                      duration: 1.5 + Math.random() * 1,
                      ease: "easeOut"
                    }}
                  />
                ))}
              </div>
            )}

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 relative overflow-hidden"
            >
              {/* Glowing top backdrop */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                selectedBadge.unlocked ? 'bg-gradient-to-r from-amber-500 to-yellow-400' : 'bg-slate-300'
              }`} />

              <div className="flex items-start gap-4 mt-2">
                <span className="text-5xl p-2.5 bg-slate-50 border rounded-2xl shrink-0">
                  {selectedBadge.icon}
                </span>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <h5 className="font-extrabold text-slate-800 text-base sm:text-lg">
                      {selectedBadge.title}
                    </h5>
                    {selectedBadge.unlocked ? (
                      <span className="bg-amber-100 text-amber-800 text-[9px] uppercase font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 border border-amber-200">
                        <Check className="w-2.5 h-2.5" />
                        <span>Unlocked</span>
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-500 text-[9px] uppercase font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 border">
                        <Lock className="w-2.5 h-2.5" />
                        <span>Locked</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    {selectedBadge.category} Achievement
                  </p>
                </div>
              </div>

              {/* Progress Detail */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/80 my-4 space-y-2">
                <p className="text-xs text-slate-600 font-medium">
                  <strong>Requirement:</strong> {selectedBadge.description}
                </p>
                
                <div className="flex justify-between items-center text-xs text-slate-500 pt-1.5 border-t border-dashed">
                  <span>Current Stat Value:</span>
                  <span className="font-bold text-slate-800">
                    {selectedBadge.currentValue} {selectedBadge.unit}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span>Required Target Value:</span>
                  <span className="font-bold text-slate-800">
                    {selectedBadge.targetValue} {selectedBadge.unit}
                  </span>
                </div>
              </div>

              {/* Coach Science Tip */}
              <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/30 text-xs text-emerald-800 space-y-2 leading-relaxed">
                <h6 className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <HeartPulse className="w-4 h-4 text-emerald-600" />
                  <span>Clinical Weight Loss Science</span>
                </h6>
                <p>{selectedBadge.scienceTip}</p>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedBadge(null)}
                className="w-full mt-6 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition"
              >
                Go Back to Dashboard
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
