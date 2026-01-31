import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FaceDetectionStatus } from '@/types/wellness';

interface FaceScannerProps {
  userName: string;
  onScanComplete: () => void;
  onCancel: () => void;
}

const SCAN_DURATION = 35000; // 35 seconds
const AWARENESS_TIPS = [
  "We burn calories while we are asleep because brain activity requires energy.",
  "During the measurement, please do not speak or move.",
  "Always sleep on your back straight since it allows your neck and spine in a neutral position.",
  "Heart pumps about 2,000 gallons of blood every day.",
  "Your heart beats about 100,000 times every day.",
  "Walking for 30 minutes a day can reduce the risk of heart disease.",
  "Laughing increases blood flow and boosts immunity.",
  "Deep breathing can lower blood pressure and reduce stress.",
  "The human brain uses 20% of the body's total energy.",
  "Drinking water boosts your metabolism by up to 30%.",
];

const VALIDATION_MESSAGES = {
  noFace: "No face detected. Please position your face in the frame.",
  tooFar: "Please move a little bit closer to the screen.",
  tooClose: "You are too close. Please move back slightly.",
  notCentered: "Please center your face in the frame.",
  poorLight: "Poor lighting detected. Please ensure bright, consistent lighting.",
  moving: "Please keep still and avoid movements.",
  lookStraight: "Please look straight at the camera.",
};

