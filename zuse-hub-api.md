# Zuse Hub API

This is an explanation of version 1 (v1) of the RESTful Zuse Hub API.

## Endpoint Tables

Please find below a series of tables that succinctly describe the API.

### Authentication/Registration

| Method | Endpoint | Authentication |
| ------ | -------- | -------------- |
| POST | /api/v1/user/auth | None |
| POST | /api/v1/user/register | None |

### User Specific

| Method | Endpoint | Authentication |
| ------ | -------- | -------------- |
| GET | /api/v1/user/projects | Token |
| GET | /api/v1/user/projects/:uuid | Token |
| POST | /api/v1/user/projects | Token |
| PUT | /api/v1/user/projects/:uuid | Token |
| DELETE | /api/v1/user/projects/:uuid | Token |

### General

| Method | Endpoint | Authentication |
| ------ | -------- | -------------- |
| GET | /api/v1/projects | Token |
| GET | /api/v1/projects/:uuid | Token |
| GET | /api/v1/projects/:uuid/download | Token |
| GET | /api/v1/projects/:uuid/fork | Token |


### Project Sharing on Social Media

| Method | Endpoint | Authentication |
| ------ | -------- | -------------- |
| POST | /api/v1/shared_projects | None |

## Endpoint Specifications

These specifications detail what data each endpoint requires and what data and response statuses each endpoint returns.

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

**All endpoints requiring a token for authentication return an :unauthorized status with no json if the token doesn't identifiy a user.**

### User Specific

#### User Projects

```
GET /api/v1/user/projects
```

The above endpoint is used to obtain the user's (identified by authentication token) shared projects on zuse hub. On success, the endpoint returns an :ok status with the following json:

```
[
  { 
    "uuid" : "<Project uuid>", 
    "title" : "<Project title>", 
    "description" : "<Project description>",
    "username" : "<Project author's user name>",
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

#### User Project Show

```
GET /api/v1/user/projects/:uuid
```

The above endpoint is used to obtain a user's (identified by authentication token) particular project. On success, the endpoint returns an :ok status with the following json:

```
{ 
  "uuid" : "<Project uuid>", 
  "title" : "<Project title>", 
  "description" : "<Project description>",
  "downloads" : <Number of downloads>,
  "project_json" : "<Project json>",
  "compiled_code" : "<Project compiled code>"
}
```

If the user doesn't own the project that is being asked for, the endpoint returns a :forbidden status with no json.

#### User Project Creation

```
POST /api/v1/user/projects
```

The above endpoint is used to upload a project on Zusehub. This endpoint expects the following json structure:

```
{
  "project" : {
    "project_json" : "<Project json>",
    "compiled_code" : "<Project compiled code>"
  }
}
```
On success, the endpoint returns a :no_content status.

The server pulls the project title, description, and uuid out of the project\_json. If any of these keys are not present or if the project\_json or compiled\_code are invalid json the endpoint will return an :unprocessable\_entity status with the following json:

```
{ "errors" : [ <List of full error messages>, ... ] }
```

#### User Project Update

```
PUT /api/v1/user/projects/:uuid
```

The above endpoint is used to update a project and expects the following json structure:

```
{
  "project" : {
    "project_json" : "<Project json>",
    "compiled_code" : "<Project compiled code>"
  }
}
```

On success, the endpoint returns an :no\_content status. The server grabs the project title, description, and uuid from the project\_json and verifies that the json is valid. If the uuid doesn't match or if the json is not valid the endpoint returns an :unprocessable\_entity status with the following json:

```
{ "errors" : [ <List of full error messages>, ... ] }
```

If the user doesn't own the project the endpoint returns a :forbidden status.

#### User Project Deletion

```
DELETE /api/v1/user/projects/:uuid
```

The above endpoint deletes a project from Zusehub. On success the endpoint returns a :no_content status. If the user doesn't own the project trying to be deleted the endpoint returns a :forbidden status.

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
    "uuid" : "<Project uuid>", 
    "title" : "<Project title>", 
    "username" : "<Project author's username>",
    "description" : "<Project description>",
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

#### Show

```
GET /api/v1/projects/:uuid
```

The above endpoint is used to obtain meta information about a single project. On success, the endpoint returns an :ok status with the following json:

```
{ 
  "uuid" : "<Project uuid>", 
  "title" : "<Project title>", 
  "username" : "<Project author's username>",
  "description" : "<Project description>",
  "downloads" : <Number of downloads>
}
```

#### Project Download

```
GET /api/v1/projects/:uuid/download
```

The above endpoint is used to obtain the compiled code for the project for immediate execution. On success, the endpoint returns an :ok status with the following json:

```
{ 
  "uuid" : "<Project uuid>", 
  "title" : "<Project title>", 
  "username" : "<Project author's username>",
  "description" : "<Project description>",
  "project_json" : "<Project json>",
  "compiled_code" : "<Project compiled_code>"
}
```

#### Project Forking

```
GET /api/v1/projects/:uuid/fork
```
The above endpoint is used to fork a copy of a project. This copy comes with its own uuid different from the original project's uuid. On success, the endpoint returns an :ok status with the following json:

```
{ 
  "uuid" : "<Newly Generated Project uuid>", 
  "title" : "<Project title>", 
  "description" : "<Project description>",
  "project_json" : "<Project json>",
  "compiled_code" : "<Project compiled code>"
}
```


### Project Sharing on Social Media

#### Shared Project Creation

```
POST /api/v1/shared_projects
```

The above endpoint is used to quickly share a project via social media and expects the following json structure:

```
{ 
  "shared_project" : {
    "project_json" : "<Project json>",
    "compiled_code" : <Project compiled code>"
  }
}
```

On success, the endpoint returns an :ok status with the following json:

```
{ "url" : "<Shared project url>" }
```

The endpoint gets project title and description information from the project\_json. If the project\_json or compiled\_code are invalid json the endpoint will return an :unprocessable\_entity status with the following json:

```
{ "errors" : [ <List of full error messages>, ... ] }
```

Once you have the shared project url, you can append the following url parameter to it depending on what social media network the user is sharing the project to:

```
?shared_on=facebook | twitter
```
