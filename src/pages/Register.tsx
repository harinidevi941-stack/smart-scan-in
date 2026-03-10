import { useState, useRef, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { getFaceDescriptor } from '@/lib/face-recognition';
import { Student } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Upload, UserPlus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Register() {
  const { students, addStudent, removeStudent } = useApp();
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [year, setYear] = useState('3rd Year');
  const [imageData, setImageData] = useState('');
  const [capturing, setCapturing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCapturing(true);
    } catch {
      toast.error('Could not access camera');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
    setImageData(canvas.toDataURL('image/jpeg', 0.8));
    stopCamera();
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCapturing(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageData(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = useCallback(async () => {
    if (!name || !rollNumber) {
      toast.error('Name and Roll Number are required');
      return;
    }
    if (students.some(s => s.rollNumber === rollNumber)) {
      toast.error('Roll number already registered');
      return;
    }

    setProcessing(true);
    let descriptor: number[] | null = null;

    if (imageData) {
      try {
        const img = new Image();
        img.src = imageData;
        await new Promise(resolve => { img.onload = resolve; });
        const desc = await getFaceDescriptor(img);
        descriptor = desc ? Array.from(desc) : null;
        if (!descriptor) toast.warning('No face detected in image. Student saved without face data.');
      } catch {
        toast.warning('Face detection failed. Student saved without face data.');
      }
    }

    const student: Student = {
      id: crypto.randomUUID(),
      name,
      rollNumber,
      department,
      year,
      imageData,
      faceDescriptor: descriptor,
      registeredAt: new Date().toISOString(),
    };

    addStudent(student);
    setName('');
    setRollNumber('');
    setImageData('');
    setProcessing(false);
  }, [name, rollNumber, department, year, imageData, students, addStudent]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Student Registration</h1>
        <p className="text-muted-foreground mt-1">Register students with face data for attendance tracking</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Registration Form */}
        <div className="glass-card p-6 space-y-5">
          <h2 className="text-lg font-semibold text-foreground">New Student</h2>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Student Name</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Enter full name" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="roll">Roll Number</Label>
              <Input id="roll" value={rollNumber} onChange={e => setRollNumber(e.target.value)} placeholder="e.g. CS2024001" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="dept">Department</Label>
              <Input id="dept" value={department} onChange={e => setDepartment(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="year">Year / Semester</Label>
              <Input id="year" value={year} onChange={e => setYear(e.target.value)} className="mt-1.5" />
            </div>
          </div>

          {/* Face Capture */}
          <div className="space-y-3">
            <Label>Face Image</Label>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={capturing ? capturePhoto : startCamera}>
                <Camera className="w-4 h-4 mr-2" />
                {capturing ? 'Capture' : 'Use Camera'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Photo
              </Button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            </div>

            {capturing && (
              <div className="relative rounded-lg overflow-hidden border border-border">
                <video ref={videoRef} className="w-full" autoPlay playsInline muted />
                <Button variant="outline" size="sm" className="absolute bottom-2 right-2" onClick={stopCamera}>Cancel</Button>
              </div>
            )}

            {imageData && !capturing && (
              <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-border">
                <img src={imageData} alt="Captured" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <Button onClick={handleSubmit} disabled={processing} className="w-full">
            {processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserPlus className="w-4 h-4 mr-2" />}
            {processing ? 'Processing...' : 'Register Student'}
          </Button>
        </div>

        {/* Registered Students List */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Registered Students ({students.length})</h2>
          {students.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No students registered yet</p>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {students.map(s => (
                <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border/30">
                  {s.imageData ? (
                    <img src={s.imageData} alt={s.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                      {s.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.rollNumber} • {s.department}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${s.faceDescriptor ? 'bg-green-400' : 'bg-amber-400'}`} title={s.faceDescriptor ? 'Face registered' : 'No face data'} />
                    <Button variant="ghost" size="sm" onClick={() => removeStudent(s.id)}>
                      <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
