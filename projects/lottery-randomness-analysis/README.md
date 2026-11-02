# Chasing Luck: Testing Lottery Results for Patterns

An interactive statistical report that tests popular lottery beliefs ("hot numbers stay hot", "overdue numbers are due") against more than 17,000 real drawings.

| | |
|---|---|
| **Competency area** | Probability and statistical reasoning |
| **Live report** | [keatonl2.github.io/projects/lottery-randomness-analysis](https://keatonl2.github.io/projects/lottery-randomness-analysis/) |

## Problem

Players and paid "systems" treat frequency charts as if they predicted future drawings. Can historical results actually predict anything?

## Data

New York State Open Data: winning numbers for Mega Millions, Powerball, and Pick 10.

- 3,902 Mega Millions and Powerball jackpot drawings (2002–2024), 23,412 winning numbers in all
- 13,570 Pick 10 drawings (1987–2024) on one unchanged 20-of-80 matrix

## Methods

- **Split by matrix era.** Both games changed their number pools several times, so pooling eras would create fake "hot" numbers. Every test runs within a single era.
- **Chi-square goodness-of-fit** test of each era's number frequencies against equal probability.
- **Monte Carlo simulation:** 1,500 simulated fair-machine runs to set the normal range for the hottest-minus-coldest gap.
- **Sum distribution:** kernel density estimates of the five-number sum, real against simulated, plus trend and lag-1 autocorrelation.
- **Belief tests:** whether hot or cold numbers keep their status in the second half of an era, whether overdue numbers hit more often, and whether numbers avoid repeating.
- **Persistence:** year-to-year rank of each year's hottest number, and correlation of each number's count with its count the next year.
- **Stress test:** Pick 10's long record shows the hot-cold gap shrinking as the sample grows.

## Key results

- Mega Millions, current 5-of-70 era (675 drawings): χ² = 65.5 on 69 df, **p = 0.597**. The frequencies are indistinguishable from chance.
- The year-to-year correlation of number frequencies is **r = −0.034**: hot numbers do not stay hot.
- Pick 10: the hot-cold gap is **160%** of the expected count after 25 drawings and **8.6%** after 13,570 drawings, with a χ² fit of **p = 0.94** on 79 df.
- Conclusion: the data contains patterns, but they predict nothing. No number-selection method improves the odds.

## Tools

A self-contained interactive web report (HTML, CSS, and JavaScript) with chi-square testing, simulation, and kernel density estimation.

## How to run

- **Online:** open the [live report](https://keatonl2.github.io/projects/lottery-randomness-analysis/). Use the game, era, and year filters at the top. Each page reruns its tests for the current filter.
- **Locally:** download `index.html` and open it in any modern browser. Everything is bundled into that one file, so no install or server is needed.

## Limitations

The data records which numbers were drawn, not how they were drawn. The analysis can detect a lasting bias in outcomes. It cannot certify the physical drawing process, and finding no bias is not proof of perfect fairness.
