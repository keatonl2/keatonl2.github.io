# White House Visitor Patterns, 2021–2023

An exploratory analysis of public White House visitor records, presented as a one-page infographic for a nontechnical audience.

| | |
|---|---|
| **Competency area** | Exploratory data analysis and visual storytelling |
| **Deliverable** | [Infographic (PDF)](white-house-visitor-infographic.pdf) |

## Problem

How has visitation to the White House Complex changed since 2021? When do visitors come, where do they go, and how large are the groups? The goal was to answer these questions in a format a general reader can take in quickly.

## Data

Publicly released White House visitor access records for 2021–2023. Each record is a scheduled visit with its date, meeting location, and group size.

## Methods

- Cleaned the records and parsed visit dates.
- Aggregated visitors by month, by month of year, and by day of week.
- Compared volume across the five complex facilities (White House, Eisenhower Executive Office Building, Vice President's Residence, New Executive Office Building, and one smaller site).
- Plotted group sizes over time to separate routine visits from large events.
- Chose one chart per question and wrote a one- or two-sentence takeaway under each.

## Key results

- Monthly visitors rose from a few thousand in 2021 to recurring peaks of about **120,000** by late 2023.
- **December** is the busiest month every year.
- **Tuesday through Saturday** carry the heaviest load. Sundays and Mondays are quiet.
- The **White House** receives the overwhelming majority of visitors, followed by the Eisenhower Executive Office Building.
- Most appointments are **small groups**. A few events exceed several thousand guests and need far more coordination.

## Tools

Python (pandas for cleaning and aggregation, matplotlib for charts) and an infographic page layout.

## How to view

Open the [infographic PDF](white-house-visitor-infographic.pdf).

## Limitations

- The records cover scheduled visits that were disclosed publicly, not every person who entered the complex.
- The three-year window includes the recovery from pandemic-era closures, which inflates the growth trend.
