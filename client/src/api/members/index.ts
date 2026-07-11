import { api } from "@/api/axios";
import { Member, InviteMemberPayload, ChangeRolePayload, ChangeStatusPayload } from "@/types/members";

export async function listMembers(organizationId: string): Promise<Member[]> {
  const response = await api.get<{ success: boolean; data: Member[] }>(
    `/organizations/${organizationId}/members`
  );
  return response.data.data;
}

export async function inviteMember(
  organizationId: string,
  payload: InviteMemberPayload
): Promise<Member> {
  const response = await api.post<{ success: boolean; data: Member }>(
    `/organizations/${organizationId}/members/invite`,
    payload
  );
  return response.data.data;
}

export async function changeRole(
  organizationId: string,
  memberId: string,
  payload: ChangeRolePayload
): Promise<Member> {
  const response = await api.patch<{ success: boolean; data: Member }>(
    `/organizations/${organizationId}/members/${memberId}/role`,
    payload
  );
  return response.data.data;
}

export async function changeStatus(
  organizationId: string,
  memberId: string,
  payload: ChangeStatusPayload
): Promise<Member> {
  const response = await api.patch<{ success: boolean; data: Member }>(
    `/organizations/${organizationId}/members/${memberId}/status`,
    payload
  );
  return response.data.data;
}

export async function removeMember(organizationId: string, memberId: string): Promise<void> {
  await api.delete(`/organizations/${organizationId}/members/${memberId}`);
}