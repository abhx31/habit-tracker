"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion, easeOut } from "framer-motion"
import { useAuth } from "../context/AuthContext"
import { Button } from "../components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form"
import { Input } from "../components/ui/input"
import { Eye, EyeOff, Mail, Lock, User, Calendar, ArrowLeft, TrendingUp, Target, BarChart3, Zap, CheckCircle } from "lucide-react"

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  age: z.string().refine((val) => /^\d+$/.test(val), { message: "Age must be a valid number" }),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type RegisterFormValues = z.infer<typeof registerSchema>

const slideVariants = {
  initial: { x: 100, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  transition: { duration: 0.6, ease: easeOut },
}

const fadeInUp = {
  initial: { y: 30, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  transition: { duration: 0.6, ease: easeOut },
}


export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      age: "",
      email: "",
      password: "",
    },
  })

  const onSubmit = async (rawValues: RegisterFormValues) => {
    setIsLoading(true)
    const result = registerSchema.safeParse(rawValues)

    if (result.success) {
      const values: RegisterFormValues = result.data
      try {
        await register(values.name, Number(values.age), values.email, values.password)
        navigate("/login")
      } catch (error) {
        console.error(error)
      }
    } else {
      console.error(result.error)
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Visual */}
      <motion.div
        {...slideVariants}
        className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 relative overflow-hidden"
      >
        {/* Glassmorphism Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-md mx-auto rounded-3xl bg-white/10 backdrop-blur-xl p-10 flex flex-col items-center border border-white/20 shadow-2xl"
        >
          {/* Register Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
            className="mb-8"
          >
            <User className="w-16 h-16 text-white/90 drop-shadow-lg" />
          </motion.div>
          {/* Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
            className="text-4xl font-extrabold text-white mb-4 text-center drop-shadow"
          >
            Create Your Account
          </motion.h2>
          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
            className="text-lg text-white/80 mb-8 text-center max-w-md"
          >
            Join HabitFlow and start building better habits today.
          </motion.p>
          {/* Feature List */}
          <motion.ul
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.15 } },
            }}
            className="space-y-4 w-full mb-2"
          >
            <motion.li
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="flex items-center gap-3 text-white/90 text-base"
            >
              <CheckCircle className="w-5 h-5 text-green-400" /> Personalized Goals
            </motion.li>
            <motion.li
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="flex items-center gap-3 text-white/90 text-base"
            >
              <CheckCircle className="w-5 h-5 text-green-400" /> Progress Tracking
            </motion.li>
            <motion.li
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="flex items-center gap-3 text-white/90 text-base"
            >
              <CheckCircle className="w-5 h-5 text-green-400" /> Daily Motivation
            </motion.li>
          </motion.ul>
        </motion.div>
        {/* Soft background blobs */}
        <motion.div 
          className="absolute -top-10 -right-10 w-60 h-60 bg-pink-400/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.15, 0.22, 0.15],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-0 left-0 w-40 h-40 bg-violet-400/30 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white relative">
        <div className="w-full max-w-md">
          {/* Back to Home */}
          <motion.div {...fadeInUp} className="mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </motion.div>

          {/* Logo */}


          <motion.div
            {...fadeInUp}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                HabitFlow
              </h1>
            </div>
            <p className="text-gray-600">Create your account and start building better habits today.</p>
          </motion.div>

          {/* Form */}
          <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Full Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            placeholder="Enter your full name"
                            className="pl-10 h-12 border-gray-300 focus:border-violet-500 focus:ring-violet-500"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Age</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            type="text"
                            placeholder="Enter your age"
                            className="pl-10 h-12 border-gray-300 focus:border-violet-500 focus:ring-violet-500"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Email Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            placeholder="Enter your email"
                            className="pl-10 h-12 border-gray-300 focus:border-violet-500 focus:ring-violet-500"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a password"
                            className="pl-10 pr-10 h-12 border-gray-300 focus:border-violet-500 focus:ring-violet-500"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

<Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link to="/login" className="text-violet-600 hover:text-violet-700 font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
