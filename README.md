
<div align="center">
<h1> AlignShare </h1>
  </div>
<p >
    AlignShare is a platform designed to automate the content sharing process for companies by instantly fetching their updates, generating engaging content in the form of images, and sharing it directly across social media platforms.
</p>


## Project Description

*Tech Stack: NextJS, FastAPI, Python, Vercel*  
AlignShare aims to streamline the content sharing process for companies by automating the generation and posting of updates across social media platforms. By leveraging real-time fetching of updates from company websites, an AI-powered content generator, and direct social media integration, AlignShare ensures that companies can effortlessly keep their audience informed and engaged with the latest news and announcements.

## Features

- Fetch the latest updates about your company directly in AlignShare. Stay informed about important news, announcements, and events happening in your organization.
- Create engaging content for your social media platforms with our AI-powered content generator using the latest updates fetched.
- Post the generated content directly to your social media platforms from AlignShare. Save time and effort by posting directly from our platform.
- AI-generated content is designed to be visually appealing and engaging, increasing the likelihood of interaction and shares on social media, thus boosting overall visibility and engagement.
- AlignShare offers an intuitive and easy-to-use interface, making it accessible for users of all technical levels to manage their content and social media posts efficiently.

## Local Environment Setup
## Method 1
#### Prerequisites
Before you begin, ensure that you have the following installed on your local machine:
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Setup

1. **Clone the Repository**  
   If you haven’t already, clone the repository that contains the `docker-compose.yml` file.

   ```
   git clone https://github.com/AlignShare/AlignShareOfficial.git
   ```
   
2. **Configuration**
    To configure AlignShare, you will need to set up your social media API keys. Create a `.env` file in the root directory and add the following:
     ```
     HF_TOKEN=""  
     NEWS_API_KEY=""
     ```

4. **Build and Start the Services**
    Run the following command to build and start the services defined in the `docker-compose.yml` file.

   ```
   docker-compose up --build
   ```

   This will:

   - Build the Docker images for the `client`, `server`, and `test` services.
   - Start the `client` service on port 3000.
   - Start the `server` service on port 8000.
   - Run tests in the `test` service.

   ### Access the Application
   - The client application will be accessible at [http://localhost:3000](http://localhost:3000).
   - The server API will be accessible at [http://127.0.0.1:8000](http://localhost:8000).

   ### Run Tests (Optional)
   If you want to run the tests separately, you can execute the following command:

   ```
   docker-compose run test
   ```

   ### Stop the Services
   To stop the running services, use:

   ```
   docker-compose down
   ```


## Method 2
#### Prerequisites
  ##### Before you begin, ensure that you have the following installed on your local machine:
   - Node.js and npm installed for the client
   - Python and virtualenv installed for the server
1. Install the dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

### Running the Server

1. Set up a virtual environment:
   ```bash
   virtualenv venv
   ```

2. Activate the virtual environment:
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

3. Install the required packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the server:
   ```bash
   uvicorn app:app --host 0.0.0.0 --port 8000
   ```

#### Notes
- Ensure both client and server are running concurrently for full functionality.
- The client will typically run on `localhost:3000` and the server on `localhost:8000` unless specified otherwise.

## Usage

1. AlignShare will automatically fetch the latest updates from your company.
2. Use the AI-powered content generator to create engaging content based on the updates fetched.
3. Share the generated content directly to your social media platforms from AlignShare.



