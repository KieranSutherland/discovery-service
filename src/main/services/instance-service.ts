import { dep } from 'mesh-ioc';

import { DeleteInstanceParams, GetInstancesParams, Service, StartCleanupJobParams, UpsertInstanceParams } from '../spi/service.js';
import { InstanceRepository } from '../spi/repository.js';
import { inMinutes } from '../util/util.js';
import { HEARTBEAT_EXPIRY_IN_MINUTES } from '../util/consts.js';

export class InstanceService extends Service {
    @dep() private instanceRepository!: InstanceRepository;

    constructor() {
        super(HEARTBEAT_EXPIRY_IN_MINUTES);
    }

    async getInstances(params: GetInstancesParams) {
        const instances = await this.instanceRepository.getInstances(params);
        if (!params.group) {
            return instances;
        }

        // Sort instances by their 'group' property.
        return instances.sort((a, b) => {
            if (a.group < b.group) {
                return -1
            };
            if (a.group > b.group) {
                return 1
            };
            return 0;
        });
    }

    async registerInstance(params: UpsertInstanceParams) {
        return this.instanceRepository.upsertInstance(params);
    }

    async unregisterInstance(params: DeleteInstanceParams) {
        return this.instanceRepository.deleteInstance(params);
    }

    startCleanupJob(params: StartCleanupJobParams) {
        const { expiryTimeInMinutes } = params;
        setInterval(async () => {
            try {
                await this.cleanupExpiredInstances(expiryTimeInMinutes);
                console.log('Expired instances cleanup completed.');
            } catch (error) {
                console.error('Error during cleanup of expired instances:', error);
            }
        }, expiryTimeInMinutes * 60 * 1000);
    }

    async cleanupExpiredInstances(expiryTimeInMinutes: number) {
        const instances = await this.instanceRepository.getInstances({});
        const currentMinutes = inMinutes(new Date().valueOf());
        for (const instance of instances) {
            const updatedAtInMinutes = inMinutes(instance.updatedAt);
            if (currentMinutes - updatedAtInMinutes > expiryTimeInMinutes) {
                await this.instanceRepository.deleteInstance({
                    id: instance.id,
                    group: instance.group
                })
            }
        }
    }
}