import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, UserRound, PersonStanding } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface PostureSelectionProps {
  onSubmit: (posture: 'sitting' | 'standing') => void;
  onBack: () => void;
}

export function PostureSelection({ onSubmit, onBack }: PostureSelectionProps) {
  const [posture, setPosture] = useState<'sitting' | 'standing' | null>(null);

  const handleSubmit = () => {
    if (posture) {
      onSubmit(posture);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full max-w-lg mx-auto"
    >
      <div className="glass-card rounded-2xl p-6 shadow-xl">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <h2 className="text-2xl font-display font-bold text-foreground mb-2">
          Posture
        </h2>
        <p className="text-muted-foreground mb-6">
          Please select the posture you were in immediately prior to the assessment:
        </p>

        <RadioGroup
          value={posture || ''}
          onValueChange={(value) => setPosture(value as 'sitting' | 'standing')}
          className="space-y-3"
        >
          <div
            className={`flex items-center space-x-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${
              posture === 'sitting'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => setPosture('sitting')}
          >
            <UserRound className="w-6 h-6 text-foreground" />
            <Label
              htmlFor="sitting"
              className="flex-1 text-lg font-medium cursor-pointer"
            >
              Sitting
            </Label>
            <RadioGroupItem value="sitting" id="sitting" />
          </div>

          <div
            className={`flex items-center space-x-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${
              posture === 'standing'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => setPosture('standing')}
          >
            <PersonStanding className="w-6 h-6 text-foreground" />
            <Label
              htmlFor="standing"
              className="flex-1 text-lg font-medium cursor-pointer"
            >
              Standing
            </Label>
            <RadioGroupItem value="standing" id="standing" />
          </div>
        </RadioGroup>

        <p className="text-sm text-muted-foreground mt-6 mb-6">
          Please select the option that best describes your posture before the
          assessment. This information will help us to better understand your
          physical state during the assessment.
        </p>

        <Button
          onClick={handleSubmit}
          disabled={!posture}
          className="w-full h-12 wellness-gradient text-primary-foreground font-semibold text-base"
        >
          Proceed
        </Button>
      </div>
    </motion.div>
  );
}
