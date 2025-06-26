## Overview

This is a [Next.js](https://nextjs.org) project that functions as a testing sandbox for the Windsurf Analytics API.

The core logic resides in `app/api/proxy/route.ts`, which handles incoming requests, validates them, forwards them to the appropriate backend analytics service, and in some cases, performs data transformations before returning the response.

## Getting Started

### 1. Environment Variables

Before running the application, you need to create a `.env.local` file in the root of the project and add the necessary environment variables. These variables point to the backend analytics services.

```bash
NEXT_PUBLIC_ANALYTICS_API_BASE_URL="https://server.codeium.com/api/v1/Analytics"
NEXT_PUBLIC_CASCADE_ANALYTICS_API_BASE_URL="https://server.codeium.com/api/v1/CascadeAnalytics"
```

### 2. Install Dependencies

```bash
cd frontend
pnpm install
```

### 3. Run the Development Server

```bash
pnpm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## API Proxy Functionality

The application exposes a single API endpoint: `POST /api/proxy`.

### Request Body

The endpoint expects a JSON payload with the following structure:

```json
{
  "query": "<option_name>",
  "serviceKey": "<your_service_key>",
  "emails": ["user1@example.com", ...] // Optional
}
```

- `query`: A string representing one of the predefined queries (e.g., `option1`).
- `serviceKey`: An authentication key required by the backend API.
- `emails`: An optional array of email strings to filter the query results.

### Response

The endpoint returns a JSON object containing the original API response, the request that was sent, and any formatted data.

### Available Queries

The `query` parameter in the request body maps to a predefined set of API calls configured in the `QUERY_ENDPOINT_MAP` variable within the proxy route. This acts as an allowlist for predefined and pretested analytics queries for common use cases.

Here are the available queries and their purposes:

- **`option1`**: Fetches the count of distinct users.
- **`option2`**: Fetches the count of distinct users who have at least one acceptance (active users).
- **`option3`**: Fetches Cascade data on lines suggested + lines accepted.
- **`option4`**: Fetches the number + type of models used per day.
- **`option5`**: Fetches the total number of messages sent to Cascade per day.
- **`option6` & `option7`**: Fetches the total number of credits used per day.

> **Note**: The `emails` parameter is passed in the request body with `option7` and is used to filter the query results by specific users.

## Known Issues

- The API proxy logic resides in a Next.js API route (`/api/proxy`). While this is suitable for a serverless function, any future expansion with persistent connections or true backend services should be placed in a dedicated `backend` directory.
