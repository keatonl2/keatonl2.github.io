# Repository cleanup log

This log records what was broken, fixed, renamed, archived, or removed when I reorganized my coursework into this public portfolio.

## Fixed

| Problem | Where | Fix |
|---|---|---|
| Both interactive reports showed **"Bundled Page"** as the browser-tab title, and that is also what a link preview or bookmark would show. | Lottery report, childcare dashboard | Added real page titles inside each page's template, so the correct title survives after the page unpacks. |
| The childcare dashboard footer printed the course code **DSC640-T301**. | `childcare-affordability-dashboard/index.html` | Replaced it with my name and the project's subject. |
| The insurance deck's title slide printed the course code **DSC630-T302**. | `medical-insurance-cost-regression-slides.pptx` | Removed it. The slide now reads "Predictive Analytics". |
| The insurance deck could only be opened with PowerPoint. | Medical insurance project | Linked the deck through Microsoft's free online viewer, so it opens in any browser. The `.pptx` download keeps the speaker notes. |
| File names had spaces and course wording (`Chasing Luck - Lottery Data Project.html`), which break or uglify URLs on GitHub Pages. | All deliverables | Renamed to lowercase, hyphenated, subject-based names (see below). |
| README headings named the **competency area** ("Scientific Data Analysis and Research Communication") instead of the project. | Binary star and wireless power READMEs | Retitled by subject or method ("Binary Star System Analysis: WDS 20136+5307"). The competency area moved into a table under the title. Course numbers were removed from every heading. |
| The liquor forecasting project had a description but no deliverable or code in the repo. | Iowa liquor project | Added the final presentation and the full notebook (PDF), plus the held-out error table, in the README. The two PDFs went up in a separate first commit and were then moved into the project folder. The original files were staged on a temporary branch, copied into place, and that branch was deleted. |
| The two existing READMEs had no data source, tools, or run instructions, and the wireless power README had no result. | Same | Rewrote every project README to one template: problem, data, methods, key result, tools, how to run or view, and limitations. Added the wireless power paper and its measured results (Q = 162.2, k = 0.202, PTE 82.03%, 3.2 cm working gap). |

## Known issues

- The liquor forecasting slides and notebook PDF still print the course code (DSC680) in their headers and footers. These are exported PDFs, so the code can't be removed without re-exporting from the source files.
- The childcare dashboard loads its county map shapes from Plotly's public CDN. On the live site this just works. If you open the downloaded `index.html` with no internet connection, the map area stays blank while the rest of the page still loads. This is noted in that project's README.

## Renamed

| Original file | New location |
|---|---|
| `README_BinaryStarProject.md` | `projects/binary-star-wds-20136-5307/README.md` |
| `README_WPTProject.md` | `projects/wireless-power-transfer/README.md` |
| `WPT Paper.pdf` | `projects/wireless-power-transfer/wireless-power-transfer-paper.pdf` |
| `Predictive_Liquor_Sales.pdf` | `projects/iowa-liquor-demand-forecasting/liquor-demand-forecasting-presentation.pdf` |
| `Predictive_Liquor_Sales_Python.pdf` | `projects/iowa-liquor-demand-forecasting/liquor-demand-forecasting-notebook.pdf` |
| `Binary Star Project.pdf` | `projects/binary-star-wds-20136-5307/binary-star-wds-20136-5307-paper.pdf` |
| `White House Visitor Data Project.pdf` | `projects/white-house-visitor-patterns/white-house-visitor-infographic.pdf` |
| `Chasing Luck - Lottery Data Project.html` | `projects/lottery-randomness-analysis/index.html` |
| `Childcare Project Dashboard.html` | `projects/childcare-affordability-dashboard/index.html` |
| `Predicting Medical Insurance.pptx` | `projects/medical-insurance-cost-regression/medical-insurance-cost-regression-slides.pptx` |

Interactive pages are named `index.html` inside their own folders, so each one has a clean URL (for example `/projects/lottery-randomness-analysis/`).

## Archived (kept privately, not published)

| File | Reason |
|---|---|
| `Ludwig_Keaton_Milestone1.docx` / `.pdf` | Course planning document, not portfolio content. Its project descriptions now live in the project READMEs and on the site. |
| `DSC680_Milestone_1_General_Portfolio_Plan_Final.docx` | An earlier draft of the same plan, superseded by the version above. |

These files stay in my local course folder and are not uploaded to this repository.

## Added

- `index.html` and `assets/`: the GitHub Pages portfolio site (About, Projects, Contact)
- `README.md`: repository overview, project index, and the reason this portfolio has nine projects
- `assets/img/`: figures taken directly from each project's own deliverable (the star image from the published paper, the prototype photo from the wireless power paper, and the model diagnostics chart from the insurance deck). The two interactive projects get live previews on the site instead of screenshots.

## Still to add

- [ ] Analysis notebook for the medical insurance project (code lives in my course folders)
- [ ] Source `.ipynb` for the liquor forecasting project, so it can be rerun (the full notebook is already included as a PDF)
- [ ] Re-export the liquor slides and notebook without the course code
- [ ] Generative AI project and second applied project when they are complete
- [ ] Email and LinkedIn links in the Contact section, and a résumé PDF
