import { UserDetails, WellnessMetrics } from '@/types/wellness';

export function calculateWellnessMetrics(user: UserDetails): WellnessMetrics {
  const bmi = user.weight / Math.pow(user.height / 100, 2);
  
  // Posture affects blood pressure readings
  const postureModifier = user.posture === 'standing' ? 1.05 : 1;
  
  // Age and BMI factors for calculations
  const ageFactor = Math.min(user.age / 100, 1);
  const bmiFactor = bmi > 25 ? 1.1 : bmi < 18.5 ? 0.95 : 1;
  
  // Gender-specific adjustments
  const genderModifier = user.gender === 'male' ? 1.02 : user.gender === 'female' ? 0.98 : 1;
  
  // Simulated variance for realistic ranges
  const randomVariance = () => (Math.random() - 0.5) * 0.08;

  // Blood pressure calculation with posture consideration
  const baseSystolic = (110 + (user.age * 0.4) + (bmi > 25 ? 8 : 0)) * postureModifier * genderModifier;
  const baseDiastolic = (70 + (user.age * 0.25) + (bmi > 25 ? 5 : 0)) * postureModifier;
  
  const systolicMin = Math.round(baseSystolic * (0.95 + randomVariance()));
  const systolicMax = Math.round(baseSystolic * (1.06 + randomVariance()));
  const diastolicMin = Math.round(baseDiastolic * (0.95 + randomVariance()));
  const diastolicMax = Math.round(baseDiastolic * (1.06 + randomVariance()));

  let bpStatus: 'normal' | 'elevated' | 'high' = 'normal';
  if (systolicMax > 140 || diastolicMax > 90) bpStatus = 'high';
  else if (systolicMax > 130 || diastolicMax > 85) bpStatus = 'elevated';

  // Heart rate with posture consideration (standing typically higher)
  const baseHeartRate = (72 + (user.posture === 'standing' ? 5 : 0) - (user.age > 40 ? 3 : 0) + (bmi > 25 ? 6 : 0)) * genderModifier;
  const heartRateMin = Math.round(baseHeartRate * (0.88 + randomVariance()));
  const heartRateMax = Math.round(baseHeartRate * (1.12 + randomVariance()));
  
  let hrStatus: 'low' | 'normal' | 'elevated' = 'normal';
  if (heartRateMax > 100) hrStatus = 'elevated';
  else if (heartRateMin < 60) hrStatus = 'low';

  // Stress level based on multiple factors
  const baseStress = 25 + (user.age > 35 ? 12 : 0) + (bmi > 28 ? 8 : 0) + (user.posture === 'standing' ? 5 : 0);
  const stressValue = Math.min(100, Math.max(0, Math.round(baseStress + (Math.random() * 15 - 7))));
  
  let stressStatus: 'low' | 'moderate' | 'high' = 'low';
  if (stressValue > 60) stressStatus = 'high';
  else if (stressValue > 35) stressStatus = 'moderate';

  // Oxygen saturation (typically stable)
  const o2Min = 96 + Math.round(Math.random() * 2);
  const o2Max = Math.min(100, o2Min + 2);

  // BMI status
  let bmiStatus: 'underweight' | 'normal' | 'overweight' | 'obese' = 'normal';
  if (bmi < 18.5) bmiStatus = 'underweight';
  else if (bmi >= 25 && bmi < 30) bmiStatus = 'overweight';
  else if (bmi >= 30) bmiStatus = 'obese';

  // Respiratory rate (12-20 breaths/min normal)
  const baseRespRate = 14 + (user.age > 50 ? 2 : 0) + (bmi > 30 ? 2 : 0) + (user.posture === 'standing' ? 1 : 0);
  const respRateMin = Math.round(baseRespRate * (0.9 + randomVariance()));
  const respRateMax = Math.round(baseRespRate * (1.15 + randomVariance()));
  
  let respStatus: 'low' | 'normal' | 'elevated' = 'normal';
  if (respRateMax > 20) respStatus = 'elevated';
  else if (respRateMin < 12) respStatus = 'low';

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
    respiratoryRate: {
      min: respRateMin,
      max: respRateMax,
      status: respStatus,
    },
  };
}
