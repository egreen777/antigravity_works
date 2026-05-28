# Backtester CLI Tool Implementation Tasks

- [ ] Create directory structure (`backtester/code`, `backtester/data`, `backtester/output`)
- [ ] Implement `backtester/code/main.py`
  - [ ] CLI parser and parameter validation (with warnings for ignored parameters)
  - [ ] Data loader with 1-year warm-up window and `yfinance` merge logic
  - [ ] Backtest simulator engine (day-by-day, annual contribution, rebalancing)
  - [ ] Strategy logic implementations (Trend Following, Dual Momentum, Asset Allocation)
  - [ ] Performance metrics (IRR CAGR, Cumulative Return, MDD, Average Holding Days)
  - [ ] ASCII Report formatting and logging
- [ ] Verify implementation with test commands
- [ ] Create `backtester/README.md` user guide
- [ ] Create walkthrough summary
