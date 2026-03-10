import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings as SettingsIcon, RotateCcw } from 'lucide-react';
import { DEFAULT_SETTINGS } from '@/types';

export default function Settings() {
  const { settings, updateSettings } = useApp();

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure attendance tracking parameters</p>
      </div>

      <div className="space-y-6">
        <div className="glass-card p-6 space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <SettingsIcon className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Attendance Rules</h2>
          </div>

          <div>
            <Label htmlFor="outTimeout">OUT Timeout (seconds)</Label>
            <p className="text-xs text-muted-foreground mb-1.5">Time before a missing student is marked OUT</p>
            <Input
              id="outTimeout"
              type="number"
              min={1}
              value={settings.outTimeout}
              onChange={e => updateSettings({ outTimeout: Number(e.target.value) })}
            />
          </div>

          <div>
            <Label htmlFor="presentThreshold">Minimum Present Duration (seconds)</Label>
            <p className="text-xs text-muted-foreground mb-1.5">Minimum time for a student to be marked PRESENT</p>
            <Input
              id="presentThreshold"
              type="number"
              min={1}
              value={settings.presentThreshold}
              onChange={e => updateSettings({ presentThreshold: Number(e.target.value) })}
            />
          </div>

          <div>
            <Label htmlFor="confidence">Face Recognition Confidence Threshold</Label>
            <p className="text-xs text-muted-foreground mb-1.5">Lower value = stricter matching (0.3 - 0.8)</p>
            <Input
              id="confidence"
              type="number"
              min={0.1}
              max={1}
              step={0.05}
              value={settings.confidenceThreshold}
              onChange={e => updateSettings({ confidenceThreshold: Number(e.target.value) })}
            />
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Demo Mode</h3>
              <p className="text-xs text-muted-foreground">Simulated recognition for presentation purposes</p>
            </div>
            <Switch
              checked={settings.demoMode}
              onCheckedChange={checked => updateSettings({ demoMode: checked })}
            />
          </div>
        </div>

        <Button variant="outline" onClick={() => updateSettings(DEFAULT_SETTINGS)}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
}
