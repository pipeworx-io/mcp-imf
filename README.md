# IMF — International Monetary Fund Data

The International Monetary Fund's macro database. Country-level GDP, inflation, current account, fiscal balance, exchange rates, debt, employment, demographics — across 190+ member countries. The standard cross-country macro source. Free, no auth.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1856+ live data sources. This is an independent, unofficial integration — not affiliated with, endorsed by, or published by the upstream provider.

## Why this matters for AI agents

For cross-country macro analysis, the IMF's databases (WEO — World Economic Outlook; IFS — International Financial Statistics; BOP — Balance of Payments) are the canonical source. Where FRED is US-focused, IMF is global and harmonized. Where World Bank focuses on development, IMF focuses on macro/fiscal/financial.

Common flows:

- **Country macro snapshot.** GDP, inflation, current account for a given country.
- **Cross-country comparison.** Pull the same indicator across multiple countries to compare.
- **Time-series analysis.** Historical data for trend analysis.

Used by the `trade_country_profile` compound and pairs well with [Comtrade](/docs/reference/comtrade) (trade flows) and [BLS](/docs/reference/bls) (US labor).

## Auth

None. IMF Data API is fully public, free.

## Major databases

| Database | Coverage | Use |
|---|---|---|
| **WEO** (World Economic Outlook) | Annual & semi-annual | GDP, inflation, fiscal, current account forecasts |
| **IFS** (International Financial Statistics) | Monthly/quarterly | Money, banking, prices, government finance |
| **BOP** (Balance of Payments) | Quarterly | Current/capital/financial accounts |
| **DOTS** (Direction of Trade) | Monthly | Bilateral trade (mirror to Comtrade) |
| **GFS** (Government Finance Statistics) | Annual | Government revenue, expenditure, debt |

## Common pitfalls

- **Country code variants.** IMF uses ISO 3-letter codes (USA, GBR, DEU). Comtrade uses 3-digit numeric. Census uses 2-letter. Cross-source linking needs translation.
- **WEO publishes twice yearly.** April and October. Forecasts can shift dramatically between releases — always cite the vintage (e.g., "WEO October 2024").
- **Exchange-rate definitions vary.** Period average vs. end-of-period vs. PPP vs. real effective. IMF data has all four; specify which.
- **Coverage gaps.** Small economies and politically isolated countries (North Korea, Venezuela, Eritrea) have spotty data. The IMF API returns nulls; don't treat null as zero.
- **Real vs. nominal.** Default GDP is nominal in current-USD. For comparisons over time or across rapid-inflation economies, you usually want real (inflation-adjusted, in constant prices) or PPP-adjusted.
- **Lag.** Annual data published with 6–18 month lag depending on country reporting. Quarterly data faster, ~2–3 month lag for major economies.

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "imf": {
      "url": "https://gateway.pipeworx.io/imf/mcp"
    }
  }
}
```

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/imf/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1856+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## No MCP client? Call it over HTTP

```bash
curl -X POST https://gateway.pipeworx.io/v1/tools/get_datasets \
  -H 'Content-Type: application/json' \
  -d '{}'
```

No account needed for the first calls. Inspect any tool: `GET https://gateway.pipeworx.io/v1/tools/get_datasets`. Find one: `POST https://gateway.pipeworx.io/v1/tools/search_packs` with `{"query":"..."}`.

## Run it from npm

`@pipeworx/mcp-imf` is a local stdio bridge to the Pipeworx gateway: your MCP client
starts it with `npx`, and it forwards every call to the same
`https://gateway.pipeworx.io/imf/mcp` endpoint shown above. It needs network access;
there is no offline mode.

```json
{
  "mcpServers": {
    "imf": {
      "command": "npx",
      "args": ["-y", "@pipeworx/mcp-imf"]
    }
  }
}
```

Without a key it calls anonymously, capped at 50 calls a day. A free account
raises that to 200 a day: get a key at https://pipeworx.io/signup and add
`"env": { "PIPEWORX_API_KEY": "<your key>" }` to the server entry.
The key is sent as a Bearer token, the same way a hosted connection sends it,
so calls are metered and billed exactly as they are there.

It lists **only** this pack's tools by default. Set `PIPEWORX_META_TOOLS=1` to
also list `ask_pipeworx` and the other gateway-wide tools.

Behind an HTTPS proxy: Node's built-in `fetch` does not read `HTTPS_PROXY` by
default. Newer Node releases honour it when `NODE_USE_ENV_PROXY=1` is set; check
your Node version's documentation.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Imf data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
