import { Camera, ShieldCheck, Clock, Wifi, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function About() {
  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground">About This Project</h1>
        <p className="text-muted-foreground mt-1">Smart Classroom Attendance System — Project Documentation</p>
      </div>

      {/* Problem Statement */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-destructive/15 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Problem Statement</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Traditional attendance systems (manual roll call, Bluetooth, Wi-Fi proximity) are prone to proxy attendance.
          Students can hand over their phones to friends and leave the classroom while still being marked present.
          There is no mechanism to verify that a student is <strong className="text-foreground">actually present throughout the class duration</strong>.
        </p>
      </div>

      {/* Existing Issues */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-amber-500/15 flex items-center justify-center">
            <Wifi className="w-5 h-5 text-amber-400" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Issues with Existing Systems</h2>
        </div>
        <ul className="space-y-3 text-sm text-muted-foreground">
          {[
            'Bluetooth-based: Students share phones, proxy easily possible',
            'Wi-Fi-based: Only checks device proximity, not actual presence',
            'Manual roll call: Time-consuming, error-prone, disruptive',
            'QR code-based: Screenshots and sharing enable proxy attendance',
            'None of these verify continuous physical presence',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Proposed Solution */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
            <Camera className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Proposed Solution</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          An AI-powered camera-based attendance system that uses face detection and recognition through the laptop webcam.
          Instead of marking attendance once, the system continuously monitors and tracks:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: CheckCircle2, title: 'Entry Detection', desc: 'Marks IN when a registered face is first recognized' },
            { icon: Clock, title: 'Duration Tracking', desc: 'Monitors continuous presence throughout the session' },
            { icon: ShieldCheck, title: 'Exit Detection', desc: 'Marks OUT when student is no longer visible' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-4 rounded-lg bg-secondary/50 border border-border/30">
              <Icon className="w-5 h-5 text-primary mb-2" />
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Advantages */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-green-500/15 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-green-400" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Advantages</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            'Fully automated — no manual marking',
            'Low cost — uses existing laptop webcam',
            'Reduced proxy attendance — biometric verification',
            'Duration-based validation — not just one-time check',
            'Real-time monitoring — live status tracking',
            'Easy to deploy — runs in any web browser',
          ].map((adv, i) => (
            <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-green-500/5 border border-green-500/10">
              <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">{adv}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Technology Stack</h2>
        <div className="flex flex-wrap gap-2">
          {['React', 'TypeScript', 'Tailwind CSS', 'face-api.js', 'TensorFlow.js', 'WebRTC', 'Local Storage'].map(tech => (
            <span key={tech} className="px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
