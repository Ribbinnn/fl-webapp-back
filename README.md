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
- POST /api/auth/login ( requestBody = {username, password} )
- POST /api/auth/logout 
- POST /api/users ( Create new user, requestBody = {username, password, first_name, last_name, role} )
- GET /api/users ( Get all users )
- GET /api/users/:id ( Get user by id )
<!-- - POST /api/vitals/projects ( Create vitals project, requestBody = {name, owner, description} ) -->
- GET /api/vitals/projects/owner ( Get project by owner's full name, query = (first_name, last_name) )
- GET /api/vitals/projects/:id ( Get project by id )
  
