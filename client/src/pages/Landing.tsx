"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, easeOut } from "framer-motion";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  ArrowRight,
  TrendingUp,
  Play,
} from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: easeOut },
};

const buttonHover = {
  scale: 1.05,
  transition: { duration: 0.2, ease: easeOut }
};

const buttonTap = {
  scale: 0.95,
  transition: { duration: 0.1 }
};

const floatingAnimation = {
  initial: { y: 0 },
  animate: {
    y: [0, -20, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export default function Landing() {
  const [isVisible, setIsVisible] = useState(false);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -100]);
  const opacity = useTransform(scrollY, [0, 100], [1, 0]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-white to-gray-50">
      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ opacity }}
        className="fixed top-0 w-full bg-white/80 backdrop-blur-lg border-b border-gray-100 z-50 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              className="flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div 
                className="w-8 h-8 bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <TrendingUp className="w-5 h-5 text-white" />
              </motion.div>
              <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                HabitFlow
              </span>
            </motion.div>
            <div className="flex items-center gap-4">
              <Link to="/login">
                <motion.div whileHover={buttonHover} whileTap={buttonTap}>
                  <Button
                    variant="ghost"
                    className="text-gray-600 hover:text-gray-900 hover:bg-gray-100/50"
                  >
                    Sign In
                  </Button>
                </motion.div>
              </Link>
              <Link to="/register">
                <motion.div whileHover={buttonHover} whileTap={buttonTap}>
                  <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all">
                    Get Started
                  </Button>
                </motion.div>
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Badge className="bg-violet-100 text-violet-700 border-violet-200 px-4 py-2 text-sm font-medium shadow-sm">
                  ✨ Transform Your Life, One Habit at a Time
                </Badge>
              </motion.div>
            </motion.div>

            <motion.h1
              {...fadeInUp}
              className="text-6xl md:text-8xl font-bold text-gray-900 mb-8 leading-tight tracking-tight"
            >
              Build Better
              <motion.span 
                className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent block"
                animate={floatingAnimation}
              >
                Habits Daily
              </motion.span>
            </motion.h1>

            <motion.p
              {...fadeInUp}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              Transform your daily routines with our habit tracking system.
              <br />
              Start your journey to a more productive and fulfilling life today.
            </motion.p>

            <motion.div
              {...fadeInUp}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
              <Link to="/register">
                <motion.div whileHover={buttonHover} whileTap={buttonTap}>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-10 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all"
                  >
                    Start Tracking
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </motion.span>
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <motion.div
          style={{ y: y1 }}
          className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-violet-400 to-purple-400 rounded-full opacity-20 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          style={{ y: y2 }}
          className="absolute top-40 right-10 w-48 h-48 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full opacity-20 blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          style={{ y: y1 }}
          className="absolute bottom-20 left-1/3 w-40 h-40 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full opacity-20 blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </section>
    </div>
  );
}
