"use client"
import Image from "next/image";
import { Button } from "@repo/ui/components/ui/button";
import { Card } from "@repo/ui/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@repo/ui/components/ui/carousel";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { CarouselApi } from "@repo/ui/components/ui/carousel";

// Types
interface CarouselRef {
  scrollNext: () => void;
}

interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradientFrom: string;
  gradientTo: string;
  borderColor: string;
}

interface StatCard {
  id: string;
  value: string;
  label: string;
  animationDelay: string;
}

interface CarouselSlide {
  id: string;
  imageSrc: string;
  alt: string;
  title: string;
}

// Typography constants to match login page
const TYPOGRAPHY = {
  h1: 'text-3xl md:text-4xl', // 24px/32px
  h2: 'text-2xl md:text-3xl', // 20px/24px
  h3: 'text-xl md:text-2xl',  // 18px/20px
  body: 'text-base md:text-lg', // 16px/18px
  small: 'text-sm md:text-base', // 14px/16px
  tiny: 'text-xs md:text-sm',  // 12px/14px
} as const;

// Constants
const AUTO_SCROLL_INTERVAL = 3000;
const TOTAL_SLIDES = 4;

// Data
const FEATURE_CARDS: FeatureCard[] = [
  {
    id: 'employee-management',
    title: 'Employee Management',
    description: 'Complete HR lifecycle',
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    gradientFrom: 'from-blue-50',
    gradientTo: 'to-blue-100',
    borderColor: 'border-blue-200/50',
  },
  {
    id: 'analytics-reports',
    title: 'Analytics & Reports',
    description: 'Data-driven insights',
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    gradientFrom: 'from-green-50',
    gradientTo: 'to-green-100',
    borderColor: 'border-green-200/50',
  },
  {
    id: 'time-tracking',
    title: 'Time Tracking',
    description: 'Attendance & overtime',
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    gradientFrom: 'from-purple-50',
    gradientTo: 'to-purple-100',
    borderColor: 'border-purple-200/50',
  },
  {
    id: 'leave-management',
    title: 'Leave Management',
    description: 'Streamlined approvals',
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    gradientFrom: 'from-orange-50',
    gradientTo: 'to-orange-100',
    borderColor: 'border-orange-200/50',
  },
];

const STAT_CARDS: StatCard[] = [
  { id: 'employees', value: '10K+', label: 'Employees', animationDelay: '0s' },
  { id: 'companies', value: '500+', label: 'Companies', animationDelay: '0.5s' },
  { id: 'uptime', value: '99.9%', label: 'Uptime', animationDelay: '1s' },
];

const CAROUSEL_SLIDES: CarouselSlide[] = [
  { id: 'dashboard', imageSrc: '/images/dashboard.png', alt: 'Analytics Dashboard', title: 'Analytics Dashboard' },
  { id: 'forms', imageSrc: '/images/form.png', alt: 'Employee Forms', title: 'Employee Forms' },
  { id: 'reports', imageSrc: '/images/report.png', alt: 'Detailed Reports', title: 'Detailed Reports' },
  { id: 'import', imageSrc: '/images/excel-upload.png', alt: 'Data Import', title: 'Data Import' },
];

