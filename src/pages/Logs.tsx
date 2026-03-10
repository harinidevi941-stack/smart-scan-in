import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Search, Trash2, Printer } from 'lucide-react';

export default function Logs() {
  const { records, clearRecords } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    return records.filter(r => {
      const matchSearch = !search ||
        r.studentName.toLowerCase().includes(search.toLowerCase()) ||
        r.rollNumber.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [records, search, statusFilter]);

  const exportCSV = () => {
    const headers = 'Name,Roll Number,IN Time,OUT Time,Duration (s),Status,Confidence\n';
    const rows = filtered.map(r =>
      `"${r.studentName}","${r.rollNumber}","${new Date(r.inTime).toLocaleString()}","${r.outTime ? new Date(r.outTime).toLocaleString() : '-'}",${r.duration},"${r.status}",${Math.round(r.confidence * 100)}%`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Attendance Report</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { font-size: 18px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 13px; }
        th { background: #1e3a5f; color: white; }
        .present { color: green; font-weight: bold; }
        .absent { color: red; font-weight: bold; }
      </style></head><body>
      <h1>Smart Classroom Attendance System - Report</h1>
      <p>Generated: ${new Date().toLocaleString()}</p>
      <table>
        <tr><th>Name</th><th>Roll No</th><th>IN</th><th>OUT</th><th>Duration</th><th>Status</th></tr>
        ${filtered.map(r => `<tr>
          <td>${r.studentName}</td>
          <td>${r.rollNumber}</td>
          <td>${new Date(r.inTime).toLocaleTimeString()}</td>
          <td>${r.outTime ? new Date(r.outTime).toLocaleTimeString() : '-'}</td>
          <td>${r.duration}s</td>
          <td class="${r.status === 'PRESENT' ? 'present' : 'absent'}">${r.status}</td>
        </tr>`).join('')}
      </table></body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Attendance Logs</h1>
          <p className="text-muted-foreground mt-1">{records.length} total records</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV} disabled={filtered.length === 0}>
            <Download className="w-4 h-4 mr-2" />CSV
          </Button>
          <Button variant="outline" size="sm" onClick={printReport} disabled={filtered.length === 0}>
            <Printer className="w-4 h-4 mr-2" />Print
          </Button>
          <Button variant="outline" size="sm" onClick={clearRecords} disabled={records.length === 0}>
            <Trash2 className="w-4 h-4 mr-2" />Clear
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or roll number..." className="pl-9" />
        </div>
        <div className="flex gap-1">
          {['all', 'IN', 'OUT', 'PRESENT', 'LEFT_EARLY', 'ABSENT'].map(s => (
            <Button key={s} variant={statusFilter === s ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter(s)} className="text-xs">
              {s === 'all' ? 'All' : s.replace('_', ' ')}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Name</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Roll No</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">IN Time</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">OUT Time</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Duration</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Confidence</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-muted-foreground text-sm">No records found</td>
                </tr>
              ) : (
                filtered.map(r => (
                  <tr key={r.id} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{r.studentName}</td>
                    <td className="px-4 py-3 text-sm font-mono text-muted-foreground">{r.rollNumber}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(r.inTime).toLocaleTimeString()}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{r.outTime ? new Date(r.outTime).toLocaleTimeString() : '—'}</td>
                    <td className="px-4 py-3 text-sm font-mono text-muted-foreground">{r.duration > 0 ? `${r.duration}s` : '—'}</td>
                    <td className="px-4 py-3 text-sm font-mono text-primary">{Math.round(r.confidence * 100)}%</td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
