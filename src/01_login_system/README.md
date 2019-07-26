# Lark-in-server

## 00_auth_system

#### Request Table

| Type    | Code | Message                          |
|---------|------|----------------------------------|
| OK      | 000  | Created Token.                   |
| ERROR   | 000  | No Public Key in Request Header. |
| WARNING | 000  | Generating Token...              |

#### Auth System

```sequence
title: Auth
Client -->> Server: public-key-header: pk
Server -->> Client: token
Client -->  Server: headers: signed-token-header, public-key-header
Server -->  Client: saved {public_key: signed_token}
Client ->   Server: normal request
```

## 01_post_an_article
