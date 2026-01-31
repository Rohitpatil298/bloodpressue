import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, Lightbulb, Camera } from 'lucide-react';
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
  ready: "Face detected. Hold steady.",
  scanning: "Scanning in progress. Please remain still.",
};

export function FaceScanner({ userName, onScanComplete, onCancel }: FaceScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [currentTip, setCurrentTip] = useState(0);
  const [faceStatus, setFaceStatus] = useState<FaceDetectionStatus>({
    faceDetected: false,
    faceInFrame: false,
    imageQuality: 'fair',
    message: 'Initializing camera...',
  });
  
  // Use refs to track current state in intervals (avoids closure issues)
  const scanPausedRef = useRef(false);
  const scanningRef = useRef(false);
  const progressRef = useRef(0);
  
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const tipIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update ref when scanning changes
  useEffect(() => {
    scanningRef.current = scanning;
  }, [scanning]);

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
    if (scanning && !scanPausedRef.current) {
      tipIntervalRef.current = setInterval(() => {
        setCurrentTip((prev) => (prev + 1) % AWARENESS_TIPS.length);
      }, 5000);
    }
    return () => {
      if (tipIntervalRef.current) clearInterval(tipIntervalRef.current);
    };
  }, [scanning]);

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
          width: { ideal: 1280 }, 
          height: { ideal: 720 },
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
      const motionLevel = detectMotion(imageData);
      
      // Simulate face detection with realistic validation
      const simulatedDetection = simulateFaceDetection(brightness, motionLevel);
      setFaceStatus(simulatedDetection);

      // Update the pause ref based on detection quality
      const shouldPause = !simulatedDetection.faceDetected || 
                          !simulatedDetection.faceInFrame || 
                          simulatedDetection.imageQuality === 'poor';
      scanPausedRef.current = shouldPause;
    }, 300);
  };

  const calculateBrightness = (imageData: ImageData): number => {
    let sum = 0;
    const step = 20; // Sample every 20th pixel for performance
    for (let i = 0; i < imageData.data.length; i += 4 * step) {
      sum += (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
    }
    return sum / (imageData.data.length / (4 * step));
  };

  // Simple motion detection based on frame differences
  const previousFrameRef = useRef<Uint8ClampedArray | null>(null);
  const detectMotion = (imageData: ImageData): number => {
    if (!previousFrameRef.current) {
      previousFrameRef.current = new Uint8ClampedArray(imageData.data);
      return 0;
    }
    
    let diff = 0;
    const step = 40;
    for (let i = 0; i < imageData.data.length; i += 4 * step) {
      diff += Math.abs(imageData.data[i] - previousFrameRef.current[i]);
    }
    previousFrameRef.current = new Uint8ClampedArray(imageData.data);
    return diff / (imageData.data.length / (4 * step));
  };

  const simulateFaceDetection = (brightness: number, motionLevel: number): FaceDetectionStatus => {
    // Check for poor lighting
    if (brightness < 40) {
      return {
        faceDetected: false,
        faceInFrame: false,
        imageQuality: 'poor',
        message: VALIDATION_MESSAGES.poorLight,
      };
    }

    // Check for excessive motion
    if (motionLevel > 15) {
      return {
        faceDetected: true,
        faceInFrame: false,
        imageQuality: 'fair',
        message: VALIDATION_MESSAGES.moving,
      };
    }

    // Simulate various face detection scenarios (higher success rate for good conditions)
    const random = Math.random();
    
    // 90% chance of good detection in normal conditions
    if (random > 0.10) {
      const quality = brightness > 80 ? 'good' : 'fair';
      return {
        faceDetected: true,
        faceInFrame: true,
        imageQuality: quality,
        message: scanningRef.current ? VALIDATION_MESSAGES.scanning : VALIDATION_MESSAGES.ready,
      };
    }

    // Simulate occasional validation issues
    const issues = ['tooFar', 'notCentered', 'lookStraight'] as const;
    const issue = issues[Math.floor(Math.random() * issues.length)];
    
    return {
      faceDetected: true,
      faceInFrame: false,
      imageQuality: 'fair',
      message: VALIDATION_MESSAGES[issue],
    };
  };

  const startScan = () => {
    if (!faceStatus.faceDetected || !faceStatus.faceInFrame) {
      setError('Please position your face properly in the frame before starting the scan.');
      return;
    }

    setScanning(true);
    scanningRef.current = true;
    setProgress(0);
    progressRef.current = 0;
    scanPausedRef.current = false;
    setCurrentTip(0);

    const progressPerTick = 100 / (SCAN_DURATION / 100);

    scanIntervalRef.current = setInterval(() => {
      // Check if paused using ref (not closure)
      if (scanPausedRef.current) {
        return; // Don't update progress when paused
      }

      progressRef.current += progressPerTick;
      setProgress(progressRef.current);
      
      if (progressRef.current >= 100) {
        if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
        setTimeout(() => {
          cleanup();
          onScanComplete();
        }, 500);
      }
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

  const getStatusBorderColor = () => {
    if (!faceStatus.faceDetected) return 'border-destructive';
    if (faceStatus.imageQuality === 'poor') return 'border-destructive';
    if (!faceStatus.faceInFrame) return 'border-yellow-500';
    return 'border-green-500';
  };

  const isPaused = scanPausedRef.current && scanning;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full h-full flex flex-col"
    >
      {/* Hidden canvas for image analysis */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header with cancel button */}
      <div className="flex justify-between items-center p-4 pb-2">
        <div>
          <h2 className="text-xl font-display font-bold text-foreground">
            Hi, {userName}!
          </h2>
          <p className="text-muted-foreground text-sm">
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

      {/* Validation message bar - above camera */}
      <div className="px-4 pb-3">
        <motion.div 
          key={faceStatus.message}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${getStatusColor()} rounded-xl py-3 px-4`}
        >
          <p className="text-white text-center text-sm font-medium">
            {faceStatus.message}
          </p>
        </motion.div>
      </div>

      {/* Camera view - Full width */}
      <div className="flex-1 px-4 min-h-0">
        <div className={`relative w-full h-full rounded-2xl overflow-hidden border-4 ${getStatusBorderColor()} transition-colors`}>
          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-muted">
              <AlertCircle className="w-12 h-12 text-destructive mb-4" />
              <p className="text-destructive font-medium">{error}</p>
              <Button onClick={startCamera} className="mt-4" variant="outline">
                <Camera className="w-4 h-4 mr-2" />
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

              {/* Face validation overlay */}
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
                        animate={scanning && !scanPausedRef.current ? { scale: [1, 1.02, 1] } : {}}
                        transition={{ duration: 1, repeat: Infinity }}
                        className={`w-56 h-72 sm:w-64 sm:h-80 border-4 rounded-[40%] transition-colors ${
                          scanning && !scanPausedRef.current
                            ? 'border-primary'
                            : faceStatus.faceDetected && faceStatus.faceInFrame
                            ? 'border-green-500/70'
                            : 'border-yellow-500/70'
                        }`}
                        style={{
                          boxShadow: scanning && !scanPausedRef.current
                            ? '0 0 40px hsl(var(--primary) / 0.4), inset 0 0 40px hsl(var(--primary) / 0.1)'
                            : 'none',
                        }}
                      />
                    </div>

                    {/* Scan line animation */}
                    {scanning && !scanPausedRef.current && (
                      <motion.div
                        initial={{ top: '15%' }}
                        animate={{ top: ['15%', '80%', '15%'] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute left-1/2 -translate-x-1/2 w-52 sm:w-60 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
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
                          className={`absolute ${pos} w-10 h-10`}
                          style={{
                            borderWidth: '4px',
                            borderStyle: 'solid',
                            borderColor: 'transparent',
                            borderTopColor: i < 2 ? 'hsl(var(--primary))' : 'transparent',
                            borderBottomColor: i >= 2 ? 'hsl(var(--primary))' : 'transparent',
                            borderLeftColor: i % 2 === 0 ? 'hsl(var(--primary))' : 'transparent',
                            borderRightColor: i % 2 === 1 ? 'hsl(var(--primary))' : 'transparent',
                            borderRadius: '8px',
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
      </div>

      {/* Bottom section - Progress/Tips/Buttons */}
      <div className="p-4 space-y-4">
        {scanning ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Scan paused warning */}
            {scanPausedRef.current && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 flex items-center gap-2"
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
                  {scanPausedRef.current ? 'Waiting for proper positioning...' : 'Analyzing facial features...'}
                </span>
                <span className="text-primary font-semibold">{Math.round(progress)}%</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className={`h-full transition-colors ${scanPausedRef.current ? 'bg-yellow-500' : 'wellness-gradient'}`}
                />
              </div>
            </div>

            {/* Awareness tip */}
            <motion.div
              key={currentTip}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-primary/5 border border-primary/20 rounded-xl p-4"
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
        ) : (
          cameraActive && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              <Button
                onClick={startScan}
                disabled={!faceStatus.faceDetected || !faceStatus.faceInFrame}
                className="w-full h-14 wellness-gradient text-primary-foreground font-semibold text-lg gap-2 disabled:opacity-50"
              >
                Begin Face Scan
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                The scan will take approximately 35 seconds. Please remain still.
              </p>
            </motion.div>
          )
        )}
      </div>
    </motion.div>
  );
}
