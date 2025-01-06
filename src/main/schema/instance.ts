import { Schema } from '@ubio/framework';

export interface Instance {
    /**
     * The ID of the instance.
     */
    id: string;
    /**
     * The group the instance belongs to.
     */
    group: string;
    /**
     * The date the instance was created in milliseconds.
     */
    createdAt: number;
    /**
     * The date the instance was last updated in milliseconds.
     */
    updatedAt: number;
    /**
     * Metadata belonging to the instance.
     */
    meta?: Record<string, any>;
}

export const INSTANCE_SCHEMA = new Schema<Instance>({
    schema: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
                format: 'uuid'
            },
            group: {
                type: 'string'
            },
            createdAt: {
                type: 'number'
            },
            updatedAt: {
                type: 'number'
            },
            meta: { 
                type: 'object', 
                optional: true,
                properties: {} 
            }
        },
        required: ['id', 'group', 'createdAt', 'updatedAt']
    }
});