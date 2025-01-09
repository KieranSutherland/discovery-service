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

export interface StartCleanupJobParams {
    /**
     * The maximum time an instance can not be updated for before it is considered expired, in minutes.
     */
    expiryTimeInMinutes: number;
}

export abstract class Service {

    constructor(expiryTimeInMinutes: number) {
        if (!expiryTimeInMinutes) {
            throw new Error('No expiry time has been declared.')
        }
        this.startCleanupJob({ expiryTimeInMinutes });
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
     * Starts a re-ocurring job to unregister all instances that have an updated time longer than the maximum expiry time.
     * @param params The params for the cleanup job.
     */
    abstract startCleanupJob(params: StartCleanupJobParams): void;
}