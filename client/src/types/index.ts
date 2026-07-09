// TypeScript Types placeholder

export interface User {
  id: string;
  email: string;
  fullName: string;
  roleId: string;
  role: string;
  organizationId: string;
  organization: string;
}

export interface Activity {
  id: string;
  userId: string;
  action: string;
  target: string;
  timestamp: string;
}
