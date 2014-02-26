# Zuse Hub API

Following is an explanation of version 1 (v1) of the RESTful Zuse Hub API.

## Endpoint Tables

Following is a series of tables that succinctly describes the API.

### Authentication/Registration

| Method | Endpoint | Authentication |
| ------ | -------- | -------------- |
| POST | /api/v1/user/auth | None |
| POST | /api/v1/user/register | None |

### User Specific

| Method | Endpoint | Authentication |
| ------ | -------- | -------------- |
| GET | /api/v1/user/projects | Token |
| GET | /api/v1/user/projects/:id | Token |
| GET | /api/v1/user/projects/:id/download | Token |
| POST | /api/v1/user/projects | Token |
| PUT | /api/v1/user/projects/:id | Token |
| DELETE | /api/v1/user/projects/:id | Token |
| GET | /api/v1/user/projects/favorites | Token |
| POST | /api/v1/user/projects/:id/favorite | Token |
| DELETE | /api/v1/user/projects/:id/unfavorite | Token |

### General

| Method | Endpoint | Authentication |
| ------ | -------- | -------------- |
| GET | /api/v1/projects | Token |

## Endpoint Specifications

Following are the definitions of each API endpoint, what data they require, and what data and response statuses they return.

### Authentication/Registration

#### Registration

```
POST /api/v1/user/register
```

The above endpoint is used to register a user on Zuse Hub. It expects the following JSON structure:

```
{
  "user" : {
    "username" : "<Some user name>",
    "email" : "<Some email address>",
    "password" : "<Some password>",
    "confirm_password" : "<Confirmation password>"
  }
}
```

On success, the endpoint returns a :created status with the following json:

```
{ "token" : "<The user's access token>" }
```

This token should be saved by the client as it will be used to authenticate on all succeeding requests to the api. On error, the endpoint returns an :unprocessable_entity status with the following json:

```
{ "errors" : [ <List of full error messages>, ... ] }
```

#### Authentication

```
POST /api/v1/user/auth
```

The above endpoint is used to obtain an existing user's authentication token. It expects the following json:

```
{ "user" : {
    "username" : "<The user's name>",
    "password" : "<The user's password>"
  }
}
```

On success, the endpoint returns an :ok status with the following json:

```
{ "token" : "<The user's access token>" }
```

Again, this token should be saved by the client as it will be used to authenticate on all succeeding request to the api. On error, the endpoint returns an :unauthorized status with no json.

**All remaining endpoints require a valid token for access. If a valid token is not given, these endpoints return an :unauthroized status with no json.**

### User Specific

#### User Projects

```
GET /api/v1/user/projects
```

The above endpoint is used to obtain the user's (identified by authentication token) shared projects on zuse hub. On success, the endpoint returns an :ok status with the following json:

```
[
  { 
    "id" : "<Project id>", 
    "title" : "<Project title>", 
    "description" : "<Project description>",
    "favorites" : <Number of favorites>,
    "downloads" : <Number of downloads>
    },
    { 
      <More projects>
    },
    .
    .
    .
]
```

#### User Project

```
GET /api/v1/user/projects/:id
```

The above endpoint is used to obtain a user's (identified by authentication token) particular project. On success, the endpoint returns an :ok status with the following json:

```
{ 
  "id" : "<Project id>", 
  "title" : "<Project title>", 
  "description" : "<Project description>",
  "favorites" : <Number of favorites>,
  "downloads" : <Number of downloads>,
  "raw_code" : "<Project raw code>",
  "compiled_code" : "<Project compiled code>"
}
```

If the user doesn't own the project that is being asked for, the endpoint returns a :forbidden status with no json.

#### User Full Project

```
GET /api/v1/user/projects/:id/download
```

The above endpoint is used to download a copy of a project. On success, the endpoint returns
| GET | /api/v1/user/projects/:id | Token |
| GET | /api/v1/user/projects/:id/download | Token |
| POST | /api/v1/user/projects | Token |
| PUT | /api/v1/user/projects/:id | Token |
| DELETE | /api/v1/user/projects/:id | Token |
| GET | /api/v1/user/projects/favorites | Token |
| POST | /api/v1/user/projects/:id/favorite | Token |
| DELETE | /api/v1/user/projects/:id/unfavorite | Token |

### General

#### Index

```
GET /api/v1/projects
```

The above endpoint is used to obtain lists of categorized projects. This endpoint takes any combination of the following url parameters:

```
?search=<query_string> - returns projects that have the query string in their title/description
?category=popular | newest | favorites - returns projects that are most popular (most downloads), newest, favorites (most favorited)
?user=<username> - returns all projects shared by this user
```

On success, the endpoint returns an :ok status with the following json:

```
[
  { 
    "id" : "<Project id>", 
    "title" : "<Project title>", 
    "username" : "<Project author's username>",
    "description" : "<Project description>",
    "favorites" : <Number of favorites>,
    "downloads" : <Number of downloads>
    },
    { 
      <More projects>
    },
    .
    .
    .
]
```
