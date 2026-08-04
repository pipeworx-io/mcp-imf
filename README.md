# IMF — International Monetary Fund Data

The International Monetary Fund's macro database. Country-level GDP, inflation, current account, fiscal balance, exchange rates, debt, employment, demographics — across 190+ member countries. The standard cross-country macro source. Free, no auth.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

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

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Imf data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
