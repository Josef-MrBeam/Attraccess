import { MigrationInterface, QueryRunner } from 'typeorm';

export class GroupIntroducersUpdate1749112451681 implements MigrationInterface {
  name = 'GroupIntroducersUpdate1749112451681';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "temporary_email_templates" ("type" varchar CHECK( "type" IN ('verify-email','reset-password') ) PRIMARY KEY NOT NULL, "subject" varchar(255) NOT NULL, "body" text NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "variables" text NOT NULL)`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_email_templates"("type", "subject", "body", "createdAt", "updatedAt", "variables") SELECT "type", "subject", "body", "createdAt", "updatedAt", "variables" FROM "email_templates"`
    );
    await queryRunner.query(`DROP TABLE "email_templates"`);
    await queryRunner.query(`ALTER TABLE "temporary_email_templates" RENAME TO "email_templates"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_resource_introduction_history_item" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "introductionId" integer NOT NULL, "action" varchar CHECK( "action" IN ('revoke','grant') ) NOT NULL, "performedByUserId" integer NOT NULL, "comment" text, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "FK_d8111a1260c0438d095303dc136" FOREIGN KEY ("introductionId") REFERENCES "resource_introduction" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_6e8c08c535b7a63961699049cba" FOREIGN KEY ("performedByUserId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_resource_introduction_history_item"("id", "introductionId", "action", "performedByUserId", "comment", "createdAt") 
       SELECT "id", "introductionId", 
              CASE 
                WHEN "action" = 'unrevoke' THEN 'grant'
                ELSE "action"
              END as "action",
              "performedByUserId", "comment", "createdAt" 
       FROM "resource_introduction_history_item"`
    );

    // for all introductions without any history items, add a history item with the action "grant"
    await queryRunner.query(
      `INSERT INTO "temporary_resource_introduction_history_item"("introductionId", "action", "performedByUserId", "comment", "createdAt") 
       SELECT "resource_introduction"."id", 'grant', "resource_introduction"."tutorUserId", NULL, "resource_introduction"."createdAt" 
       FROM "resource_introduction" 
       LEFT JOIN "temporary_resource_introduction_history_item" ON "temporary_resource_introduction_history_item"."introductionId" = "resource_introduction"."id" 
       WHERE "temporary_resource_introduction_history_item"."id" IS NULL
       AND "resource_introduction"."tutorUserId" IS NOT NULL`
    );

    await queryRunner.query(`DROP TABLE "resource_introduction_history_item"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_resource_introduction_history_item" RENAME TO "resource_introduction_history_item"`
    );
    const originalIntroduceCount = await queryRunner.query(`SELECT COUNT(*) FROM "resource_introduction_user"`);

    await queryRunner.query(
      `CREATE TABLE "resource_introducer" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "resourceId" integer, "userId" integer NOT NULL, "resourceGroupId" integer, "grantedAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "FK_cd443e54af5fcbe1c9b7a2fe633" FOREIGN KEY ("resourceId") REFERENCES "resource" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_e56231d39612dcfa29f78e1f68d" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_58e298501d9635bc1978798cb90" FOREIGN KEY ("resourceGroupId") REFERENCES "resource_group" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "resource_introducer"("id", "resourceId", "userId", "resourceGroupId", "grantedAt") SELECT "id", "resourceId", "userId", "resourceGroupId", "grantedAt" FROM "resource_introduction_user"`
    );

    const newIntroduceCount = await queryRunner.query(`SELECT COUNT(*) FROM "resource_introducer"`);

    if (originalIntroduceCount[0].count !== newIntroduceCount[0].count) {
      throw new Error('Introduce count is not the same');
    }

    await queryRunner.query(`DROP TABLE "resource_introduction_user"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "resource_introduction_user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "resourceId" integer, "userId" integer NOT NULL, "resourceGroupId" integer, "grantedAt" datetime NOT NULL DEFAULT (datetime('now')))`
    );
    await queryRunner.query(
      `INSERT INTO "resource_introduction_user"("id", "resourceId", "userId", "resourceGroupId", "grantedAt") SELECT "id", "resourceId", "userId", "resourceGroupId", "grantedAt" FROM "resource_introducer"`
    );
    await queryRunner.query(
      `ALTER TABLE "resource_introduction_history_item" RENAME TO "temporary_resource_introduction_history_item"`
    );
    await queryRunner.query(
      `CREATE TABLE "resource_introduction_history_item" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "introductionId" integer NOT NULL, "action" varchar CHECK( "action" IN ('revoke','unrevoke') ) NOT NULL, "performedByUserId" integer NOT NULL, "comment" text, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "FK_d8111a1260c0438d095303dc136" FOREIGN KEY ("introductionId") REFERENCES "resource_introduction" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_6e8c08c535b7a63961699049cba" FOREIGN KEY ("performedByUserId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "resource_introduction_history_item"("id", "introductionId", "action", "performedByUserId", "comment", "createdAt") 
       SELECT "id", "introductionId", 
              CASE 
                WHEN "action" = 'grant' THEN 'unrevoke'
                ELSE "action"
              END as "action",
              "performedByUserId", "comment", "createdAt" 
       FROM "temporary_resource_introduction_history_item"`
    );

    await queryRunner.query(`DROP TABLE "temporary_resource_introduction_history_item"`);
    await queryRunner.query(`ALTER TABLE "email_templates" RENAME TO "temporary_email_templates"`);
    await queryRunner.query(
      `CREATE TABLE "email_templates" ("type" varchar CHECK( "type" IN ('verify-email','reset-password') ) PRIMARY KEY NOT NULL, "subject" varchar(255) NOT NULL, "body" text NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "variables" text NOT NULL)`
    );
    await queryRunner.query(
      `INSERT INTO "email_templates"("type", "subject", "body", "createdAt", "updatedAt", "variables") SELECT "type", "subject", "body", "createdAt", "updatedAt", "variables" FROM "temporary_email_templates"`
    );
    await queryRunner.query(`DROP TABLE "temporary_email_templates"`);
    await queryRunner.query(`DROP TABLE "resource_introducer"`);
  }
}
