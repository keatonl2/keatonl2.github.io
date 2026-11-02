# The Geography of Childcare Affordability

An interactive dashboard of county-level childcare prices in the United States from 2008 to 2018. It shows where statewide averages hide the families under the heaviest cost burden.

| | |
|---|---|
| **Competency area** | Interactive data visualization and dashboard development |
| **Live dashboard** | [keatonl2.github.io/projects/childcare-affordability-dashboard](https://keatonl2.github.io/projects/childcare-affordability-dashboard/) |

## Problem

Childcare costs are usually reported as state averages, but prices and incomes vary sharply between counties in the same state. Where is childcare least affordable, and how has the burden changed over a decade?

## Data

The **National Database of Childcare Prices** (U.S. Department of Labor, Women's Bureau), 2008–2018. It has county-level weekly prices by child age group (infant, toddler, preschool) and provider type (center-based or family care), along with county median household income.

## What the dashboard shows

- **Filters:** year, state, county, child age group, and provider type
- **Headline metrics:** average weekly cost, cost as a share of median income, costliest state, and the county with the heaviest burden
- **Figures:** county choropleth map, spread of prices within states, decade trend, burden against income by county (with the 7% federal affordability benchmark), and a table of the highest-cost counties

## Key results (2018, infant center-based care)

- National average: **$162 per week**, or **16.3%** of median household income. That is more than double the 7% federal benchmark.
- Costliest state: **Hawaii**, at $346 per week.
- Heaviest burden: **Bronx County, NY**, where care costs **54.3%** of median income.
- The highest-priced counties (Arlington, VA at $470 per week, and San Francisco, CA at $462) have high incomes. The heaviest burdens fall on lower-income urban counties.

## Tools

Plotly (choropleth and charts) and HTML/JavaScript, packaged as one self-contained web page.

## How to run

- **Online:** open the [live dashboard](https://keatonl2.github.io/projects/childcare-affordability-dashboard/). Click the year to change it, then use the filter bar.
- **Locally:** download `index.html` and open it in a browser. The page needs an internet connection the first time because the county map shapes load from Plotly's public CDN.

## Limitations

- Counties that did not report prices appear unshaded.
- Prices are reported market rates, not what families actually pay after subsidies.
