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

export abstract class InstanceRepository {
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
    abstract upsertInstance(params: UpsertInstanceParams): Promise<Instance>;

    /**
     * Deletes a instance.
     * @param params The params for the instance to be deleted.
     * @returns The deleted instance.
     */
    abstract deleteInstance(params: DeleteInstanceParams): Promise<Instance>;
}