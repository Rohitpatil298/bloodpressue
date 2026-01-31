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
  
  // Small variance for realistic readings (±2%)
  const smallVariance = () => 1 + (Math.random() - 0.5) * 0.04;

  // Blood pressure calculation with posture consideration
  const baseSystolic = (110 + (user.age * 0.4) + (bmi > 25 ? 8 : 0)) * postureModifier * genderModifier;
  const baseDiastolic = (70 + (user.age * 0.25) + (bmi > 25 ? 5 : 0)) * postureModifier;
  
  const systolic = Math.round(baseSystolic * smallVariance());
  const diastolic = Math.round(baseDiastolic * smallVariance());

  let bpStatus: 'normal' | 'elevated' | 'high' = 'normal';
  if (systolic > 140 || diastolic > 90) bpStatus = 'high';
  else if (systolic > 130 || diastolic > 85) bpStatus = 'elevated';

  // Heart rate with posture consideration (standing typically higher)
  const baseHeartRate = (72 + (user.posture === 'standing' ? 5 : 0) - (user.age > 40 ? 3 : 0) + (bmi > 25 ? 6 : 0)) * genderModifier;
  const heartRate = Math.round(baseHeartRate * smallVariance());
  
  let hrStatus: 'low' | 'normal' | 'elevated' = 'normal';
  if (heartRate > 100) hrStatus = 'elevated';
  else if (heartRate < 60) hrStatus = 'low';

  // Stress level based on multiple factors
  const baseStress = 25 + (user.age > 35 ? 12 : 0) + (bmi > 28 ? 8 : 0) + (user.posture === 'standing' ? 5 : 0);
  const stressValue = Math.min(100, Math.max(0, Math.round(baseStress + (Math.random() * 10 - 5))));
  
  let stressStatus: 'low' | 'moderate' | 'high' = 'low';
  if (stressValue > 60) stressStatus = 'high';
  else if (stressValue > 35) stressStatus = 'moderate';

  // Oxygen saturation (typically stable 96-99%)
  const oxygenValue = 97 + Math.round(Math.random() * 2);

  // BMI status
  let bmiStatus: 'underweight' | 'normal' | 'overweight' | 'obese' = 'normal';
  if (bmi < 18.5) bmiStatus = 'underweight';
  else if (bmi >= 25 && bmi < 30) bmiStatus = 'overweight';
  else if (bmi >= 30) bmiStatus = 'obese';

  // Respiratory rate (12-20 breaths/min normal)
  const baseRespRate = 14 + (user.age > 50 ? 2 : 0) + (bmi > 30 ? 2 : 0) + (user.posture === 'standing' ? 1 : 0);
  const respRate = Math.round(baseRespRate * smallVariance());
  
  let respStatus: 'low' | 'normal' | 'elevated' = 'normal';
  if (respRate > 20) respStatus = 'elevated';
  else if (respRate < 12) respStatus = 'low';

  return {
    bloodPressure: {
      systolic,
      diastolic,
      status: bpStatus,
    },
    heartRate: {
      value: heartRate,
      status: hrStatus,
    },
    stressLevel: {
      value: stressValue,
      status: stressStatus,
    },
    oxygenSaturation: {
      value: oxygenValue,
    },
    bmi: {
      value: Math.round(bmi * 10) / 10,
      status: bmiStatus,
    },
    respiratoryRate: {
      value: respRate,
      status: respStatus,
    },
  };
}
