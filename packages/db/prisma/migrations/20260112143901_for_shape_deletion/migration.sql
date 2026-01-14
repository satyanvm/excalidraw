/*
  Warnings:

  - Added the required column `endX` to the `Chat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startX` to the `Chat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Chat` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "endX" INTEGER NOT NULL,
ADD COLUMN     "startX" INTEGER NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL;
