import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import { UserDetailsForm } from '@/components/UserDetailsForm';
import { PostureSelection } from '@/components/PostureSelection';
import { ScanInstructions } from '@/components/ScanInstructions';
import { FaceScanner } from '@/components/FaceScanner';
import { WellnessResults } from '@/components/WellnessResults';
import { UserDetails, WellnessMetrics, AppStep } from '@/types/wellness';
import { calculateWellnessMetrics } from '@/utils/wellnessCalculator';

interface BasicUserDetails {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number;
  weight: number;
}

const Index = () => {
  const [step, setStep] = useState<AppStep>('form');
  const [basicDetails, setBasicDetails] = useState<BasicUserDetails | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [metrics, setMetrics] = useState<WellnessMetrics | null>(null);

  const handleFormSubmit = (details: BasicUserDetails) => {
    setBasicDetails(details);
    setStep('posture');
  };

  const handlePostureSubmit = (posture: 'sitting' | 'standing') => {
    if (basicDetails) {
      setUserDetails({
        ...basicDetails,
        posture,
      });
      setStep('instructions');
    }
  };

  const handleInstructionsStart = () => {
    setStep('scanning');
  };

  const handleScanComplete = () => {
    if (userDetails) {
      const calculatedMetrics = calculateWellnessMetrics(userDetails);
      setMetrics(calculatedMetrics);
      setStep('results');
    }
  };

  const handleReset = () => {
    setStep('form');
    setBasicDetails(null);
    setUserDetails(null);
    setMetrics(null);
  };

  const handleBack = (toStep: AppStep) => {
    setStep(toStep);
  };

  const getStepTitle = () => {
    switch (step) {
      case 'form':
        return (
          <>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
              Discover Your<br />
              <span className="text-transparent bg-clip-text wellness-gradient">Wellness Insights</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Get AI-powered health estimates through advanced facial analysis and demographic data
            </p>
          </>
        );
      case 'posture':
      case 'instructions':
      case 'scanning':
        return (
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Wellness Assessment
          </h1>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-primary/3 to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Activity className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary">AI Wellness Scanner</span>
          </div>
          
          {step !== 'results' && (
            <motion.div
              key={step}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {getStepTitle()}
            </motion.div>
          )}
        </motion.header>

        {/* Progress indicator */}
        {step !== 'form' && step !== 'results' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-lg mx-auto mb-8"
          >
            <div className="flex items-center justify-center gap-2">
              {['posture', 'instructions', 'scanning'].map((s, i) => (
                <div
                  key={s}
                  className={`h-2 rounded-full transition-all ${
                    step === s
                      ? 'w-8 wellness-gradient'
                      : ['posture', 'instructions', 'scanning'].indexOf(step) > i
                      ? 'w-4 bg-primary/50'
                      : 'w-4 bg-muted'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Main Content */}
        <main className="pb-12">
          <AnimatePresence mode="wait">
            {step === 'form' && (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <UserDetailsForm onSubmit={handleFormSubmit} />
              </motion.div>
            )}

            {step === 'posture' && (
              <motion.div
                key="posture"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <PostureSelection
                  onSubmit={handlePostureSubmit}
                  onBack={() => handleBack('form')}
                />
              </motion.div>
            )}

            {step === 'instructions' && userDetails && (
              <motion.div
                key="instructions"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <ScanInstructions
                  userName={userDetails.name.split(' ')[0]}
                  onStart={handleInstructionsStart}
                  onBack={() => handleBack('posture')}
                />
              </motion.div>
            )}

            {step === 'scanning' && userDetails && (
              <motion.div
                key="scanner"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <FaceScanner
                  userName={userDetails.name.split(' ')[0]}
                  onScanComplete={handleScanComplete}
                  onCancel={() => handleBack('instructions')}
                />
              </motion.div>
            )}

            {step === 'results' && userDetails && metrics && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <WellnessResults
                  user={userDetails}
                  metrics={metrics}
                  onReset={handleReset}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center py-6 border-t border-border/50"
        >
          <p className="text-sm text-muted-foreground">
            Powered by AI • For informational purposes only
          </p>
        </motion.footer>
      </div>
    </div>
  );
};

export default Index;
