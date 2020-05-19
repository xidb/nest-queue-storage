### Queue storage Application

### Running

This app requires docker.

RabbitMQ and app itself is inside Docker containers. There is a `docker-compose.yml` file for starting Docker. Run it
 with:

`docker-compose up`

### Using

You can do POST requests on

`http://localhost:3000/storage`

Request example:

```json
{
	"type": "set",
	"key": "test",
	"value": "example"
}
```

`/storage` requests are saved in object key/value storage in memory. Storage is persisted on disk every 60 seconds
 (default value). Also each request is persisted in a log file. In case of server failure all requests are replayed
  from log file
  on next application start. 
