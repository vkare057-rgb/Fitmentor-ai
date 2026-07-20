export interface CalculatedStats {
  bmi: number;
  bmiCategory: string;
  bodyFatPct: number;
  healthyWeightRange: { min: number; max: number };
  maintenanceCalories: number;
  weightLossCalories: number;
  proteinG: number;
  fatG: number;
  carbG: number;
  waterMl: number;
  fiberG: number;
}

export interface Profile {
  name: string;
  age: number;
  gender: string;
  height: number; // in cm
  weight: number; // in kg
  targetWeight: number; // in kg
  occupation: string;
  country: string;
  foodPreference: 'vegetarian' | 'vegan' | 'eggetarian' | 'non-vegetarian';
  allergies: string;
  medicalConditions: string;
  medications: string;
  pregnancyStatus: string;
  
  // Lifestyle
  wakeTime: string;
  sleepTime: string;
  workingHours: string;
  dailyStepsGoal: number;
  screenTime: string;
  waterGoalCups: number;
  stressLevel: 'low' | 'medium' | 'high';
  sleepQuality: 'poor' | 'fair' | 'good' | 'excellent';
  energyLevels: 'low' | 'medium' | 'high';
  exerciseHistory: string;
  workoutPreference: 'gym' | 'home';
  equipmentAvailable: string;
  budgetForFood: 'low' | 'moderate' | 'high';
  cookingSkills: 'beginner' | 'intermediate' | 'advanced';

  // Weight History
  highestWeight: number;
  lowestWeight: number;
  previousDiets: string;
  whyFailed: string;
  biggestStruggles: string[]; // Sugar cravings, emotional eating, busy schedule, etc.

  // Goals
  mainGoal: 'lose-weight' | 'lose-belly-fat' | 'build-muscle' | 'improve-stamina' | 'improve-health' | 'improve-confidence';
  timeline: string;
  motivation: string;
  biggestChallenge: string;

  calculatedStats?: CalculatedStats;
  onboardedAt?: string;
}

export interface FoodLogItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert';
}

export interface ExerciseLogItem {
  id: string;
  name: string;
  durationMinutes: number;
  caloriesBurned: number;
  type: string; // 'cardio' | 'strength' | 'stretching' | etc.
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  weight?: number;
  waistCm?: number;
  hipsCm?: number;
  waterCups: number;
  steps: number;
  sleepHours: number;
  foodItems: FoodLogItem[];
  exercises: ExerciseLogItem[];
  mood: 'great' | 'good' | 'neutral' | 'tired' | 'stressed' | 'frustrated';
  stressLevel: 'low' | 'medium' | 'high';
  energyLevel: 'low' | 'medium' | 'high';
  cravings: string; // none, sweet, salty, fast food, etc.
  hungerLevel: number; // 1-10
  completedHabits?: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface WeeklyMission {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  completed: boolean;
}

export interface WeightHistoryRecord {
  date: string;
  weight: number;
  waist?: number;
  hips?: number;
}
