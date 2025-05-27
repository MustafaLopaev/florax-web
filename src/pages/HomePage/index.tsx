'use client';

import type React from 'react';

import { CVImage, InferenceEngine } from 'inferencejs';
import { AlertCircle, Camera, RotateCcw, Upload } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import ProcessinLoading from '@/components/loader/Processing';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// Environment variable for your Roboflow publishable key
const PUBLISHABLE_KEY = 'rf_wfMlQ8YUt1Qc6FVWqoP52p3mdu52';
const MODEL_NAME = 'florax-ai';
const MODEL_VERSION = 4;

type DetectionMode = 'camera' | 'upload' | 'select';

interface Prediction {
  class: string;
  confidence: number;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  color: string;
}

function HomePage() {
  const inferEngine = useMemo(() => new InferenceEngine(), []);

  const [modelWorkerId, setModelWorkerId] = useState<string | null>(null);
  const [modelLoading, setModelLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [mode, setMode] = useState<DetectionMode>('select');
  const [error, setError] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // a ref to mirror it
  const isDetecting = useRef(false);

  // whenever you toggle:
  const setIsDetecting = (status: boolean) => {
    isDetecting.current = status;
  };

  useEffect(() => {
    if (!modelLoading && !modelWorkerId) {
      initializeModel();
    }
  }, []);

  const initializeModel = async () => {
    setModelLoading(true);
    setIsLoading(true);
    setLoadingMessage('Loading AI model, please wait...');
    setError(null);

    try {
      const id = await inferEngine.startWorker(
        MODEL_NAME,
        MODEL_VERSION,
        PUBLISHABLE_KEY
        // configuration
      );
      setModelWorkerId(id);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to load the AI model. Please try again.');
      setIsLoading(false);
      setModelLoading(false);
    }
  };

  const startCamera = async () => {
    if (!modelWorkerId) return;

    setError(null);
    setMode('camera');

    try {
      const constraints = {
        audio: false,
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'environment',
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
        };

        videoRef.current.onplay = () => {
          setupCanvas();
          setIsDetecting(true);
          detectFrame();
        };
      }
    } catch (err) {
      setError('Failed to access camera. Please check permissions.');
    }
  };

  const setupCanvas = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const height = video.videoHeight;
    const width = video.videoWidth;

    video.width = width;
    video.height = height;
    canvas.width = width;
    canvas.height = height;

    if (ctx) {
      ctx.scale(1, 1);
    }
  };

  const detectFrame = async () => {
    if (
      !modelWorkerId ||
      !videoRef.current ||
      !canvasRef.current ||
      !isDetecting.current
    ) {
      setTimeout(detectFrame, 100);
      return;
    }

    try {
      console.log('Detecting frame...');
      const img = new CVImage(videoRef.current);
      const predictions = await inferEngine.infer(modelWorkerId, img);

      drawPredictions(predictions);
      setPredictions(predictions);

      if (isDetecting.current) {
        setTimeout(detectFrame, 100);
      }
    } catch (err) {
      console.error('Detection error:', err);
      setTimeout(detectFrame, 100);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !modelWorkerId) return;

    setMode('upload');
    setError(null);
    setIsDetecting(false);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const img = new Image();
      img.onload = async () => {
        if (imageRef.current && canvasRef.current) {
          imageRef.current.src = img.src;

          // Setup canvas for image
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');

          canvas.width = img.width;
          canvas.height = img.height;

          if (ctx) {
            ctx.drawImage(img, 0, 0);
          }

          // Detect objects in uploaded image
          try {
            const cvImg = new CVImage(img);
            const predictions = await inferEngine.infer(modelWorkerId, cvImg);
            drawPredictions(predictions);
            setPredictions(predictions);
          } catch (err) {
            console.error('Error analyzing image:', err);
            setError('Failed to analyze the image. Please try another image.');
          }
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const drawPredictions = (predictions: Prediction[]) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear previous drawings
    if (mode === 'upload' && imageRef.current) {
      ctx.drawImage(imageRef.current, 0, 0);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Draw predictions
    predictions.forEach((prediction) => {
      const { bbox, class: className, confidence, color } = prediction;

      ctx.strokeStyle = color;
      ctx.lineWidth = 3;

      const x = bbox.x - bbox.width / 2;
      const y = bbox.y - bbox.height / 2;

      // Draw bounding box
      ctx.strokeRect(x, y, bbox.width, bbox.height);

      // Draw label background
      const text = `${className} ${Math.round(confidence * 100)}%`;
      const textMetrics = ctx.measureText(text);

      ctx.fillStyle = color;
      ctx.fillRect(x - 2, y - 30, textMetrics.width + 8, 24);

      // Draw label text
      ctx.fillStyle = 'white';
      ctx.font =
        '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(text, x + 2, y - 10);
    });
  };

  const stopCamera = () => {
    setIsDetecting(false);
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const resetToSelection = () => {
    stopCamera();
    setMode('select');
    setPredictions([]);
    setError(null);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  if (isLoading) {
    return <ProcessinLoading text={loadingMessage} isLoading={true} />;
  }

  if (mode === 'select') {
    return (
      <div className=" w-full h-full bg-gradient-to-br bg-white p-4">
        <div className="text-center mb-8 pt-8">
          <div className="flex flex-row gap-2 items-center justify-center mb-4">
            <img src="/logo.svg" alt="Florax AI Logo" className="w-12 h-12" />
            <h1 className="text-4xl font-bold text-white-900 mb-4">Florax AI</h1>
          </div>
          <p className="text-xl text-black">
            Choose how you want to detect objects
          </p>
        </div>

        {error && (
          <Alert className="mb-6 max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={startCamera}
          >
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Camera className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Live Camera</CardTitle>
              <CardDescription>
                Use your camera for real-time object detection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" size="lg">
                Start Camera Detection
              </Button>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-xl ">Upload Image</CardTitle>
              <CardDescription>
                Upload an image to run a object detection analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full text-white" variant="outline" size="lg">
                Choose Image
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gradient-to-br bg-white  p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {mode === 'camera' ? 'Live Camera Detection' : 'Image Analysis'}
          </h1>
          <Button onClick={resetToSelection} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            Back to Selection
          </Button>
        </div>

        {error && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-4">
                <div className="relative bg-black rounded-lg overflow-hidden">
                  {mode === 'camera' && (
                    <video
                      ref={videoRef}
                      className="w-full h-auto"
                      style={{ maxHeight: '500px' }}
                    />
                  )}
                  {mode === 'upload' && (
                    <img
                      ref={imageRef}
                      className="w-full h-auto "
                      style={{ maxHeight: '500px' }}
                    />
                  )}
                  <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-full h-full"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Detection Results</CardTitle>
                <CardDescription>
                  {predictions.length} object(s) detected
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col overflow-hidden">
                {predictions.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No objects detected yet
                  </p>
                ) : (
                  <div className="space-y-2 flex-1 overflow-y-auto max-h-96">
                    {predictions.map((prediction, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: prediction.color }}
                          />
                          <span className="font-medium text-gray-800">
                            {prediction.class}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {Math.round(prediction.confidence * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {mode === 'camera' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Camera Controls</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => setIsDetecting(!isDetecting.current)}
                    className="w-full"
                    variant={isDetecting.current ? 'destructive' : 'default'}
                  >
                    {isDetecting.current
                      ? 'Pause Detection'
                      : 'Resume Detection'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
