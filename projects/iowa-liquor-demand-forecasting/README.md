# Forecasting Store-Level Liquor Demand in Iowa

A forecasting study that predicts how many bottles each Iowa retailer will buy over the next four weeks, by product and by category. Three naive and intermittent-demand baselines are compared with three machine-learning models.

| | |
|---|---|
| **Competency area** | Predictive analytics and forecasting |
| **Presentation** | [liquor-demand-forecasting-presentation.pdf](liquor-demand-forecasting-presentation.pdf) (14 slides) |
| **Code** | [liquor-demand-forecasting-notebook.pdf](liquor-demand-forecasting-notebook.pdf) (full Jupyter notebook with outputs, exported to PDF) |

## Problem

Distributors commit inventory before they know what each account will order. Ordering too much ties up working capital in slow stock, and ordering too little runs fast movers short. The study asked three questions:

1. Can purchase history predict a store's next four weeks of purchases better than a naive carry-forward?
2. Which product, store, and timing characteristics matter most?
3. Is forecasting more dependable for a product within a store, or for a category within a store?

## Data

**Iowa Liquor Sales 2026** (Iowa Department of Revenue, dataset 1263, Iowa Data Hub, CC BY). Iowa is an alcohol control state: the state is the only spirits wholesaler, so every retailer purchase is published at the invoice-line level.

- January–August 2026, analyzed as **34 full weeks** (January 5 to August 30)
- After cleaning: **1.60 million** invoice lines, **2,203 stores** across all 99 counties, **4,429 products** in 44 categories, 19.5 million net bottles
- These are retailer purchases, not inventory on hand or consumer sales

## Methods

- **Cleaning.** Found and removed **364,160 exact duplicate rows**, an export artifact concentrated in July (43% of rows) and August (50%) that doubled those months' apparent volume. The cleaned count matched the state portal to within 14 rows. I also filled missing store geography from the same store, netted returns into weekly totals, and logged every cleaning rule.
- **Aggregation.** Summed to store × product × week and store × category × week. A series is forecast only if it bought in at least 3 of the previous 8 weeks, judged from past weeks alone.
- **Target.** Bottles bought in the next four weeks: a monthly replenishment rhythm.
- **Methods compared.**
  - Baselines: naive (last 4 weeks), 8-week moving average, Croston-SBA
  - Models: Poisson GLM, random forest, gradient boosting with Poisson loss
- **Validation.** History weeks 1–7, training targets from weeks 8–22, a 3-week gap, then a held-out test on weeks 26–30 (July–August). Rolling cross-validation picked the model, and the test set was used once.
- **Metric.** WAPE (total absolute error ÷ total actual bottles). Permutation importance by feature family.

## Key results

Forecast error on held-out July–August weeks (WAPE %, lower is better):

| Method | Store × product | Store × category |
|---|---|---|
| Naive (last 4 weeks) | 64.2 | 53.8 |
| 8-week moving average | 56.0 | 46.3 |
| Croston-SBA | 50.5 | **41.6** |
| Poisson GLM | 54.0 | 50.1 |
| Random forest | **50.2** | 45.6 |
| Gradient boosting | 50.6 | 44.7 |

- **Q1: History helps.** Gradient boosting cuts error by about **21%** against carrying last month forward, and 59% of its individual forecasts are closer than naive. But the simple **Croston-SBA baseline matched the machine-learning models** at product level and won at category level. Gradient boosting's cross-validation lead did not hold out of sample.
- **Q2: A store's own recent buying drives the forecast.** Shuffling the series' recency and frequency features raised MAE by 20 bottles. Product, store, and calendar features each added under half a bottle.
- **Q3: Coarser planning levels are far more dependable.** WAPE was about 50% for a product in a store, 42–45% for a category in a store, and 22.8% for store totals (naive 32.5%). Error was highest for low-volume items (78.5%), the smallest stores (56.3%), and rural counties (54.8%), though the model still beat naive in every segment.
- **Recommendation:** Distributors should replace carry-forward planning with an intermittency-aware baseline such as Croston-SBA and plan at the account and category level. Machine learning should run in shadow mode until it beats that baseline for three or more months, including holidays.

## Tools

Python, pandas, NumPy, scikit-learn (`PoissonRegressor`, `RandomForestRegressor`, `HistGradientBoostingRegressor` with Poisson loss, `ColumnTransformer` pipelines, `permutation_importance`), matplotlib, and a Croston-SBA implementation for intermittent demand.

## How to run

The notebook is included as a PDF export with every cell's code and output, so the full workflow can be read without running anything.

<!-- TODO (Keaton): add the source notebook as `liquor-demand-forecasting.ipynb` (plus a requirements.txt) so it can be rerun. -->

To reproduce it:

1. Download Iowa Liquor Sales 2026 (dataset 1263) from the Iowa Data Hub as CSV parts named `iowa_liquor_sales_2026_1263_rows_part_*.csv`.
2. `pip install pandas numpy scikit-learn matplotlib jupyter`
3. Run the notebook top to bottom. All tunable settings are in the first cell, and the outputs (cleaning log, coverage tables, cross-validation folds) are written to an output folder.

## Limitations and ethics

- With eight months of data and a July–August test, there is no full seasonal cycle, so holiday accuracy is unknown.
- Purchases are not inventory, so the models cannot predict stockouts.
- Iowa's single wholesaler and uniform prices may not transfer to open markets.
- Eligible series cover 37% of product-level volume. The models were lightly tuned and have no prediction intervals.
- Every store is named in the public data, so figures use no store names. Small and rural stores see higher error, so results are reported by segment. Forecasts are advisory, and a person places every order.
