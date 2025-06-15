"use client"

import { Outlet } from "react-router-dom"
import { motion } from "framer-motion"
import Sidebar from "./Sidebar"

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: -20 },
}

export default function Layout() {
  return (
    <div className="flex h-screen bg-gradient-to-br from-violet-50 via-white to-cyan-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            y: [-10, 10, -10],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 6,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-violet-200 to-purple-200 rounded-full opacity-20 blur-xl"
        />
        <motion.div
          animate={{
            y: [-10, 10, -10],
            rotate: [0, -5, 5, 0],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-r from-cyan-200 to-blue-200 rounded-full opacity-20 blur-xl"
        />
        <motion.div
          animate={{
            y: [-10, 10, -10],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 4,
          }}
          className="absolute bottom-32 left-1/3 w-40 h-40 bg-gradient-to-r from-pink-200 to-rose-200 rounded-full opacity-20 blur-xl"
        />
      </div>

      <Sidebar />
      <motion.main
        className="flex-1 overflow-auto relative z-10"
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
      >
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </motion.main>
    </div>
  )
}
