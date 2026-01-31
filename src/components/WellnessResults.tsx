import { motion } from 'framer-motion';
import { 
  Heart, 
  Activity, 
  Brain, 
  Droplets, 
  Scale, 
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Wind
} from 'lucide-react';
import { UserDetails, WellnessMetrics } from '@/types/wellness';
import { Button } from '@/components/ui/button';

interface WellnessResultsProps {
  user: UserDetails;
  metrics: WellnessMetrics;
  onReset: () => void;
}

const statusColors = {
  normal: 'text-metric-good',
  good: 'text-metric-good',
  low: 'text-metric-good',
  moderate: 'text-metric-moderate',
  elevated: 'text-metric-elevated',
  high: 'text-metric-elevated',
  underweight: 'text-metric-moderate',
  overweight: 'text-metric-moderate',
  obese: 'text-metric-elevated',
};

const statusIcons = {
  normal: CheckCircle2,
  good: CheckCircle2,
  low: CheckCircle2,
  moderate: TrendingUp,
  elevated: AlertTriangle,
  high: AlertTriangle,
  underweight: TrendingUp,
  overweight: TrendingUp,
  obese: AlertTriangle,
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function WellnessResults({ user, metrics, onReset }: WellnessResultsProps) {
  const bpStatusIcon = statusIcons[metrics.bloodPressure.status];
  const hrStatusIcon = statusIcons[metrics.heartRate.status];
  const stressStatusIcon = statusIcons[metrics.stressLevel.status];
  const bmiStatusIcon = statusIcons[metrics.bmi.status];
  const respStatusIcon = statusIcons[metrics.respiratoryRate.status];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-2xl mx-auto px-4"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-20 h-20 mx-auto mb-4 rounded-full wellness-gradient flex items-center justify-center wellness-glow">
          <Activity className="w-10 h-10 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Wellness Analysis
        </h1>
        <p className="text-muted-foreground mt-2">
          Estimated metrics for {user.name}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Posture: <span className="capitalize font-medium text-foreground">{user.posture}</span>
        </p>
      </motion.div>

      {/* Metrics Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* Blood Pressure */}
        <motion.div variants={item} className="glass-card rounded-xl p-5 shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-metric-bp/15 flex items-center justify-center">
                <Droplets className="w-6 h-6 text-metric-bp" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Blood Pressure</h3>
                <p className="text-sm text-muted-foreground">Estimated range</p>
              </div>
            </div>
            {(() => {
              const Icon = bpStatusIcon;
              return <Icon className={`w-5 h-5 ${statusColors[metrics.bloodPressure.status]}`} />;
            })()}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-display font-bold text-foreground">
              {metrics.bloodPressure.systolic.min}-{metrics.bloodPressure.systolic.max}
            </span>
            <span className="text-muted-foreground">/</span>
            <span className="text-xl font-display font-semibold text-foreground">
              {metrics.bloodPressure.diastolic.min}-{metrics.bloodPressure.diastolic.max}
            </span>
            <span className="text-sm text-muted-foreground">mmHg</span>
          </div>
          <div className={`mt-2 text-sm font-medium capitalize ${statusColors[metrics.bloodPressure.status]}`}>
            {metrics.bloodPressure.status}
          </div>
        </motion.div>

        {/* Heart Rate */}
        <motion.div variants={item} className="glass-card rounded-xl p-5 shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-metric-heart/15 flex items-center justify-center">
                <Heart className="w-6 h-6 text-metric-heart" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Heart Rate</h3>
                <p className="text-sm text-muted-foreground">Resting estimate</p>
              </div>
            </div>
            {(() => {
              const Icon = hrStatusIcon;
              return <Icon className={`w-5 h-5 ${statusColors[metrics.heartRate.status]}`} />;
            })()}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-display font-bold text-foreground">
              {metrics.heartRate.min}-{metrics.heartRate.max}
            </span>
            <span className="text-sm text-muted-foreground">BPM</span>
          </div>
          <div className={`mt-2 text-sm font-medium capitalize ${statusColors[metrics.heartRate.status]}`}>
            {metrics.heartRate.status}
          </div>
        </motion.div>

        {/* Stress Level */}
        <motion.div variants={item} className="glass-card rounded-xl p-5 shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-metric-stress/15 flex items-center justify-center">
                <Brain className="w-6 h-6 text-metric-stress" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Stress Level</h3>
                <p className="text-sm text-muted-foreground">Facial analysis</p>
              </div>
            </div>
            {(() => {
              const Icon = stressStatusIcon;
              return <Icon className={`w-5 h-5 ${statusColors[metrics.stressLevel.status]}`} />;
            })()}
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-display font-bold text-foreground">
              {metrics.stressLevel.value}
            </span>
            <span className="text-sm text-muted-foreground">/ 100</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${metrics.stressLevel.value}%` }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className={`h-full rounded-full ${
                metrics.stressLevel.status === 'low'
                  ? 'bg-metric-good'
                  : metrics.stressLevel.status === 'moderate'
                  ? 'bg-metric-moderate'
                  : 'bg-metric-elevated'
              }`}
            />
          </div>
          <div className={`mt-2 text-sm font-medium capitalize ${statusColors[metrics.stressLevel.status]}`}>
            {metrics.stressLevel.status}
          </div>
        </motion.div>

        {/* BMI */}
        <motion.div variants={item} className="glass-card rounded-xl p-5 shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
                <Scale className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">BMI</h3>
                <p className="text-sm text-muted-foreground">Body Mass Index</p>
              </div>
            </div>
            {(() => {
              const Icon = bmiStatusIcon;
              return <Icon className={`w-5 h-5 ${statusColors[metrics.bmi.status]}`} />;
            })()}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-display font-bold text-foreground">
              {metrics.bmi.value}
            </span>
            <span className="text-sm text-muted-foreground">kg/m²</span>
          </div>
          <div className={`mt-2 text-sm font-medium capitalize ${statusColors[metrics.bmi.status]}`}>
            {metrics.bmi.status.replace('weight', ' weight')}
          </div>
        </motion.div>

        {/* Respiratory Rate */}
        <motion.div variants={item} className="glass-card rounded-xl p-5 shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-accent/15 flex items-center justify-center">
                <Wind className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Respiratory Rate</h3>
                <p className="text-sm text-muted-foreground">Breaths per minute</p>
              </div>
            </div>
            {(() => {
              const Icon = respStatusIcon;
              return <Icon className={`w-5 h-5 ${statusColors[metrics.respiratoryRate.status]}`} />;
            })()}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-display font-bold text-foreground">
              {metrics.respiratoryRate.min}-{metrics.respiratoryRate.max}
            </span>
            <span className="text-sm text-muted-foreground">breaths/min</span>
          </div>
          <div className={`mt-2 text-sm font-medium capitalize ${statusColors[metrics.respiratoryRate.status]}`}>
            {metrics.respiratoryRate.status}
          </div>
        </motion.div>

        {/* Oxygen Saturation */}
        <motion.div variants={item} className="glass-card rounded-xl p-5 shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-metric-heart/15 flex items-center justify-center">
                <Activity className="w-6 h-6 text-metric-heart" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Oxygen Saturation</h3>
                <p className="text-sm text-muted-foreground">SpO₂ estimate</p>
              </div>
            </div>
            <CheckCircle2 className="w-5 h-5 text-metric-good" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-display font-bold text-foreground">
              {metrics.oxygenSaturation.min}-{metrics.oxygenSaturation.max}
            </span>
            <span className="text-sm text-muted-foreground">%</span>
          </div>
          <div className="mt-2 text-sm font-medium text-metric-good">
            Normal
          </div>
        </motion.div>
      </motion.div>

      {/* Disclaimer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-6 p-4 bg-muted/50 rounded-xl border border-border"
      >
        <p className="text-sm text-muted-foreground text-center">
          <strong>Disclaimer:</strong> These metrics are AI-estimated based on demographic data and facial analysis. 
          They are for informational purposes only and should not be used for medical diagnosis. 
          Consult a healthcare professional for accurate measurements.
        </p>
      </motion.div>

      {/* Reset Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="mt-8 flex justify-center"
      >
        <Button
          onClick={onReset}
          variant="outline"
          size="lg"
          className="gap-2 border-primary/30 hover:bg-primary/5"
        >
          <RefreshCw className="w-5 h-5" />
          Start New Analysis
        </Button>
      </motion.div>
    </motion.div>
  );
}
