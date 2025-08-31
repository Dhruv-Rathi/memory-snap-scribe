import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, RotateCcw, Download, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const filters = [
  { id: 'none', name: 'Original', style: '' },
  { id: 'vintage', name: 'Vintage', style: 'sepia(0.5) contrast(1.2) brightness(0.9)' },
  { id: 'bw', name: 'B&W', style: 'grayscale(1) contrast(1.1)' },
  { id: 'warm', name: 'Warm', style: 'sepia(0.2) saturate(1.5) hue-rotate(-10deg)' },
  { id: 'cool', name: 'Cool', style: 'saturate(1.2) hue-rotate(20deg) brightness(1.1)' },
  { id: 'dreamy', name: 'Dreamy', style: 'contrast(0.9) brightness(1.1) blur(0.5px)' },
];

export default function CameraPage() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      setStream(mediaStream);
      setIsCameraActive(true);
      
      // Wait for next tick to ensure video element is mounted
      setTimeout(() => {
        if (videoRef.current && mediaStream) {
          videoRef.current.srcObject = mediaStream;
          // Ensure video plays
          videoRef.current.play().catch(e => {
            console.error('Error playing video:', e);
          });
        }
      }, 100);
    } catch (error) {
      console.error('Camera error:', error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive"
      });
    }
  }, [toast]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraActive(false);
    }
  }, [stream]);

  const takePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Apply filter during capture
        const filter = filters.find(f => f.id === selectedFilter);
        if (filter) {
          context.filter = filter.style;
        }
        
        context.drawImage(video, 0, 0);
        const photoUrl = canvas.toDataURL('image/jpeg');
        setPhoto(photoUrl);
        stopCamera();
      }
    }
  }, [selectedFilter, stopCamera]);

  const retakePhoto = () => {
    setPhoto(null);
    startCamera();
  };

  const saveToScrapebook = () => {
    if (photo) {
      // Get existing memories from localStorage
      const existingMemories = JSON.parse(localStorage.getItem('memories') || '[]');
      
      // Create new memory
      const newMemory = {
        id: Date.now().toString(),
        photo,
        date: new Date().toISOString(),
        filter: selectedFilter,
        notes: ''
      };
      
      // Save to localStorage
      const updatedMemories = [newMemory, ...existingMemories];
      localStorage.setItem('memories', JSON.stringify(updatedMemories));
      
      toast({
        title: "Memory Saved! 📸",
        description: "Your photo has been added to your scrapebook",
      });
      
      // Navigate to scrapebook
      navigate('/scrapebook');
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="min-h-screen bg-gradient-paper relative">
      <div className="paper-texture min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card/90 backdrop-blur-sm border-b border-border">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-2xl font-handwritten text-primary flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              Capture a Memory
            </h1>
            {isCameraActive && (
              <Button
                onClick={stopCamera}
                variant="ghost"
                size="icon"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>

        <div className="p-4 max-w-2xl mx-auto">
          {!isCameraActive && !photo ? (
            /* Start Camera View */
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div className="polaroid-frame p-8 animate-scale-in">
                <Camera className="w-24 h-24 text-primary mb-4 animate-float" />
                <h2 className="text-xl font-semibold mb-2">Ready to capture?</h2>
                <p className="text-muted-foreground mb-6">Take a photo with fun filters!</p>
                <Button 
                  onClick={startCamera}
                  size="lg"
                  className="bg-primary hover:bg-primary/90"
                >
                  Open Camera
                </Button>
              </div>
            </div>
          ) : photo ? (
            /* Photo Preview */
            <div className="space-y-4 animate-fade-in">
              <div className="polaroid-frame">
                <img 
                  src={photo} 
                  alt="Captured memory" 
                  className="w-full rounded-sm"
                />
                <p className="mt-3 text-center font-handwritten text-vintage-brown">
                  {new Date().toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
              
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={retakePhoto}
                  variant="outline"
                  className="gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Retake
                </Button>
                <Button
                  onClick={saveToScrapebook}
                  className="gap-2 bg-primary hover:bg-primary/90"
                >
                  <Download className="w-4 h-4" />
                  Save to Scrapebook
                </Button>
              </div>
            </div>
          ) : (
            /* Camera View */
            <div className="space-y-4">
              <div className="relative polaroid-frame overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-sm"
                  style={{ 
                    filter: filters.find(f => f.id === selectedFilter)?.style,
                    transform: 'scaleX(-1)'
                  }}
                />
              </div>

              {/* Filter Selection */}
              <div className="bg-card rounded-lg p-3">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {filters.map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setSelectedFilter(filter.id)}
                      className={`px-4 py-2 rounded-md font-medium transition-all whitespace-nowrap ${
                        selectedFilter === filter.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
                      }`}
                    >
                      {filter.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Capture Button */}
              <div className="flex justify-center">
                <Button
                  onClick={takePhoto}
                  size="lg"
                  className="w-20 h-20 rounded-full bg-primary hover:bg-primary/90 shadow-float"
                >
                  <Camera className="w-8 h-8" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Hidden canvas for photo capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}