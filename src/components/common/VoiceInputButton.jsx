import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Sparkles, Loader2 } from 'lucide-react';
import { createSpeechRecognizer, parseSpeechTransaction } from '../../services/speechParser.js';

export function VoiceInputButton({ onParsed, categories = [] }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const recognizerRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
    }
  }, []);

  const handleToggleListen = () => {
    if (isListening) {
      if (recognizerRef.current) {
        recognizerRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    if (!isSupported) {
      // Fallback: prompt for text input with the same natural language parser
      const text = prompt('Sesli tanıma bu tarayıcıda desteklenmiyor. Lütfen harcamanızı doğal cümleyle yazın:\nÖrn: "Markete 350 lira verdim"');
      if (text) {
        const parsed = parseSpeechTransaction(text, categories);
        if (parsed && onParsed) onParsed(parsed);
      }
      return;
    }

    try {
      const recognizer = createSpeechRecognizer(
        (recognizedText) => {
          setTranscript(recognizedText);
          const parsed = parseSpeechTransaction(recognizedText, categories);
          if (parsed && onParsed) {
            onParsed(parsed);
          }
          setIsListening(false);
        },
        (error) => {
          console.warn('Speech recognition error:', error);
          setIsListening(false);
        },
        () => {
          setIsListening(false);
        }
      );

      if (recognizer) {
        recognizerRef.current = recognizer;
        recognizer.start();
        setIsListening(true);
      }
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={handleToggleListen}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
          isListening
            ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-400/30'
            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
        }`}
        title={isListening ? 'Dinleniyor... Konuşun' : 'Sesle Doldur ("Markete 250 TL verdim")'}
      >
        {isListening ? (
          <>
            <MicOff className="w-3.5 h-3.5 animate-bounce" />
            <span>Dinleniyor...</span>
          </>
        ) : (
          <>
            <Mic className="w-3.5 h-3.5 text-emerald-600" />
            <span>Sesle Kaydet</span>
          </>
        )}
      </button>

      {/* Floating listening feedback pill */}
      {isListening && (
        <div className="absolute left-0 top-full mt-2 z-30 bg-slate-900 text-white px-3 py-2 rounded-xl text-[11px] shadow-xl whitespace-nowrap animate-slide-up flex items-center gap-2 border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span>Şimdi konuşun... (Örn: "Benzine 1500 TL ödedim")</span>
        </div>
      )}
    </div>
  );
}
