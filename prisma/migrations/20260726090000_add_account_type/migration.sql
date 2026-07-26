-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('CHECKING', 'SAVINGS', 'TRADITIONAL');

-- AlterTable
ALTER TABLE "Account" ADD COLUMN "type" "AccountType" NOT NULL DEFAULT 'SAVINGS';
