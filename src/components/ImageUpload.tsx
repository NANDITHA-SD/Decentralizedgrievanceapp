import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Camera, Upload, X } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { toast } from 'sonner@2.0.3';

interface ImageUploadProps {
  onImageCapture: (imageDataUrl: string) => void;
  currentImage?: string;
  disabled?: boolean;
  title?: string;
  description?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ 
  onImageCapture, 
  currentImage, 
  disabled,
  title = 'Photo Evidence (Optional)',
  description = 'Upload or capture a photo of the issue'
}) => {
  const [preview, setPreview] = useState<string>(currentImage || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image too large. Please choose an image under 5MB.');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      onImageCapture(dataUrl);
      toast.success('Image uploaded successfully!');
    };
    reader.onerror = () => {
      toast.error('Failed to read image. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleCameraCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image too large. Please try a different photo.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      onImageCapture(dataUrl);
      toast.success('Photo captured successfully!');
    };
    reader.onerror = () => {
      toast.error('Failed to capture photo. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setPreview('');
    onImageCapture('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    toast.info('Image removed');
  };

  return (
    <Card className="bg-slate-800 border-amber-500/20">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Upload className="h-5 w-5 text-amber-400" />
            <h3 className="text-white">{title}</h3>
          </div>

          {preview ? (
            <div className="relative">
              <img 
                src={preview} 
                alt="Preview" 
                className="w-full h-48 object-cover rounded-lg border-2 border-amber-500/30"
              />
              <Button
                type="button"
                onClick={clearImage}
                disabled={disabled}
                size="sm"
                variant="destructive"
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">{description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              disabled={disabled}
            />
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload from Device
            </Button>

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCameraCapture}
              className="hidden"
              disabled={disabled}
            />
            <Button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              disabled={disabled}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <Camera className="mr-2 h-4 w-4" />
              Take Photo
            </Button>
          </div>

          <p className="text-slate-500 text-xs text-center">
            Maximum file size: 5MB • Supported formats: JPG, PNG, GIF, WebP
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
