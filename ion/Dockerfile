FROM golang:latest

ENV GO111MODULE=on

RUN mkdir /ca11
ADD . /ca11

WORKDIR /ca11
RUN go build -o sfu ./cmd/main.go
CMD ["/ca11/sfu"]
