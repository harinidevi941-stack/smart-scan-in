import { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { loadModels, detectFaces, matchFace, drawDetections } from '@/lib/face-recognition';
import { AttendanceRecord, TrackingEntry } from '@/types';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/StatusBadge';
import { Camera, CameraOff, Loader2, Play, Square, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function Attendance() {
  const { students, settings, sessionId, addRecord, updateRecord, records, startNewSession } = useApp();
  const [running, setRunning] = useState(false);
  const [modelsReady, setModelsReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const trackingRef = useRef<Map<string, TrackingEntry>>(new Map());
  const intervalRef = useRef<number>(0);
  const timerRef = useRef<number>(0);

  const sessionRecords = records.filter(r => r.sessionId === sessionId);

  // Load models on mount
  useEffect(() => {
    setLoading(true);
    loadModels().then(ok => {
      setModelsReady(ok);
      setLoading(false);
      if (!ok) toast.error('Failed to load AI models. Check your internet connection.');
    });
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      return true;
    } catch {
      toast.error('Could not access camera');
      return false;
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  };

  const processFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !running) return;

    const registeredDescriptors = students
      .filter(s => s.faceDescriptor)
      .map(s => ({
        id: s.id,
        name: s.name,
        descriptor: new Float32Array(s.faceDescriptor!),
      }));

    try {
      const detections = await detectFaces(videoRef.current);
      const matchResults: { name: string; status: string }[] = [];

      for (const det of detections) {
        const match = matchFace(det.descriptor, registeredDescriptors, settings.confidenceThreshold);

        if (match) {
          const now = Date.now();
          const tracking = trackingRef.current.get(match.id);

          if (!tracking) {
            // First detection - mark IN
            trackingRef.current.set(match.id, {
              studentId: match.id,
              lastSeen: now,
              inTime: now,
              isPresent: true,
            });

            const student = students.find(s => s.id === match.id)!;
            const record: AttendanceRecord = {
              id: crypto.randomUUID(),
              studentId: match.id,
              studentName: student.name,
              rollNumber: student.rollNumber,
              inTime: new Date(now).toISOString(),
              outTime: null,
              duration: 0,
              status: 'IN',
              sessionId,
              confidence: 1 - match.distance,
            };
            addRecord(record);
            matchResults.push({ name: match.name, status: 'IN' });
          } else {
            tracking.lastSeen = now;
            if (!tracking.isPresent) {
              tracking.isPresent = true;
            }
            matchResults.push({ name: match.name, status: 'IN' });
          }
        } else {
          matchResults.push({ name: 'Unknown', status: '?' });
        }
      }

      // Check for students who left (not seen for outTimeout)
      const now = Date.now();
      trackingRef.current.forEach((tracking, studentId) => {
        if (tracking.isPresent && (now - tracking.lastSeen) > settings.outTimeout * 1000) {
          tracking.isPresent = false;
          const duration = Math.round((tracking.lastSeen - tracking.inTime) / 1000);
          const status = duration >= settings.presentThreshold ? 'PRESENT' : 'LEFT_EARLY';

          const existingRecord = sessionRecords.find(r => r.studentId === studentId && r.status === 'IN');
          if (existingRecord) {
            updateRecord(existingRecord.id, {
              outTime: new Date(tracking.lastSeen).toISOString(),
              duration,
              status,
            });
            const student = students.find(s => s.id === studentId);
            toast.info(`${student?.name} marked ${status} (${duration}s)`);
          }
        }
      });

      drawDetections(canvasRef.current, videoRef.current, detections, matchResults);
    } catch (err) {
      console.error('Frame processing error:', err);
    }
  }, [running, students, settings, sessionId, sessionRecords, addRecord, updateRecord]);

  const startAttendance = async () => {
    if (students.filter(s => s.faceDescriptor).length === 0) {
      toast.error('No students with face data registered');
      return;
    }
    const cameraOk = await startCamera();
    if (!cameraOk) return;

    trackingRef.current.clear();
    setRunning(true);
    setSessionTime(0);
    timerRef.current = window.setInterval(() => setSessionTime(t => t + 1), 1000);
  };

  const stopAttendance = () => {
    setRunning(false);
    stopCamera();
    clearInterval(intervalRef.current);
    clearInterval(timerRef.current);

    // Mark remaining IN students
    trackingRef.current.forEach((tracking, studentId) => {
      if (tracking.isPresent) {
        const duration = Math.round((Date.now() - tracking.inTime) / 1000);
        const status = duration >= settings.presentThreshold ? 'PRESENT' : 'LEFT_EARLY';
        const existingRecord = sessionRecords.find(r => r.studentId === studentId && r.status === 'IN');
        if (existingRecord) {
          updateRecord(existingRecord.id, {
            outTime: new Date().toISOString(),
            duration,
            status,
          });
        }
      }
    });

    const ctx = canvasRef.current?.getContext('2d');
    if (ctx && canvasRef.current) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  // Detection loop
  useEffect(() => {
    if (!running) return;
    intervalRef.current = window.setInterval(processFrame, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running, processFrame]);

  useEffect(() => {
    return () => {
      stopCamera();
      clearInterval(intervalRef.current);
      clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Live Attendance</h1>
          <p className="text-muted-foreground mt-1">Webcam-based face recognition attendance tracking</p>
        </div>
        <div className="flex items-center gap-3">
          {running && (
            <div className="glass-card px-4 py-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm font-mono text-foreground">{formatTime(sessionTime)}</span>
            </div>
          )}
          <Button onClick={() => { startNewSession(); trackingRef.current.clear(); }} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            New Session
          </Button>
        </div>
      </div>

      {loading && (
        <div className="glass-card p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading AI face recognition models...</p>
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Feed */}
          <div className="lg:col-span-2">
            <div className="glass-card p-4">
              <div className="relative aspect-video bg-secondary rounded-lg overflow-hidden">
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
                {!running && (
                  <div className="absolute inset-0 flex items-center justify-center bg-secondary">
                    <div className="text-center">
                      <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground text-sm">Camera feed will appear here</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-4">
                {!running ? (
                  <Button onClick={startAttendance} disabled={!modelsReady} className="flex-1">
                    <Play className="w-4 h-4 mr-2" />
                    Start Attendance
                  </Button>
                ) : (
                  <Button onClick={stopAttendance} variant="destructive" className="flex-1">
                    <Square className="w-4 h-4 mr-2" />
                    Stop Attendance
                  </Button>
                )}
              </div>

              {!modelsReady && !loading && (
                <p className="text-xs text-destructive mt-2 flex items-center gap-1">
                  <CameraOff className="w-3 h-3" />
                  AI models failed to load. Check internet and refresh.
                </p>
              )}
            </div>
          </div>

          {/* Live Status Panel */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Live Status</h3>
            {sessionRecords.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No detections yet</p>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {[...sessionRecords].reverse().map(record => (
                  <div key={record.id} className="p-3 rounded-lg bg-secondary/50 border border-border/30">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-foreground">{record.studentName}</p>
                      <StatusBadge status={record.status} />
                    </div>
                    <p className="text-xs text-muted-foreground">{record.rollNumber}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>In: {new Date(record.inTime).toLocaleTimeString()}</span>
                      {record.outTime && <span>Out: {new Date(record.outTime).toLocaleTimeString()}</span>}
                      {record.duration > 0 && <span>{record.duration}s</span>}
                    </div>
                    <div className="mt-1">
                      <span className="text-xs font-mono text-primary">{Math.round(record.confidence * 100)}% match</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
