Changes for prod
1) backend index.js allowed origins for CORS

Input Env Keys:

Client: 
VITE_TURNSTILE_SITE_KEY

Server:
MONGO_URI
PORT(not needed for production)
JWT_SECRET
MAIL_HOST
MAIL_PORT
MAIL_USER
MAIL_PASS
PROD_SERVER_URL=http://localhost:3000 (backend url)
REDIRECTION_AFTER_VALIDATE=http://localhost:5173/login (frontend url)
TURNSTILE_SECRET

modify config.js for api in client