export default function Home() {
  const [api, setApi] = useState<CarouselApi>();
  const router = useRouter();

  // Memoized current year
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  // Auto-scroll functionality with useCallback for performance
  const handleAutoScroll = useCallback(() => {
    if (api) {
      api.scrollNext();
    }
  }, [api]);

  useEffect(() => {
    if (!api) {
      return;
    }
    const interval = setInterval(handleAutoScroll, AUTO_SCROLL_INTERVAL);
    return () => clearInterval(interval);
  }, [api, handleAutoScroll]);

  const handleGetStarted = useCallback(() => {
    router.push('/login');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Enhanced Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Floating particles */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-white/30 rounded-full animate-bounce"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-blue-300/50 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-32 left-32 w-1.5 h-1.5 bg-purple-300/40 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute bottom-20 right-20 w-1 h-1 bg-indigo-300/60 rounded-full animate-bounce" style={{ animationDelay: '2.5s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-4">
        <Card className="w-full bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-3xl overflow-hidden transform hover:scale-[1.02] transition-transform duration-500">
          <div className="grid lg:grid-cols-2">
            {/* Left Section - Welcome Content */}
            <div className="p-6 md:p-10 flex flex-col justify-center space-y-6">
              {/* Logo and Brand */}
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg animate-pulse" role="img" aria-label="INOPS Logo">
                    <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <h1 className={`${TYPOGRAPHY.h1} font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent animate-fade-in`}>
                    Welcome to <span className="text-blue-600 animate-pulse">INOPS</span>
                  </h1>
                </div>
                <p className={`${TYPOGRAPHY.body} text-gray-600 mb-8 leading-relaxed animate-fade-in`} style={{ animationDelay: '0.3s' }}>
                  Your comprehensive workforce management platform that empowers organizations to manage, 
                  track, and optimize their human resources with precision and efficiency.
                </p>
              </div>

              {/* Enhanced Feature Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {FEATURE_CARDS.map((feature) => (
                  <div
                    key={feature.id}
                    className={`flex items-center space-x-3 p-4 bg-gradient-to-r ${feature.gradientFrom} ${feature.gradientTo} rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 border ${feature.borderColor}`}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className={`${TYPOGRAPHY.small} font-semibold text-gray-900`}>{feature.title}</h3>
                      <p className={`${TYPOGRAPHY.tiny} text-gray-600`}>{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Enhanced CTA Button */}
              <div className="text-center lg:text-left">
                <Button
                  onClick={handleGetStarted}
                  className={`w-full lg:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 md:py-3.5 px-6 md:px-8 rounded-xl ${TYPOGRAPHY.body} font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-pulse`}
                  size="lg"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Get Started Now
                </Button>
                <p className={`${TYPOGRAPHY.tiny} text-gray-500 mt-4 flex items-center justify-center lg:justify-start gap-2`}>
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Secure, compliant, and enterprise-ready
                </p>
              </div>
            </div>

            {/* Right Section - Enhanced Visual Content */}
            <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-6 md:p-10 flex flex-col justify-center relative overflow-hidden">
              {/* Enhanced Background Pattern */}
              <div className="absolute inset-0 opacity-10" aria-hidden="true">
                <div className="absolute top-0 left-0 w-full h-full" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}></div>
              </div>

              <div className="relative z-10 text-center">
                <h2 className={`${TYPOGRAPHY.h2} font-bold text-white mb-4 animate-fade-in`}>
                  Transform Your
                  <br />
                  <span className="text-blue-200 animate-pulse">Workforce Management</span>
                </h2>
                <p className={`${TYPOGRAPHY.body} text-blue-100 mb-8 leading-relaxed animate-fade-in`} style={{ animationDelay: '0.3s' }}>
                  Streamline operations, enhance productivity, and drive organizational success 
                  with our comprehensive HR management solution.
                </p>

                {/* Enhanced Auto-scrolling Carousel */}
                <div className="mb-8">
                  
                  <Carousel
                    setApi={setApi}
                    opts={{
                      align: "start",
                      loop: true,
                    }}
                    className="w-full max-w-sm mx-auto"
                  >
                    <CarouselContent>
                      {CAROUSEL_SLIDES.map((slide) => (
                        <CarouselItem key={slide.id} className="md:basis-1/2 lg:basis-1/2">
                          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/30 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                            <Image
                              src={slide.imageSrc}
                              alt={slide.alt}
                              width={200}
                              height={150}
                              className="rounded-lg shadow-lg"
                              priority={slide.id === 'dashboard'}
                            />
                            <p className={`text-white ${TYPOGRAPHY.tiny} mt-2 font-medium`}>{slide.title}</p>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="bg-white/20 hover:bg-white/30 border-white/30" />
                    <CarouselNext className="bg-white/20 hover:bg-white/30 border-white/30" />
                  </Carousel>
                </div>

                {/* Enhanced Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  {STAT_CARDS.map((stat) => (
                    <div
                      key={stat.id}
                      className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/30 hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
                    >
                      <div className={`${TYPOGRAPHY.h3} font-bold text-white animate-pulse`} style={{ animationDelay: stat.animationDelay }}>
                        {stat.value}
                      </div>
                      <div className={`text-blue-200 ${TYPOGRAPHY.tiny}`}>{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Enhanced Footer */}
      {/* <footer className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center z-20">
        <p className={`text-gray-300 ${TYPOGRAPHY.tiny} animate-fade-in`} style={{ animationDelay: '1s' }}>
          © {currentYear} INOPS Platform. All rights reserved.
        </p>
      </footer> */}

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
