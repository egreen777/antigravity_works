# Stock Backtesting CLI Tool Implementation Plan

Build a command-line stock backtesting engine in Python under the `backtester` directory, implementing the strategies, data rules, and reporting formats specified in `invest_backtest.md`, `strategy.md`, and `build.md`.

## User Review Required

> [!IMPORTANT]
> **Calendar Rebalancing Alignment**
> For the rebalancing-period parameter (`1m`, `3m`, `6m`, `9m`, `1y`), we will align decisions with standard calendar periods:
> - `1m`: Last trading day of every month.
> - `3m`: Last trading day of March, June, September, and December.
> - `6m`: Last trading day of June and December.
> - `9m`: Last trading day of September.
> - `1y`: Last trading day of December.
>
> On the first day of the backtest, the portfolio will be initialized and immediately invested. Rebalancing will occur on the last trading day of the corresponding calendar periods. Please let us know if you prefer a relative rebalancing period (e.g., exactly every 3 months from the start date) instead.

> [!NOTE]
> **CAGR Calculation with Contributions**
> When annual contributions are configured, simple CAGR calculation `(Ending Value / Initial Capital) ** (1/Years) - 1` is not financially accurate because new capital is added over time. We will use the **Internal Rate of Return (IRR)** method to calculate the annualized growth rate of the portfolio, treating contributions as negative cash flows and the final portfolio value as a positive cash flow at the end of the backtest. If there are no contributions, this mathematically reduces to the standard CAGR formula.

## Open Questions

None at this stage. Any additional feedback on the proposed rebalancing or CAGR calculations can be provided during review.

---

## Proposed Changes

### Documentation

#### [NEW] [README.md](file:///data/data/com.termux/files/home/works/antigravity-project/backtester/README.md)
Create a new README user guide detailing:
- How to run the backtester CLI.
- Explanation of all command-line arguments and flags.
- Examples of execution commands for each of the three strategies.
- Descriptions of the output tables (annual performance and final summary metrics) and log files.

#### [NO CHANGE] [invest_backtest.md](file:///data/data/com.termux/files/home/works/antigravity-project/backtester/invest_backtest.md)
Keep this file untouched as it is reserved for user-only edits.

### Backtester Engine

#### [NEW] [main.py](file:///data/data/com.termux/files/home/works/antigravity-project/backtester/code/main.py)

We will create a single, well-structured, self-contained Python script at `backtester/code/main.py` which will contain:
1. **CLI Argument Parser**:
   - Parses arguments: `--strategy`, `--ticker`, `--tickers`, `--bond-ticker`, `--start`, `--end`, `--initial-capital`, `--annual-contribution` (optional), `--trading-period` (default 120), `--rebalancing-period` (default `3m`), `--save-report` (flag).
   - Validates required inputs per strategy, and prints warning logs when incompatible arguments are ignored.
2. **Data Downloader and Loader**:
   - Manages price files in `backtester/data/{ticker}.csv`.
   - Before executing the backtest, checks if the file exists and covers the backtest period including a 1-year warm-up period (to compute initial moving averages or momentum).
   - If missing or insufficient, downloads the required date range using `yfinance`, cleans and reformats the columns to `Date, Open, High, Low, Close, Adj Close, Volume`, and merges it with existing CSV data.
3. **Backtesting Simulator**:
   - Simulates daily portfolio value by tracking cash and share holdings.
   - Adds the annual contribution on the first trading day of each new calendar year.
   - Calculates daily portfolio values and benchmark values (Buy & Hold of the ticker if single asset, or VOO if multiple assets).
   - Computes daily drawdowns to track annual and overall MDD.
   - Executes strategy-specific logic:
     - **Trend Following**: Daily check of `Adj Close > SMA(trading-period)`. Positions updated at the end of the day, taking effect on the next trading day.
     - **Dual Momentum**: Computes relative momentum over the `trading-period` for risk and bond assets at the end of each rebalancing period. Rebalances to the selected asset (or cash) at the close.
     - **Asset Allocation**: Rebalances to target weights at the end of each rebalancing period. Automatically scales weights proportionally if some assets have not yet launched.
4. **Metrics Calculator**:
   - Calculates CAGR (IRR solver via bisection method), cumulative return, overall MDD, and average holding days (consecutive trading days with non-empty positions).
5. **Logger**:
   - Appends a detailed log block for each run to `backtester/output/backtest.log` containing configuration and all strategy decision events.
6. **Reporter**:
   - Prints beautifully aligned ASCII tables for annual performance and final summary performance to the console, and optionally saves the report to `backtester/output/report.txt`.

---

## Verification Plan

### Automated Tests
- Since we don't have a test runner configured, we will verify correctness by executing the script directly with python:
  - **Test Case 1 (Trend Following)**:
    `python3 backtester/code/main.py --strategy trend_following --ticker VOO --start 2020-01-01 --end 2025-12-31 --initial-capital 10000 --annual-contribution 2000 --trading-period 200`
  - **Test Case 2 (Dual Momentum)**:
    `python3 backtester/code/main.py --strategy dual_momentum --tickers QQQ,VOO --bond-ticker IEF --start 2018-01-01 --end 2025-12-31 --initial-capital 10000 --rebalancing-period 3m --trading-period 120`
  - **Test Case 3 (Asset Allocation)**:
    `python3 backtester/code/main.py --strategy asset_allocation --tickers QQQ:40,VOO:25 --bond-ticker IEF --start 2015-01-01 --end 2025-12-31 --initial-capital 10000 --annual-contribution 1000 --rebalancing-period 1m`

### Manual Verification
- Verify that the CSV files are created correctly in `backtester/data/`.
- Verify that the log is recorded in `backtester/output/backtest.log` and matches the event formats.
- Verify that the console report contains the ASCII tables with correct metrics.
