# Zuse Hub API

Following is an explanation of version 1 (v1) of the RESTful Zuse Hub API.

| Method | Endpoint                      | Authentication |
| ------ | ----------------------------- | -------------- |
| GET    | /api/v1/projects              | None           | 
| GET    | /api/v1/my_favorites          | Token: user    |
| POST   | /api/v1/project               | Token: user    |
| PUT    | /api/v1/project/:id           | Token: user    |
| DELETE | /api/v1/project/:id           | Token: user    |
| GET    | /api/v1/project/:id           | None           |
| GET    | /api/v1/project/:id/json      | None           |
| POST   | /api/v1/auth                  | None           |
| POST   | /api/v1/register              | None           |

## Endpoint Specifications

Following is an explanation of the url parameters and JSON formatted data that each endpoint requires.

### Index

```
GET /api/v1/projects
```

This endpoint takes any combination of the following url parameters:

```
?search=<query_string> - returns projects that have the query string in their title/description
?category=popular | newest | favorites - returns projects that are most popular (most downloads), newest, favorites (most favorited)
?user=<username> - returns all projects shared by this user
```

---

```
GET /api/v1/my_favorites
```

This endpoint only requires the user's authentication token and returns all projects the user has favorited

### Create

```
POST /api/v1/project
```

This endpoint requires the user's authentication token and the following JSON structure:

```
{
  "project" :
  {
    "title" : "My Project",
    "description" : "A description of my project.",
    "screenshot" : <File Resource> (optional)
  }
}
```

In response the server will return:
  
  * 204 - If the project was created
  * 422 - If the project was missing a required field
  * 403 - If no user authentication token was provided

### Read

```
GET /api/v1/project/:id
```

This endpoint returns the meta data of the project

---

```
GET /api/v1/project/:id/json
```

This endpoint returns the json of the project

### Update

```
PUT /api/v1/project/:id
```

This endpoint requires the user's authentication and the following JSON structure:

```
{
  "project" :
  {
    "title" : "My Project",
    "description" : "A description of my project.",
    "screenshot" : <File Resource> (optional)
  }
}
```

In response the server will return:
  
  * 204 - If the project was updated
  * 422 - If the project was missing a required field
  * 403 - If no user authentication token was provided or if the user authentication token provided was wrong
