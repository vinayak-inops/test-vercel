export type PunchReason = 'DEFAULT' | 'OFFICIAL' | 'MEDICAL' | 'PERSONAL' | 'LUNCH';
export type SwipeMode = 'In' | 'Out';

export interface PunchApplication {
  id: string;
  punchSelection: 'Fullday';
  employee: string;
  attendanceDate: string;
  reasonCode: PunchReason;
  deleted: boolean;
  punchedTime: string;
  swipeMode: SwipeMode;
  transactionTime: string;
  comments: string;
  secondPunchedTime?: string;
  secondSwipeMode?: SwipeMode;
  secondTransactionTime?: string;
} 