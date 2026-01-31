export interface UserDetails {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number; // in cm
  weight: number; // in kg
  posture: 'sitting' | 'standing';
}

export interface WellnessMetrics {
  bloodPressure: {
    systolic: { min: number; max: number };
    diastolic: { min: number; max: number };
    status: 'normal' | 'elevated' | 'high';
  };
  heartRate: {
    min: number;
    max: number;
    status: 'low' | 'normal' | 'elevated';
  };
  stressLevel: {
    value: number; // 0-100
    status: 'low' | 'moderate' | 'high';
  };
  oxygenSaturation: {
    min: number;
    max: number;
  };
  bmi: {
    value: number;
    status: 'underweight' | 'normal' | 'overweight' | 'obese';
  };
  respiratoryRate: {
    min: number;
    max: number;
    status: 'low' | 'normal' | 'elevated';
  };
}

export type AppStep = 'form' | 'posture' | 'instructions' | 'scanning' | 'results';

export interface FaceDetectionStatus {
  faceDetected: boolean;
  faceInFrame: boolean;
  imageQuality: 'poor' | 'fair' | 'good';
  message: string;
}
