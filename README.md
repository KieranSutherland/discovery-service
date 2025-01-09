# discovery-service

This is a RESTful discovery service that tracks heartbeat messages from various instances/applications and maintains their information. If the instance/application does not send a message within an (configurable) amount of time, it will be unregistered from the service.

## Running locally

### Prerequisites

- Docker
- Setup a `.env` file with `HEARTBEAT_EXPIRY_IN_MINUTES` and (optionally) `MONGO_URL`: 
```
HEARTBEAT_EXPIRY_IN_MINUTES - required - how many minutes you want the instance expiry to be set to.
MONGO_URL - optional - custom MongoDB URI if you want to override the default database.
``` 

Run the following command: `docker-compose up`

This will start a `localhost` Node server on port `8080`. This is the endpoint to direct requests to.

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
  - `meta` (object, optional): Metadata associated with the instance.

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

- **200 OK**: Indicates successful deletion of the instance.
    - **Schema**:
    ```json
        {
            "group": "string",
            "instances": "number",
            "createdAt": "number",
            "lastUpdatedAt": "number"
        }
    ```

### 3. Get Instances

- **Method**: `GET`
- **Path**: `/`
- **Description**: Retrieves all instances.

#### Responses

- **200 OK**: Returns an array of instances.
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

### 4. Get Group Instances

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