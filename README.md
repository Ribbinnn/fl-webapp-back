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
- POST /api/auth/logout ( requestBody = {user_id} )
- POST /api/users ( Create new user, requestBody = {username, password} )
- GET /api/users ( Get all users )
  
