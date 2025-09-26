"use client"
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Globe, Search, List, ArrowUpRight, Users, DollarSign, Building2, MapPin, GitBranch, Split, BadgeInfo, Layers, ListOrdered, Rows, Star, UserCog, User, Tag, Briefcase, CalendarCheck2, Repeat2, Map, Wrench, ClipboardList, FileText, CheckCircle2, Upload, Clock, Calendar, Percent,ClipboardType,CalendarClock,ScrollText } from "lucide-react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { SessionProvider } from "next-auth/react";

// Icon map for string-to-component
const iconMap: Record<string, React.ElementType> = {
  Building2, MapPin, GitBranch, Split, BadgeInfo, Layers, ListOrdered, Rows, Star, UserCog, User, Tag, Briefcase, CalendarCheck2, Repeat2, Map, Wrench, ClipboardList, FileText, CheckCircle2, Upload, Clock, Calendar, Percent, Users, DollarSign, ClipboardType, CalendarClock, ScrollText
};


const languages = [
  "English",
  "Nederlands",
  "Français",
  "Deutsch",
  "Español",
  "日本語",
  "한국어",
];

const MainHeader = ({navItems}: {navItems: any}) => {
  return (
    <SessionProvider>
      <MainHeaderContent navItems={navItems} />
    </SessionProvider>
  );
};

