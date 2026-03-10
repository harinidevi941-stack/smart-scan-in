import { AttendanceStatus } from '@/types';

const statusConfig: Record<AttendanceStatus, { label: string; className: string }> = {
  IN: { label: 'IN', className: 'status-in' },
  OUT: { label: 'OUT', className: 'status-out' },
  PRESENT: { label: 'Present', className: 'status-present' },
  LEFT_EARLY: { label: 'Left Early', className: 'status-left-early' },
  ABSENT: { label: 'Absent', className: 'status-absent' },
};

export default function StatusBadge({ status }: { status: AttendanceStatus }) {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.className}`}>
      {config.label}
    </span>
  );
}
