# Ion SFU

This is a fork of ION-SFU, customized for the CA11 project. It tries to
stay as close as possible to the upstream project.

## Usage

Compile Ion-SFU and start it with modd(livereload):

```bash
go build -o ion-sfu ./cmd/server/main.go && ./ion-sfu -c config.toml
# Or using livereload during development:
env GO111MODULE=on go get github.com/cortesi/modd/cmd/modd
modd
```

If you prefer a containerized environment:

```bash
docker run -p 50051:50051 -p 5000-5020:5000-5020/udp pionwebrtc/ion-sfu:latest-jsonrpc
```
