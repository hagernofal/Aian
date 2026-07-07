/*
  Warnings:

  - You are about to drop the `organization_members` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[key,organization_id]` on the table `roles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `organization_id` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role_id` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "organization_members" DROP CONSTRAINT "organization_members_invited_by_user_id_fkey";

-- DropForeignKey
ALTER TABLE "organization_members" DROP CONSTRAINT "organization_members_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "organization_members" DROP CONSTRAINT "organization_members_role_id_fkey";

-- DropForeignKey
ALTER TABLE "organization_members" DROP CONSTRAINT "organization_members_user_id_fkey";

-- DropIndex
DROP INDEX "roles_key_key";

-- AlterTable
ALTER TABLE "roles" ADD COLUMN     "organization_id" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "invited_by_user_id" TEXT,
ADD COLUMN     "joined_at" TIMESTAMPTZ,
ADD COLUMN     "member_status" "membership_status" NOT NULL DEFAULT 'invited',
ADD COLUMN     "organization_id" TEXT NOT NULL,
ADD COLUMN     "role_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "organization_members";

-- CreateIndex
CREATE UNIQUE INDEX "roles_key_organization_id_key" ON "roles"("key", "organization_id");

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_invited_by_user_id_fkey" FOREIGN KEY ("invited_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
