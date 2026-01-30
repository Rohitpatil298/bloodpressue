import { UserDetails, WellnessMetrics } from '@/types/wellness';

export function calculateWellnessMetrics(user: UserDetails): WellnessMetrics {
  const bmi = user.weight / Math.pow(user.height / 100, 2);
  
  // Simulate facial analysis factors (in real app, this would come from ML model)
  const ageFactor = user.age / 100;
  const bmiFactor = bmi > 25 ? 1.1 : bmi < 18.5 ? 0.95 : 1;
  const randomVariance = () => (Math.random() - 0.5) * 0.1;

  // Estimate blood pressure based on age, BMI, and simulated facial features
  const baseSystolic = 100 + (user.age * 0.5) + (bmi > 25 ? 10 : 0);
  const baseDiastolic = 60 + (user.age * 0.3) + (bmi > 25 ? 5 : 0);
  
  const systolicMin = Math.round(baseSystolic * (0.95 + randomVariance()));
  const systolicMax = Math.round(baseSystolic * (1.08 + randomVariance()));
  const diastolicMin = Math.round(baseDiastolic * (0.95 + randomVariance()));
  const diastolicMax = Math.round(baseDiastolic * (1.08 + randomVariance()));

  let bpStatus: 'normal' | 'elevated' | 'high' = 'normal';
  if (systolicMax > 140 || diastolicMax > 90) bpStatus = 'high';
  else if (systolicMax > 130 || diastolicMax > 85) bpStatus = 'elevated';

  // Estimate heart rate
  const baseHeartRate = 70 - (user.age > 40 ? 5 : 0) + (bmi > 25 ? 8 : 0);
  const heartRateMin = Math.round(baseHeartRate * (0.9 + randomVariance()));
  const heartRateMax = Math.round(baseHeartRate * (1.15 + randomVariance()));
  
  let hrStatus: 'low' | 'normal' | 'elevated' = 'normal';
  if (heartRateMax > 100) hrStatus = 'elevated';
  else if (heartRateMin < 60) hrStatus = 'low';

  // Simulate stress level from facial features
  const baseStress = 30 + (user.age > 35 ? 15 : 0) + (bmi > 28 ? 10 : 0);
  const stressValue = Math.min(100, Math.max(0, Math.round(baseStress + (Math.random() * 20 - 10))));
  
  let stressStatus: 'low' | 'moderate' | 'high' = 'low';
  if (stressValue > 60) stressStatus = 'high';
  else if (stressValue > 35) stressStatus = 'moderate';

  // Oxygen saturation (simulated normal range)
  const o2Min = 96 + Math.round(Math.random() * 2);
  const o2Max = Math.min(100, o2Min + 2);

  // BMI status
  let bmiStatus: 'underweight' | 'normal' | 'overweight' | 'obese' = 'normal';
  if (bmi < 18.5) bmiStatus = 'underweight';
  else if (bmi >= 25 && bmi < 30) bmiStatus = 'overweight';
  else if (bmi >= 30) bmiStatus = 'obese';

  return {
    bloodPressure: {
      systolic: { min: systolicMin, max: systolicMax },
      diastolic: { min: diastolicMin, max: diastolicMax },
      status: bpStatus,
    },
    heartRate: {
      min: heartRateMin,
      max: heartRateMax,
      status: hrStatus,
    },
    stressLevel: {
      value: stressValue,
      status: stressStatus,
    },
    oxygenSaturation: {
      min: o2Min,
      max: o2Max,
    },
    bmi: {
      value: Math.round(bmi * 10) / 10,
      status: bmiStatus,
    },
  };
}
