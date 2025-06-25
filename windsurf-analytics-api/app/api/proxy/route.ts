import { NextRequest, NextResponse } from "next/server";

const ANALYTICS_API_BASE_URL = process.env.NEXT_PUBLIC_ANALYTICS_API_BASE_URL;
const CASCADE_ANALYTICS_API_BASE_URL =
  process.env.NEXT_PUBLIC_CASCADE_ANALYTICS_API_BASE_URL;

// note: not used in this file, but left in for future expansion
const USER_ANALYTICS_API_BASE_URL =
  process.env.NEXT_PUBLIC_USER_ANALYTICS_API_BASE_URL;

// A mapping of query options to specific API endpoints to prevent unwanted API calls.
const QUERY_ENDPOINT_MAP: Record<
  string,
  {
    endpoint: string;
    method: string;
    headers: { [key: string]: string };
    body: any;
    formattingFunction?: (data: any) => any;
  }
> = {
  option1: {
    endpoint: ANALYTICS_API_BASE_URL!,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: {
      query_requests: [
        {
          data_source: "QUERY_DATA_SOURCE_USER_DATA",
          selections: [
            {
              field: "distinct_users",
              name: "distinct_users",
              aggregation_function: "QUERY_AGGREGATION_COUNT",
            },
          ],
        },
      ],
    },
  },
  option2: {
    endpoint: ANALYTICS_API_BASE_URL!,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: {
      query_requests: [
        {
          data_source: "QUERY_DATA_SOURCE_USER_DATA",
          selections: [
            {
              field: "distinct_users",
              name: "distinct_users",
              aggregation_function: "QUERY_AGGREGATION_COUNT",
            },
          ],
          filters: [
            {
              name: "num_acceptances",
              value: "0",
              filter: "QUERY_FILTER_GREATER_THAN",
            },
          ],
        },
      ],
    },
  },
  option3: {
    endpoint: CASCADE_ANALYTICS_API_BASE_URL!,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: {
      query_requests: [
        {
          cascade_lines: {},
        },
      ],
    },
  },
  option4: {
    endpoint: CASCADE_ANALYTICS_API_BASE_URL!,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: {
      query_requests: [
        {
          cascade_runs: {},
        },
      ],
    },
    formattingFunction: (data: any) => {
      const runs = data.queryResults[0].cascadeRuns.cascadeRuns;
      const modelsPerDay: { [day: string]: Set<string> } = {};

      runs.forEach(({ day, model }: { day: string; model: string }) => {
        // Remove/don't count empty values
        if (!day || !model) return;

        // Create a set for each day if one does not exist
        if (!modelsPerDay[day]) {
          modelsPerDay[day] = new Set();
        }

        // Add the model to the set
        modelsPerDay[day].add(model);
      });

      // Create new object of (day, model_count) entries
      const modelCountsPerDay = Object.fromEntries(
        Object.entries(modelsPerDay).map(([day, models]) => [day, models.size])
      );

      const modelsPerDayArray = Object.fromEntries(
        Object.entries(modelsPerDay).map(([day, models]) => [
          day,
          Array.from(models),
        ])
      );

      return { modelCountsPerDay, modelsPerDay: modelsPerDayArray };
    },
  },
  option5: {
    endpoint: CASCADE_ANALYTICS_API_BASE_URL!,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: {
      query_requests: [
        {
          cascade_runs: {},
        },
      ],
    },
    formattingFunction: (data: any) => {
      const runs = data.queryResults[0].cascadeRuns.cascadeRuns;
      const messagesPerDay: { [day: string]: number } = {};

      runs.forEach(
        ({ day, messagesSent }: { day: string; messagesSent: number }) => {
          // Remove/don't count empty values
          if (!day || !messagesSent) return;

          // Accumulate number of messagesSent per day
          if (!messagesPerDay[day]) {
            messagesPerDay[day] = Number(messagesSent);
          } else {
            messagesPerDay[day] += Number(messagesSent);
          }
        }
      );

      return { messagesPerDay };
    },
  },
  option6: {
    endpoint: CASCADE_ANALYTICS_API_BASE_URL!,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: {
      query_requests: [
        {
          cascade_runs: {},
        },
      ],
    },
    formattingFunction: (data: any) => {
      const runs = data.queryResults[0].cascadeRuns.cascadeRuns;
      const creditSpendPerDay: { [day: string]: number } = {};

      runs.forEach(
        ({ day, promptsUsed }: { day: string; promptsUsed: number }) => {
          // Remove/don't count empty values
          if (!day || !promptsUsed) return;

          // Accumulate number of promptsUsed per day
          if (!creditSpendPerDay[day]) {
            creditSpendPerDay[day] = Number(promptsUsed);
          } else {
            creditSpendPerDay[day] += Number(promptsUsed);
          }
        }
      );

      return { creditSpendPerDay };
    },
  },
  option7: {
    endpoint: CASCADE_ANALYTICS_API_BASE_URL!,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: {
      query_requests: [
        {
          cascade_runs: {},
        },
      ],
    },
    formattingFunction: (data: any) => {
      const runs = data.queryResults[0].cascadeRuns.cascadeRuns;
      const creditSpendPerDay: { [day: string]: number } = {};

      runs.forEach(
        ({ day, promptsUsed }: { day: string; promptsUsed: number }) => {
          // Remove/don't count empty values
          if (!day || !promptsUsed) return;

          // Accumulate number of promptsUsed per day
          if (!creditSpendPerDay[day]) {
            creditSpendPerDay[day] = Number(promptsUsed);
          } else {
            creditSpendPerDay[day] += Number(promptsUsed);
          }
        }
      );

      return { creditSpendPerDay };
    },
  },
};

export async function POST(req: NextRequest) {
  try {
    const { query, serviceKey, emails } = await req.json();
    let formattedOutput = null;

    // Validate input
    if (!query || !serviceKey) {
      return NextResponse.json(
        { error: "Missing query or serviceKey" },
        { status: 400 }
      );
    }

    const endpoint = QUERY_ENDPOINT_MAP[query];
    if (!endpoint) {
      return NextResponse.json({ error: "Invalid query" }, { status: 400 });
    }

    // Create a mutable copy of the body and insert the service key
    const requestBody = { service_key: serviceKey, ...endpoint.body };
    if (emails.length > 0) {
      requestBody.emails = emails;
    }

    // Forward the request to the actual API
    const response = await fetch(`${endpoint.endpoint}`, {
      method: endpoint.method,
      headers: endpoint.headers,
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    // Handle formatting if needed
    if (endpoint.formattingFunction) {
      formattedOutput = endpoint.formattingFunction(data);
    }

    // Handle non-ok responses from the target API
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})); // Try to parse error, but don't fail if body is empty
      return NextResponse.json(
        { error: "API request failed", details: errorData },
        { status: response.status }
      );
    }

    return NextResponse.json({
      apiResponse: data,
      sentRequest: requestBody,
      endpoint: endpoint,
      formattedOutput: formattedOutput,
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: "An internal server error occurred" },
      { status: 500 }
    );
  }
}
