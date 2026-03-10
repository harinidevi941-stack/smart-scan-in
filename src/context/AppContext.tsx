import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Student, AttendanceRecord, AppSettings, DEFAULT_SETTINGS, SAMPLE_STUDENTS } from '@/types';
import { toast } from 'sonner';

interface AppContextType {
  students: Student[];
  records: AttendanceRecord[];
  settings: AppSettings;
  sessionId: string;
  addStudent: (student: Student) => void;
  removeStudent: (id: string) => void;
  addRecord: (record: AttendanceRecord) => void;
  updateRecord: (id: string, updates: Partial<AttendanceRecord>) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  clearRecords: () => void;
  startNewSession: () => string;
  getActiveRecords: () => AttendanceRecord[];
  seedSampleData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [students, setStudents] = useState<Student[]>(() => loadFromStorage('scas_students', []));
  const [records, setRecords] = useState<AttendanceRecord[]>(() => loadFromStorage('scas_records', []));
  const [settings, setSettings] = useState<AppSettings>(() => loadFromStorage('scas_settings', DEFAULT_SETTINGS));
  const [sessionId, setSessionId] = useState(() => loadFromStorage('scas_session', crypto.randomUUID()));

  useEffect(() => saveToStorage('scas_students', students), [students]);
  useEffect(() => saveToStorage('scas_records', records), [records]);
  useEffect(() => saveToStorage('scas_settings', settings), [settings]);
  useEffect(() => saveToStorage('scas_session', sessionId), [sessionId]);

  const addStudent = useCallback((student: Student) => {
    setStudents(prev => [...prev, student]);
    toast.success(`${student.name} registered successfully`);
  }, []);

  const removeStudent = useCallback((id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  }, []);

  const addRecord = useCallback((record: AttendanceRecord) => {
    setRecords(prev => [...prev, record]);
    toast.success(`${record.studentName} marked ${record.status}`);
  }, []);

  const updateRecord = useCallback((id: string, updates: Partial<AttendanceRecord>) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  }, []);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    toast.success('Settings updated');
  }, []);

  const clearRecords = useCallback(() => {
    setRecords([]);
    toast.info('Attendance records cleared');
  }, []);

  const startNewSession = useCallback(() => {
    const newId = crypto.randomUUID();
    setSessionId(newId);
    return newId;
  }, []);

  const getActiveRecords = useCallback(() => {
    return records.filter(r => r.sessionId === sessionId);
  }, [records, sessionId]);

  const seedSampleData = useCallback(() => {
    const samples: Student[] = SAMPLE_STUDENTS.map(s => ({
      ...s,
      faceDescriptor: null,
    }));
    setStudents(samples);
    toast.success('Sample students loaded');
  }, []);

  return (
    <AppContext.Provider value={{
      students, records, settings, sessionId,
      addStudent, removeStudent, addRecord, updateRecord,
      updateSettings, clearRecords, startNewSession, getActiveRecords, seedSampleData,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
