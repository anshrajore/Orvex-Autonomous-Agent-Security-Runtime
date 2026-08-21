import { useState, useEffect } from 'react';
import { Mark } from './Mark';

interface NavbarProps {
  currentView: 'product' | 'console' | 'guide';
  onNavigate: (view: 'product' | 'console' | 'guide') => void;
  onScrollTo: (id: string) => void;
}

export function Navbar({ currentView, onNavigate, onScrollTo }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled ? 'bg-black/80 backdrop-blur-md border-b border-line' : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <button
            type="button"
            onClick={() => onNavigate('product')}
            className="flex items-center gap-3 group focus:outline-none"
          >
            <Mark className="h-7 w-7 transition-transform group-hover:scale-105" />
            <span className="text-base font-semibold tracking-tight text-white">ORVEX</span>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-[13px] font-medium text-mute">
            <button
              type="button"
              onClick={() => {
                onNavigate('product');
                setTimeout(() => onScrollTo('overview'), 50);
              }}
              className="hover:text-white transition-colors"
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => {
                onNavigate('product');
                setTimeout(() => onScrollTo('capabilities'), 50);
              }}
              className="hover:text-white transition-colors"
            >
              Capabilities
            </button>
            <button
              type="button"
              onClick={() => {
                onNavigate('product');
                setTimeout(() => onScrollTo('architecture'), 50);
              }}
              className="hover:text-white transition-colors"
            >
              Architecture
            </button>
            <button
              type="button"
              onClick={() => {
                onNavigate('product');
                setTimeout(() => onScrollTo('interactive-demo'), 50);
              }}
              className="hover:text-white transition-colors"
            >
              Live Demo
            </button>
            <button
              type="button"
              onClick={() => onNavigate('guide')}
              className={`hover:text-white transition-colors ${currentView === 'guide' ? 'text-white' : ''}`}
            >
              Guide & Docs
            </button>
            <button
              type="button"
              onClick={() => onNavigate('console')}
              className={`hover:text-white transition-colors ${currentView === 'console' ? 'text-white' : ''}`}
            >
              Console
            </button>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="https://github.com/anshrajore/Orvex-Autonomous-Agent-Security-Runtime"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs font-medium text-mute hover:border-dim hover:text-white transition-all"
          >
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>GitHub</span>
          </a>

          <button
            type="button"
            onClick={() => {
              onNavigate('product');
              setTimeout(() => onScrollTo('quick-start'), 50);
            }}
            className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-black hover:bg-neutral-200 transition-colors"
          >
            Get Started
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-mute hover:text-white p-1"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-line bg-black/95 px-6 py-6 space-y-4">
          <button
            type="button"
            onClick={() => {
              onNavigate('product');
              setMobileMenuOpen(false);
              setTimeout(() => onScrollTo('overview'), 50);
            }}
            className="block w-full text-left text-sm font-medium text-mute hover:text-white"
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => {
              onNavigate('product');
              setMobileMenuOpen(false);
              setTimeout(() => onScrollTo('capabilities'), 50);
            }}
            className="block w-full text-left text-sm font-medium text-mute hover:text-white"
          >
            Capabilities
          </button>
          <button
            type="button"
            onClick={() => {
              onNavigate('product');
              setMobileMenuOpen(false);
              setTimeout(() => onScrollTo('architecture'), 50);
            }}
            className="block w-full text-left text-sm font-medium text-mute hover:text-white"
          >
            Architecture
          </button>
          <button
            type="button"
            onClick={() => {
              onNavigate('guide');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left text-sm font-medium text-mute hover:text-white"
          >
            Guide & Documentation
          </button>
          <button
            type="button"
            onClick={() => {
              onNavigate('console');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left text-sm font-medium text-mute hover:text-white"
          >
            Live Console
          </button>
          <div className="pt-4 border-t border-line flex gap-3">
            <button
              type="button"
              onClick={() => {
                onNavigate('product');
                setMobileMenuOpen(false);
                setTimeout(() => onScrollTo('quick-start'), 50);
              }}
              className="flex-1 rounded-full bg-white py-2 text-center text-xs font-semibold text-black"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
