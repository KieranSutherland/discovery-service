import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import { exec } from 'child_process';
import { promisify } from 'util';
import { Instance } from '../main/schema/instance.js';
import { HEARTBEAT_EXPIRY_IN_MINUTES } from '../main/util/consts.js';

const START_TIMEOUT = 1200000 // 2 minutes. This should only happen if the docker image is being built for the first time.
const ENDPOINT = 'http://localhost:8080';

const execAsync = promisify(exec);

chai.use(chaiHttp);

async function deleteMongoVolume() {
    try {
        console.log('Deleting any exisiting discovery-service volumes...');
        const volumeName = 'discovery-service_mongo-data';
        await execAsync(`docker volume rm ${volumeName}`);
    } catch (error) { }
}

async function waitForContainers() {
    let containersReady = false;
    const maxRetries = 10;
    let retries = 0;

    while (!containersReady && retries < maxRetries) {
        try {
            const { stdout } = await execAsync('docker compose ps');
            containersReady = stdout.includes('Up');
            if (!containersReady) {
                console.log('Waiting for containers to be ready...');
                await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for 2 seconds before retrying
            }
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for 2 seconds to allow start-up.
        } catch (error) {
            console.error('Error checking container status:', error);
        }
        retries++;
    }

    if (!containersReady) {
        throw new Error('Containers did not start in time');
    }
}

function endCallback(err: any, res: any, callback: () => void) {
    expect(err).to.be.null;
    expect(res).to.have.status(200);
    expect(res.body).to.be.not.undefined;
    callback();
}

function getRequest(url: string, expections: (err: any, res: any) => void) {
    chai.request(ENDPOINT)
        .get(url)
        .end((err: any, res: any) => {
            endCallback(err, res, () => {
                expections(err, res);
            });
        });
}

function postRequest(instance: Instance, callback: (err: any, res: any) => void) {
    const url = `/${instance.group}/${instance.id}`;
    const body = instance.meta ? { meta: instance.meta } : undefined;
    chai.request(ENDPOINT)
        .post(url)
        .send(body)
        .end((err: any, res: any) => {
            endCallback(err, res, () => {
                callback(err, res);
            });
        });
}
function deleteRequest(instance: Instance, callback: (err: any, res: any) => void) {
    const url = `/${instance.group}/${instance.id}`;
    chai.request(ENDPOINT)
        .delete(url)
        .end((err: any, res: any) => {
            endCallback(err, res, () => {
                callback(err, res);
            });
        });
}

function expectInstance(response: Instance, original: Instance) {
    expect(response).to.be.an('object');
    expect(response).has.property('id', original.id);
    expect(response).has.property('group', original.group);
    expect(response).to.have.property('createdAt').that.is.a('number');
    expect(response).to.have.property('updatedAt').that.is.a('number');
    if (typeof original.meta !== 'undefined') {
        expect(response).to.have.property('meta').that.is.a('object');
        expect(response.meta).to.deep.equal(original.meta);
    }
}

const testInstance1 = {
    id: '550e8400-e29b-41d4-a716-446655440001',
    group: 'group-1',
} as Instance;

const testInstance2 = {
    id: '550e8400-e29b-41d4-a716-446655440002',
    group: 'group-1',
    meta: {
        'some-meta-data': 'test'
    } as any
} as Instance;

const testInstance3 = {
    id: '550e8400-e29b-41d4-a716-446655440003',
    group: 'group-2',
} as Instance;

describe('discovery-service', () => {
    before(async () => {
        await deleteMongoVolume();
        console.log('Starting Docker containers...');
        await execAsync('docker compose up -d');
        await waitForContainers();
    }).timeout(START_TIMEOUT);

    after(async () => {
        console.log('Stopping Docker containers...');
        await execAsync('docker compose down');
    });

    it('should respond with an empty array body on GET /', (done) => {
        getRequest('/', (_err, res) => {
            expect(res.body).to.deep.equal([]);
            done();
        });
    });

    it('should register new instance on POST /{group}/{id}', (done) => {
        // Create new instance.
        postRequest(testInstance1, (_err, res) => {
            expectInstance(res.body, testInstance1);

            // Create second new instance.
            postRequest(testInstance2, (_err, res) => {
                expectInstance(res.body, testInstance2);

                // Create third new instance.
                postRequest(testInstance3, (_err, res) => {
                    expectInstance(res.body, testInstance3);

                    done();
                });
            });

        });
    });

    it('should respond with relevant instances on GET / and GET /{group}', (done) => {
        // Check instances have been uploaded via GET /.
        getRequest('/', (_err, res) => {
            expect(res.body).to.be.an('array').that.has.lengthOf(3);
            expectInstance(res.body[ 0 ], testInstance1);
            expectInstance(res.body[ 1 ], testInstance2);
            expectInstance(res.body[ 2 ], testInstance3);

            // Check instances have been uploaded via GET /{group} for group 1.
            getRequest(`/${testInstance1.group}`, (_err, res) => {
                expect(res.body).to.be.an('array').that.has.lengthOf(2);
                expectInstance(res.body[ 0 ], testInstance1);
                expectInstance(res.body[ 1 ], testInstance2);

                // Check instances have been uploaded via GET /{group} for group 2.
                getRequest(`/${testInstance3.group}`, (_err, res) => {
                    expect(res.body).to.be.an('array').that.has.lengthOf(1);
                    expectInstance(res.body[ 0 ], testInstance3);

                    done();
                });
            });
        });
    });

    it('should unregister instance on DELETE /{group}/{id}', (done) => {
        deleteRequest(testInstance1, (_err, res) => {
            expectInstance(res.body, testInstance1);

            // Check instance is deleted.
            getRequest('/', (_err, res) => {
                expect(res.body).to.be.an('array').that.has.lengthOf(2);
                expectInstance(res.body[ 0 ], testInstance2);
                expectInstance(res.body[ 1 ], testInstance3);

                done();
            });
        });
    });

    it('should unregister expired instances', async () => {
        await new Promise(resolve => setTimeout(resolve, HEARTBEAT_EXPIRY_IN_MINUTES * 1000 * 60 * 2)); // Wait to allow for cleanup job.

        // Check instances have been deleted.
        return new Promise((resolve, reject) => {
            getRequest('/', (_err, res) => {
                try {
                    expect(res.body).to.be.an('array').that.has.lengthOf(0);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
        });
    }).timeout((HEARTBEAT_EXPIRY_IN_MINUTES * 1000 * 60 * 2) + 1000);
});
