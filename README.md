# discovery-service

This is a RESTful discovery service that tracks heartbeat messages from various instances/applications and maintains their information. If the instance/application does not send a message within an (configurable) amount of time, it will be unregistered from the service.

## Running locally

### Prerequisites

- Docker
- Setup a `.env` file with `HEARTBEAT_EXPIRY_IN_MINUTES=??` where `??` equal to how many minutes you want the instance expiry to be set to.

Run the following command: `docker-compose up`

This will start a Node server on port 3000 and a MongoDB server on port 27017.

## Endpoints

### 1. Register Instance

- **Method**: `POST`
- **Path**: `/{group}/{id}`
- **Description**: Registers a new instance with the specified group, ID, and metadata.

#### Parameters

- **Path Parameters**:
  - `group` (string): The group to which the instance belongs.
  - `id` (string, UUID format): The unique identifier for the instance.

- **Body Parameters**:
  - `meta` (object): Metadata associated with the instance.

#### Responses

- **200 OK**: Returns the registered instance.
  - **Schema**:
  ```json
    {
        "group": "string",
        "instances": "number",
        "createdAt": "number",
        "lastUpdatedAt": "number"
    }
    ```

### 2. Unregister Instance

- **Method**: `DELETE`
- **Path**: `/{group}/{id}`
- **Description**: Unregisters an instance identified by the specified group and ID.

#### Parameters

- **Path Parameters**:
  - `group` (string): The group to which the instance belongs.
  - `id` (string, UUID format): The unique identifier for the instance.

#### Responses

- **204 No Content**: Indicates successful deletion of the instance.

### 3. Get Group Instances

- **Method**: `GET`
- **Path**: `/{group}`
- **Description**: Retrieves all instances associated with the specified group.

#### Parameters

- **Path Parameters**:
  - `group` (string): The group for which to retrieve instances.

#### Responses

- **200 OK**: Returns an array of instances belonging to the specified group.
  - **Schema**: 
    ```json
    [
        {
            "group": "string",
            "instances": "number",
            "createdAt": "number",
            "lastUpdatedAt": "number"
        }
    ]
    ```