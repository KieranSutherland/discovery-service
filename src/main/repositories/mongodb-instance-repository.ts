import { MongoDb } from '@ubio/framework/modules/mongodb';
import { dep } from 'mesh-ioc';
import { INSTANCES_IDENTIFIER } from '../util/consts.js';
import { Collection } from 'mongodb';
import { Instance } from '../schema/instance.js';
import { DeleteInstanceParams, GetInstancesParams, InstanceRepository, UpsertInstanceParams } from '../spi/repository.js';

const DEFAULT_FIND_OPTIONS = {
    projection: {
        _id: 0 // Remove the default _id field from responses.
    }
}

/**
 * Provides CRUD operations for instance data in a MongoDB database.
 */
export class MongoDBInstanceRepository extends InstanceRepository {
    @dep() private mongodb!: MongoDb;

    /**
     * Gets the collection of instances.
     */
    private getCollection(): Collection<Instance> {
        return this.mongodb.db.collection<Instance>(INSTANCES_IDENTIFIER);
    }

    async getInstances(params: GetInstancesParams) {
        return this.getCollection().find(params, DEFAULT_FIND_OPTIONS).toArray();
    }

    async upsertInstance({ instance }: UpsertInstanceParams) {
        const { id, group, meta } = instance;
        const now = new Date().valueOf();
        await this.getCollection().updateOne(
            { id, group },
            { $set: { updatedAt: now, meta }, $setOnInsert: { createdAt: now } },
            { upsert: true }
        );
        const upsertedInstance = await this.getInstances({ id, group });
        if (upsertedInstance.length !== 1) {
            throw new Error('Upserted the instance but could not find the instance in the collection to return');
        }
        return upsertedInstance[ 0 ];
    }

    async deleteInstance(params: DeleteInstanceParams) {
        const foundInstance = await this.getInstances(params);
        if (foundInstance.length > 1) {
            throw new Error(`More than one instance has been found with the params: ${params}`);
        }
        if (foundInstance.length < 1) {
            throw new Error(`No instance has been found with the params: ${params}`);
        }
        await this.getCollection().deleteOne(params);
        return foundInstance[ 0 ];
    }
}