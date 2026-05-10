export interface StatusAlert {
  id: string;
  receiptNumber: string;
  email: string;
  lastStatus: string;
  createdAt: Date;
  lastChecked: Date;
}

const alerts = new Map<string, StatusAlert>();

export function addAlert(receiptNumber: string, email: string, currentStatus: string): StatusAlert {
  const existing = [...alerts.values()].find(
    (a) => a.receiptNumber === receiptNumber && a.email === email,
  );
  if (existing) return existing;

  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const alert: StatusAlert = {
    id,
    receiptNumber,
    email,
    lastStatus: currentStatus,
    createdAt: new Date(),
    lastChecked: new Date(),
  };
  alerts.set(id, alert);
  return alert;
}

export function getAllAlerts(): StatusAlert[] {
  return [...alerts.values()];
}

export function updateAlertStatus(id: string, newStatus: string): void {
  const a = alerts.get(id);
  if (a) {
    a.lastStatus = newStatus;
    a.lastChecked = new Date();
  }
}
