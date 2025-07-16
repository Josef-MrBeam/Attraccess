import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateWebhookConfig1741607471605 implements MigrationInterface {
    name = 'CreateWebhookConfig1741607471605'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "webhook_config" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "resourceId" integer NOT NULL, "name" varchar NOT NULL, "url" varchar NOT NULL, "method" varchar NOT NULL, "headers" text, "inUseTemplate" text NOT NULL, "notInUseTemplate" text NOT NULL, "active" boolean NOT NULL DEFAULT (1), "retryEnabled" boolean NOT NULL DEFAULT (0), "maxRetries" integer NOT NULL DEFAULT (3), "retryDelay" integer NOT NULL DEFAULT (1000), "secret" varchar, "signatureHeader" varchar NOT NULL DEFAULT ('X-Webhook-Signature'), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`CREATE TABLE "temporary_webhook_config" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "resourceId" integer NOT NULL, "name" varchar NOT NULL, "url" varchar NOT NULL, "method" varchar NOT NULL, "headers" text, "inUseTemplate" text NOT NULL, "notInUseTemplate" text NOT NULL, "active" boolean NOT NULL DEFAULT (1), "retryEnabled" boolean NOT NULL DEFAULT (0), "maxRetries" integer NOT NULL DEFAULT (3), "retryDelay" integer NOT NULL DEFAULT (1000), "secret" varchar, "signatureHeader" varchar NOT NULL DEFAULT ('X-Webhook-Signature'), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "FK_2ff18641734c27268d49ac3fdd0" FOREIGN KEY ("resourceId") REFERENCES "resource" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_webhook_config"("id", "resourceId", "name", "url", "method", "headers", "inUseTemplate", "notInUseTemplate", "active", "retryEnabled", "maxRetries", "retryDelay", "secret", "signatureHeader", "createdAt", "updatedAt") SELECT "id", "resourceId", "name", "url", "method", "headers", "inUseTemplate", "notInUseTemplate", "active", "retryEnabled", "maxRetries", "retryDelay", "secret", "signatureHeader", "createdAt", "updatedAt" FROM "webhook_config"`);
        await queryRunner.query(`DROP TABLE "webhook_config"`);
        await queryRunner.query(`ALTER TABLE "temporary_webhook_config" RENAME TO "webhook_config"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "webhook_config" RENAME TO "temporary_webhook_config"`);
        await queryRunner.query(`CREATE TABLE "webhook_config" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "resourceId" integer NOT NULL, "name" varchar NOT NULL, "url" varchar NOT NULL, "method" varchar NOT NULL, "headers" text, "inUseTemplate" text NOT NULL, "notInUseTemplate" text NOT NULL, "active" boolean NOT NULL DEFAULT (1), "retryEnabled" boolean NOT NULL DEFAULT (0), "maxRetries" integer NOT NULL DEFAULT (3), "retryDelay" integer NOT NULL DEFAULT (1000), "secret" varchar, "signatureHeader" varchar NOT NULL DEFAULT ('X-Webhook-Signature'), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`INSERT INTO "webhook_config"("id", "resourceId", "name", "url", "method", "headers", "inUseTemplate", "notInUseTemplate", "active", "retryEnabled", "maxRetries", "retryDelay", "secret", "signatureHeader", "createdAt", "updatedAt") SELECT "id", "resourceId", "name", "url", "method", "headers", "inUseTemplate", "notInUseTemplate", "active", "retryEnabled", "maxRetries", "retryDelay", "secret", "signatureHeader", "createdAt", "updatedAt" FROM "temporary_webhook_config"`);
        await queryRunner.query(`DROP TABLE "temporary_webhook_config"`);
        await queryRunner.query(`DROP TABLE "webhook_config"`);
    }

}
