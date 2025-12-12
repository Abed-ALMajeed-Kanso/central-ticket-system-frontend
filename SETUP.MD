Frontend Setup

Follow the steps below to run the frontend locally or prepare it for deployment.

Prerequisites

Ensure Node.js and npm are installed on your machine.

Installation

Clone the repository or download the project as a ZIP and extract it.

Navigate into the project folder.

Install project dependencies:

npm install

Environment Variables

For local development, rename the file:

.env.example → .env

To run the ptoject make sure the backend is running on the same api in the .env.example

running command:

npm run dev

To deploy, use the same environment variables as defined in .env.example

for deployment setup, check DEPLOYMENT_SETUP.MD in the backend repository

