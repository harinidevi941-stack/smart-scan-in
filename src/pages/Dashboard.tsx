import { useApp } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import StatsCard from '@/components/StatsCard';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Users, UserCheck, UserX, CalendarDays, UserPlus, Camera, ClipboardList, Download, Zap } from 'lucide-react';

export default function Dashboard() {
  const { students, records, sessionId, seedSampleData } = useApp();
  const navigate = useNavigate();

  const sessionRecords = records.filter(r => r.sessionId === sessionId);
  const currentlyIn = sessionRecords.filter(r => r.status === 'IN').length;
  const leftEarly = sessionRecords.filter(r => r.status === 'LEFT_EARLY').length;
  const todaySessions = new Set(
    records
      .filter(r => new Date(r.inTime).toDateString() === new Date().toDateString())
      .map(r => r.sessionId)
  ).size;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Smart Classroom Attendance System</h1>
        <p className="text-muted-foreground mt-1">AI-based automated entry-exit attendance tracking</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Registered Students" value={students.length} icon={Users} variant="primary" />
        <StatsCard title="Currently Present" value={currentlyIn} icon={UserCheck} variant="success" />
        <StatsCard title="Left Early" value={leftEarly} icon={UserX} variant="warning" />
        <StatsCard title="Sessions Today" value={todaySessions} icon={CalendarDays} variant="default" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button onClick={() => navigate('/register')} className="h-auto py-4 flex flex-col gap-2" variant="outline">
          <UserPlus className="w-5 h-5" />
          <span>Register Student</span>
        </Button>
        <Button onClick={() => navigate('/attendance')} className="h-auto py-4 flex flex-col gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
          <Camera className="w-5 h-5" />
          <span>Start Attendance</span>
        </Button>
        <Button onClick={() => navigate('/logs')} className="h-auto py-4 flex flex-col gap-2" variant="outline">
          <ClipboardList className="w-5 h-5" />
          <span>View Logs</span>
        </Button>
        <Button onClick={() => navigate('/logs')} className="h-auto py-4 flex flex-col gap-2" variant="outline">
          <Download className="w-5 h-5" />
          <span>Export Report</span>
        </Button>
      </div>

      {/* Seed Data */}
      {students.length === 0 && (
        <div className="glass-card p-6 text-center">
          <Zap className="w-8 h-8 text-primary mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-foreground">Get Started</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">Load sample students for a quick demo</p>
          <Button onClick={seedSampleData} variant="outline">
            <Zap className="w-4 h-4 mr-2" />
            Load Sample Data
          </Button>
        </div>
      )}

      {/* Recent Activity */}
      {sessionRecords.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Current Session Activity</h3>
          <div className="space-y-3">
            {sessionRecords.slice(-5).reverse().map(record => (
              <div key={record.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{record.studentName}</p>
                  <p className="text-xs text-muted-foreground">{record.rollNumber} • {new Date(record.inTime).toLocaleTimeString()}</p>
                </div>
                <StatusBadge status={record.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
