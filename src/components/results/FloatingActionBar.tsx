import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Download, Edit3, RotateCcw, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FloatingActionBarProps {
  onExport: () => void;
  onAnalyzeAgain: () => void;
}

export function FloatingActionBar({ onExport, onAnalyzeAgain }: FloatingActionBarProps) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    // Delay appearance so it doesn't distract from initial load
    const timer = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Desktop floating bar — bottom-right */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
            className="fixed bottom-6 right-6 z-50 hidden md:flex items-center gap-2 p-2 rounded-2xl"
            style={{
              background: 'rgba(7,13,27,0.95)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,240,255,0.06), 0 0 32px rgba(0,240,255,0.06)',
            }}
          >
            <ActionBtn
              icon={Edit3}
              label="Edit Inputs"
              onClick={() => navigate('/input')}
              variant="ghost"
            />
            <ActionBtn
              icon={RotateCcw}
              label="Analyze Again"
              onClick={onAnalyzeAgain}
              variant="ghost"
            />
            <div className="w-px h-6 mx-1" style={{ background: 'rgba(255,255,255,0.1)' }} />
            <ActionBtn
              icon={Download}
              label="Export PDF"
              onClick={onExport}
              variant="accent"
            />
          </motion.div>

          {/* Mobile sticky bottom bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.35 }}
            className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden items-center gap-2 p-3 pb-safe"
            style={{
              background: 'rgba(5,5,5,0.96)',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(24px)',
            }}
          >
            <button
              onClick={() => navigate('/input')}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-colors"
              style={{
                background: 'rgba(255,255,255,0.05)',
                color: 'rgba(255,255,255,0.72)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <Edit3 size={14} />
              Edit
            </button>
            <button
              onClick={onAnalyzeAgain}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-colors"
              style={{
                background: 'rgba(255,255,255,0.05)',
                color: 'rgba(255,255,255,0.72)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <RotateCcw size={14} />
              Retry
            </button>
            <button
              onClick={onExport}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-opacity"
              style={{
                background: 'var(--act-cyan)',
                color: '#000',
              }}
            >
              <Download size={14} />
              Export
            </button>
          </motion.div>

          {/* Scroll-to-top button */}
          <AnimatePresence>
            {showScrollTop && (
              <motion.button
                key="scroll-top"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="fixed bottom-[4.5rem] right-6 z-50 hidden md:flex w-9 h-9 items-center justify-center rounded-full"
                style={{
                  background: 'rgba(7,13,27,0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(16px)',
                  color: 'rgba(255,255,255,0.55)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                }}
                aria-label="Scroll to top"
              >
                <ChevronUp size={16} />
              </motion.button>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}

interface ActionBtnProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  variant: 'ghost' | 'accent';
}

function ActionBtn({ icon: Icon, label, onClick, variant }: ActionBtnProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors"
      style={
        variant === 'accent'
          ? {
              background: 'var(--act-cyan)',
              color: '#000',
              boxShadow: '0 0 18px rgba(0,240,255,0.3), 0 2px 8px rgba(0,0,0,0.3)',
            }
          : {
              background: 'transparent',
              color: 'rgba(255,255,255,0.6)',
              border: '1px solid transparent',
            }
      }
      onMouseEnter={e => {
        if (variant === 'ghost') {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)';
          (e.currentTarget as HTMLButtonElement).style.color = '#fff';
        }
      }}
      onMouseLeave={e => {
        if (variant === 'ghost') {
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.6)';
        }
      }}
    >
      <Icon size={14} />
      {label}
    </motion.button>
  );
}
