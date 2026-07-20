import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, ShieldAlert, Heart, Flame, Dumbbell, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { Profile } from '../types';
import { calculateStats } from '../utils/calculations';

interface OnboardingProps {
  onComplete: (profile: Profile) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Omit<Profile, 'calculatedStats'>>({
    name: '',
    age: 30,
    gender: 'Female',
    height: 165,
    weight: 75,
    targetWeight: 60,
    occupation: 'Office Employee',
    country: 'United States',
    foodPreference: 'non-vegetarian',
    allergies: '',
    medicalConditions: '',
    medications: '',
    pregnancyStatus: 'No',

    // Lifestyle
    wakeTime: '07:00',
    sleepTime: '23:00',
    workingHours: '9 AM - 5 PM',
    dailyStepsGoal: 8000,
    screenTime: '5-6 hours',
    waterGoalCups: 8,
    stressLevel: 'medium',
    sleepQuality: 'good',
    energyLevels: 'medium',
    exerciseHistory: 'Gym 1-2 times a week previously',
    workoutPreference: 'home',
    equipmentAvailable: 'Dumbbells, resistance bands',
    budgetForFood: 'moderate',
    cookingSkills: 'intermediate',

    // Weight history
    highestWeight: 80,
    lowestWeight: 58,
    previousDiets: 'Keto, Intermittent Fasting',
    whyFailed: 'Hard to maintain socially, felt too restrictive',
    biggestStruggles: ['Sugar cravings', 'Busy schedule'],

    // Goals
    mainGoal: 'lose-weight',
    timeline: '3 to 6 months',
    motivation: 'To feel lighter, healthier, and have more energy for my family',
    biggestChallenge: 'Sticking to habits on weekends'
  });

