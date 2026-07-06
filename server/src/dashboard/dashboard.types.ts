export interface EyeStatusItem {
  eyeType: string;
  providerName: string | null;
  status: string;
}

export interface DashboardOwnerData {
  organization: {
    id: string;
    name: string;
    status: string;
  } | null;
  subscription: {
    billingCycle: string;
    status: string;
    currentPeriodEnd: string | null;
  } | null;
  onboardingProgress: {
    currentStep: string;
    isCompleted: boolean;
  } | null;
  eyes: EyeStatusItem[];
  memberCount: number;
  roleCount: number;
}