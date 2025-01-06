import { Application } from '@ubio/framework';
import { MongoDb } from '@ubio/framework/modules/mongodb';
import { dep } from 'mesh-ioc';
import { InstanceService } from './services/instance-service.js';
import { MongoDBInstanceRepository } from './repositories/mongodb-instance-repository.js';
import { Service } from './spi/service.js';
import { InstanceRepository } from './spi/repository.js';
import { InstanceRouter } from './routes/instance-router.js';
import dotenv from 'dotenv';

dotenv.config();

export class App extends Application {
    @dep() mongodb!: MongoDb;

    override createGlobalScope() {
        const mesh = super.createGlobalScope();
        mesh.service(MongoDb);
        mesh.service(InstanceRepository, MongoDBInstanceRepository);
        mesh.service(Service, InstanceService);
        return mesh;
    }

    override createHttpRequestScope() {
        const mesh = super.createHttpRequestScope();
        mesh.service(InstanceRouter);
        return mesh;
    }

    override async beforeStart() {
        await this.mongodb.client.connect();
        await this.httpServer.startServer();
    };

    override async afterStop() {
        await this.httpServer.stopServer();
        this.mongodb.client.close();
    }

}