# Keaton Ludwig · Data Science Portfolio

**Portfolio site:** [keatonl2.github.io](https://keatonl2.github.io)
**Repository:** [github.com/keatonl2/keatonl2.github.io](https://github.com/keatonl2/keatonl2.github.io)

I came to data science through physics, and I still work like an experimentalist: check the data before trusting it, test a pattern against chance before believing it, and report a result together with its uncertainty. This repository holds my graduate portfolio, nine projects organized by the competency each one demonstrates. It is also the source of the GitHub Pages site linked above.

## Projects

| Project | Competency area | Key result | Open |
|---|---|---|---|
| [Wireless Power Transfer: Designing a Near-Field System](projects/wireless-power-transfer/) | Experimental research and quantitative analysis | Built a resonant inductive system with 82.03% power-transfer efficiency (Qi standard ≥ 85%) that worked up to a 3.2 cm gap | [Paper](projects/wireless-power-transfer/wireless-power-transfer-paper.pdf) |
| [Binary Star System Analysis: WDS 20136+5307](projects/binary-star-wds-20136-5307/) | Scientific data analysis and research communication | Separation 5.21″ ± 0.05″. The pair is physically bound (peer-reviewed, *JDSO* 2021) | [Paper](projects/binary-star-wds-20136-5307/binary-star-wds-20136-5307-paper.pdf) |
| [White House Visitor Patterns, 2021–2023](projects/white-house-visitor-patterns/) | Exploratory data analysis and visual storytelling | Monthly visitors rose to peaks near 120,000. December and Tuesday–Saturday are busiest | [Infographic](projects/white-house-visitor-patterns/white-house-visitor-infographic.pdf) |
| [Chasing Luck: Testing Lottery Results for Patterns](projects/lottery-randomness-analysis/) | Probability and statistical reasoning | 17,000+ drawings are indistinguishable from chance (Pick 10 χ² p = 0.94) | [Live report](https://keatonl2.github.io/projects/lottery-randomness-analysis/) |
| [The Geography of Childcare Affordability](projects/childcare-affordability-dashboard/) | Interactive visualization and dashboards | Infant care costs 54.3% of median income in Bronx County, NY, against a 7% benchmark | [Live dashboard](https://keatonl2.github.io/projects/childcare-affordability-dashboard/) |
| [Predicting Medical Insurance Charges](projects/medical-insurance-cost-regression/) | Regression modeling and healthcare analytics | Random forest test R² 0.86 and MAE $2,560 (linear: 0.78, $4,181). Smoking is the top driver | [Slides](projects/medical-insurance-cost-regression/medical-insurance-cost-regression-slides.pptx) |
| [Forecasting Store-Level Liquor Demand in Iowa](projects/iowa-liquor-demand-forecasting/) | Predictive analytics and forecasting | 21% less error than naive (WAPE 50.6% vs 64.2%). A simple Croston-SBA baseline matched machine learning. 364K duplicate rows removed | [Slides](projects/iowa-liquor-demand-forecasting/liquor-demand-forecasting-presentation.pdf) · [Code](projects/iowa-liquor-demand-forecasting/liquor-demand-forecasting.ipynb) |
| [Generative AI Application](projects/generative-ai-application/) | Generative AI applications | In progress | |
| [Applied Data Science Project](projects/applied-data-science-project/) | Applied end-to-end project development | In progress | |

Every project folder has a README with the same sections: problem, data source, methods, key result, tools, how to run or view, and limitations.

## Why nine projects instead of ten

Each project in this portfolio stands for **one distinct competency**, and nine competencies cover the range of work I want to show, from physical experiment to generative AI. Every other candidate from my coursework would have repeated a competency already shown here, such as another dashboard or another regression model. A tenth project would have made the portfolio longer without adding evidence of a new skill. Two of the nine (generative AI and the second applied project) are still in progress and will be my most recent work when they are added.

## Repository layout

```
.
├── index.html                 # GitHub Pages site: About, Projects, Contact
├── assets/
│   ├── css/site.css
│   └── img/                   # figures taken from each project's own deliverable
├── projects/
│   ├── wireless-power-transfer/
│   ├── binary-star-wds-20136-5307/
│   ├── white-house-visitor-patterns/
│   ├── lottery-randomness-analysis/        # index.html = interactive report
│   ├── childcare-affordability-dashboard/  # index.html = interactive dashboard
│   ├── medical-insurance-cost-regression/
│   ├── iowa-liquor-demand-forecasting/
│   ├── generative-ai-application/
│   └── applied-data-science-project/
├── CLEANUP.md                 # what was fixed, renamed, archived, and still to add
└── README.md
```

## Cleanup

See [CLEANUP.md](CLEANUP.md) for a full log of what was broken, fixed, renamed, and archived while turning coursework into this portfolio.

## Contact

The best way to reach me is through the [Contact section](https://keatonl2.github.io/#contact) of the portfolio site.
