'use client';

import type React from 'react';
import { useState, useRef, useMemo } from 'react';
import {
  AlertCircle,
  Upload,
  ShoppingCart,
  RotateCcw,
  Loader2,
  CheckCircle,
} from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { predictFlowerRoboflowApi } from './api/predict-flower';
import { PRICE_DICTIONARY, type GroupedPrediction } from '../LoadModelLocal';
import type { Prediction, Predictions } from './types';

// Add this import at the top

// Replace the existing PRICE_DICTIONARY constant with the imported one
// Hardcoded price dictionary for different object classes

const DETECTION_COLORS = [
  '#e6194b',
  '#3cb44b',
  '#ffe119',
  '#0082c8',
  '#f58231',
  '#911eb4',
  '#46f0f0',
  '#f032e6',
  '#d2f53c',
  '#fabebe',
  '#008080',
  '#e6beff',
  '#aa6e28',
  '#fffac8',
  '#800000',
  '#aaffc3',
  '#808000',
  '#ffd8b1',
  '#000080',
  '#808080',
  '#FFFFFF',
  '#000000',
  '#B0E0E6',
  '#FF69B4',
  '#7FFF00',
];

// Update the generateColor function to use the config:
const generateColor = (index: number): string => {
  return DETECTION_COLORS[index % DETECTION_COLORS.length];
};

