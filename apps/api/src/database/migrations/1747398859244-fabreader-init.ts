import { MigrationInterface, QueryRunner } from "typeorm";

export class FabreaderInit1747398859244 implements MigrationInterface {
    name = 'FabreaderInit1747398859244'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "nfc_card" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "uid" text NOT NULL, "userId" integer NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "key_0" text NOT NULL DEFAULT ('0000000000000000'))`);
        await queryRunner.query(`CREATE TABLE "fab_reader" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" text NOT NULL, "apiTokenHash" text NOT NULL, "hasAccessToResourceIds" text NOT NULL DEFAULT (''), "lastConnection" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "firstConnection" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "fab_reader"`);
        await queryRunner.query(`DROP TABLE "nfc_card"`);
    }

}
