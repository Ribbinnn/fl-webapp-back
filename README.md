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
Authentication <br />
- POST /api/auth/login ( reqBody = {username, password, remember} )
- POST /api/auth/logout 


User 
- POST /api/users ( Create new user, reqBody = {username, password, first_name, last_name, role, email} )

Webapp Project
- POST /api/projects ( Create new project, reqBody = {name, task, description, users, requirements, predClasses} )
- GET /api/projects/HN/:HN ( Get patient info by HN )
- GET /api/projects/user/:id ( Get all projects by user id )
- GET /api/projects/:id ( Get project by id )
- POST /api/projects/:id/insert ( Insert medical record to project, reqBody = Object ) 


Vitals
- POST /api/vitals/records ( Create vitals project and upload medical records, reqBody = {project_name, record_name, user_id, records} )
- GET /api/vitals/projects/clinician/:id ( Get all projects by clinician's user id )
- GET /api/vitals/projects/:id/medrec ( Get all records by project id )
- GET /api/vitals/records/HN/:HN ( Get all records by patient's HN )
- GET /api/vitals/template/:project_name (Get .xlsx template from project's requirements)
- PATCH /api/vitals/records/updaterow (Update selected row in record file, reqBody = {record_id, update_data})
- PATCH /api/vitals/records/deleterow/ (Delete selected row in record file req.boy = {record_id, record_index}) 
- DELETE /api/vitals/records/deletefile/:id (Delete entire record file by record_id) 

Infer
- POST /api/infer (start inference, reqBody (multipart/form-data) = (file, project_id, record) )

Image
- GET /api/image (get image, reqQuery = (result_id, finding)) <br />
  example: /image/?result_id=6181884fdb269acd1bf1bd77&finding=original (original file) <br />
  example: /image/?result_id=6181884fdb269acd1bf1bd77&finding=Mass (overlay file)

**Path ที่ไม่ได้ใช้ แต่อาจมีประโยชน์** <br />
User <br />
- GET /api/users ( Get all users )
- GET /api/users/:id ( Get user by id )


Webapp Project
- GET /api/projects ( Get all projects )

Vitals 
- GET /api/vitals/projects ( Get all vitals projects )