export default function CloudDetectionPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    predictions: Prediction[];
    imageUrl: string;
  } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileToBase64 = (file: File): Promise<ArrayBuffer | string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.readAsDataURL(file);

      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Group predictions by class and calculate pricing
  const groupedPredictions = useMemo((): GroupedPrediction[] => {
    if (!result?.predictions) return [];

    const groups: Record<string, Prediction[]> = {};

    // Group predictions by class
    result.predictions.forEach((prediction, index) => {
      const predictionWithColor = {
        ...prediction,
        color:
          DETECTION_COLORS[prediction.class_id % DETECTION_COLORS.length] ||
          generateColor(index),
      };

      if (!groups[prediction.class]) {
        groups[prediction.class] = [];
      }
      groups[prediction.class].push(predictionWithColor);
    });

    // Convert to grouped predictions with pricing
    return Object.entries(groups).map(([className, classPredictions]) => {
      const count = classPredictions.length;
      const averageConfidence =
        classPredictions.reduce((sum, p) => sum + p.confidence, 0) / count;
      const unitPrice =
        PRICE_DICTIONARY[className.toLowerCase()] ||
        PRICE_DICTIONARY['unknown'];
      const totalPrice = unitPrice * count;

      return {
        class: className,
        count,
        averageConfidence,
        unitPrice,
        totalPrice,
        color:
          DETECTION_COLORS[
            classPredictions[0].class_id % DETECTION_COLORS.length
          ],
      };
    });
  }, [result]);

  // Calculate total price
  const totalPrice = useMemo(() => {
    return groupedPredictions.reduce((sum, group) => sum + group.totalPrice, 0);
  }, [groupedPredictions]);

  // Calculate total items
  const totalItems = useMemo(() => {
    return groupedPredictions.reduce((sum, group) => sum + group.count, 0);
  }, [groupedPredictions]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setResult(null);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    uploadAndDetect(file);
  };

  // Update the uploadAndDetect function to use config values:
  const uploadAndDetect = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    const reader = new FileReader();

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const base64: string | ArrayBuffer = await fileToBase64(file);
      const response = await predictFlowerRoboflowApi(base64);

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Transform API response to match our interface
      const predictions: Prediction[] =
        response.outputs[0].predictions.predictions;

      setResult({
        predictions: predictions,
        imageUrl: previewUrl || '',
      });

      // Draw predictions on canvas
      setTimeout(() => drawPredictions(predictions), 100);
    } catch (err) {
      console.error('Detection error:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to process image. Please try again.'
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  const drawPredictions = (predictions: Prediction[]) => {
    console.log('Drawing predictions:', predictions);
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    // Match canvas size with image natural size
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw the image itself
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Draw all predictions on top
    predictions.forEach((prediction) => {
      const {
        x,
        y,
        width,
        height,
        class: className,
        confidence,
        class_id,
      } = prediction;

      const color =
        DETECTION_COLORS[class_id % DETECTION_COLORS.length] ||
        generateColor(class_id);
      const topLeftX = x - width / 2;
      const topLeftY = y - height / 2;

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(topLeftX, topLeftY, width, height);

      const label = `${className} ${Math.round(confidence * 100)}%`;
      const textWidth = ctx.measureText(label).width;

      ctx.fillStyle = color;
      ctx.fillRect(topLeftX - 2, topLeftY - 22, textWidth + 6, 20);

      ctx.fillStyle = 'white';
      ctx.font = '14px sans-serif';
      ctx.fillText(label, topLeftX + 2, topLeftY - 8);
    });
  };

  const resetToUpload = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className="flex flex-row gap-2 items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">
              Cloud Detection AI
            </h1>
          </div>
          <p className="text-xl text-gray-600">
            Upload an image for AI-powered object detection and pricing
          </p>
        </div>

        {error && (
          <Alert className="mb-6 max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Upload Section */}
        {!selectedFile && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Upload Image</CardTitle>
              <CardDescription>
                Select an image file to analyze with our AI detection system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg text-gray-600 mb-2">
                  Click to select an image or drag and drop
                </p>
                <p className="text-sm text-gray-500">
                  Supports JPG, PNG, WebP (max 10MB)
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </CardContent>
          </Card>
        )}

        {/* Processing Section */}
        {selectedFile && !result && (
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Image Analysis
              </h2>
              <Button
                onClick={resetToUpload}
                variant="outline"
                className="text-white hover:text-gray-300"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Upload Different Image
              </Button>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Selected Image</CardTitle>
                </CardHeader>
                <CardContent>
                  {previewUrl && (
                    <div className="relative">
                      <img
                        src={previewUrl || '/placeholder.svg'}
                        alt="Selected for analysis"
                        className="w-full h-auto rounded-lg max-h-96 object-contain"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Analysis Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      File: {selectedFile.name}
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>

                  {isUploading && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Processing...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="w-full" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Detection Results
                </h2>
              </div>
              <Button
                onClick={resetToUpload}
                variant="outline"
                className="text-white hover:text-gray-300"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Analyze New Image
              </Button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardContent className="p-4">
                    <div className="relative bg-black rounded-lg overflow-hidden">
                      {/* Image rendered only for drawing context */}
                      <img
                        ref={imageRef}
                        src={previewUrl || ''}
                        alt="Analysis result"
                        className="invisible absolute pointer-events-none"
                        onLoad={() => {
                          if (result?.predictions) {
                            drawPredictions(result.predictions);
                          }
                        }}
                      />

                      {/* Canvas is visible and overlays the image */}
                      <canvas
                        ref={canvasRef}
                        className="w-full h-auto max-h-[500px] object-contain"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                {/* Detection Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      Detection Summary
                    </CardTitle>
                    <CardDescription>
                      {totalItems} item(s) detected in{' '}
                      {groupedPredictions.length} categories
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {groupedPredictions.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">
                        No objects detected in this image
                      </p>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {groupedPredictions.map((group, index) => (
                          <div
                            key={index}
                            className="p-4 bg-gray-50 rounded-lg border"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-3">
                                <div
                                  className="w-4 h-4 rounded"
                                  style={{ backgroundColor: group.color }}
                                />
                                <span className="font-semibold text-gray-800 capitalize">
                                  {group.class}
                                </span>
                                <Badge variant="secondary">
                                  {group.count}x
                                </Badge>
                              </div>
                              <span className="text-sm text-gray-600">
                                {Math.round(group.averageConfidence * 100)}% avg
                              </span>
                            </div>

                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">
                                ₸{group.unitPrice.toFixed(2)} each
                              </span>
                              <span className="font-semibold text-green-600">
                                ₸{group.totalPrice.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ))}

                        {groupedPredictions.length > 0 && (
                          <>
                            <Separator />
                            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-lg text-gray-800">
                                  Total ({totalItems} items)
                                </span>
                                <span className="font-bold text-xl text-green-600">
                                  ₸{totalPrice.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Pricing Info */}
                {groupedPredictions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Pricing Information
                      </CardTitle>
                      <CardDescription>
                        Prices based on our product catalog
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xs text-gray-500 space-y-1">
                        <p>
                          • Prices shown are per unit in Kazakhstani Tenge (₸)
                        </p>
                        <p>• Unknown items default to ₸1,200</p>
                        <p>• Confidence shows detection accuracy</p>
                        <p>• Bounding boxes show detected object locations</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
