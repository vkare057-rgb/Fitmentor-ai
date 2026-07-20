import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, ChefHat, Dumbbell, Sparkles, AlertTriangle, Play, BookOpen, Clock, Flame, CheckCircle, Search, Download
} from 'lucide-react';
import { Profile } from '../types';
import { jsPDF } from 'jspdf';

interface DietWorkoutsProps {
  profile: Profile;
}

export default function DietWorkouts({ profile }: DietWorkoutsProps) {
  const [activeTab, setActiveTab] = useState<'diet' | 'workouts'>('diet');
  
  // Recipe Generator States
  const [recipeQuery, setRecipeQuery] = useState('');
  const [recipeType, setRecipeType] = useState<'recipe' | 'mealplan'>('recipe');
  const [recipeResult, setRecipeResult] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipeQuery.trim()) return;

    setIsGenerating(true);
    setRecipeResult('');
    try {
      const response = await fetch('/api/recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          query: recipeQuery,
          type: recipeType
        })
      });

      if (!response.ok) {
        throw new Error("Server failed to generate recipe.");
      }

      const data = await response.json();
      setRecipeResult(data.text);
    } catch (err) {
      console.error(err);
      setRecipeResult("### Offline Mode / Configuration Needed\nFitMentor AI's custom live recipe generator requires an active `GEMINI_API_KEY` defined in the Secrets panel in AI Studio. Please verify your keys, or check the pre-designed meal guides below!");
    } finally {
      setIsGenerating(false);
    }
  };

  const parseBolds = (text: string) => {
    const parts = text.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="font-extrabold text-slate-900">{part}</strong>;
      }
      return part;
    });
  };

  const renderGeneratedResult = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        return (
          <li key={idx} className="ml-4 list-disc text-xs sm:text-sm my-1 text-slate-700">
            {parseBolds(line.trim().replace(/^[\*\-]\s+/, ''))}
          </li>
        );
      }
      if (line.trim().startsWith('### ')) {
        return (
          <h5 key={idx} className="font-bold text-sm sm:text-base text-slate-900 mt-3 mb-1.5 font-sans">
            {parseBolds(line.replace('### ', ''))}
          </h5>
        );
      }
      if (line.trim().startsWith('## ')) {
        return (
          <h4 key={idx} className="font-bold text-base sm:text-lg text-emerald-800 mt-4 mb-2 border-b pb-0.5 font-sans">
            {parseBolds(line.replace('## ', ''))}
          </h4>
        );
      }
      if (!line.trim()) return <div key={idx} className="h-2" />;
      return (
        <p key={idx} className="text-xs sm:text-sm text-slate-600 my-1 leading-relaxed">
          {parseBolds(line)}
        </p>
      );
    });
  };

  // Preset plans based on country
  const fallbackMeals = {
    US_Europe: [
      {
        meal: "Breakfast",
        menu: "Greek Yogurt Bowl",
        desc: "200g fat-free Greek Yogurt, 50g fresh blueberries, 15g chia seeds, 10g almond flakes.",
        macros: "280 kcal | P: 24g | C: 18g | F: 8g | Fiber: 6g"
      },
      {
        meal: "Lunch",
        menu: "High-Protein Turkey Wrap (Office Friendly)",
        desc: "1 large whole-wheat tortilla wrap, 120g grilled turkey breast slice, spinach leaves, tomato slices, 1 tbsp hummus.",
        macros: "380 kcal | P: 32g | C: 35g | F: 10g | Fiber: 7g"
      },
      {
        meal: "Snack",
        menu: "Boiled Egg & Apple",
        desc: "1 large hard-boiled egg with a pinch of sea-salt & 1 crisp green apple.",
        macros: "160 kcal | P: 7g | C: 22g | F: 5g | Fiber: 4g"
      },
      {
        meal: "Dinner",
        menu: "Garlic Butter Grilled Salmon & Asparagus",
        desc: "150g Atlantic wild salmon fillet, cooked in 1 tsp olive oil with garlic, served with 120g grilled asparagus spears.",
        macros: "390 kcal | P: 34g | C: 6g | F: 22g | Fiber: 3g"
      }
    ],
    Asia_Generic: [
      {
        meal: "Breakfast",
        menu: "Paneer / Tofu Bhurji Toast",
        desc: "100g crumbled Paneer (or firm Tofu for vegan), sauteed with onions, tomatoes, turmeric, with 1 slice toasted multi-grain bread.",
        macros: "310 kcal | P: 18g | C: 20g | F: 14g | Fiber: 4g"
      },
      {
        meal: "Lunch",
        menu: "Spiced Chickpea & Quinoa Bowl",
        desc: "120g boiled chickpeas sauteed with cumin, served with 80g cooked quinoa and salad (cucumber, carrots, lime juice).",
        macros: "390 kcal | P: 14g | C: 54g | F: 8g | Fiber: 12g"
      },
      {
        meal: "Snack",
        menu: "Roasted Chana & Green Tea",
        desc: "30g roasted chickpeas (dry chana) with a hot cup of lemon ginger green tea.",
        macros: "110 kcal | P: 6g | C: 18g | F: 2g | Fiber: 5g"
      },
      {
        meal: "Dinner",
        menu: "Soya Chunk Curry & Cauliflower Rice",
        desc: "80g high-protein Soya chunks cooked in light home curry base, served with 150g grated Cauliflower Rice (stir-fried with mustard seeds).",
        macros: "290 kcal | P: 26g | C: 16g | F: 6g | Fiber: 7g"
      }
    ]
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    let y = 15;

    const checkAddPage = (needed: number) => {
      if (y + needed > 280) {
        doc.addPage();
        y = 15;
        // Subtle header line on new pages
        doc.setDrawColor(226, 232, 240); // slate-200
        doc.setLineWidth(0.5);
        doc.line(15, 10, 195, 10);
        
        doc.setFont('helvetica', 'oblique');
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184); // slate-400
        doc.text("FitMentor AI - Personal Weekly Plan", 15, 8);
        doc.text(`Page ${doc.getNumberOfPages()}`, 180, 8);
        y = 18;
      }
    };

    // --- PDF Header ---
    doc.setFillColor(16, 185, 129); // emerald-500 color
    doc.rect(15, y, 180, 26, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text("FITMENTOR AI - WEEKLY PLAN", 22, y + 10);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.text("Your Customized Bio-Adaptation Meal & Exercise Guide", 22, y + 16);
    
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.text(`Generated on ${new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}`, 22, y + 21);

    // Decorative symbol
    doc.setFontSize(18);
    doc.text("🍏🏋️", 168, y + 15);

    y += 31;

    // --- Profile Summary Card ---
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.rect(15, y, 180, 32, 'FD');

    doc.setTextColor(15, 23, 42); // slate-900
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text(`HEALTH & LIFESTYLE PROFILE: ${profile.name.toUpperCase()}`, 20, y + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105); // slate-600

    doc.text(`• Age / Gender: ${profile.age} yrs / ${profile.gender}`, 20, y + 14);
    doc.text(`• Weight Baseline: ${profile.weight} kg`, 20, y + 20);
    doc.text(`• Target Weight Goal: ${profile.targetWeight} kg`, 20, y + 26);

    doc.text(`• Location / Region: ${profile.country || 'Global'}`, 110, y + 14);
    doc.text(`• Food Preferences: ${profile.foodPreference.replace('_', ' ').replace('-', ' ').toUpperCase()}`, 110, y + 20);
    const safeAllergies = profile.allergies && profile.allergies.toLowerCase() !== 'none' ? profile.allergies : 'None declared';
    doc.text(`• Allergies & Notes: ${safeAllergies}`, 110, y + 26);

    y += 38;

    // --- SECTION 1: MEAL GUIDE ---
    checkAddPage(15);
    doc.setFillColor(220, 252, 231); // emerald-100
    doc.rect(15, y, 180, 8, 'F');
    doc.setTextColor(6, 95, 70); // deep green
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text("SECTION 1: WEEKLY NUTRITIONAL MEAL PLAN", 20, y + 5.5);

    y += 12;

    activeFallbackMeals.forEach((item) => {
      checkAddPage(25);
      
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(241, 245, 249); // slate-100
      doc.rect(15, y, 180, 19, 'FD');

      // Meal Tag Indicator
      doc.setFillColor(209, 250, 229); // light emerald
      doc.rect(18, y + 3, 20, 5, 'F');
      doc.setTextColor(5, 150, 105); // emerald-600
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.text(item.meal.toUpperCase(), 20, y + 6.5);

      // Meal Name
      doc.setTextColor(15, 23, 42); // slate-900
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(item.menu, 42, y + 6.5);

      // Description
      doc.setTextColor(71, 85, 105); // slate-600
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const splitDesc = doc.splitTextToSize(item.desc, 145);
      doc.text(splitDesc, 42, y + 11);

      // Macros text (right-aligned)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(item.macros, 130, y + 6.5);

      y += 22;
    });

    // --- ACTIVE AI GENERATED DISH ---
    if (recipeResult) {
      checkAddPage(30);
      doc.setFillColor(254, 243, 199); // amber-100
      doc.rect(15, y, 180, 8, 'F');
      doc.setTextColor(146, 64, 14); // amber-800
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text("✨ ACTIVE GENERATED AI DIET RECIPE", 20, y + 5.5);
      
      y += 12;

      const lines = recipeResult.split('\n');
      lines.forEach((line) => {
        const cleanLine = line.trim().replace(/\*\*/g, '').replace(/^[\*\-\#\s]+/, '');
        if (cleanLine) {
          checkAddPage(10);
          
          doc.setTextColor(51, 65, 85);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);

          if (line.trim().startsWith('##') || line.trim().startsWith('###')) {
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(15, 23, 42);
            doc.setFontSize(9);
          }

          const splitLine = doc.splitTextToSize(cleanLine, 170);
          doc.text(splitLine, 20, y);
          y += (splitLine.length * 4) + 1;
        }
      });
      y += 4;
    }

    y += 5;

    // --- SECTION 2: WORKOUT GUIDE ---
    checkAddPage(15);
    doc.setFillColor(219, 234, 254); // blue-100
    doc.rect(15, y, 180, 8, 'F');
    doc.setTextColor(30, 58, 138); // deep blue
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text("SECTION 2: CORE WORKOUT & MOBILITY BLUEPRINTS", 20, y + 5.5);

    y += 12;

    workoutGuides.forEach((guide) => {
      checkAddPage(30);
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.rect(15, y, 180, 10, 'FD');

      doc.setTextColor(30, 41, 59); // slate-800
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(`${guide.title} [${guide.difficulty}]`, 18, y + 6.5);
      
      y += 13;

      guide.exercises.forEach((ex, idx) => {
        checkAddPage(15);
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(241, 245, 249);
        doc.rect(15, y, 180, 11, 'FD');

        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.text(`${idx + 1}. ${ex.name}`, 18, y + 4.5);

        doc.setTextColor(16, 185, 129); // emerald
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.text(ex.details, 18, y + 8.5);

        doc.setTextColor(100, 116, 139); // slate-500
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7.5);
        doc.text(`Coach Tip: ${ex.tip}`, 65, y + 8.5);

        y += 13;
      });
      y += 3;
    });

    // --- SECTION 3: MOTIVATION & PROTOCOLS ---
    checkAddPage(22);
    y += 2;
    doc.setFillColor(240, 253, 244); // green-50
    doc.setDrawColor(220, 252, 231); // green-100
    doc.rect(15, y, 180, 18, 'FD');

    doc.setTextColor(21, 128, 61); // green-700
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text("FITMENTOR AI CLINICAL PROTOCOLS & LONGEVITY TRICKS", 20, y + 5);

    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text("• Satiety Hormone Sync: Always chew your meals 25-30 times. This allows sufficient leptin signaling to avoid overeating.", 20, y + 10);
    doc.text("• Hydration standard: Maintain a constant intake of 2.5 - 3.0 Liters of water daily to sustain steady fat metabolization.", 20, y + 14);

    // Save
    doc.save(`FitMentor_Weekly_Plan_${profile.name.replace(/\s+/g, '_')}.pdf`);
  };

  const activeFallbackMeals = profile.country.toLowerCase().includes('india') || profile.country.toLowerCase().includes('asia') 
    ? fallbackMeals.Asia_Generic 
    : fallbackMeals.US_Europe;

  // Visual Workout Guides
  const workoutGuides = [
    {
      id: 'w1',
      title: "Knee-Pain & Obesity Safe Routine",
      difficulty: "Beginner Friendly",
      desc: "Designed to elevate calorie burn (NEAT) without impact load on knee joints.",
      exercises: [
        { name: "Supported Chair Squats", details: "3 Sets x 12 Reps", tip: "Keep weight back in your heels." },
        { name: "Wall Push-Ups", details: "3 Sets x 10 Reps", tip: "Maintain rigid core alignment." },
        { name: "Seated Leg Extensions", details: "3 Sets x 15 Reps (each side)", tip: "Squeeze quadriceps at the top." },
        { name: "Supported Standing Calf Raises", details: "3 Sets x 20 Reps", tip: "Slow controlled lower down." },
        { name: "Post-Meal Soft Walking", details: "15 minutes (after dinner)", tip: "Reduces post-meal insulin spikes." }
      ]
    },
    {
      id: 'w2',
      title: "Home Fat Burner & Core Guard",
      difficulty: "Intermediate",
      desc: "High intensity, zero equipment routine focusing on calorie burn and midsection core stability.",
      exercises: [
        { name: "Jumping Jacks (or Step Jacks)", details: "4 Sets x 40 seconds", tip: "Smooth constant breathing." },
        { name: "Dumbbell / Backpack Goblet Squats", details: "4 Sets x 15 Reps", tip: "Drive knees outwards on the descend." },
        { name: "Bird Dog Core Stabilizers", details: "3 Sets x 12 Reps (alternating)", tip: "Hold extension for 2 seconds." },
        { name: "Incline Couch Mountain Climbers", details: "3 Sets x 30 seconds", tip: "Drive knees toward chest." },
        { name: "Plank Core Hold", details: "3 Sets x 45 seconds", tip: "Keep hips level with shoulders." }
      ]
    },
    {
      id: 'w3',
      title: "PCOS Balance & Metabolism Booster",
      difficulty: "Beginner to Intermediate",
      desc: "Focuses on progressive resistance training which improves insulin sensitivity and hormonal balance.",
      exercises: [
        { name: "Resistance Band Glute Bridges", details: "4 Sets x 15 Reps", tip: "Drive knees outward against the band." },
        { name: "Dumbbell Bent-Over Row", details: "3 Sets x 12 Reps", tip: "Squeeze shoulder blades together." },
        { name: "DB Romanian Deadlifts", details: "4 Sets x 10 Reps", tip: "Hinge at the hips, keep back flat." },
        { name: "Dumbbell Shoulder Press", details: "3 Sets x 12 Reps", tip: "Do not arch your lower back." },
        { name: "Yin / Restorative Yoga Stretching", details: "10 minutes (Recovery-end)", tip: "Reduces cortisol/stress levels." }
      ]
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6 pb-20 font-sans text-slate-800">
      
      {/* Top Navigation Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 mb-6 gap-3 pb-2 sm:pb-0">
        <div className="flex overflow-x-auto whitespace-nowrap scrollbar-none">
          <button
            onClick={() => setActiveTab('diet')}
            className={`flex items-center space-x-2 py-3 px-6 border-b-2 font-bold text-sm transition-all ${
              activeTab === 'diet' 
                ? 'border-emerald-500 text-emerald-600' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <ChefHat className="w-4 h-4" />
            <span>Meal Plans & Recipes</span>
          </button>
          <button
            onClick={() => setActiveTab('workouts')}
            className={`flex items-center space-x-2 py-3 px-6 border-b-2 font-bold text-sm transition-all ${
              activeTab === 'workouts' 
                ? 'border-emerald-500 text-emerald-600' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            <span>Interactive Workout Guides</span>
          </button>
        </div>

        {/* Download PDF button */}
        <button
          onClick={handleDownloadPDF}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-4 rounded-xl shadow-md shadow-emerald-600/15 transition-all flex items-center justify-center gap-2 self-start sm:self-auto mb-2 sm:mb-0 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Download Weekly Plan (PDF)</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.15 }}
        >
          {/* DIET SECTION */}
          {activeTab === 'diet' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Live AI Recipe Generator */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm border-b pb-3 mb-4">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    <span>Live AI Recipe Generator</span>
                  </h3>

                  <form onSubmit={handleGenerateRecipe} className="space-y-4">
                    <div>
                      <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">What are you craving or have in your kitchen?</label>
                      <input 
                        type="text" 
                        required
                        value={recipeQuery}
                        onChange={(e) => setRecipeQuery(e.target.value)}
                        placeholder="e.g. high protein chicken breast, eggs and spinach, low carb desserts"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setRecipeType('recipe')}
                        className={`py-2 px-3 text-xs rounded-xl font-bold border transition ${
                          recipeType === 'recipe'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        Single Recipe
                      </button>
                      <button
                        type="button"
                        onClick={() => setRecipeType('mealplan')}
                        className={`py-2 px-3 text-xs rounded-xl font-bold border transition ${
                          recipeType === 'mealplan'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        1-Day Meal Plan
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={isGenerating || !recipeQuery.trim()}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-md shadow-slate-900/10 flex items-center justify-center gap-1.5"
                    >
                      <ChefHat className="w-4 h-4" />
                      <span>{isGenerating ? 'AI Cooking...' : 'Generate Recipe/Plan'}</span>
                    </button>
                  </form>
                </div>

                {/* Micro educational block */}
                <div className="bg-emerald-50/50 rounded-3xl p-5 border border-emerald-100/40 text-xs text-emerald-800 space-y-2">
                  <h5 className="font-bold flex items-center gap-1.5 text-emerald-900">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>FitMentor Science Tip</span>
                  </h5>
                  <p className="leading-relaxed">
                    Always chew your food at least <strong>25-30 times</strong> before swallowing. Proper chewing increases salivary enzymes and gives your leptin hormones (fullness signals) 20 minutes to reach your brain, preventing emotional overeating!
                  </p>
                </div>
              </div>

              {/* Right Column: Live Result Box OR Country Fallbacks */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Result output card */}
                {(recipeResult || isGenerating) && (
                  <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm max-h-[600px] overflow-y-auto">
                    <div className="flex items-center justify-between border-b pb-3 mb-4">
                      <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Live AI Diet Output</span>
                      </span>
                      <button 
                        onClick={() => setRecipeResult('')}
                        className="text-[10px] text-slate-400 font-bold hover:underline"
                      >
                        Clear Plan
                      </button>
                    </div>

                    {isGenerating ? (
                      <div className="py-12 flex flex-col items-center justify-center space-y-3">
                        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-xs text-slate-400 font-medium">Computing macros, ingredients, and guidelines personalized for {profile.name}...</p>
                      </div>
                    ) : (
                      <div className="prose prose-slate max-w-none text-slate-700">
                        {renderGeneratedResult(recipeResult)}
                      </div>
                    )}
                  </div>
                )}

                {/* Standard Pre-Designed Base Plan */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                  <h3 className="font-bold text-slate-800 text-sm border-b pb-3 mb-4">
                    🥗 Pre-designed High-Protein Weight Loss Plan (Tailored to {profile.country})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeFallbackMeals.map((item, i) => (
                      <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                              {item.meal}
                            </span>
                          </div>
                          <h4 className="font-extrabold text-sm text-slate-800 mt-1">{item.menu}</h4>
                          <p className="text-xs text-slate-400 leading-relaxed mt-1">{item.desc}</p>
                        </div>
                        <span className="block mt-3 text-[10px] font-black text-slate-500 bg-white border px-2.5 py-1 rounded-xl w-max">
                          {item.macros}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* WORKOUT SECTION */}
          {activeTab === 'workouts' && (
            <div className="space-y-6">
              
              {/* Caution block */}
              <div className="bg-amber-50 rounded-3xl p-4 border border-amber-100 flex items-start space-x-3 text-xs text-amber-800 leading-relaxed">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Fitness Safety Guidance:</strong> Always perform a 3-5 minute warm-up (joint rotations, light arm swings) before beginning, and end with passive stretching. If you have severe joint pain, perform ONLY the Obesity/Knee-Pain friendly routine with soft breathing.
                </div>
              </div>

              {/* Workout cards grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {workoutGuides.map((guide) => (
                  <div key={guide.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b pb-3 mb-3">
                        <span className="text-xs font-bold text-emerald-600 capitalize bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full">
                          {guide.difficulty}
                        </span>
                        <Play className="w-4 h-4 text-emerald-500" />
                      </div>
                      <h4 className="font-extrabold text-slate-800 text-base">{guide.title}</h4>
                      <p className="text-xs text-slate-400 mt-1 mb-4 leading-relaxed">{guide.desc}</p>

                      <div className="space-y-3">
                        {guide.exercises.map((ex, idx) => (
                          <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-start space-x-2.5 text-xs">
                            <span className="bg-white border rounded-lg w-5 h-5 flex items-center justify-center text-[10px] font-bold text-slate-400 shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <div>
                              <span className="font-bold text-slate-700 block">{ex.name}</span>
                              <span className="text-[10px] text-slate-400 block mt-0.5 font-bold uppercase tracking-wider">{ex.details}</span>
                              <span className="text-[10px] text-emerald-600 leading-tight block mt-0.5 font-medium">💡 Tip: {ex.tip}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Est: 20-30 mins</span>
                      </span>
                      <button 
                        onClick={() => alert(`Nice choice! Log this workout after completion in your Daily Logger card on the Dashboard tab to subtract -250 kcal burned!`)}
                        className="bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold px-4 py-2 rounded-xl transition"
                      >
                        Start Session
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}
        </motion.div>
      </AnimatePresence>

    </div>
  );
}
