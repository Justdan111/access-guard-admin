import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShieldX, AlertTriangle } from 'lucide-react';

interface BlockedModalProps {
  isOpen: boolean;
  // riskScore is 0-100
  riskScore: number;
  factors: string[];
  onClose: () => void;
}

export function BlockedModal({ isOpen, riskScore, factors, onClose }: BlockedModalProps) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (isOpen) {
      setCountdown(5);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            onClose();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md border-danger">
        <DialogHeader>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="p-3 bg-danger/10 rounded-full">
              <ShieldX className="h-12 w-12 text-danger" />
            </div>
            <DialogTitle className="text-2xl text-danger">Access Denied</DialogTitle>
            <DialogDescription>
              High-risk activity detected. Access to this resource has been blocked.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Risk Score Gauge */}
          <div className="p-4 bg-danger/5 border border-danger/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Risk Score</span>
              <span className="text-2xl font-bold text-danger">{Math.round(riskScore)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div 
                className="bg-danger h-3 rounded-full transition-all"
                style={{ width: `${riskScore}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Critical risk threshold exceeded</p>
          </div>

          {/* Risk Factors */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-danger">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Security Concerns:</span>
            </div>
            <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground pl-6">
              {factors.map((factor, i) => (
                <li key={i}>{factor}</li>
              ))}
            </ul>
          </div>

          {/* Auto Logout Warning */}
          <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg text-center">
            <p className="text-sm font-medium">
              Auto-logout in <span className="text-warning font-bold text-lg">{countdown}</span> seconds
            </p>
          </div>

          {/* Contact Support */}
          <Button variant="outline" className="w-full" onClick={onClose}>
            Contact Security Team
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}