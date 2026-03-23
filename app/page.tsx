// app/page.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Menu, X, ArrowRight, Users, Trophy, Zap, HeartHandshake } from 'lucide-react';

// Scroll Progress Bar Component
function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(scrollPercent);
    };

    window.addEventListener('scroll', updateProgress);
    updateProgress(); // initial call
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 z-50 h-1 bg-gradient-to-r from-blue-600 to-violet-600 transition-all duration-150"
      style={{ width: `${progress}%` }}
    />
  );
}

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [demoStreak, setDemoStreak] = useState(27);

  // Close mobile menu on ESC or outside click
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (isMenuOpen && !(e.target as Element)?.closest('nav')) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleDemoCheckIn = () => {
    setDemoStreak((prev) => prev + 1);
  };

  return (
    <>
      <ScrollProgress />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-black text-gray-900 dark:text-white">
        {/* Navbar */}
        <nav
          className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 dark:border-white/10 bg-white/90 dark:bg-black/90 backdrop-blur-xl"
          role="navigation"
          aria-label="Main navigation"
        >
          <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3" aria-label="ChainTogether Home">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-violet-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                C
              </div>
              <span className="font-bold text-2xl tracking-tight">ChainTogether</span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-10 text-sm font-medium">
              <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Features
              </a>
              <a href="#how" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                How it Works
              </a>
              <a href="#testimonials" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Community
              </a>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              <ThemeToggle />

              <Link href="/auth/signin" className="hidden md:block">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold">
                  Get Started Free
                </Button>
              </Link>

              {/* Hamburger Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden bg-white dark:bg-zinc-900 border-t px-6 py-8"
              >
                <div className="flex flex-col gap-6 text-lg font-medium">
                  <a href="#features" onClick={() => setIsMenuOpen(false)}>
                    Features
                  </a>
                  <a href="#how" onClick={() => setIsMenuOpen(false)}>
                    How it Works
                  </a>
                  <a href="#testimonials" onClick={() => setIsMenuOpen(false)}>
                    Community
                  </a>
                  <Link href="/auth/signin" onClick={() => setIsMenuOpen(false)}>
                    Log in
                  </Link>
                  <Link href="/auth/signup" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full">Start Free</Button>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* Hero with Live Demo */}
        <section className="pt-32 pb-20 md:pt-40 md:pb-32">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-7xl font-extrabold tracking-tighter"
            >
              Build habits.<br />
              <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                Together.
              </span>
            </motion.h1>

            <p className="mt-6 text-2xl text-gray-600 dark:text-zinc-300 max-w-3xl mx-auto">
              Real accountability with friends. Track streaks, send nudges, and never break the chain again.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="text-lg px-12 py-7 rounded-2xl">
                  Start Free Now
                </Button>
              </Link>
            </div>

            {/* Live Demo Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-16 mx-auto max-w-md bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-2xl"
            >
              <p className="text-sm uppercase tracking-widest text-gray-500 dark:text-zinc-400 mb-3">Live Demo</p>
              <div className="text-6xl font-bold text-green-500 mb-2">{demoStreak}</div>
              <p className="text-xl mb-6">days streak on "Code daily"</p>

              <Button onClick={handleDemoCheckIn} className="w-full py-6 text-lg font-medium">
                ✅ Mark Done Today
              </Button>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-4">
                Click to see the streak grow in real-time
              </p>
            </motion.div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-24 bg-white dark:bg-zinc-950">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-4xl font-bold text-center mb-4">Real people, real results</h2>
            <p className="text-center text-zinc-500 mb-12">What our community is saying</p>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: "Biniyam T.",
                  role: "Software Developer, Addis Ababa",
                  avatar: "https://i.pravatar.cc/150?u=biniyam",
                  quote:
                    "The social nudges actually work! My coding streak went from 7 to 68 days because my friends keep me accountable.",
                },
                {
                  name: "Selam A.",
                  role: "Student, Mekelle",
                  avatar: "https://i.pravatar.cc/150?u=selam",
                  quote:
                    "I love seeing my friends' streaks. It makes me not want to break mine. Best habit app I've ever used.",
                },
                {
                  name: "Yohannes K.",
                  role: "Entrepreneur",
                  avatar: "https://i.pravatar.cc/150?u=yohannes",
                  quote:
                    "The weekly reports + friend accountability helped me finally quit doom-scrolling. Highly recommended!",
                },
              ].map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-gray-100 dark:border-white/10 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <img src={t.avatar} alt={t.name} className="w-16 h-16 rounded-full mx-auto mb-6" />
                  <p className="italic text-lg mb-6">“{t.quote}”</p>
                  <div className="text-center">
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-sm text-gray-500 dark:text-zinc-400">{t.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer with Privacy Badge */}
        <footer className="border-t border-gray-200 dark:border-white/10 py-12 text-center text-sm text-gray-500 dark:text-zinc-500">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-4xl mx-auto px-6">
            <p>© {new Date().getFullYear()} ChainTogether • Built with ❤️ in Addis Ababa, Ethiopia</p>

            <div className="flex items-center gap-2 text-xs bg-white dark:bg-zinc-900 px-4 py-1.5 rounded-full border border-gray-200 dark:border-white/10 shadow-sm">
              <span className="text-green-500">🔒</span> Privacy-first • Your data stays in Ethiopia
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}