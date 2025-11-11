import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';

interface VoiceInputProps {
  onTranscript: (text: string, language: string) => void;
  disabled?: boolean;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscript, disabled }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState('en-US');
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [supportedLanguages] = useState([
    { code: 'en-US', name: 'English' },
    { code: 'hi-IN', name: 'Hindi (हिंदी)' },
    { code: 'ta-IN', name: 'Tamil (தமிழ்)' },
    { code: 'te-IN', name: 'Telugu (తెలుగు)' },
    { code: 'kn-IN', name: 'Kannada (ಕನ್ನಡ)' },
    { code: 'ml-IN', name: 'Malayalam (മലയാളം)' },
    { code: 'bn-IN', name: 'Bengali (বাংলা)' },
    { code: 'mr-IN', name: 'Marathi (मराठी)' },
    { code: 'gu-IN', name: 'Gujarati (ગુજરાતી)' },
  ]);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');

  // Check if browser supports speech recognition
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = selectedLanguage;

      recognitionInstance.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(finalTranscript);
          onTranscript(finalTranscript, selectedLanguage);
          toast.success('Voice recorded successfully!');
        }
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setPermissionDenied(true);
          toast.error('Microphone access blocked. Please enable microphone permissions in your browser settings.');
        } else if (event.error === 'no-speech') {
          toast.warning('No speech detected. Please try again and speak clearly.');
        } else if (event.error === 'audio-capture') {
          toast.error('No microphone found. Please connect a microphone and try again.');
        } else {
          toast.error(`Voice input error: ${event.error}. You can still use text input.`);
        }
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, [selectedLanguage, SpeechRecognition, onTranscript]);

  const startListening = async () => {
    if (disabled) return;
    
    if (!SpeechRecognition) {
      toast.error('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    // Request microphone permission first
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (error) {
      setPermissionDenied(true);
      toast.error('Microphone access denied. Please allow microphone access and try again.');
      return;
    }

    if (recognition) {
      setPermissionDenied(false); // Reset permission state
      try {
        recognition.lang = selectedLanguage;
        recognition.start();
        setIsListening(true);
        setTranscript('');
        toast.info(`🎤 Listening in ${supportedLanguages.find(l => l.code === selectedLanguage)?.name}... Speak now!`);
      } catch (error: any) {
        console.error('Error starting recognition:', error);
        // If recognition is already started, stop and restart
        if (error.message?.includes('already started')) {
          recognition.stop();
          setTimeout(() => {
            try {
              recognition.start();
              setIsListening(true);
            } catch (e) {
              toast.error('Failed to start voice input. Please try again.');
              setIsListening(false);
            }
          }, 100);
        } else {
          toast.error('Failed to start voice input. Please try again.');
          setIsListening(false);
        }
      }
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  return (
    <Card className="bg-slate-800 border-amber-500/20">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Volume2 className="h-5 w-5 text-amber-400" />
            <h3 className="text-white">Voice Input (Multi-language Support)</h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {supportedLanguages.map(lang => (
              <Badge
                key={lang.code}
                onClick={() => !isListening && setSelectedLanguage(lang.code)}
                className={`cursor-pointer ${
                  selectedLanguage === lang.code
                    ? 'bg-amber-500 text-slate-900'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {lang.name}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              onClick={isListening ? stopListening : startListening}
              disabled={disabled}
              className={
                isListening
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-amber-500 hover:bg-amber-600 text-slate-900'
              }
            >
              {isListening ? (
                <>
                  <MicOff className="mr-2 h-4 w-4 animate-pulse" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-4 w-4" />
                  Start Voice Input
                </>
              )}
            </Button>

            {isListening && (
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-400 text-sm">Recording...</span>
              </div>
            )}
          </div>

          {transcript && (
            <div className="mt-4 p-4 bg-slate-700/50 rounded-lg">
              <p className="text-slate-300 text-sm mb-1">Detected Speech:</p>
              <p className="text-white">{transcript}</p>
            </div>
          )}

          {!SpeechRecognition && (
            <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <p className="text-amber-400 text-sm">
                ⚠️ Voice input is not supported in your browser. Please use text input or switch to Chrome/Edge/Safari.
              </p>
            </div>
          )}

          {permissionDenied && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm mb-2">
                🎤 Microphone access blocked
              </p>
              <p className="text-red-300 text-xs mb-3">
                To enable voice input, please allow microphone permissions:
              </p>
              <ul className="text-red-300 text-xs space-y-1 list-disc list-inside">
                <li>Click the lock/info icon in your browser's address bar</li>
                <li>Find "Microphone" permissions and set to "Allow"</li>
                <li>Refresh the page and try again</li>
              </ul>
              <p className="text-slate-400 text-xs mt-3">
                Or continue using text input below.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
