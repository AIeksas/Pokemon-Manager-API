/*
  Warnings:

  - You are about to drop the column `title` on the `Pokemon` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Pokemon" DROP COLUMN "title",
ADD COLUMN     "name" TEXT NOT NULL DEFAULT 'missing name';