  const strugglesOptions = [
    'Emotional eating',
    'Sugar cravings',
    'Night eating',
    'Eating out frequently',
    'Lack of motivation',
    'PCOS',
    'Thyroid',
    'Diabetes',
    'Knee pain',
    'Busy schedule',
    'Slow metabolism'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['age', 'height', 'weight', 'targetWeight', 'highestWeight', 'lowestWeight', 'dailyStepsGoal', 'waterGoalCups'].includes(name)
        ? parseFloat(value) || 0
        : value
    }));
  };

  const handleStruggleToggle = (struggle: string) => {
    setFormData(prev => {
      const current = prev.biggestStruggles || [];
      const updated = current.includes(struggle)
        ? current.filter(s => s !== struggle)
        : [...current, struggle];
      return { ...prev, biggestStruggles: updated };
    });
  };

  const handleNext = () => {
    if (step === 1 && !formData.name.trim()) {
      alert("Please enter your name to personalize your coach.");
      return;
    }
    setStep(prev => prev + 1);
  };

  const handlePrev = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = () => {
    const stats = calculateStats(formData);
    const completeProfile: Profile = {
      ...formData,
      calculatedStats: stats,
      onboardedAt: new Date().toISOString()
    };
    onComplete(completeProfile);
  };

  const currentStatsPreview = step === 5 ? calculateStats(formData) : null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-xl w-full mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        
        {/* Header Progress */}
        <div className="px-8 pt-8 pb-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white relative">
          <div className="absolute top-4 right-4 flex items-center space-x-1 bg-white/20 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Step {step} of 5</span>
          </div>
          <h2 className="text-2xl font-bold font-sans">FitMentor AI</h2>
          <p className="text-emerald-100 text-sm mt-1">Configure your personal evidence-based healthy coach</p>
          
          <div className="mt-6 flex space-x-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div 
                key={i} 
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  i <= step ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ x: -15, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* STEP 1: Basic Info */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-slate-800 font-semibold text-lg border-b pb-2 mb-4">
                    <Activity className="w-5 h-5 text-emerald-500" />
                    <span>Basic Physical Profile</span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Your Name</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="e.g. Sarah"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Age</label>
                      <input
                        type="number"
                        name="age"
                        min="13"
                        max="110"
                        value={formData.age}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Gender</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                      >
                        <option>Female</option>
                        <option>Male</option>
                        <option>Non-binary</option>
                        <option>Prefer not to say</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Height (cm)</label>
                      <input
                        type="number"
                        name="height"
                        value={formData.height}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Weight (kg)</label>
                      <input
                        type="number"
                        name="weight"
                        value={formData.weight}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Target (kg)</label>
                      <input
                        type="number"
                        name="targetWeight"
                        value={formData.targetWeight}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Country</label>
                      <input
                        type="text"
                        name="country"
                        placeholder="e.g. India, USA"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Occupation</label>
                      <input
                        type="text"
                        name="occupation"
                        placeholder="e.g. Software Engineer"
                        value={formData.occupation}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Food Preference</label>
                    <select
                      name="foodPreference"
                      value={formData.foodPreference}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    >
                      <option value="non-vegetarian">Non-Vegetarian</option>
                      <option value="vegetarian">Vegetarian</option>
                      <option value="vegan">Vegan</option>
                      <option value="eggetarian">Eggetarian</option>
                    </select>
                  </div>
                </div>
              )}

              {/* STEP 2: Medical & Allergies */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-slate-800 font-semibold text-lg border-b pb-2 mb-4">
                    <ShieldAlert className="w-5 h-5 text-red-500" />
                    <span>Safety & Health Shield</span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Food Allergies</label>
                    <textarea
                      name="allergies"
                      placeholder="e.g. Peanuts, Dairy, Gluten (Leave blank if none)"
                      rows={2}
                      value={formData.allergies}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Medical Conditions</label>
                    <textarea
                      name="medicalConditions"
                      placeholder="e.g. Thyroid, PCOS, Type 2 Diabetes, Knee Pain (Leave blank if none)"
                      rows={2}
                      value={formData.medicalConditions}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Active Medications</label>
                    <textarea
                      name="medications"
                      placeholder="e.g. Insulin, Metformin (Leave blank if none)"
                      rows={2}
                      value={formData.medications}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>

                  {formData.gender.toLowerCase().includes('female') && (
                    <div>
                      <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Pregnancy or Breastfeeding?</label>
                      <select
                        name="pregnancyStatus"
                        value={formData.pregnancyStatus}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                      >
                        <option>No</option>
                        <option>Pregnant</option>
                        <option>Breastfeeding</option>
                      </select>
                    </div>
                  )}

                  <div className="bg-amber-50 rounded-xl p-3 text-xs text-amber-800 flex items-start space-x-2 border border-amber-100">
                    <ShieldAlert className="w-4 h-4 mt-0.5 text-amber-600 shrink-0" />
                    <span>FitMentor AI is designed for safe habits. If you have active medical concerns or severe knee pain, we customize your workouts with soft mobility drills. Always consult your primary doctor first.</span>
                  </div>
                </div>
              )}

              {/* STEP 3: Lifestyle Audit */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-slate-800 font-semibold text-lg border-b pb-2 mb-4">
                    <Heart className="w-5 h-5 text-rose-500" />
                    <span>Lifestyle Audit</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Wake Time</label>
                      <input
                        type="time"
                        name="wakeTime"
                        value={formData.wakeTime}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Sleep Time</label>
                      <input
                        type="time"
                        name="sleepTime"
                        value={formData.sleepTime}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Daily Step Goal</label>
                      <select
                        name="dailyStepsGoal"
                        value={formData.dailyStepsGoal}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                      >
                        <option value={4000}>4,000 (Low active)</option>
                        <option value={6000}>6,000 (Fair active)</option>
                        <option value={8000}>8,000 (Moderate)</option>
                        <option value={10000}>10,000 (Active)</option>
                        <option value={12000}>12,000 (Very active)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Sleep Quality</label>
                      <select
                        name="sleepQuality"
                        value={formData.sleepQuality}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                      >
                        <option value="poor">Poor</option>
                        <option value="fair">Fair</option>
                        <option value="good">Good</option>
                        <option value="excellent">Excellent</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Stress Level</label>
                      <select
                        name="stressLevel"
                        value={formData.stressLevel}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Energy Levels</label>
                      <select
                        name="energyLevels"
                        value={formData.energyLevels}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                      >
                        <option value="low">Low Energy</option>
                        <option value="medium">Medium</option>
                        <option value="high">High Energy</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Workout Space</label>
                      <select
                        name="workoutPreference"
                        value={formData.workoutPreference}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                      >
                        <option value="home">At Home</option>
                        <option value="gym">At the Gym</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Cooking Skill</label>
                      <select
                        name="cookingSkills"
                        value={formData.cookingSkills}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                      >
                        <option value="beginner">Beginner (Can assemble)</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced (Master meal prep)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: History & Mindset */}
              {step === 4 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-slate-800 font-semibold text-lg border-b pb-2 mb-4">
                    <Flame className="w-5 h-5 text-amber-500" />
                    <span>Struggles & Goals</span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Primary Weight Loss Goal</label>
                    <select
                      name="mainGoal"
                      value={formData.mainGoal}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    >
                      <option value="lose-weight">Lose overall weight safely</option>
                      <option value="lose-belly-fat">Lose belly fat</option>
                      <option value="build-muscle">Build lean muscle while losing fat</option>
                      <option value="improve-stamina">Improve Stamina & Fitness</option>
                      <option value="improve-health">Improve health metrics (Insulin/Thyroid)</option>
                      <option value="improve-confidence">Boost body confidence</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Your Biggest Weight Loss Struggles</label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {strugglesOptions.map((struggle) => {
                        const isSelected = formData.biggestStruggles?.includes(struggle);
                        return (
                          <button
                            key={struggle}
                            type="button"
                            onClick={() => handleStruggleToggle(struggle)}
                            className={`px-3 py-2 text-left text-xs rounded-xl font-medium border transition-all ${
                              isSelected
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-500'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {struggle}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Highest Weight (kg)</label>
                      <input
                        type="number"
                        name="highestWeight"
                        value={formData.highestWeight}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Lowest Weight (kg)</label>
                      <input
                        type="number"
                        name="lowestWeight"
                        value={formData.lowestWeight}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Timeline Goal</label>
                    <input
                      type="text"
                      name="timeline"
                      placeholder="e.g. 12 weeks, 3-6 months"
                      value={formData.timeline}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">What is your core motivation?</label>
                    <input
                      type="text"
                      name="motivation"
                      placeholder="e.g. To stay healthy for my kids, build physical confidence"
                      value={formData.motivation}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>
                </div>
              )}

              {/* STEP 5: Science Body Analysis & Targets */}
              {step === 5 && currentStatsPreview && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-slate-800 font-semibold text-lg border-b pb-2 mb-3">
                    <Sparkles className="w-5 h-5 text-yellow-500 animate-spin" />
                    <span>FitMentor AI Scientific Body Analysis</span>
                  </div>

                  <p className="text-slate-600 text-xs leading-relaxed">
                    Sarah, we have scientifically computed your metabolic baseline. Here is your personalized profile blueprint based on healthy fat loss (preserving maximum lean mass):
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                      <span className="block text-[10px] uppercase text-slate-400 font-bold tracking-wider">Your BMI Baseline</span>
                      <div className="flex items-baseline space-x-1 mt-0.5">
                        <span className="text-xl font-bold text-slate-800">{currentStatsPreview.bmi}</span>
                        <span className="text-xs text-slate-500">kg/m²</span>
                      </div>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                        {currentStatsPreview.bmiCategory} Range
                      </span>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                      <span className="block text-[10px] uppercase text-slate-400 font-bold tracking-wider">Estimated Body Fat %</span>
                      <div className="flex items-baseline space-x-1 mt-0.5">
                        <span className="text-xl font-bold text-slate-800">{currentStatsPreview.bodyFatPct}%</span>
                      </div>
                      <span className="text-[10px] block text-slate-400 mt-1 leading-tight">BMI & age-adjusted prediction</span>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                      <span className="block text-[10px] uppercase text-slate-400 font-bold tracking-wider">TDEE Maintenance Cal</span>
                      <div className="flex items-baseline space-x-1 mt-0.5">
                        <span className="text-xl font-bold text-slate-700">{currentStatsPreview.maintenanceCalories}</span>
                        <span className="text-xs text-slate-500">kcal/day</span>
                      </div>
                      <span className="text-[10px] block text-slate-400 mt-1">To stay at exactly {formData.weight}kg</span>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-3 border border-emerald-100 relative overflow-hidden">
                      <span className="block text-[10px] uppercase text-emerald-700 font-bold tracking-wider">Daily Target Calories</span>
                      <div className="flex items-baseline space-x-1 mt-0.5">
                        <span className="text-2xl font-black text-emerald-800">{currentStatsPreview.weightLossCalories}</span>
                        <span className="text-xs text-emerald-600 font-bold">kcal/day</span>
                      </div>
                      <span className="text-[10px] block text-emerald-700 font-medium mt-1">Steady, safe healthy fat loss</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <span className="block text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-2">Preservation Macros & Hydration</span>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="bg-white rounded-xl p-1.5 border border-slate-100">
                        <span className="block text-[10px] text-slate-400">Protein</span>
                        <span className="text-sm font-bold text-slate-800">{currentStatsPreview.proteinG}g</span>
                      </div>
                      <div className="bg-white rounded-xl p-1.5 border border-slate-100">
                        <span className="block text-[10px] text-slate-400">Carbs</span>
                        <span className="text-sm font-bold text-slate-800">{currentStatsPreview.carbG}g</span>
                      </div>
                      <div className="bg-white rounded-xl p-1.5 border border-slate-100">
                        <span className="block text-[10px] text-slate-400">Fat</span>
                        <span className="text-sm font-bold text-slate-800">{currentStatsPreview.fatG}g</span>
                      </div>
                      <div className="bg-white rounded-xl p-1.5 border border-slate-100">
                        <span className="block text-[10px] text-slate-400">Water</span>
                        <span className="text-sm font-bold text-slate-800">{(currentStatsPreview.waterMl / 1000).toFixed(1)}L</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-emerald-50 rounded-2xl p-3 text-xs text-emerald-800 border border-emerald-100/60 leading-relaxed flex items-start space-x-2">
                    <Dumbbell className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>
                      <strong>Muscle Preservation Strategy:</strong> We prioritized a high-protein goal of <strong>{currentStatsPreview.proteinG}g/day</strong> to keep your muscle mass dense and your resting metabolic rate (BMR) burning calories even on rest days.
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
            {step > 1 ? (
              <button
                onClick={handlePrev}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <button
                onClick={handleNext}
                className="flex items-center space-x-1.5 bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all shadow-md shadow-slate-900/10"
              >
                <span>Next Step</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="flex items-center space-x-1.5 bg-emerald-600 text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20"
              >
                <Sparkles className="w-4 h-4" />
                <span>Initialize FitMentor Coach</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
