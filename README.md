# Social Media App

Welcome to the Social Media App! This project is a full-featured social media application built on the MERN stack with additional functionalities for voice message denoising using a Python model. The app also leverages Cloudinary for media management and Zeegocloud for video call capabilities.

## Features

- **User Authentication:**
  - Create Account
  - Login
- **Social Networking:**
  - Follow and Unfollow Users
  - Accept Follow Requests
- **Posts:**
  - Create Text Posts
  - Create Posts with Images (Cloudinary integration)
- **Media:**
  - Video Call Enabled (Zeegocloud integration)
- **Events and Messaging:**
  - Create Event Reminders
  - Create Scheduled Messages
- **Groups:**
  - Create Group
  - Add Members to Group
  - Remove Members from Group
  - Delete or Exit Group
- **Voice Messages:**
  - Denoise Voice Messages using a Python Model

## Technologies Used

- **Frontend:**
  - React.js
- **Backend:**
  - Node.js
  - Express.js
- **Database:**
  - MongoDB
- **Media Management:**
  - Cloudinary
- **Video Call:**
  - Zeegocloud
- **Voice Message Denoising:**
  - Python Model
- **Authentication:**
  - JWT (JSON Web Tokens)

## Getting Started

### Prerequisites

Make sure you have the following installed on your machine:

- Node.js
- MongoDB
- Python
- Cloudinary Account
- Zeegocloud Account

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/your-username/social-media-app.git
    cd social-media-app
    ```

2. Install the dependencies for the frontend and backend:

    ```bash
    cd frontend
    npm install
    cd ../backend
    npm install
    ```

3. Set up your environment variables. Create a `.env` file in the `backend` directory with the following variables:

    ```plaintext
    MONGO_URI=your_mongodb_uri
    JWT_SECRET=your_jwt_secret
    CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
    CLOUDINARY_API_KEY=your_cloudinary_api_key
    CLOUDINARY_API_SECRET=your_cloudinary_api_secret
    ZEEGOCLOUD_APP_ID=your_zeegocloud_app_id
    ZEEGOCLOUD_SERVER_SECRET=your_zeegocloud_server_secret
    ```

4. Run the backend server:

    ```bash
    cd backend
    npm start
    ```

5. Run the frontend development server:

    ```bash
    cd frontend
    npm start
    ```

6. Set up and run the Python voice denoising service:

    ```bash
    cd voice-denoising
    pip install -r requirements.txt
    python app.py
    ```

### Usage

1. Navigate to `http://localhost:3000` in your browser to use the application.
2. Sign up for a new account or log in with existing credentials.
3. Explore features such as creating posts, following users, making video calls, creating groups, and more.

## Contributing

We welcome contributions to improve this project! Please fork the repository and create a pull request with your changes. Ensure your code follows the project's coding standards and includes appropriate tests.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Contact

If you have any questions or feedback, feel free to reach out to the project maintainer at your-email@example.com.

---

Thank you for using our Social Media App! We hope you enjoy the features and find it useful for connecting with others.
