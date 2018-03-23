# Example for LuffaHub

Socket.IO is a solution for data streaming over http/websocket. It is applied to communicate between LuffaHub and your application server. Check out the [Socket.IO](https://socket.io/) documents if needed.

## Service entry point

Luffanet builds up the Socket.IO service at https://io.luffanet.com.tw. It is SSL supported only.

## Authentication

Connected to the entry point with a valid token will be authenticated. If you do not have a valid token, it can be generated one by yourself in the console of [LuffaHub](https://hub.luffanet.com.tw).

## Usage

```shell
git clone https://github.com/luffanet/luffahub-example-nodejs
cd luffahub-example-nodejs
npm install
TOKEN=<your_token> npm start
```

# License

[MIT](./LICENSE)
