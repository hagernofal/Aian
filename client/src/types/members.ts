export interface MemberRole {
  id: string;
  key: "owner" | "admin" | "member";
  name: string;
}

export interface Member {
  id: string;
  fullName: string;
  email: string;
  status: string;
  memberStatus: "invited" | "active" | "deactivated";
  joinedAt: string | null;
  createdAt: string;
  role: MemberRole;
}

export interface InviteMemberPayload {
  email: string;
  roleId: string;
}

export interface ChangeRolePayload {
  roleId: string;
}

export interface ChangeStatusPayload {
  memberStatus: "active" | "deactivated";
}