// app/page.tsx
'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Menu, X } from 'lucide-react';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { scrollY } = useScroll();
  const navbarOpacity = useTransform(scrollY, [0, 100], [0.95, 1]);

  // Navbar scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Navbar with scroll effect */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
          scrolled 
            ? 'border-zinc-200 dark:border-zinc-800 bg-white/98 dark:bg-zinc-950/98 shadow-sm' 
            : 'border-transparent bg-white/95 dark:bg-zinc-950/95'
        } backdrop-blur-md`}
      >
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-teal-600 rounded-2xl flex items-center justify-center text-white font-semibold text-xl">C</div>
            <span className="font-semibold text-2xl tracking-tight">ChainTogether</span>
          </Link>

          <div className="hidden md:flex items-center gap-10 text-sm font-medium">
            <a href="#features" className="hover:text-teal-600 transition-colors">Features</a>
            <a href="#how" className="hover:text-teal-600 transition-colors">How it Works</a>
            <a href="#testimonials" className="hover:text-teal-600 transition-colors">Stories</a>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            
            <Link href="/auth/signin" className="hidden md:block text-sm font-medium">
              Log in
            </Link>
            
            <Link href="/auth/signup">
              <Button className="bg-teal-600 hover:bg-teal-700 text-white px-6">Get Started Free</Button>
            </Link>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen pt-32 flex items-center">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-7xl font-semibold tracking-tighter leading-none"
          >
            Build better habits.<br />
            <span className="text-teal-600">Together.</span>
          </motion.h1>

          <p className="mt-8 text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Simple habit tracking with real accountability. 
            Share your progress with friends and stay consistent.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="text-lg px-10 py-7 rounded-2xl bg-teal-600 hover:bg-teal-700">
                Start Free
              </Button>
            </Link>
            <Link href="#how">
              <Button size="lg" variant="outline" className="text-lg px-10 py-7 rounded-2xl">
                How it works
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <div className="border-b border-zinc-100 dark:border-zinc-800 py-6 bg-white dark:bg-zinc-950">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-sm text-zinc-500 dark:text-zinc-400">
            <div>Trusted by developers & students in Ethiopia</div>
            <div className="hidden sm:block">•</div>
            <div>1,200+ habits tracked together</div>
            <div className="hidden sm:block">•</div>
            <div>Built locally in Addis Ababa</div>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <section id="features" className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-16">
            {[
              {
                title: "Track together",
                desc: "Simple daily check-ins. See your friends' streaks in real time."
              },
              {
                title: "Gentle nudges",
                desc: "Send encouragement when someone misses a day. Stay motivated as a group."
              },
              {
                title: "Real accountability",
                desc: "No more solo promises. Build habits that actually stick."
              }
            ].map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="space-y-4"
              >
                <div className="text-teal-600">
                  <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950 flex items-center justify-center">
                    {i === 0 && "📊"}
                    {i === 1 && "💬"}
                    {i === 2 && "🤝"}
                  </div>
                </div>
                <h3 className="text-2xl font-semibold tracking-tight">{benefit.title}</h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how" className="py-24 bg-zinc-50 dark:bg-zinc-900">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-4xl font-semibold text-center mb-16">Three simple steps</h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { 
                number: "01", 
                title: "Create habits", 
                desc: "Add what matters to you — coding, exercise, reading, or anything else." 
              },
              { 
                number: "02", 
                title: "Invite friends", 
                desc: "Share specific habits with people you trust for mutual accountability." 
              },
              { 
                number: "03", 
                title: "Stay consistent", 
                desc: "See streaks, send nudges, and support each other every day." 
              }
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative text-center"
              >
                <div className="mx-auto w-20 h-20 rounded-3xl bg-teal-100 dark:bg-teal-950 text-teal-600 flex items-center justify-center text-5xl font-semibold mb-8">
                  {step.number}
                </div>
                <h3 className="text-2xl font-semibold mb-4 tracking-tight">{step.title}</h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-4xl font-semibold text-center mb-16">What people are saying</h2>
          
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                quote: "The nudges from my friends made all the difference. My coding streak is now at 92 days.",
                name: "Biniyam T.",
                role: "Software Developer"
              },
              {
                quote: "Finally a habit tracker that doesn't feel lonely. Seeing my friends' progress keeps me going.",
                name: "Selam A.",
                role: "Student"
              },
              {
                quote: "The social aspect made me actually stick to my goals. Best decision I made this year.",
                name: "Yohannes K.",
                role: "Entrepreneur"
              }
            ].map((t, i) => (
              <div key={i} className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-100 dark:border-zinc-800">
                <p className="italic text-lg leading-relaxed">“{t.quote}”</p>
                <div className="mt-8">
                  <p className="font-medium">{t.name}</p>
                  <p className="text-sm text-zinc-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stronger Final CTA */}
      <section className="py-24 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
        <div className="max-w-2xl mx-auto text-center px-6">
          <div className="inline-flex items-center gap-2 bg-white dark:bg-zinc-800 rounded-full px-4 py-1.5 text-sm text-zinc-500 dark:text-zinc-400 mb-8 border border-zinc-100 dark:border-zinc-700">
            <span className="text-emerald-500">✓</span>
            Join 1,200+ people building habits together in Ethiopia
          </div>

          <h2 className="text-5xl font-semibold tracking-tight mb-6">
            Ready to build habits that last?
          </h2>
          
          <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-10">
            Start free today. No credit card needed. 
            Your first chain is just a click away.
          </p>

          <Link href="/auth/signup" className="inline-block">
            <Button 
              size="lg" 
              className="text-lg px-14 py-8 rounded-2xl bg-teal-600 hover:bg-teal-700 shadow-lg hover:shadow-xl transition-all"
            >
              Create Your First Chain — It's Free
            </Button>
          </Link>

          <p className="mt-6 text-xs text-zinc-500">
            Thousands have already started • Cancel anytime
          </p>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="border-t border-zinc-100 dark:border-zinc-800 py-12 text-center text-sm text-zinc-500">
        <p>© {new Date().getFullYear()} ChainTogether • Built with care in Addis Ababa, Ethiopia</p>
      </footer>
    </div>
  );
}