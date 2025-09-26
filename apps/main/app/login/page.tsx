"use client"
import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState(false);
  const router = useRouter();

  const handleKeycloakLogin = async () => {
    try {
      setLoading(true);
      await signIn('keycloak', { callbackUrl: '/launchdesk' });
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50">
      {/* Modern geometric background */}
      <div className="absolute inset-0">
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
        
        {/* Floating geometric shapes */}
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-20 left-20 w-32 h-32 border border-blue-200/30 rounded-full"
        />
        <motion.div
          animate={{
            rotate: [360, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-br from-blue-100/40 to-indigo-100/40 rounded-lg rotate-45"
        />
        <motion.div
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-32 left-1/4 w-16 h-16 border-2 border-blue-200/40 rounded-full"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-full blur-xl"
        />
      </div>

      {/* Main container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Login card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden">
            {/* Card glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white/30 to-indigo-50/50 rounded-3xl" />
            
            {/* Content */}
            <div className="relative z-10">
              {/* Logo section */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-center mb-8"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg">
                  <img
                    src="/images/logo.png"
                    alt="INOPS Logo"
                    className="w-12 h-12 object-contain filter brightness-0 invert"
                  />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Welcome back
                </h1>
                <p className="text-gray-600 text-sm">
                  Sign in to your INOPS account
                </p>
              </motion.div>

              {/* Login form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="space-y-6"
              >
                {/* Login button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onHoverStart={() => setHovered(true)}
                  onHoverEnd={() => setHovered(false)}
                  onClick={handleKeycloakLogin}
                  disabled={loading}
                  className="group relative w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
                >
                  {/* Animated background */}
                  <AnimatePresence>
                    {hovered && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-2xl"
                      />
                    )}
                  </AnimatePresence>
                  
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      <span>Continue with INOPS</span>
                    </>
                  )}
                </motion.button>

                {/* Security note */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="flex items-center justify-center gap-2 text-sm text-gray-500"
                >
                  <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Secure enterprise authentication</span>
                </motion.div>
              </motion.div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-100/30 to-indigo-100/30 rounded-full blur-xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-indigo-100/30 to-blue-100/30 rounded-full blur-xl" />
          </div>

          {/* Features section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-8 grid grid-cols-3 gap-4"
          >
            {[
              { icon: "🔒", text: "Secure" },
              { icon: "⚡", text: "Fast" },
              { icon: "🎯", text: "Reliable" }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1, duration: 0.3 }}
                className="text-center p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20"
              >
                <div className="text-2xl mb-1">{feature.icon}</div>
                <div className="text-xs font-medium text-gray-600">{feature.text}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-center"
      >
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span>© {new Date().getFullYear()} INOPS Platform</span>
        </div>
      </motion.div>
    </div>
  );
}