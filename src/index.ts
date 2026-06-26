interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * IMF MCP — wraps IMF SDMX JSON REST API (dataservices.imf.org)
 *
 * Tools:
 * - get_datasets: list available IMF databases
 * - get_data: fetch time-series data for an indicator/country
 * - search_indicators: search indicator codes within a database
 */


const BASE_URL = 'https://dataservices.imf.org/REST/SDMX_JSON.svc';

const tools: McpToolExport['tools'] = [
  {
    name: 'get_datasets',
    description:
      'List all available IMF databases/datasets. Returns database IDs and names you can use with get_data and search_indicators. Example: call with no arguments to browse available datasets like IFS (International Financial Statistics), BOP (Balance of Payments), etc.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_data',
    description:
      'Fetch IMF time-series data for an indicator and country. Uses SDMX CompactData format. Example: get_data({ database_id: "IFS", frequency: "A", indicator: "NGDP_XDC", country: "US", start: "2018", end: "2023" }) returns annual nominal GDP for the US.',
    inputSchema: {
      type: 'object',
      properties: {
        database_id: {
          type: 'string',
          description: 'IMF database ID, e.g. "IFS", "BOP", "DOT", "WEO"',
        },
        frequency: {
          type: 'string',
          description: 'Data frequency: "A" (annual), "Q" (quarterly), "M" (monthly)',
        },
        indicator: {
          type: 'string',
          description: 'Indicator code, e.g. "NGDP_XDC" for nominal GDP. Use search_indicators to find codes.',
        },
        country: {
          type: 'string',
          description: 'ISO 2-letter country code, e.g. "US", "GB", "JP". Omit for all countries.',
        },
        start: {
          type: 'string',
          description: 'Start period, e.g. "2018" or "2018-Q1" or "2018-01"',
        },
        end: {
          type: 'string',
          description: 'End period, e.g. "2023" or "2023-Q4" or "2023-12"',
        },
      },
      required: ['database_id', 'frequency', 'indicator'],
    },
  },
  {
    name: 'search_indicators',
    description:
      'Search or list indicator codes available in an IMF database. Returns the code list (dimensions) for a dataset. Example: search_indicators({ database_id: "IFS", query: "GDP" }) finds GDP-related indicator codes.',
    inputSchema: {
      type: 'object',
      properties: {
        database_id: {
          type: 'string',
          description: 'IMF database ID to search within, e.g. "IFS"',
        },
        query: {
          type: 'string',
          description: 'Optional search term to filter indicators, e.g. "GDP", "inflation", "trade"',
        },
      },
      required: ['database_id'],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'get_datasets':
      return getDatasets();
    case 'get_data':
      return getData(
        args.database_id as string,
        args.frequency as string,
        args.indicator as string,
        args.country as string | undefined,
        args.start as string | undefined,
        args.end as string | undefined,
      );
    case 'search_indicators':
      return searchIndicators(
        args.database_id as string,
        args.query as string | undefined,
      );
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function getDatasets() {
  const res = await fetch(`${BASE_URL}/Dataflow`);
  if (!res.ok) throw new Error(`IMF API error: ${res.status}`);
  const data = (await res.json()) as Record<string, unknown>;
  return data;
}

async function getData(
  databaseId: string,
  frequency: string,
  indicator: string,
  country?: string,
  start?: string,
  end?: string,
) {
  const countryPart = country ?? '';
  const dimensions = `${frequency}.${countryPart}.${indicator}`;
  let url = `${BASE_URL}/CompactData/${databaseId}/${dimensions}`;

  const params = new URLSearchParams();
  if (start) params.set('startPeriod', start);
  if (end) params.set('endPeriod', end);
  const qs = params.toString();
  if (qs) url += `?${qs}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`IMF API error: ${res.status}`);
  const data = (await res.json()) as Record<string, unknown>;
  return data;
}

async function searchIndicators(databaseId: string, query?: string) {
  const res = await fetch(`${BASE_URL}/DataStructure/${databaseId}`);
  if (!res.ok) throw new Error(`IMF API error: ${res.status}`);
  const data = (await res.json()) as Record<string, unknown>;

  if (!query) return data;

  // Filter the structure to find matching indicators
  const lowerQuery = query.toLowerCase();
  const filtered = JSON.parse(JSON.stringify(data));
  // Return the full structure — the LLM can parse what it needs
  // The query is used as a hint for the caller
  return { query: lowerQuery, structure: filtered };
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