export function FaceScanner({ userName, onScanComplete, onCancel }: FaceScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [scanPaused, setScanPaused] = useState(false);
  const [currentTip, setCurrentTip] = useState(0);
  const [faceStatus, setFaceStatus] = useState<FaceDetectionStatus>({
    faceDetected: false,
    faceInFrame: false,
    imageQuality: 'fair',
    message: 'Initializing camera...',
  });
  
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const tipIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    if (tipIntervalRef.current) clearInterval(tipIntervalRef.current);
    if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current);
    stopCamera();
  }, []);

  useEffect(() => {
    startCamera();
    return cleanup;
  }, [cleanup]);

  // Rotate tips every 5 seconds during scanning
  useEffect(() => {
    if (scanning && !scanPaused) {
      tipIntervalRef.current = setInterval(() => {
        setCurrentTip((prev) => (prev + 1) % AWARENESS_TIPS.length);
      }, 5000);
    }
    return () => {
      if (tipIntervalRef.current) clearInterval(tipIntervalRef.current);
    };
  }, [scanning, scanPaused]);

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user', 
          width: { ideal: 640 }, 
          height: { ideal: 480 },
        },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        setError(null);
        startFaceAnalysis();
      }
    } catch (err) {
      setError('Camera access denied. Please allow camera permissions and try again.');
      console.error('Camera error:', err);
    }
  };

  // Simulate face detection and validation
  const startFaceAnalysis = () => {
    analysisIntervalRef.current = setInterval(() => {
      if (!videoRef.current || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      ctx.drawImage(videoRef.current, 0, 0);

      // Analyze image brightness and simulate face detection
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const brightness = calculateBrightness(imageData);
      
      // Simulate face detection with realistic validation
      const simulatedDetection = simulateFaceDetection(brightness);
      setFaceStatus(simulatedDetection);

      // If scanning and face is not properly detected, pause the scan
      if (scanning && (!simulatedDetection.faceDetected || simulatedDetection.imageQuality === 'poor')) {
        setScanPaused(true);
      } else if (scanning && simulatedDetection.faceDetected && simulatedDetection.imageQuality !== 'poor') {
        setScanPaused(false);
      }
    }, 500);
  };

  const calculateBrightness = (imageData: ImageData): number => {
    let sum = 0;
    for (let i = 0; i < imageData.data.length; i += 4) {
      sum += (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
    }
    return sum / (imageData.data.length / 4);
  };

  const simulateFaceDetection = (brightness: number): FaceDetectionStatus => {
    // Simulate various face detection scenarios
    const random = Math.random();
    
    if (brightness < 50) {
      return {
        faceDetected: false,
        faceInFrame: false,
        imageQuality: 'poor',
        message: VALIDATION_MESSAGES.poorLight,
      };
    }

    // 85% chance of good detection in normal conditions
    if (random > 0.15) {
      return {
        faceDetected: true,
        faceInFrame: true,
        imageQuality: brightness > 100 ? 'good' : 'fair',
        message: 'Face detected. Hold steady.',
      };
    }

    // Simulate various validation issues
    const issues = [
      { ...VALIDATION_MESSAGES, key: 'tooFar' },
      { ...VALIDATION_MESSAGES, key: 'notCentered' },
      { ...VALIDATION_MESSAGES, key: 'lookStraight' },
    ];
    const issue = issues[Math.floor(Math.random() * issues.length)];
    
    return {
      faceDetected: true,
      faceInFrame: false,
      imageQuality: 'fair',
      message: VALIDATION_MESSAGES[issue.key as keyof typeof VALIDATION_MESSAGES],
    };
  };

  const startScan = () => {
    if (!faceStatus.faceDetected) {
      setError('Please position your face in the frame before starting the scan.');
      return;
    }

    setScanning(true);
    setProgress(0);
    setScanPaused(false);
    setCurrentTip(0);

    const startTime = Date.now();
    const progressPerTick = 100 / (SCAN_DURATION / 100);

    scanIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        // Don't progress if paused
        if (scanPaused) return prev;

        const newProgress = prev + progressPerTick;
        
        if (newProgress >= 100) {
          if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
          setTimeout(() => {
            cleanup();
            onScanComplete();
          }, 500);
          return 100;
        }
        return newProgress;
      });
    }, 100);
  };

  const handleCancel = () => {
    cleanup();
    onCancel();
  };

  const getStatusColor = () => {
    if (!faceStatus.faceDetected) return 'bg-destructive';
    if (faceStatus.imageQuality === 'poor') return 'bg-destructive';
    if (!faceStatus.faceInFrame) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-lg mx-auto"
    >
      <div className="glass-card rounded-2xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-display font-bold text-foreground">
              Hi, {userName}!
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              {scanning ? 'Scanning in progress...' : 'Position your face in the frame'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-muted">
          {/* Hidden canvas for image analysis */}
          <canvas ref={canvasRef} className="hidden" />
          
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
                className="w-full h-full object-cover scale-x-[-1]"
              />

              {/* Face validation message overlay */}
              <AnimatePresence>
                {cameraActive && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0"
                  >
                    {/* Validation message bar */}
                    <div className={`absolute top-4 left-4 right-4 ${getStatusColor()} rounded-full py-2 px-4`}>
                      <p className="text-white text-center text-sm font-medium">
                        {faceStatus.message}
                      </p>
                    </div>

                    {/* Face guide frame */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        animate={scanning && !scanPaused ? { scale: [1, 1.02, 1] } : {}}
                        transition={{ duration: 1, repeat: Infinity }}
                        className={`w-48 h-60 border-4 rounded-[40%] transition-colors ${
                          scanning && !scanPaused
                            ? 'border-primary'
                            : faceStatus.faceDetected && faceStatus.faceInFrame
                            ? 'border-green-500/70'
                            : 'border-yellow-500/70'
                        }`}
                        style={{
                          boxShadow: scanning && !scanPaused
                            ? '0 0 40px hsl(var(--primary) / 0.4), inset 0 0 40px hsl(var(--primary) / 0.1)'
                            : 'none',
                        }}
                      />
                    </div>

                    {/* Scan line animation */}
                    {scanning && !scanPaused && (
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
                    {['top-12 left-4', 'top-12 right-4', 'bottom-4 left-4', 'bottom-4 right-4'].map(
                      (pos, i) => (
                        <div
                          key={i}
                          className={`absolute ${pos} w-8 h-8`}
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

        {/* Progress bar and scanning info */}
        {scanning && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 space-y-4"
          >
            {/* Scan paused warning */}
            {scanPaused && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 flex items-center gap-2"
              >
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                <p className="text-sm text-destructive font-medium">
                  Scan Paused - {faceStatus.message}
                </p>
              </motion.div>
            )}

            {/* Progress */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">
                  {scanPaused ? 'Waiting for proper positioning...' : 'Analyzing facial features...'}
                </span>
                <span className="text-primary font-semibold">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className={`h-full ${scanPaused ? 'bg-yellow-500' : 'wellness-gradient'}`}
                />
              </div>
            </div>

            {/* Awareness tip */}
            <motion.div
              key={currentTip}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-primary/5 border border-primary/20 rounded-lg p-4"
            >
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm text-foreground/80">{AWARENESS_TIPS[currentTip]}</p>
              </div>
            </motion.div>

            {/* Cancel button */}
            <Button
              variant="outline"
              onClick={handleCancel}
              className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              Cancel Scan
            </Button>
          </motion.div>
        )}

        {/* Start scan button */}
        {cameraActive && !scanning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 space-y-3"
          >
            <Button
              onClick={startScan}
              disabled={!faceStatus.faceDetected}
              className="w-full h-12 wellness-gradient text-primary-foreground font-semibold text-base gap-2 disabled:opacity-50"
            >
              Begin Face Scan
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              The scan will take approximately 30-40 seconds
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
