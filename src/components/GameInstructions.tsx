import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Play, Info } from 'lucide-react';

interface GameInstructionsProps {
  title: string;
  description: string;
  instructions: string[];
  isOpen: boolean;
  onClose: () => void;
  accentColor?: string;
}

export const GameInstructions: React.FC<GameInstructionsProps> = ({ 
  title, description, instructions, isOpen, onClose, accentColor = '#bef264' 
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-md pointer-events-auto"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed z-[101] max-w-lg w-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                     bg-background/90 border border-border rounded-3xl p-8 shadow-2xl overflow-hidden pointer-events-auto"
          >
            <div 
              className="absolute top-0 left-0 w-full h-1"
              style={{ backgroundColor: accentColor }}
            />
            
            <div className="flex items-center gap-4 mb-6">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center border"
                style={{ backgroundColor: `${accentColor}15`, borderColor: `${accentColor}30`, color: accentColor }}
              >
                <Info size={24} />
              </div>
              <h2 className="text-3xl font-black text-foreground italic uppercase tracking-tighter">
                {title}
              </h2>
            </div>
            
            <p className="text-foreground/60 text-sm mb-8 font-mono tracking-tight leading-relaxed">
              {description}
            </p>
            
            <div className="space-y-4 mb-8">
              {instructions.map((inst, idx) => (
                <div key={idx} className="flex gap-4 items-start">
                  <div className="w-6 h-6 rounded-full bg-white/5 border border-border flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-foreground/60 font-mono tracking-widest">{idx + 1}</span>
                  </div>
                  <p className="text-sm text-foreground/80 font-mono leading-relaxed uppercase tracking-tight">
                    {inst}
                  </p>
                </div>
              ))}
            </div>
            
            <button
              onClick={onClose}
              className="relative z-30 w-full py-4 rounded-xl flex items-center justify-center gap-3 font-black text-black transition-all hover:scale-[1.02] active:scale-95 uppercase tracking-widest pointer-events-auto"
              style={{ backgroundColor: accentColor, boxShadow: `0 0 20px ${accentColor}40` }}
            >
              <Play className="w-5 h-5 fill-current" />
              Understood
            </button>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
};
