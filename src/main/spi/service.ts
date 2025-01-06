import { Instance } from "../schema/instance.js";

export interface UpsertInstanceParams {
    instance: Pick<Instance, 'id' | 'group' | 'meta'>;
}

export interface GetInstancesParams {
    id?: string;
    group?: string;
}

export interface DeleteInstanceParams {
    id: string;
    group: string;
}

export interface GetGroupInstancesParams {
    group: string;
}

export abstract class Service {

    constructor(expiryTimeInMinutes: number) {
        setInterval(async () => {
            try {
                await this.cleanupExpiredInstances(expiryTimeInMinutes);
                console.log('Expired instances cleanup completed.');
            } catch (error) {
                console.error('Error during cleanup of expired instances:', error);
            }
        }, expiryTimeInMinutes * 60 * 1000);
    }

    /**
     * Retrieves instances given the provided parameter filters.
     * @param params The params to filter the instances by.
     * @returns The instances matching the given params.
     */
    abstract getInstances(params: GetInstancesParams): Promise<Instance[]>;

    /**
     * Updates/inserts instance into the database.
     * @param params The params for the upsertion.
     * @returns The upserted instance.
     */
    abstract registerInstance(params: UpsertInstanceParams): Promise<Instance>;

    /**
     * Unregister a instance.
     * @param params The params for the instance to be deleted.
     * @returns The deleted instance.
     */
    abstract unregisterInstance(params: DeleteInstanceParams): Promise<Instance>;

    /**
     * Unregister all instances that have an updated time longer than the maximum expiry time.
     * @param expiryTimeInMinutes The maximum time an instance can not be updated for before it is considered expired, in minutes.
     */
    abstract cleanupExpiredInstances(expiryTimeInMinutes: number): Promise<void>;
}