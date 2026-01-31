import { motion } from 'framer-motion';
import { ArrowLeft, Sun, Glasses, Move, Circle, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ScanInstructionsProps {
  userName: string;
  onStart: () => void;
  onBack: () => void;
}

const instructions = [
  {
    icon: Sun,
    text: 'The ambient light should be bright and consistent and must be white.',
  },
  {
    icon: Glasses,
    text: 'Remove your masks, eye-wear, or clothing obstructing the face for the duration of the scan.',
  },
  {
    icon: Move,
    text: 'Keep your face and phone steady to avoid movements during the scan.',
  },
  {
    icon: Circle,
    text: 'Make sure your face is mostly covered by the scanning frame.',
  },
  {
    icon: Camera,
    text: 'If prompted, allow the camera permission.',
  },
];

export function ScanInstructions({ userName, onStart, onBack }: ScanInstructionsProps) {
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

        <h2 className="text-2xl font-display font-bold text-foreground mb-6">
          Instructions
        </h2>

        <div className="bg-muted/50 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-center mb-4">Face scan</h3>
          
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border-4 border-primary/30">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center">
                <span className="text-2xl">👤</span>
              </div>
            </div>
          </div>

          <ul className="space-y-4">
            {instructions.map((instruction, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <instruction.icon className="w-3.5 h-3.5 text-primary" />
                </div>
                <p className="text-sm text-foreground/80">{instruction.text}</p>
              </motion.li>
            ))}
          </ul>
        </div>

        <Button
          onClick={onStart}
          className="w-full h-12 wellness-gradient text-primary-foreground font-semibold text-base"
        >
          Scan Now
        </Button>

        <p className="text-xs text-muted-foreground text-center mt-4">
          <span className="font-semibold">Disclaimer</span> - For Investigational Use Only. 
          Results are estimates and should not replace professional medical advice.
        </p>
      </div>
    </motion.div>
  );
}
