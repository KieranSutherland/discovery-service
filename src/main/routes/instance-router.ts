import { BodyParam, Delete, Get, PathParam, Post, Router } from '@ubio/framework';
import { dep } from 'mesh-ioc';

import { INSTANCE_SCHEMA, Instance } from '../schema/instance.js';
import { Service } from '../spi/service.js';


export class InstanceRouter extends Router {
    @dep() instanceService!: Service;

    @Post({
        path: '/{group}/{id}',
        responses: {
            200: {
                schema: INSTANCE_SCHEMA.schema
            }
        }
    })
    async registerInstance(
        @PathParam('group', { schema: { type: 'string' } })
        group: string,
        @PathParam('id', { schema: { type: 'string', format: 'uuid' } })
        id: string,
        @BodyParam('meta', { schema: { type: 'object', }, required: false })
        meta: object
    ): Promise<Instance> {
        return await this.instanceService.registerInstance({
            instance: {
                group, id, meta
            }
        });
    }

    @Delete({
        path: '/{group}/{id}',
        responses: {
            200: {
                schema: INSTANCE_SCHEMA.schema
            }
        }
    })
    async unregisterInstance(
        @PathParam('group', { schema: { type: 'string' } })
        group: string,
        @PathParam('id', { schema: { type: 'string', format: 'uuid' } })
        id: string
    ): Promise<Instance> {
        return this.instanceService.unregisterInstance({ id, group });
    }

    @Get({
        path: '/',
        responses: {
            200: {
                schema: {
                    type: 'array',
                    items: INSTANCE_SCHEMA.schema
                }
            }
        }
    })
    async getInstances(): Promise<Instance[]> {
        return await this.instanceService.getInstances({});
    }

    @Get({
        path: '/{group}',
        responses: {
            200: {
                schema: {
                    type: 'array',
                    items: INSTANCE_SCHEMA.schema
                }
            }
        }
    })
    async getGroupInstances(
        @PathParam('group', { schema: { type: 'string' } }) group: string
    ): Promise<Instance[]> {
        return await this.instanceService.getInstances({ group });
    }
}