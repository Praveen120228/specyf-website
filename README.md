# Specyf Business Website

A modern, responsive business website for Specyf company with user authentication and admin functionality.

## Features

- Clean, professional layout
- Responsive design for all devices
- User account creation and management
- Social media integration
- Admin panel for user data management
- MongoDB database integration

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd specyf-website
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Create a `.env` file in the root directory and add:
```
PORT=3000
MONGODB_URI=mongodb://localhost/specyf
```

4. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## Project Structure

```
specyf-website/
├── css/
│   └── style.css
├── js/
│   └── main.js
├── index.html
├── login.html
├── server.js
├── package.json
└── .env
```

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- Node.js
- Express.js
- MongoDB
- Mongoose

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License.
