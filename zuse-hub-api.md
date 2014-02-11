# Zuse Hub API

| Method | Endpoint                  | Authentication |
| ------ | ------------------------- | -------------- |
| GET    | /v1/projects              | None           | 
| GET    | /v1/my_favorites          | Token: user    |
| POST   | /v1/project               | Token: user    |
| PUT    | /v1/project/:id           | Token: user    |
| DELETE | /v1/project/:id           | Token: user    |
| GET    | /v1/project/:id           | None           |
| GET    | /v1/project/:id/json      | None           |
| POST   | /v1/auth                  | None           |
| POST   | /v1/register              | None           |
