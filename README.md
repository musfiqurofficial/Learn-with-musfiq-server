## Backend

### Technologies Used

- **Express.js**: A web application framework for Node.js.
- **MongoDB**: A NoSQL database for storing application data.
- **Mongoose**: An ODM (Object Data Modeling) library for MongoDB and Node.js.
- **JWT (jsonwebtoken)**: A library for generating JSON Web Tokens.
- **Bcrypt.js**: A library to help hash passwords.
- **Cors**: Middleware for enabling Cross-Origin Resource Sharing.
- **Dotenv**: A module to load environment variables from a .env file.
- **Nodemon**: A utility that monitors for any changes in your source and automatically restarts your server.

### Setup and Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/musfiqurofficial/Learn-with-musfiq-server.git
   cd learn-with-musfiq/backend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create a .env file** in the root directory and add your environment variables (e.g., MongoDB URI, JWT secret):

   ```env
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   ```

4. **Run the server:**

   ```bash
   npm start
   ```

5. **Run the server in development mode (with Nodemon):**
   ```bash
   npx nodemon
   ```

### Project Structure

- **src/**: Contains the source code of the backend.
  - **controllers/**: Contains the controller functions for handling requests and responses.
  - **models/**: Contains the Mongoose models for MongoDB collections.
  - **routes/**: Contains the route definitions for the API endpoints.
  - **middlewares/**: Contains middleware functions for request processing.
  - **config/**: Contains configuration files and environment variables.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the ISC License.

## Author

Musfiq

```▋

```
# EasyLink-ERP-Server
