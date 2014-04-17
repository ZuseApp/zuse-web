ZuseHub Web Front-End and API
========

In order to install the web portion of ZuseHub follow these steps:

```
1) We assume you have ruby 2.0.0 and rails 4.0 installed on your machine
2) Clone this repo to your machine
3) cd into the directory that is cloned down
4) run bundle install
4) run rake db:create:all
5) run rake db:migrate
6) run rails s to boot up the server
```

ZuseHub has some front end pages but relies on content coming from iOS clients that are sharing projects onto ZuseHub through the api that it provides.
