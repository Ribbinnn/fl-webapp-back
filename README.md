# fl-webapp-back
- install dependencies
   ```
   npm install
   ```
- run the appliaction (server will be running on port 3000)
  ```
  npm start
  ```
- database: [MongoDB](https://docs.mongodb.com/manual/installation/)

API
- POST /api/auth/login ( reqBody = {username, password} )
- POST /api/auth/logout 
- POST /api/users ( Create new user, reqBody = {username, password, first_name, last_name, role} )
- GET /api/users ( Get all users )
- GET /api/users/:id ( Get user by id )
- POST /api/projects ( Create new project, reqBody = {name, task, description, users, fields} )
- POST /api/projects/:id/insert ( Insert medical record to project, reqBody = Object )
- POST /api/vitals/projects ( Create vitals project, reqBody = {name, owner_first_name, owner_last_name} + file )
- GET /api/vitals/projects/owner ( Get all projects by owner's full name, query = (first, last) )
- GET /api/vitals/projects/:id/medrec ( Get all records by project id )
- GET /api/vitals/projects ( Get all projects )