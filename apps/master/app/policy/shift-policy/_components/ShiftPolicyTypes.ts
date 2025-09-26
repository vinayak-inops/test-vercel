export interface ShiftPolicy {
  id: string;
  title: string;
  description?: string;
  active: boolean;
  isPreviousDayShift: boolean;
  isNextDayShift: boolean;
  isBreakShift: boolean;
  shiftDuration: string;
  workingHrs1stHalf: string;
  workingHrs2ndHalf: string;
  shiftStartTime: string;
  shiftEndTime: string;
  firstHalfStartTime: string;
  firstHalfEndTime: string;
  secondHalfStartTime: string;
  secondHalfEndTime: string;
  earlyInDuration: string;
  maxOutDuration: string;
  inGraceDuration: string;
  lateUptoDuration: string;
  earlyGoDuration: string;
  graceOutDuration: string;
  isFlexiShift: boolean;
  isCoreTimeApplicable: boolean;
  isAutoShift: boolean;
  considerShiftStartIfInPunch: boolean;
} 