const MainHeaderContent = ({navItems}: {navItems: any}) => {
  const [navOpen, setNavOpen] = useState<string | null>(null);
  const [langOpen, setLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState("English");
  const { status } = useSession();

  // Show loading state while session is initializing
  if (status === "loading") {
    return (
      <header className="w-full bg-[#f3f3f3] flex items-center justify-between px-12 py-4">
        <div className="flex items-center gap-0">
          {/* Logo */}
          <Link href={`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/launchdesk`} className="flex relative z-[50] items-center rounded-full bg-[#0061ff] text-white px-6 py-2 shadow-lg border-[3px] border-white">
            <span className="font-bold text-xl mr-2">I</span>
            <span className="font-semibold text-lg">inops</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-32 h-10 bg-gray-200 animate-pulse rounded-full"></div>
        </div>
      </header>
    );
  }

  return (
    <header className="w-full bg-[#f3f3f3] flex items-center justify-between px-12 py-4">
      {/* Left: Logo and Nav */}
      <div className="flex items-center gap-0">
        {/* Logo */}
        <Link href={`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/launchdesk`} className="flex relative z-[50] items-center rounded-full bg-[#0061ff] text-white px-6 py-2 shadow-lg  border-[3px] border-white">
          <span className="font-bold text-xl mr-2">I</span>
          <span className="font-semibold text-lg">inops</span>
        </Link>
        <svg
          className="w-6 h-8 relative z-[40] ml-[-4px] mr-[-4px]"
          viewBox="0 0 60 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10,0 
               Q30,10 50,0 
               Q60,20 50,40 
               Q30,30 10,40 
               Q0,20 10,0 
               Z"
            fill="white"
            stroke="#f3f3f3"
            strokeWidth="2"
          />
        </svg>
        {/* Nav */}
        <nav className="flex  relative z-[50] items-center bg-white rounded-full shadow-lg px-[3px] py-[9px] gap-0.5">
          {navItems.map((item: any) => (
            <div key={item.label} className="relative">
              <div className="relative inline-block">
                <Link href={item?.link || "#"}
                  className={`px-4 py-2 rounded-full font-medium text-sm transition-colors ${navOpen === item.label ? "bg-gray-100 text-black" : "text-gray-700 hover:bg-gray-100"}`}
                  onMouseEnter={() => item.dropdown && setNavOpen(item.label)}
                  onClick={() => item.dropdown && setNavOpen(item.label)}
                >
                  {item.label}
                </Link>
                {item.dropdown && navOpen === item.label && (
                  <>
                    <div
                      className="absolute left-0 right-0 h-4 bg-transparent"
                      onMouseEnter={() => setNavOpen(item.label)}
                    />
                    <div
                      className="absolute left-0 top-[calc(100%+1rem)] z-50 bg-white rounded-2xl shadow-xl border border-gray-100"
                      onMouseEnter={() => setNavOpen(item.label)}
                      onMouseLeave={() => setNavOpen(null)}
                    >
                      <div className="w-[480px] p-6 flex flex-col gap-2">
                        <div className="font-semibold text-[14px] text-blue-900 mb-0">{item.dropdown}</div>
                        <ul className="text-sm text-gray-700 space-y-1 grid grid-cols-2 gap-0">
                          {item.items.map((sub: any, idx: any) => {
                            const Icon = iconMap[sub.icon];
                            return (
                              <Link key={sub?.label} href={sub?.link || "#"} className="group flex items-center p-2 px-4 rounded-full hover:bg-gray-100 cursor-pointer">
                                {Icon && <Icon className="w-5 h-5 mr-2 text-gray-400" />}
                                {sub.label}
                                <ArrowUpRight className="w-4 h-4 ml-auto text-gray-400 hidden group-hover:inline" />
                              </Link>
                            );
                          })}
                        </ul>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </nav>
      </div>
      {/* Right: Language, Pricing, Login, Book Demo */}
      <div className="flex items-center gap-2">
        {/* Language Selector */}
        <div className="relative">
          <button
            className="flex items-center gap-1 px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100"
            onClick={() => setLangOpen((v) => !v)}
          >
            <Globe className="w-5 h-5" />
            <ChevronDown className="w-4 h-4" />
          </button>
          {langOpen && (
            <div className="absolute right-0 top-12 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 min-w-[180px]">
              {languages.map((lang) => (
                <button
                  key={lang}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg ${selectedLang === lang ? "font-semibold text-black" : "text-gray-700"}`}
                  onClick={() => {
                    setSelectedLang(lang);
                    setLangOpen(false);
                  }}
                >
                  {lang}
                </button>
              ))}
            </div>
          )}
        </div>
        {/* Pricing */}
        {/* <button className="px-4 py-2 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 font-medium text-sm">Pricing</button> */}
        {/* Login */}
        {/* <button className="px-4 py-2 rounded-full bg-white text-gray-700 hover:bg-gray-100 font-medium text-sm">Login</button> */}
        {/* Book Demo */}
        <ProfileDropdown />
      </div>
    </header>
  );
};

function ProfileDropdown() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: session, status } = useSession();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Show loading state while session is initializing
  if (status === "loading") {
    return (
      <div className="flex items-center gap-2 bg-white shadow-xl px-3 py-2 rounded-full">
        <div className="w-10 h-10 bg-gray-200 animate-pulse rounded-full"></div>
        <div className="flex flex-col gap-1">
          <div className="w-24 h-4 bg-gray-200 animate-pulse rounded"></div>
          <div className="w-32 h-3 bg-gray-200 animate-pulse rounded"></div>
        </div>
      </div>
    );
  }

  // Show sign in button if not authenticated
  if (status === "unauthenticated") {
    return (
      <Link 
        href="/login"
        className="flex items-center gap-2 bg-white shadow-xl hover:bg-[#f8f6fa] px-4 py-2 rounded-full"
      >
        Sign in
      </Link>
    );
  }

  const userName = session?.user?.name || 'User';
  const userEmail = session?.user?.email || '';
  const userImage = session?.user?.image || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="flex items-center gap-2 bg-white shadow-xl hover:bg-[#f8f6fa] px-3 py-2 rounded-full cursor-pointer"
        onClick={() => setOpen((prev) => !prev)}
      >
        <img
          src={userImage}
          alt={userName}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <span className="font-semibold text-[15px] text-gray-900 leading-tight">{userName}</span>
          <span className="text-xs text-gray-500">{userEmail}</span>
        </div>
      </div>
      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <button
            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            onClick={async () => {
              try {
                // Clear all localStorage and sessionStorage
                if (typeof window !== "undefined") {
                  localStorage.clear();
                  sessionStorage.clear();

                  // More robust cookie clearing
                  const cookies = document.cookie.split(";");
                  cookies.forEach(cookie => {
                    const eqPos = cookie.indexOf("=");
                    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
                    
                    // Clear cookie with different path and domain combinations
                    const paths = ['/', '/login', '/dashboard', '/launchdesk'];
                    const domains = ['', window.location.hostname, '.' + window.location.hostname];
                    
                    paths.forEach(path => {
                      domains.forEach(domain => {
                        const domainPart = domain ? `;domain=${domain}` : '';
                        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path}${domainPart}`;
                        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path}${domainPart};secure`;
                        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path}${domainPart};samesite=strict`;
                      });
                    });
                  });

                  // Clear any IndexedDB data if used
                  if ('indexedDB' in window) {
                    try {
                      const databases = await indexedDB.databases();
                      databases.forEach(db => {
                        if (db.name) {
                          indexedDB.deleteDatabase(db.name);
                        }
                      });
                    } catch (error) {
                      console.log('IndexedDB clear error:', error);
                    }
                  }

                  // Clear any service worker registrations
                  if ('serviceWorker' in navigator) {
                    try {
                      const registrations = await navigator.serviceWorker.getRegistrations();
                      registrations.forEach(registration => {
                        registration.unregister();
                      });
                    } catch (error) {
                      console.log('Service worker clear error:', error);
                    }
                  }
                }
                
                // Sign out via NextAuth with proper Keycloak logout
                await signOut({ 
                  callbackUrl: `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/login`,
                  redirect: true 
                });
                
              } catch (error) {
                console.error('Sign out error:', error);
                // Fallback: force redirect to login
                window.location.href = `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/login`;
              }
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export default MainHeader
