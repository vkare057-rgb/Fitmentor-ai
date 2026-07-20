import { Profile, CalculatedStats } from "../types";

export function calculateStats(profile: Omit<Profile, 'calculatedStats'>): CalculatedStats {
  const { height, weight, age, gender, dailyStepsGoal, mainGoal } = profile;

  // 1. BMI Calculation
  const heightM = height / 100;
  const bmi = parseFloat((weight / (heightM * heightM)).toFixed(1));

  let bmiCategory = "Normal";
  if (bmi < 18.5) bmiCategory = "Underweight";
  else if (bmi < 25) bmiCategory = "Normal";
  else if (bmi < 30) bmiCategory = "Overweight";
  else bmiCategory = "Obese";

  // 2. Body Fat % (BMI-based adult formula)
  let bodyFatPct = 0;
  if (gender.toLowerCase() === "male" || gender.toLowerCase() === "men") {
    bodyFatPct = 1.20 * bmi + 0.23 * age - 16.2;
  } else {
    bodyFatPct = 1.20 * bmi + 0.23 * age - 5.4;
  }
  bodyFatPct = parseFloat(Math.max(3, Math.min(60, bodyFatPct)).toFixed(1));

  // 3. Healthy Weight Range (for BMI 18.5 to 24.9)
  const healthyWeightMin = parseFloat((18.5 * heightM * heightM).toFixed(1));
  const healthyWeightMax = parseFloat((24.9 * heightM * heightM).toFixed(1));

  // 4. BMR (Mifflin-St Jeor)
  let bmr = 0;
  if (gender.toLowerCase() === "male" || gender.toLowerCase() === "men") {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  // Activity Factor based on daily steps goal
  let activityFactor = 1.2; // Sedentary
  if (dailyStepsGoal >= 12000) activityFactor = 1.725; // Very Active
  else if (dailyStepsGoal >= 8000) activityFactor = 1.55; // Moderately Active
  else if (dailyStepsGoal >= 5000) activityFactor = 1.375; // Lightly Active

  const maintenanceCalories = Math.round(bmr * activityFactor);

  // 5. Weight Loss Calories
  // Safe default: subtract 500 for steady fat loss, but keep above extreme limits (1200 for female, 1500 for male)
  let deficit = 500;
  if (mainGoal === "lose-belly-fat") deficit = 550;
  else if (mainGoal === "build-muscle") deficit = 200; // Recorposition (slight deficit or maintenance)
  
  let weightLossCalories = maintenanceCalories - deficit;
  const lowerLimit = (gender.toLowerCase() === "male" || gender.toLowerCase() === "men") ? 1500 : 1200;
  if (weightLossCalories < lowerLimit) {
    weightLossCalories = lowerLimit;
  }

  // 6. Protein requirement: 2.0g per kg of target/current weight for muscle preservation
  let proteinG = Math.round(weight * 2.0);
  // Cap protein safely
  proteinG = Math.max(60, Math.min(220, proteinG));

  // 7. Fat requirement: 25% of target calories. 1g fat = 9 kcal
  let fatG = Math.round((weightLossCalories * 0.25) / 9);
  fatG = Math.max(30, Math.min(100, fatG));

  // 8. Carbohydrates requirement: Remaining calories. 1g carb = 4 kcal
  const proteinKcal = proteinG * 4;
  const fatKcal = fatG * 9;
  let carbG = Math.round((weightLossCalories - (proteinKcal + fatKcal)) / 4);
  carbG = Math.max(50, carbG);

  // 9. Water requirement: 35ml per kg of bodyweight + extra for activity
  let waterMl = Math.round(weight * 35);
  if (dailyStepsGoal > 8000) {
    waterMl += 500; // extra water for exercise
  }
  waterMl = Math.max(2000, Math.min(5000, waterMl)); // bound between 2L and 5L

  // 10. Fiber requirement: 30g for men, 25g for women
  const fiberG = (gender.toLowerCase() === "male" || gender.toLowerCase() === "men") ? 30 : 25;

  return {
    bmi,
    bmiCategory,
    bodyFatPct,
    healthyWeightRange: { min: healthyWeightMin, max: healthyWeightMax },
    maintenanceCalories,
    weightLossCalories,
    proteinG,
    fatG,
    carbG,
    waterMl,
    fiberG,
  };
}
