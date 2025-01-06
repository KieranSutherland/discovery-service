import { dep } from 'mesh-ioc';

import { DeleteInstanceParams, GetInstancesParams, Service, UpsertInstanceParams } from '../spi/service.js';
import { InstanceRepository } from '../spi/repository.js';
import { inMinutes } from '../util/util.js';
import { HEARTBEAT_EXPIRY_IN_MINUTES } from '../util/consts.js';

export class InstanceService extends Service {
    @dep() private instanceRepository!: InstanceRepository;

    constructor() {
        super(HEARTBEAT_EXPIRY_IN_MINUTES);
    }
    
    async getInstances(params: GetInstancesParams) {
        return this.instanceRepository.getInstances(params);
    }

    async registerInstance(params: UpsertInstanceParams) {
        return this.instanceRepository.upsertInstance(params);
    }

    async unregisterInstance(params: DeleteInstanceParams) {
        return this.instanceRepository.deleteInstance(params);
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