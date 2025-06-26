export interface DistinctUser {
  value: string;
}

export interface DistinctUsersPerDay {
  day: string;
  distinct_users: DistinctUser[];
}

export interface CascadeRun {
  day: string;
  model?: string;
  mode: string;
  messagesSent?: string;
  cascadeId: string;
  promptsUsed?: string;
}

export interface CascadeLine {
  day: string;
  linesSuggested?: string;
  linesAccepted?: string;
}

export interface CascadeToolUsage {
  tool: string;
  count: string;
}

export interface QueryResult {
  distinctUsersPerDay?: {
    distinctUsersPerDay: DistinctUsersPerDay[];
  };
  cascadeRuns?: {
    cascadeRuns: CascadeRun[];
  };
  cascadeLines?: {
    cascadeLines: CascadeLine[];
  };
  cascadeToolUsage?: {
    cascadeToolUsage: CascadeToolUsage[];
  };
}

export interface ApiResponseData {
  queryResults: QueryResult[];
}

export interface RequestBody {
  query_requests: {
    data_source?: string;
    selections?: {
      field: string;
      name: string;
      aggregation_function: string;
    }[];
    cascade_runs?: Record<string, unknown>;
    cascade_lines?: Record<string, unknown>;
    cascade_tool_usage?: Record<string, unknown>;
    filters?: {
      name: string;
      value: string;
      filter: string;
    }[];
  }[];
}
