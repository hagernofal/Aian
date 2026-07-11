"use client";

import { OnboardingLayout } from "@/layouts/OnboardingLayout";
import { useAuthStore } from "@/store/auth/auth.store";
import { useMembers } from "@/hooks/use-members";
import { Skeleton } from "@/components/ui/skeleton";
import { InviteMemberSection } from "./InviteMemberSection";
import { MembersList } from "./MembersList";

export default function MembersPage() {
  const user = useAuthStore((s) => s.user);
  console.log("User:", user);
  const organizationId = user?.organizationId;
  console.log("Organization ID:", organizationId);
  const { data: members, isLoading, isError } = useMembers(organizationId ?? "");

  if (!organizationId) {
    return (
      <OnboardingLayout
        eyebrow="Invite Members"
        title="Loading..."
        showSteps={false}
      >
        <Skeleton className="h-64 w-full rounded-3xl" />
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout
      eyebrow="Invite Members"
      title={<>Bring your team into the <span className="text-gold-gradient">memory</span></>}
      subtitle="Invite people by email — they'll get a beautiful onboarding to join your organization."
      maxWidth="max-w-4xl"
      showSteps={false}
    >
      <div className="glass-strong relative overflow-hidden rounded-3xl p-7">
        <InviteMemberSection organizationId={organizationId} />

        {isLoading && (
          <div className="mt-8 space-y-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        )}

        {isError && (
          <div className="mt-8 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            Failed to load members.
          </div>
        )}

        {members && <MembersList members={members} organizationId={organizationId} />}
      </div>
    </OnboardingLayout>
  );
}