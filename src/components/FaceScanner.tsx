import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Scan, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FaceScannerProps {
  userName: string;
  onScanComplete: () => void;
}

export function FaceScanner({ userName, onScanComplete }: FaceScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        setError(null);
      }
    } catch (err) {
      setError('Camera access denied. Please allow camera permissions and try again.');
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  const startScan = () => {
    setScanning(true);
    setProgress(0);

    // Simulate scanning progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            stopCamera();
            onScanComplete();
          }, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 60);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-lg mx-auto"
    >
      <div className="glass-card rounded-2xl p-6 shadow-xl">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-display font-bold text-foreground">
            Hi, {userName}!
          </h2>
          <p className="text-muted-foreground mt-1">
            Position your face in the frame for analysis
          </p>
        </div>

        <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-muted">
          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <AlertCircle className="w-12 h-12 text-destructive mb-4" />
              <p className="text-destructive font-medium">{error}</p>
              <Button onClick={startCamera} className="mt-4" variant="outline">
                Try Again
              </Button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Scanning overlay */}
              <AnimatePresence>
                {cameraActive && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0"
                  >
                    {/* Face guide frame */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        animate={scanning ? { scale: [1, 1.02, 1] } : {}}
                        transition={{ duration: 1, repeat: Infinity }}
                        className={`w-48 h-60 border-4 rounded-[40%] ${
                          scanning ? 'border-primary' : 'border-primary/50'
                        }`}
                        style={{
                          boxShadow: scanning
                            ? '0 0 40px hsl(var(--primary) / 0.4), inset 0 0 40px hsl(var(--primary) / 0.1)'
                            : 'none',
                        }}
                      />
                    </div>

                    {/* Scan line animation */}
                    {scanning && (
                      <motion.div
                        initial={{ top: '20%' }}
                        animate={{ top: ['20%', '75%', '20%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute left-1/2 -translate-x-1/2 w-44 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
                        style={{
                          boxShadow: '0 0 20px hsl(var(--primary)), 0 0 40px hsl(var(--primary) / 0.5)',
                        }}
                      />
                    )}

                    {/* Corner markers */}
                    {['top-4 left-4', 'top-4 right-4', 'bottom-4 left-4', 'bottom-4 right-4'].map(
                      (pos, i) => (
                        <div
                          key={i}
                          className={`absolute ${pos} w-8 h-8 ${
                            scanning ? 'border-primary' : 'border-primary/60'
                          }`}
                          style={{
                            borderWidth: '3px',
                            borderStyle: 'solid',
                            borderColor: 'transparent',
                            borderTopColor: i < 2 ? 'hsl(var(--primary))' : 'transparent',
                            borderBottomColor: i >= 2 ? 'hsl(var(--primary))' : 'transparent',
                            borderLeftColor: i % 2 === 0 ? 'hsl(var(--primary))' : 'transparent',
                            borderRightColor: i % 2 === 1 ? 'hsl(var(--primary))' : 'transparent',
                            borderRadius: '4px',
                          }}
                        />
                      )
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>

        {/* Progress bar */}
        {scanning && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4"
          >
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Analyzing facial features...</span>
              <span className="text-primary font-semibold">{progress}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full wellness-gradient"
              />
            </div>
          </motion.div>
        )}

        {/* Action button */}
        {cameraActive && !scanning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6"
          >
            <Button
              onClick={startScan}
              className="w-full h-12 wellness-gradient text-primary-foreground font-semibold text-base gap-2"
            >
              <Scan className="w-5 h-5" />
              Begin Face Scan
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
