import React, { useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, 
  Legend, ComposedChart, Line
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingDown, Calendar, Sparkles, Scale, Info, ArrowRight, Target, 
  Flame, Award, CheckCircle, RefreshCw, BarChart4, ChevronRight 
} from 'lucide-react';
import { Profile, WeightHistoryRecord } from '../types';

interface InteractiveWeightChartProps {
  profile: Profile;
  weightHistory: WeightHistoryRecord[];
}

type TimeRange = 'all' | '7' | '15' | '30';
type ActiveMetric = 'weight' | 'waist' | 'hips' | 'all';

export default function InteractiveWeightChart({ profile, weightHistory }: InteractiveWeightChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [activeMetric, setActiveMetric] = useState<ActiveMetric>('weight');

  // Fallback if empty history
  if (!weightHistory || weightHistory.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center py-12 flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-3xl animate-pulse">
          📈
        </div>
        <div>
          <h4 className="font-extrabold text-slate-800 text-sm sm:text-base">No progress records found yet</h4>
          <p className="text-xs text-slate-400 max-w-sm mt-1 mx-auto leading-relaxed">
            Once you log your body measurements in the form on the right, your biological progress indicators and trend analytics will render here!
          </p>
        </div>
      </div>
    );
  }

  // 1. Filter weightHistory based on timeRange
  const getFilteredData = () => {
    let sorted = [...weightHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    if (timeRange === '7') {
      return sorted.slice(-7);
    } else if (timeRange === '15') {
      return sorted.slice(-15);
    } else if (timeRange === '30') {
      return sorted.slice(-30);
    }
    return sorted;
  };

  const filteredData = getFilteredData();

  // 2. Metrics & Progress Highlights
  const firstRecord = weightHistory[0] || { weight: profile.weight, date: new Date().toLocaleDateString() };
  const currentRecord = weightHistory[weightHistory.length - 1] || firstRecord;
  
  const startingWeight = firstRecord.weight;
  const currentWeight = currentRecord.weight;
  const targetWeight = profile.targetWeight || 70;
  
  const totalChange = parseFloat((currentWeight - startingWeight).toFixed(1));
  const absChange = Math.abs(totalChange);
  const isLoss = totalChange < 0;
  const isGain = totalChange > 0;

  // Percentage of journey completed
  const totalJourneyToLose = startingWeight - targetWeight;
  const currentLost = startingWeight - currentWeight;
  let journeyPercent = 0;
  if (totalJourneyToLose > 0) {
    journeyPercent = Math.min(100, Math.max(0, Math.round((currentLost / totalJourneyToLose) * 100)));
  } else if (totalJourneyToLose < 0) {
    // Weight gain journey
    const totalToGain = targetWeight - startingWeight;
    const currentGained = currentWeight - startingWeight;
    journeyPercent = Math.min(100, Math.max(0, Math.round((currentGained / totalToGain) * 100)));
  }

  // Format date helper
  const formatDateLabel = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // BMI Estimator helper
  const calculateBMI = (weightKg: number) => {
    const heightM = profile.height / 100;
    if (!heightM) return 0;
    return parseFloat((weightKg / (heightM * heightM)).toFixed(1));
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-amber-500 bg-amber-50 border-amber-200' };
    if (bmi < 25) return { label: 'Healthy Weight', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' };
    if (bmi < 30) return { label: 'Overweight', color: 'text-amber-600 bg-amber-50 border-amber-200' };
    return { label: 'Obesity Class', color: 'text-rose-600 bg-rose-50 border-rose-100' };
  };

  const currentBMI = calculateBMI(currentWeight);
  const bmiClassification = getBMICategory(currentBMI);

  // Generate motivational quote based on loss
  const getMotivationalInsight = () => {
    if (totalChange < 0) {
      return `Amazing! You have shivered off ${absChange} kg of mass. This reduces mechanical load on your knee joints by ${parseFloat((absChange * 4).toFixed(1))} kg!`;
    } else if (totalChange === 0) {
      return "Stability phase: Your energy inputs match your metabolic outputs perfectly. Ready to add a soft post-meal walking routine to shift the trend?";
    } else {
      return "Tissue density adaptation: Minor fluctuations are standard water retention. Focus on hitting your protein and hydration targets to sustain your lean metabolically-active mass!";
    }
  };

  // Custom chart tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const weightVal = data.weight;
      const waistVal = data.waist;
      const hipsVal = data.hips;
      const dateFormatted = new Date(data.date).toLocaleDateString('en-US', { 
        weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' 
      });

      const bmiAtPoint = calculateBMI(weightVal);
      const bmiClassAtPoint = getBMICategory(bmiAtPoint);

      return (
        <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 shadow-xl max-w-[280px] font-sans text-xs space-y-2.5 z-50">
          <div className="flex items-center space-x-1 border-b border-slate-800 pb-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-extrabold text-slate-300">{dateFormatted}</span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Weight:</span>
              <span className="font-black text-amber-400 text-sm">{weightVal} kg</span>
            </div>
            
            {waistVal !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Waist:</span>
                <span className="font-bold text-teal-400">{waistVal} cm</span>
              </div>
            )}

            {hipsVal !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Hips:</span>
                <span className="font-bold text-sky-400">{hipsVal} cm</span>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
            <span className="text-slate-400">BMI: <strong className="text-white font-black">{bmiAtPoint}</strong></span>
            <span className={`px-1.5 py-0.5 rounded font-black text-[8px] uppercase tracking-wide ${bmiClassAtPoint.color.replace('bg-', 'bg-opacity-20 bg-').split(' border')[0]}`}>
              {bmiClassAtPoint.label}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
      
      {/* 1. Header with custom filters and tags */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 border-b pb-4">
        <div>
          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 w-max border border-emerald-100">
            <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
            <span>Interactive Trend Analytics</span>
          </span>
          <h4 className="font-black text-slate-800 text-base sm:text-lg mt-1.5 flex items-center gap-1.5">
            <span>Body Composition Trends</span>
          </h4>
          <p className="text-xs text-slate-400">We analyze weight along with abdominal waist and hip measurements to prove your fat-loss success.</p>
        </div>

        {/* Filters Controls */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Metric selector tabs */}
          <div className="flex bg-slate-50 border p-0.5 rounded-xl text-xs font-bold">
            {[
              { id: 'weight', label: 'Weight' },
              { id: 'waist', label: 'Waist' },
              { id: 'hips', label: 'Hips' },
              { id: 'all', label: 'All Metrics' }
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setActiveMetric(m.id as any)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeMetric === m.id
                    ? 'bg-white text-slate-800 shadow-xs border border-slate-100'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Time range Selector */}
          <div className="flex bg-slate-50 border p-0.5 rounded-xl text-xs font-bold">
            {[
              { id: '7', label: '7 Entries' },
              { id: '15', label: '15 Entries' },
              { id: '30', label: '30 Entries' },
              { id: 'all', label: 'All Time' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTimeRange(t.id as any)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  timeRange === t.id
                    ? 'bg-white text-slate-800 shadow-xs border border-slate-100'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* 2. Key Interactive Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Starting Stats */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col justify-between relative overflow-hidden group">
          <div>
            <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Starting Baseline</span>
            <span className="text-xl font-black text-slate-700 mt-1 block">{startingWeight} kg</span>
          </div>
          <span className="text-[10px] text-slate-400 font-semibold block mt-1.5">
            Logged: {new Date(firstRecord.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>

        {/* Current Weight & BMI status */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col justify-between relative overflow-hidden group">
          <div>
            <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Current Weight</span>
            <span className="text-xl font-black text-slate-800 mt-1 block">{currentWeight} kg</span>
          </div>
          <div className="flex items-center space-x-1.5 mt-1.5">
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${bmiClassification.color}`}>
              BMI: {currentBMI} ({bmiClassification.label})
            </span>
          </div>
        </div>

        {/* Dynamic Change Card */}
        <div className={`rounded-2xl p-4 border flex flex-col justify-between ${
          isLoss 
            ? 'bg-emerald-50/50 border-emerald-100 text-emerald-900' 
            : totalChange === 0 
              ? 'bg-slate-50 border-slate-100 text-slate-800'
              : 'bg-amber-50/40 border-amber-100 text-amber-900'
        }`}>
          <div>
            <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Net Change</span>
            <span className="text-xl font-black mt-1 block flex items-center gap-1">
              <span>{totalChange > 0 ? `+${totalChange}` : totalChange} kg</span>
              {isLoss && <TrendingDown className="w-5 h-5 text-emerald-600 animate-bounce" />}
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 block mt-1.5">
            {isLoss ? '🔥 Burning Steady' : totalChange === 0 ? '⚓ Holding Steady' : '📈 Mass Fluctuations'}
          </span>
        </div>

        {/* Completion Bar Gauge */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col justify-between">
          <div>
            <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Journey Accomplished</span>
            <div className="flex items-baseline space-x-1 mt-1">
              <span className="text-xl font-black text-slate-800">{journeyPercent}%</span>
              <span className="text-[10px] text-slate-400">towards {targetWeight} kg</span>
            </div>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
            <div 
              className="bg-emerald-500 h-full rounded-full" 
              style={{ width: `${journeyPercent}%` }}
            />
          </div>
        </div>

      </div>

      {/* 3. Recharts Composed/Area Chart */}
      <div className="h-72 w-full p-2 bg-slate-50/30 border border-slate-100/70 rounded-3xl relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={filteredData}
            margin={{ top: 15, right: 15, left: -20, bottom: 5 }}
          >
            {/* Soft grid */}
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDateLabel} 
              tick={{ fontSize: 9, fontWeight: 'bold', fill: '#64748b' }} 
              stroke="#cbd5e1"
              dy={5}
            />

            <YAxis 
              domain={['dataMin - 2', 'dataMax + 2']} 
              tick={{ fontSize: 9, fontWeight: 'bold', fill: '#64748b' }} 
              stroke="#cbd5e1"
              dx={-5}
            />

            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1.5, strokeDasharray: '4 4' }} />
            
            {/* Gradients declaration */}
            <defs>
              <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="waistGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="hipsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            {/* Target Weight Reference Line */}
            <ReferenceLine 
              y={targetWeight} 
              stroke="#f43f5e" 
              strokeDasharray="4 4" 
              strokeWidth={1.5}
              label={{ 
                value: `Goal: ${targetWeight} kg`, 
                position: 'insideBottomRight', 
                fill: '#e11d48', 
                fontSize: 9, 
                fontWeight: 'bold',
                dy: -8
              }} 
            />

            {/* Render active metrics */}
            {(activeMetric === 'weight' || activeMetric === 'all') && (
              <Area 
                type="monotone" 
                dataKey="weight" 
                stroke="#10b981" 
                strokeWidth={3} 
                fillOpacity={1}
                fill="url(#weightGradient)"
                activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
                name="Weight"
              />
            )}

            {(activeMetric === 'waist' || activeMetric === 'all') && (
              <Area 
                type="monotone" 
                dataKey="waist" 
                stroke="#f59e0b" 
                strokeWidth={2.5} 
                fillOpacity={1}
                fill="url(#waistGradient)"
                activeDot={{ r: 5, stroke: '#f59e0b', strokeWidth: 2, fill: '#fff' }}
                name="Waist"
              />
            )}

            {(activeMetric === 'hips' || activeMetric === 'all') && (
              <Area 
                type="monotone" 
                dataKey="hips" 
                stroke="#3b82f6" 
                strokeWidth={2.5} 
                fillOpacity={1}
                fill="url(#hipsGradient)"
                activeDot={{ r: 5, stroke: '#3b82f6', strokeWidth: 2, fill: '#fff' }}
                name="Hips"
              />
            )}

          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* 4. Coach Science Insight Banner with high-value motivation */}
      <div className="bg-emerald-50/40 p-4 rounded-2xl border border-emerald-100 flex items-start gap-3 text-xs text-emerald-800 leading-relaxed">
        <div className="bg-emerald-500 text-white p-1.5 rounded-xl shrink-0 mt-0.5">
          <Award className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <p className="font-extrabold text-emerald-900 flex items-center gap-1">
            <span>Coaching Insight</span>
            <Sparkles className="w-3.5 h-3.5 text-yellow-500 animate-spin" style={{ animationDuration: '4s' }} />
          </p>
          <p className="font-medium">{getMotivationalInsight()}</p>
        </div>
      </div>

    </div>
  );
}
