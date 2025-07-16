import { MigrationInterface, QueryRunner } from "typeorm";

export class MultipleResourceMqttConfigs1747664572702 implements MigrationInterface {
    name = 'MultipleResourceMqttConfigs1747664572702'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temporary_mqtt_resource_config" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "resourceId" integer NOT NULL, "serverId" integer NOT NULL, "inUseTopic" text NOT NULL, "inUseMessage" text NOT NULL, "notInUseTopic" text NOT NULL, "notInUseMessage" text NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "name" text NOT NULL, CONSTRAINT "FK_df86aa26ad244673076a0ffc833" FOREIGN KEY ("resourceId") REFERENCES "resource" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_6ea7fa73bd2eb020ae6fc7206a3" FOREIGN KEY ("serverId") REFERENCES "mqtt_server" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_mqtt_resource_config"("id", "resourceId", "serverId", "inUseTopic", "inUseMessage", "notInUseTopic", "notInUseMessage", "createdAt", "updatedAt") SELECT "id", "resourceId", "serverId", "inUseTopic", "inUseMessage", "notInUseTopic", "notInUseMessage", "createdAt", "updatedAt" FROM "mqtt_resource_config"`);
        await queryRunner.query(`DROP TABLE "mqtt_resource_config"`);
        await queryRunner.query(`ALTER TABLE "temporary_mqtt_resource_config" RENAME TO "mqtt_resource_config"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mqtt_resource_config" RENAME TO "temporary_mqtt_resource_config"`);
        await queryRunner.query(`CREATE TABLE "mqtt_resource_config" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "resourceId" integer NOT NULL, "serverId" integer NOT NULL, "inUseTopic" text NOT NULL, "inUseMessage" text NOT NULL, "notInUseTopic" text NOT NULL, "notInUseMessage" text NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "FK_df86aa26ad244673076a0ffc833" FOREIGN KEY ("resourceId") REFERENCES "resource" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_6ea7fa73bd2eb020ae6fc7206a3" FOREIGN KEY ("serverId") REFERENCES "mqtt_server" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "mqtt_resource_config"("id", "resourceId", "serverId", "inUseTopic", "inUseMessage", "notInUseTopic", "notInUseMessage", "createdAt", "updatedAt") SELECT "id", "resourceId", "serverId", "inUseTopic", "inUseMessage", "notInUseTopic", "notInUseMessage", "createdAt", "updatedAt" FROM "temporary_mqtt_resource_config"`);
        await queryRunner.query(`DROP TABLE "temporary_mqtt_resource_config"`);
    }

}
