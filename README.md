# fl-webapp-back
- install dependencies
   ```
   npm install
   ```
- run the appliaction (server will be running on port 5000)
  ```
  npm start
  ```
- database: [MongoDB](https://docs.mongodb.com/manual/installation/)

## API PATH
Authentication <br />
- POST /api/auth/login ( reqBody = {username, password} )
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
- POST /api/vitals/records ( Create vitals project and upload medical records, reqBody = {name, clinician_first_name, clinician_last_name} + file )
- GET /api/vitals/projects/clinician/:id ( Get all projects by clinician's user id )
- GET /api/vitals/projects/:id/medrec ( Get all records by project id )
- DELETE /api/vitals/records/deleterow/ (Delete selected row in record file req.boy = {record_id, record_index}) 
- DELETE /api/vitals/records/deletefile/:id (Delete entire record file by record_id) 

**Path ที่ไม่ได้ใช้ แต่อาจมีประโยชน์** <br />
User <br />
- GET /api/users ( Get all users )
- GET /api/users/:id ( Get user by id )


Webapp Project
- GET /api/projects ( Get all projects )

Vitals 
- GET /api/vitals/projects ( Get all vitals projects )
