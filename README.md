# Primitive

Lark-in Design Primitive Repo.

## Auth Sysetm

```sequence
title: Auth
Client -->> Server: public-key-header: pk
Server -->> Client: token
Client -->  Server: headers: signed-token-header, public-key-header
Server -->  Client: saved {public_key: signed_token}
Client ->   Server: normal request
```

[link](./package/00_auth_system)
