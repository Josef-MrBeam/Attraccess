import { MigrationInterface, QueryRunner } from "typeorm";

export class Sso1741719940175 implements MigrationInterface {
    name = 'Sso1741719940175'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "sso_provider_oidc_configuration" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "ssoProviderId" integer NOT NULL, "issuer" varchar NOT NULL, "authorizationURL" varchar NOT NULL, "tokenURL" varchar NOT NULL, "userInfoURL" varchar NOT NULL, "clientId" varchar NOT NULL, "clientSecret" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "REL_e0afa5fbb3a37c919d37d5438a" UNIQUE ("ssoProviderId"))`);
        await queryRunner.query(`CREATE TABLE "sso_provider" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "type" varchar CHECK( "type" IN ('OIDC') ) NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`CREATE TABLE "temporary_authentication_detail" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "userId" integer NOT NULL, "type" varchar CHECK( "type" IN ('local_password','sso') ) NOT NULL, "password" varchar, CONSTRAINT "FK_65a0cb4c981b2ebe57d4c546fda" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_authentication_detail"("id", "userId", "type", "password") SELECT "id", "userId", "type", "password" FROM "authentication_detail"`);
        await queryRunner.query(`DROP TABLE "authentication_detail"`);
        await queryRunner.query(`ALTER TABLE "temporary_authentication_detail" RENAME TO "authentication_detail"`);
        await queryRunner.query(`CREATE TABLE "temporary_sso_provider_oidc_configuration" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "ssoProviderId" integer NOT NULL, "issuer" varchar NOT NULL, "authorizationURL" varchar NOT NULL, "tokenURL" varchar NOT NULL, "userInfoURL" varchar NOT NULL, "clientId" varchar NOT NULL, "clientSecret" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "REL_e0afa5fbb3a37c919d37d5438a" UNIQUE ("ssoProviderId"), CONSTRAINT "FK_e0afa5fbb3a37c919d37d5438ab" FOREIGN KEY ("ssoProviderId") REFERENCES "sso_provider" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_sso_provider_oidc_configuration"("id", "ssoProviderId", "issuer", "authorizationURL", "tokenURL", "userInfoURL", "clientId", "clientSecret", "createdAt", "updatedAt") SELECT "id", "ssoProviderId", "issuer", "authorizationURL", "tokenURL", "userInfoURL", "clientId", "clientSecret", "createdAt", "updatedAt" FROM "sso_provider_oidc_configuration"`);
        await queryRunner.query(`DROP TABLE "sso_provider_oidc_configuration"`);
        await queryRunner.query(`ALTER TABLE "temporary_sso_provider_oidc_configuration" RENAME TO "sso_provider_oidc_configuration"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sso_provider_oidc_configuration" RENAME TO "temporary_sso_provider_oidc_configuration"`);
        await queryRunner.query(`CREATE TABLE "sso_provider_oidc_configuration" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "ssoProviderId" integer NOT NULL, "issuer" varchar NOT NULL, "authorizationURL" varchar NOT NULL, "tokenURL" varchar NOT NULL, "userInfoURL" varchar NOT NULL, "clientId" varchar NOT NULL, "clientSecret" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "REL_e0afa5fbb3a37c919d37d5438a" UNIQUE ("ssoProviderId"))`);
        await queryRunner.query(`INSERT INTO "sso_provider_oidc_configuration"("id", "ssoProviderId", "issuer", "authorizationURL", "tokenURL", "userInfoURL", "clientId", "clientSecret", "createdAt", "updatedAt") SELECT "id", "ssoProviderId", "issuer", "authorizationURL", "tokenURL", "userInfoURL", "clientId", "clientSecret", "createdAt", "updatedAt" FROM "temporary_sso_provider_oidc_configuration"`);
        await queryRunner.query(`DROP TABLE "temporary_sso_provider_oidc_configuration"`);
        await queryRunner.query(`ALTER TABLE "authentication_detail" RENAME TO "temporary_authentication_detail"`);
        await queryRunner.query(`CREATE TABLE "authentication_detail" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "userId" integer NOT NULL, "type" varchar CHECK( "type" IN ('local_password','google','github') ) NOT NULL, "password" varchar, CONSTRAINT "FK_65a0cb4c981b2ebe57d4c546fda" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "authentication_detail"("id", "userId", "type", "password") SELECT "id", "userId", "type", "password" FROM "temporary_authentication_detail"`);
        await queryRunner.query(`DROP TABLE "temporary_authentication_detail"`);
        await queryRunner.query(`DROP TABLE "sso_provider"`);
        await queryRunner.query(`DROP TABLE "sso_provider_oidc_configuration"`);
    }

}
