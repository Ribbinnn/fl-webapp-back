# fl-webapp-back
- install dependencies
   ```
   npm install
   ```
- run the appliaction (server will be running on port 5000)
  ```
  npm start
  ```
- Database: [MongoDB](https://docs.mongodb.com/manual/installation/)
   - Import sample data into database
  ```
  npm run initDB
  ```

## API PATH
Authentication & User <br />
- POST /api/auth/login ( reqBody = {username, password, remember} )
- POST /api/auth/logout 
- GET /api/users/:id ( Get user by id )

Webapp Project
- GET /api/projects/user/:id ( Get all projects by user id )
- GET /api/projects/:project_id ( Get project by id )

Infer & Report
- POST /api/infer (Start inference, reqBody = (accession_no, project_id, record, user_id, dir) )
- GET /api/report/:rid (Get report by id)
- GET /api/report/list/project/:project_id (View history by project id)
- PATCH /api/report/ (Update or finalize report, reqBody = ( report_id, note, user_id, label, rating ) )
- DELETE /api/report/delete/:rid (Delete report by id)

Image
- GET /api/image/ (get image, reqQuery = (result_id, finding, accession_no, dir)) <br />
  example: /api/image/?accession_no=0041018 (original file from PACS) <br />
  example: /api/image/?accession_no=74&dir=local (original file from local directory) <br />
  example: /api/image/?result_id=6181884fdb269acd1bf1bd77&finding=Mass (overlay file)

PACS
- GET /api/pacs/( Get all patient's data from pacs by HN, reqQuery = (HN, dir, accession_no, start_date, end_date) )
- GET /api/pacs/info/ ( Get patient info by HN, reqQuery = (HN, dir) )

Mask
- PATCH /api/masks/ ( Crete bounding box position, reqBody=(report_id, data: [{label, tool, updated_by, data}, ...]) )
- GET /api/masks/report/:report_id ( Get bounding box position by report id )

Mask (Local)
- PATCH /api/masks/local ( Crete bounding box position, reqBody=( mask_id, data: [{label, tool, updated_by, data}, ...]) )
- GET /api/masks/local ( Get bounding box position by report id, reqQuery = (accession_no) )
- GET /api/masks/xlsx/ ( Get bounding box in .xlsx format, reqQuery = (is_acc_no, list)) <br />
  example: /api/masks/xlsx/?is_acc_no=false&list[]=61fc0637a715cf392adb3b0d (list is list of report_id, used in View History) <br />
  example: /api/masks/xlsx/?is_acc_no=true&list[]=0041018 (list is list of accession_no, used in Annotate) 
- GET /api/masks/png/ ( Get bounding box in .png format, reqQuery = (report_id, accession_no) )

**Admin API PATH** <br />
Webapp Project
- POST /api/projects ( Create new project, reqBody = {name, task, description, predClasses, head} )
- PATCH /api/projects ( Create new project, reqBody = {id, name, task, description, predClasses, head} )
- PATCH /api/projects/manage ( Manage project's user list, reqBody = {id, users} )
- GET /api/projects ( Get all projects )
- GET /api/projects/tasks ( Get all AI tasks )
- DELETE /api/projects/delete/:project_id ( Delete project by id )
 
User
- POST /api/users ( Create new user, reqBody = {username, password, first_name, last_name, role, email} )
- GET /api/users ( Get all users )


**Docker** <br />
1. Go to root directory of all three fl servers
2. Copy docker-compose.yml, Dockerfile, and mongo-init.js to the root directory <br />
![image](https://user-images.githubusercontent.com/47110972/148223267-2b95e1ec-f038-41d2-b8d2-13ee7e23c6b5.png) <br />
  docker-compose.yml
  ```
  version: "3.8"
  services:
    webapp-back:
      container_name: webapp-back
      restart: always
      build: ./fl-webapp-back
      ports:
        - '5000:5000'
      volumes:
        - /path/to/fl-webapp-back/resources:/usr/src/app/resources # host_directory:docker_directory
    webapp-front:
      container_name: webapp-front
      restart: always
      build: ./fl-webapp-front
      ports:
        - '3000:3000'
    webapp-model:
      container_name: webapp-model
      restart: always
      build: ./fl-webapp-model
      ports:
        - '7000:7000'
      volumes:
        - /path/to/fl-webapp-model/resources:/code/resources # host_directory:docker_directory
    mongo:
      container_name: mongo
      build: ./
      ports:
        - '27018:27017' # host_port:container_port
      volumes:
        - mongodb:/data/db
  volumes:
    mongodb:
  ```
  Dockerfile
  ```
  FROM mongo
  ENV MONGO_INITDB_ROOT_USERNAME <root>
  ENV MONGO_INITDB_ROOT_PASSWORD <password>
  ENV MONGO_INITDB_DATABASE admin
  ADD mongo-init.js /docker-entrypoint-initdb.d/
  ```
  mongo-init.js
  ```
  db.auth('<root>', '<password>')
  db = db.getSiblingDB('webapp')
  db.createUser({
    user: '<admin>',
    pwd: '<admin>',
    roles: [
      {
        role: 'readWrite',
        db: 'webapp',
      },
    ],
  });

  db = db.getSiblingDB('vitals')
  db.createUser({
    user: '<admin>',
    pwd: '<admin>',
    roles: [
      {
        role: 'readWrite',
        db: 'vitals',
      },
    ],
  });

  db = db.getSiblingDB('pacs')
  db.createUser({
    user: '<admin>',
    pwd: '<admin>',
    roles: [
      {
        role: 'readWrite',
        db: 'pacs',
      },
    ],
  });
  ```
3. For frontend, change serverURL in `config.js` to `http://localhost:5000/api`, for backend remove comments under #DOCKER in `.env`
3. Build docker compose. Frontend, backend, and model will be run at port 3000, 5000, and 7000
   ```
   docker-compose up -d --build
   ```
   or
   ```
   docker-compose up -d
   ```
4. Import sample data into the containers
   ```
   docker exec -it webapp-back bash
   ```
   ```
   npm run initDB
   ```
5. Others
- ดูรายละเอียดของแต่ละ container: `docker ps`
- เข้าไปดูข้อมูลต่าง ๆ ใน database ของ container ผ่าน MongoDB Compass ได้ทาง url `mongodb://localhost:27018` หรือใช้คำสั่ง `docker exec -it mongo bash` เข้าไปใน container ของ mongo แล้วใช้คำสั่งของ MongoDB Shell ดูข้อมูลใน database ก็ได้
