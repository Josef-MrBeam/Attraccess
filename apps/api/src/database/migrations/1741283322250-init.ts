import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1741283322250 implements MigrationInterface {
    name = 'Init1741283322250'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "resource_usage" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "resourceId" integer NOT NULL, "userId" integer, "startTime" datetime NOT NULL DEFAULT (datetime('now')), "startNotes" text, "endTime" datetime, "endNotes" text, "usageInMinutes" integer NOT NULL AS (CASE 
      WHEN "endTime" IS NULL THEN -1
      ELSE (julianday("endTime") - julianday("startTime")) * 1440
    END) STORED)`);
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (NULL, NULL, ?, ?, ?, ?)`, ["resource_usage","GENERATED_COLUMN","usageInMinutes","CASE \n      WHEN \"endTime\" IS NULL THEN -1\n      ELSE (julianday(\"endTime\") - julianday(\"startTime\")) * 1440\n    END"]);
        await queryRunner.query(`CREATE TABLE "revoked_token" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "userId" integer NOT NULL, "token" varchar NOT NULL, "tokenId" varchar NOT NULL, "expiresAt" datetime NOT NULL, "revokedAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`CREATE TABLE "authentication_detail" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "userId" integer NOT NULL, "type" varchar CHECK( "type" IN ('local_password','google','github') ) NOT NULL, "password" varchar)`);
        await queryRunner.query(`CREATE TABLE "resource_introduction_user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "resourceId" integer NOT NULL, "userId" integer NOT NULL, "grantedAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "username" varchar NOT NULL, "email" varchar NOT NULL, "isEmailVerified" boolean NOT NULL DEFAULT (0), "emailVerificationToken" text, "emailVerificationTokenExpiresAt" datetime, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "systemPermissionsCanmanageresources" boolean NOT NULL DEFAULT (0), "systemPermissionsCanmanageusers" boolean NOT NULL DEFAULT (0), "systemPermissionsCanmanagepermissions" boolean NOT NULL DEFAULT (0), CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"))`);
        await queryRunner.query(`CREATE TABLE "resource_introduction_history_item" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "introductionId" integer NOT NULL, "action" varchar CHECK( "action" IN ('revoke','unrevoke') ) NOT NULL, "performedByUserId" integer NOT NULL, "comment" text, "createdAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`CREATE TABLE "resource_introduction" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "resourceId" integer NOT NULL, "receiverUserId" integer NOT NULL, "tutorUserId" integer, "completedAt" datetime NOT NULL DEFAULT (datetime('now')), "createdAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`CREATE TABLE "resource" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "description" text, "imageFilename" text, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`CREATE TABLE "temporary_resource_usage" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "resourceId" integer NOT NULL, "userId" integer, "startTime" datetime NOT NULL DEFAULT (datetime('now')), "startNotes" text, "endTime" datetime, "endNotes" text, "usageInMinutes" integer NOT NULL AS (CASE 
      WHEN "endTime" IS NULL THEN -1
      ELSE (julianday("endTime") - julianday("startTime")) * 1440
    END) STORED, CONSTRAINT "FK_8177b2b424a6d31c533d57b95cc" FOREIGN KEY ("resourceId") REFERENCES "resource" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_6f80e3fc0cf8bfce60e25a6805f" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_resource_usage"("id", "resourceId", "userId", "startTime", "startNotes", "endTime", "endNotes") SELECT "id", "resourceId", "userId", "startTime", "startNotes", "endTime", "endNotes" FROM "resource_usage"`);
        await queryRunner.query(`DROP TABLE "resource_usage"`);
        await queryRunner.query(`ALTER TABLE "temporary_resource_usage" RENAME TO "resource_usage"`);
        await queryRunner.query(`CREATE TABLE "temporary_revoked_token" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "userId" integer NOT NULL, "token" varchar NOT NULL, "tokenId" varchar NOT NULL, "expiresAt" datetime NOT NULL, "revokedAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "FK_9441609ff7307fb73d22eed453d" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_revoked_token"("id", "userId", "token", "tokenId", "expiresAt", "revokedAt") SELECT "id", "userId", "token", "tokenId", "expiresAt", "revokedAt" FROM "revoked_token"`);
        await queryRunner.query(`DROP TABLE "revoked_token"`);
        await queryRunner.query(`ALTER TABLE "temporary_revoked_token" RENAME TO "revoked_token"`);
        await queryRunner.query(`CREATE TABLE "temporary_authentication_detail" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "userId" integer NOT NULL, "type" varchar CHECK( "type" IN ('local_password','google','github') ) NOT NULL, "password" varchar, CONSTRAINT "FK_65a0cb4c981b2ebe57d4c546fda" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_authentication_detail"("id", "userId", "type", "password") SELECT "id", "userId", "type", "password" FROM "authentication_detail"`);
        await queryRunner.query(`DROP TABLE "authentication_detail"`);
        await queryRunner.query(`ALTER TABLE "temporary_authentication_detail" RENAME TO "authentication_detail"`);
        await queryRunner.query(`CREATE TABLE "temporary_resource_introduction_user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "resourceId" integer NOT NULL, "userId" integer NOT NULL, "grantedAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "FK_1965529b5359163f498e97b6979" FOREIGN KEY ("resourceId") REFERENCES "resource" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_12a2193fc2a76b7cbc8fcb1aef8" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_resource_introduction_user"("id", "resourceId", "userId", "grantedAt") SELECT "id", "resourceId", "userId", "grantedAt" FROM "resource_introduction_user"`);
        await queryRunner.query(`DROP TABLE "resource_introduction_user"`);
        await queryRunner.query(`ALTER TABLE "temporary_resource_introduction_user" RENAME TO "resource_introduction_user"`);
        await queryRunner.query(`CREATE TABLE "temporary_resource_introduction_history_item" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "introductionId" integer NOT NULL, "action" varchar CHECK( "action" IN ('revoke','unrevoke') ) NOT NULL, "performedByUserId" integer NOT NULL, "comment" text, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "FK_d8111a1260c0438d095303dc136" FOREIGN KEY ("introductionId") REFERENCES "resource_introduction" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_6e8c08c535b7a63961699049cba" FOREIGN KEY ("performedByUserId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_resource_introduction_history_item"("id", "introductionId", "action", "performedByUserId", "comment", "createdAt") SELECT "id", "introductionId", "action", "performedByUserId", "comment", "createdAt" FROM "resource_introduction_history_item"`);
        await queryRunner.query(`DROP TABLE "resource_introduction_history_item"`);
        await queryRunner.query(`ALTER TABLE "temporary_resource_introduction_history_item" RENAME TO "resource_introduction_history_item"`);
        await queryRunner.query(`CREATE TABLE "temporary_resource_introduction" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "resourceId" integer NOT NULL, "receiverUserId" integer NOT NULL, "tutorUserId" integer, "completedAt" datetime NOT NULL DEFAULT (datetime('now')), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "FK_1693bbfb15013a1ec119e9f9c0d" FOREIGN KEY ("resourceId") REFERENCES "resource" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_275626e28c839888d63e6a7d2c1" FOREIGN KEY ("receiverUserId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_bef5cdb0c4699414e813acfb683" FOREIGN KEY ("tutorUserId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_resource_introduction"("id", "resourceId", "receiverUserId", "tutorUserId", "completedAt", "createdAt") SELECT "id", "resourceId", "receiverUserId", "tutorUserId", "completedAt", "createdAt" FROM "resource_introduction"`);
        await queryRunner.query(`DROP TABLE "resource_introduction"`);
        await queryRunner.query(`ALTER TABLE "temporary_resource_introduction" RENAME TO "resource_introduction"`);
        await queryRunner.query(`CREATE VIEW "resource_computed_view" AS SELECT "resource"."id" AS "id", COALESCE(SUM("usage"."usageInMinutes"), -1) AS "totalUsageMinutes" FROM "resource" "resource" LEFT JOIN "resource_usage" "usage" ON "usage"."resourceId" = "resource"."id" GROUP BY "resource"."id"`);
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (NULL, NULL, NULL, ?, ?, ?)`, ["VIEW","resource_computed_view","SELECT \"resource\".\"id\" AS \"id\", COALESCE(SUM(\"usage\".\"usageInMinutes\"), -1) AS \"totalUsageMinutes\" FROM \"resource\" \"resource\" LEFT JOIN \"resource_usage\" \"usage\" ON \"usage\".\"resourceId\" = \"resource\".\"id\" GROUP BY \"resource\".\"id\""]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = ? AND "name" = ?`, ["VIEW","resource_computed_view"]);
        await queryRunner.query(`DROP VIEW "resource_computed_view"`);
        await queryRunner.query(`ALTER TABLE "resource_introduction" RENAME TO "temporary_resource_introduction"`);
        await queryRunner.query(`CREATE TABLE "resource_introduction" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "resourceId" integer NOT NULL, "receiverUserId" integer NOT NULL, "tutorUserId" integer, "completedAt" datetime NOT NULL DEFAULT (datetime('now')), "createdAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`INSERT INTO "resource_introduction"("id", "resourceId", "receiverUserId", "tutorUserId", "completedAt", "createdAt") SELECT "id", "resourceId", "receiverUserId", "tutorUserId", "completedAt", "createdAt" FROM "temporary_resource_introduction"`);
        await queryRunner.query(`DROP TABLE "temporary_resource_introduction"`);
        await queryRunner.query(`ALTER TABLE "resource_introduction_history_item" RENAME TO "temporary_resource_introduction_history_item"`);
        await queryRunner.query(`CREATE TABLE "resource_introduction_history_item" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "introductionId" integer NOT NULL, "action" varchar CHECK( "action" IN ('revoke','unrevoke') ) NOT NULL, "performedByUserId" integer NOT NULL, "comment" text, "createdAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`INSERT INTO "resource_introduction_history_item"("id", "introductionId", "action", "performedByUserId", "comment", "createdAt") SELECT "id", "introductionId", "action", "performedByUserId", "comment", "createdAt" FROM "temporary_resource_introduction_history_item"`);
        await queryRunner.query(`DROP TABLE "temporary_resource_introduction_history_item"`);
        await queryRunner.query(`ALTER TABLE "resource_introduction_user" RENAME TO "temporary_resource_introduction_user"`);
        await queryRunner.query(`CREATE TABLE "resource_introduction_user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "resourceId" integer NOT NULL, "userId" integer NOT NULL, "grantedAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`INSERT INTO "resource_introduction_user"("id", "resourceId", "userId", "grantedAt") SELECT "id", "resourceId", "userId", "grantedAt" FROM "temporary_resource_introduction_user"`);
        await queryRunner.query(`DROP TABLE "temporary_resource_introduction_user"`);
        await queryRunner.query(`ALTER TABLE "authentication_detail" RENAME TO "temporary_authentication_detail"`);
        await queryRunner.query(`CREATE TABLE "authentication_detail" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "userId" integer NOT NULL, "type" varchar CHECK( "type" IN ('local_password','google','github') ) NOT NULL, "password" varchar)`);
        await queryRunner.query(`INSERT INTO "authentication_detail"("id", "userId", "type", "password") SELECT "id", "userId", "type", "password" FROM "temporary_authentication_detail"`);
        await queryRunner.query(`DROP TABLE "temporary_authentication_detail"`);
        await queryRunner.query(`ALTER TABLE "revoked_token" RENAME TO "temporary_revoked_token"`);
        await queryRunner.query(`CREATE TABLE "revoked_token" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "userId" integer NOT NULL, "token" varchar NOT NULL, "tokenId" varchar NOT NULL, "expiresAt" datetime NOT NULL, "revokedAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`INSERT INTO "revoked_token"("id", "userId", "token", "tokenId", "expiresAt", "revokedAt") SELECT "id", "userId", "token", "tokenId", "expiresAt", "revokedAt" FROM "temporary_revoked_token"`);
        await queryRunner.query(`DROP TABLE "temporary_revoked_token"`);
        await queryRunner.query(`ALTER TABLE "resource_usage" RENAME TO "temporary_resource_usage"`);
        await queryRunner.query(`CREATE TABLE "resource_usage" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "resourceId" integer NOT NULL, "userId" integer, "startTime" datetime NOT NULL DEFAULT (datetime('now')), "startNotes" text, "endTime" datetime, "endNotes" text, "usageInMinutes" integer NOT NULL AS (CASE 
      WHEN "endTime" IS NULL THEN -1
      ELSE (julianday("endTime") - julianday("startTime")) * 1440
    END) STORED)`);
        await queryRunner.query(`INSERT INTO "resource_usage"("id", "resourceId", "userId", "startTime", "startNotes", "endTime", "endNotes") SELECT "id", "resourceId", "userId", "startTime", "startNotes", "endTime", "endNotes" FROM "temporary_resource_usage"`);
        await queryRunner.query(`DROP TABLE "temporary_resource_usage"`);
        await queryRunner.query(`DROP TABLE "resource"`);
        await queryRunner.query(`DROP TABLE "resource_introduction"`);
        await queryRunner.query(`DROP TABLE "resource_introduction_history_item"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "resource_introduction_user"`);
        await queryRunner.query(`DROP TABLE "authentication_detail"`);
        await queryRunner.query(`DROP TABLE "revoked_token"`);
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = ? AND "name" = ? AND "table" = ?`, ["GENERATED_COLUMN","usageInMinutes","resource_usage"]);
        await queryRunner.query(`DROP TABLE "resource_usage"`);
    }

}
