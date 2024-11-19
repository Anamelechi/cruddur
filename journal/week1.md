# Week 1 — App Containerization

## Containerized the Backend
### Ran Python

```python
cd backend-flask
export FRONTEND_URL="*"
export BACKEND_URL="*"
python3 -m flask run --host=0.0.0.0 --port=4567
cd ..

```

- I unlocked the port on the exposed port tab

- Open the link for 4567 in your browser

- Append the url to ```/api/activities/home``` and i got back json

### Added Dockerfile

Created a file here: ```backend-flask/Dockerfile```

```Dockerfile
FROM python:3.10-slim-buster

WORKDIR /backend-flask

COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt

COPY . .

ENV FLASK_ENV=development

EXPOSE ${PORT}
CMD [ "python3", "-m" , "flask", "run", "--host=0.0.0.0", "--port=4567"]

```

### Built Container

```sh

docker build -t  backend-flask ./backend-flask

```

### Ran Container

```sh
docker run --rm -p 4567:4567 -it -e FRONTEND_URL='*' -e BACKEND_URL='*' backend-flask

```

### Checked Container Images or Running Container Ids

```sh

docker ps
docker images

```

### Gained access to the Container

```sh

docker exec CONTAINER_ID -it /bin/bash

```

## Containerized Frontend

### Ran NPM install

I had to run NPM Install before building the container since it needs to copy the contents of node_modules 

```sh

cd frontend-react-js
npm i

```

### Created Docker File

Created a file here: ```frontend-react-js/Dockerfile```

```Dockerfile

FROM node:16.18

ENV PORT=3000

COPY . /frontend-react-js
WORKDIR /frontend-react-js
RUN npm install
EXPOSE ${PORT}
CMD ["npm", "start"]

```

### Built Container

```sh

docker build -t frontend-react-js ./frontend-react-js

```

### Ran Container

```sh
docker run -p 3000:3000 -d frontend-react-js

```

## Built Multiple Containers with Docker Compose

### Created a docker-compose file

Created ```docker-compose.yml``` at the root of my project.

```yaml

version: "3.8"
services:
  backend-flask:
    environment:
      FRONTEND_URL: "https://3000-${GITPOD_WORKSPACE_ID}.${GITPOD_WORKSPACE_CLUSTER_HOST}"
      BACKEND_URL: "https://4567-${GITPOD_WORKSPACE_ID}.${GITPOD_WORKSPACE_CLUSTER_HOST}"
    build: ./backend-flask
    ports:
      - "4567:4567"
    volumes:
      - ./backend-flask:/backend-flask

  frontend-react-js:
    environment:
      REACT_APP_BACKEND_URL: "https://4567-${GITPOD_WORKSPACE_ID}.${GITPOD_WORKSPACE_CLUSTER_HOST}"
    build: ./frontend-react-js
    ports:
      - "3000:3000"
    volumes:
      - ./frontend-react-js:/frontend-react-js

networks: 
  internal-network:
    driver: bridge
    name: cruddur

```

## Adding DynamoDB Local and Postgres

Since Postgres and Dynamodb are going to be containers I integrated the following code into the docker-compose file

### Postgres

```Dockerfile

services:
  db:
    image: postgres:13-alpine
    restart: always
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    ports:
      - '5432:5432'
    volumes: 
      - db:/var/lib/postgresql/data
volumes:
  db:
    driver: local

```

Installed the postgres client into Gitpod

```sh

  - name: postgres
    init: |
      curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc|sudo gpg --dearmor -o /etc/apt/trusted.gpg.d/postgresql.gpg
      echo "deb http://apt.postgresql.org/pub/repos/apt/ `lsb_release -cs`-pgdg main" |sudo tee  /etc/apt/sources.list.d/pgdg.list
      sudo apt update
      sudo apt install -y postgresql-client-13 libpq-dev

```

### DynamoDB Local

```Dockerfile

services:
  dynamodb-local:
    # https://stackoverflow.com/questions/67533058/persist-local-dynamodb-data-in-volumes-lack-permission-unable-to-open-databa
    # We needed to add user:root to get this working.
    user: root
    command: "-jar DynamoDBLocal.jar -sharedDb -dbPath ./data"
    image: "amazon/dynamodb-local:latest"
    container_name: dynamodb-local
    ports:
      - "8000:8000"
    volumes:
      - "./docker/dynamodb:/home/dynamodblocal/data"
    working_dir: /home/dynamodblocal

```

### Volumes

directory volume mapping

```Dockerfile

volumes: 
- "./docker/dynamodb:/home/dynamodblocal/data"

```

named volume mapping

```Dockerfile

volumes: 
  - db:/var/lib/postgresql/data

volumes:
  db:
    driver: local

```












