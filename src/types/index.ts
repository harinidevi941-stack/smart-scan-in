export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  department: string;
  year: string;
  imageData: string; // base64
  faceDescriptor: number[] | null;
  registeredAt: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  inTime: string;
  outTime: string | null;
  duration: number; // seconds
  status: AttendanceStatus;
  sessionId: string;
  confidence: number;
}

export type AttendanceStatus = 'IN' | 'OUT' | 'PRESENT' | 'LEFT_EARLY' | 'ABSENT';

export interface AppSettings {
  outTimeout: number; // seconds before marking OUT
  presentThreshold: number; // seconds required for PRESENT
  confidenceThreshold: number; // 0-1
  demoMode: boolean;
}

export interface TrackingEntry {
  studentId: string;
  lastSeen: number; // timestamp
  inTime: number; // timestamp
  isPresent: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  outTimeout: 10,
  presentThreshold: 20,
  confidenceThreshold: 0.5,
  demoMode: false,
};

export const SAMPLE_STUDENTS: Omit<Student, 'faceDescriptor'>[] = [
  {
    id: 'sample-1',
    name: 'Arjun Sharma',
    rollNumber: 'CS2024001',
    department: 'Computer Science',
    year: '3rd Year',
    imageData: '',
    registeredAt: new Date().toISOString(),
  },
  {
    id: 'sample-2',
    name: 'Priya Patel',
    rollNumber: 'CS2024002',
    department: 'Computer Science',
    year: '3rd Year',
    imageData: '',
    registeredAt: new Date().toISOString(),
  },
  {
    id: 'sample-3',
    name: 'Rahul Verma',
    rollNumber: 'CS2024003',
    department: 'Computer Science',
    year: '3rd Year',
    imageData: '',
    registeredAt: new Date().toISOString(),
  },
];
