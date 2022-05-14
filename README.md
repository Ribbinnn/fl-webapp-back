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

Vitals
- POST /api/vitals/records ( Create vitals project and upload medical records, reqBody = {project_name, record_name, user_id, records} )
- GET /api/vitals/ ( Get projects by field, reqQuery = (user_id, project_id) )
- GET /api/vitals/projects/:id/medrec ( Get all records by project id )
- GET /api/vitals/records/ ( Get all records by patient's HN, reqQuery = (HN, project_id) )
- GET /api/vitals/template/:project_id (Get .xlsx template from project's requirements)
- PATCH /api/vitals/records/updaterow (Update selected row in record file, reqBody = {record_id, update_data})
- PATCH /api/vitals/records/deleterow/ (Delete selected row in record file req.body = {record_id, record_index}) 
- DELETE /api/vitals/records/deletefile/:id (Delete entire record file by record_id) 

Infer & Report
- POST /api/infer (Start inference, reqBody = (accession_no, project_id, record, user_id) )
- POST /api/infer/batch (Start batch inference, reqBody = {project_id, user_id, dicom_info_list: {accession_no, record: {...}}} )
- GET /api/report/:rid (Get report by id)
- GET /api/report/list/project/:project_id (View history by project id)
- PATCH /api/report/ (Update or finalize report, reqBody = ( report_id, note, user_id, label, rating ) )
- DELETE /api/report/delete/:rid (Delete report by id)

Image
- GET /api/image (get image, reqQuery = (result_id, finding, accession_no)) <br />
  example: /api/image/?accession_no=74 (original file from PACS) <br />
  example: /api/image/?result_id=6181884fdb269acd1bf1bd77&finding=Mass (overlay file)

PACS
- GET /api/pacs/ ( Get all patient's data from pacs by HN, reqQuery = (HN, accession_no, start_date, end_date) )
- GET /api/pacs/info/ ( Get patient info by HN, reqQuery = (HN, dir) )
- POST /api/pacs/save/:report_id ( Save report to PACS )

Mask
- PATCH /api/masks/ ( Crete bounding box position, reqBody=(report_id, data: [{label, tool, updated_by, data}, ...]) )
- GET /api/masks/report/:report_id ( Get bounding box position by report id )

**Admin API PATH** <br />
Webapp Project
- POST /api/projects ( Create new project, reqBody = {name, task, description, predClasses, head} )
- PATCH /api/projects ( Update project, reqBody = {id, name, task, description, predClasses, head} )
- PATCH /api/projects/manage ( Manage project's user list, reqBody = {id, users} )
- GET /api/projects ( Get all projects )
- GET /api/projects/tasks ( Get all AI tasks )
- DELETE /api/projects/delete/:project_id ( Delete project by id )
 
User
- POST /api/users ( Create new user, reqBody = {username, password, first_name, last_name, role, email} )
- PATCH /api/users ( Update user, reqBody = {id, password, first_name, last_name, role, email, isChulaSSO} )
- GET /api/users ( Get all users )


**Docker** <br />
1. Go to root directory of all three fl servers
2. Copy `docker-compose.yml` and `.env` into root directory and copy `init-mongo.sh` into mongo volume directory <br />
![image](https://user-images.githubusercontent.com/47110972/159545612-269a81f4-4c47-4624-841f-920c60c8fe84.png) <br />
  docker-compose.yml
  ```
  version: "3.8"
  services:
    webapp-front:
      container_name: webapp-front
      restart: always
      build: ./fl-webapp-front
      ports:
        - '80:3000'
      env_file:
        - ./.env
    webapp-model:
      container_name: webapp-model
      restart: always
      build: ./fl-webapp-model
      ports:
        - '7000:7000'
        - '11112:11112'
      volumes:
        - /fl-webapp-model/resources:/code/resources
      env_file:
        - ./.env
    mongo:
      image: mongo:4.0.3
      container_name: mongo
      ports:
        - '27018:27017' # host_port:container_port
      environment:
        MONGO_INITDB_ROOT_USERNAME: $ROOT_USER
        MONGO_INITDB_ROOT_PASSWORD: $ROOT_PASSWORD
      volumes:
        - /mongo-test/migrations:/docker-entrypoint-initdb.d # path to init-mongo.sh
        - /mongo-test/db:/data/db # can be anywhere
      env_file:
        - ./.env
    webapp-back:
      container_name: webapp-back
      restart: always
      build: ./fl-webapp-back
      ports:
        - '5000:5000'
      volumes:
        - /fl-webapp-back/resources:/usr/src/app/resources
      env_file:
        - ./.env
  ```
  init-mongo.sh
  ```
  set -e
  mongo <<EOF
  use webapp
  db.createUser({
    user: '$WEB_DB_USER',
    pwd: '$DB_PASSWORD',
    roles: [{
      role: 'readWrite',
      db: 'webapp'
    }]
  })
  use vitals
  db.createUser({
    user: '$VITALS_DB_USER',
    pwd: '$DB_PASSWORD',
    roles: [{
      role: 'readWrite',
      db: 'vitals'
    }]
  })
  EOF
  ```
  .env
  ```
  # DATABASE URL FOR BACK AND MODEL
  webappDB=mongodb://<admin>:<admin>@mongo:27017/webapp?authSource=webapp&w=1
  vitalsDB=mongodb://<admin>:<admin>@mongo:27017/vitals?authSource=vitals&w=1

  # ROOT DATABASE USERNAME/PASSWORD
  ROOT_USER=<root>
  ROOT_PASSWORD=<password>
  
  # USER DATABASE USERNAME/PASSWORD
  VITALS_DB_USER=<admin>
  WEB_DB_USER=<admin>
  DB_PASSWORD=<admin> # same for both db

  # SECRET
  SECRET_TOKEN=oUQF9vv5MB77302BJm6HDKulKKPqfukuiW5zMeamAx2JJU21cJkx23MBShP3GVt

  # BACKEND
  DeeAppId=DEE_APP_ID
  DeeAppSecret=DEE_APP_SECRET
  GROUP_SIZE=2
  PY_SERVER=http://webapp-model:7000

  # FRONTEND
  REACT_APP_IP_ADDRESS=localhost

  # PYTHON
  PACS_ADDR=127.0.0.1
  PACS_PORT=11113
  ```
3. Build docker compose. Frontend, backend, and model will be run at port 80, 5000, and 7000
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
