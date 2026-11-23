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
| The liquor forecasting project had a description but no deliverable or code in the repo. | Iowa liquor project | Added the final presentation, the white paper, the full Jupyter notebook (with its saved outputs, the output tables, and figures), a `requirements.txt`, and the held-out error table in the README. The notebook's course-code header was replaced with the project title. The two PDFs went up in a separate first commit and were then moved into the project folder. The original files were staged on a temporary branch, copied into place, and that branch was deleted. |
| The generative AI project was a placeholder marked "in progress". | `projects/generative-ai-application/` | Replaced with the finished project in `projects/prescription-sig-translator/`: the Streamlit app code, the fine-tuning notebook with saved outputs, the training data, evaluation results, app screenshots, and slides, plus a README in the standard template. The placeholder folder was deleted. |
| The fine-tuning notebook's first cell printed the course code and term-project heading (**DSC670-T301**, "Term Project - Milestone 3"), and the app's browser-tab title and code comments named the course. | `prescription-sig-translator/` | Replaced the notebook header with the project title, retitled "What's next (Milestone 4)" to "What's next", and removed the course code from the app's page title and docstrings. No code logic was changed. |
| The project's slide deck was built for the course, with the course code in the footer and on the title slide. | `prescription-sig-translator/presentation/` | Rebuilt the deck from its script without the course code and added a PDF export so it opens in any browser. |
| The medical insurance project had slides but no code. | `medical-insurance-cost-regression/` | Found the original notebook (`Ludwig_Keaton_Milestone4_PythonCode.ipynb`, in Downloads) and added it with its saved outputs, which match the README exactly (random forest R² 0.8635, MAE $2,560). Replaced its course-code header (**DSC630-T302**, "Milestone 4") with the project title, added a `requirements.txt`, and replaced the README's TODO with run steps. |
| The second applied project was a placeholder marked "in progress". | `projects/applied-data-science-project/` | Replaced with the finished NFL fourth-down project in `projects/nfl-fourth-down-decisions/`: notebook with saved outputs, figures, white paper, audience Q&A, slides, narrated deck, and video, plus a README in the standard template. The placeholder folder was deleted. |
| The fourth-down notebook, white paper, Q&A, and slides named the course (**DSC680**, "Milestone 3"). | `nfl-fourth-down-decisions/` | Removed the course and instructor lines from the white paper and Q&A title pages, changed the notebook's header and section 6 heading, and replaced the course text on the deck's title slide, closing slide, footer layout, and the first slide's speaker notes. The deck's recorded narration was kept. |
| The narrated deck is 18 MB and needs PowerPoint to play. | `nfl-fourth-down-decisions/` | Added a 0.5 MB PDF of the slides (narration removed) for viewing in any browser, and the narrated video. |
| The two existing READMEs had no data source, tools, or run instructions, and the wireless power README had no result. | Same | Rewrote every project README to one template: problem, data, methods, key result, tools, how to run or view, and limitations. Added the wireless power paper and its measured results (Q = 162.2, k = 0.202, PTE 82.03%, 3.2 cm working gap). |

## Known issues

- The fourth-down narrated video and the recorded narration in its deck still mention the course (DSC680), and the video shows the old slide footer. Re-exporting the video from the updated deck (File > Export > Create a Video) would fix the slides but not the spoken line.
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
| `Ludwig_Keaton_Milestone3.ipynb` | `projects/prescription-sig-translator/prescription-sig-translator-fine-tuning.ipynb` |
| `sig_train.jsonl`, `sig_val.jsonl`, `sig_test.jsonl` | `projects/prescription-sig-translator/data/` |
| `m3_summary.csv`, `m3_extra_metrics.csv`, `m3_all_results.csv`, `results.csv`, `training_metrics.png` | `projects/prescription-sig-translator/results/` (`evaluation-summary.csv`, `flag-f1-field-accuracy.csv`, `all-model-outputs.csv`, `training-metrics.csv`, `training-metrics.png`) |
| `Ludwig_Keaton_Milestone4_PythonCode.ipynb` (Downloads) | `projects/medical-insurance-cost-regression/medical-insurance-cost-regression.ipynb` |
| `Ludwig_Project2_FourthDown_Analysis_Final.ipynb` | `projects/nfl-fourth-down-decisions/nfl-fourth-down-decisions.ipynb` |
| `Ludwig_Milestone3_FinalWhitePaper.pdf` | `projects/nfl-fourth-down-decisions/nfl-fourth-down-white-paper.pdf` |
| `Ludwig_Milestone3_QA.pdf` | `projects/nfl-fourth-down-decisions/nfl-fourth-down-audience-qa.pdf` |
| `Ludwig_Milestone3_Presentation.pptx` | `projects/nfl-fourth-down-decisions/nfl-fourth-down-presentation.pptx` |
| `Ludwig_Milestone3_Presentation.mp4` | `projects/nfl-fourth-down-decisions/nfl-fourth-down-presentation-video.mp4` |
| `applied-data-science-project/` (placeholder) | `projects/nfl-fourth-down-decisions/` |
| `generative-ai-application/` (placeholder) | `projects/prescription-sig-translator/` |
| `Predicting Medical Insurance.pptx` | `projects/medical-insurance-cost-regression/medical-insurance-cost-regression-slides.pptx` |

Interactive pages are named `index.html` inside their own folders, so each one has a clean URL (for example `/projects/lottery-randomness-analysis/`).

## Archived (kept privately, not published)

| File | Reason |
|---|---|
| `Ludwig_Keaton_Milestone1.docx` / `.pdf` | Course planning document, not portfolio content. Its project descriptions now live in the project READMEs and on the site. |
| `DSC680_Milestone_1_General_Portfolio_Plan_Final.docx` | An earlier draft of the same plan, superseded by the version above. |

| `sig_translator_qwen05b_full_ft/` (fine-tuned model, about 2 GB) and `checkpoints/` | Too large for GitHub. The notebook recreates the model, and the README explains how to run the app with it. |
| `Ludwig_Keaton_Milestone4_v2_retrain.ipynb` | An unrun retraining plan, not a finished result. |
| Fourth-down `.docx` sources and `Ludwig_Milestone3_SpeakerNotes.txt` | Editable sources of the published PDFs and the narration script. The PDFs and deck notes carry the same content. |
| `app_draft.py` | First draft of the app, superseded by `app.py`. Its consistency check was merged into `sig_engine.py`. |

These files stay in my local course folder and are not uploaded to this repository.

## Added

- `index.html` and `assets/`: the GitHub Pages portfolio site (About, Projects, Contact)
- `README.md`: repository overview, project index, and the reason this portfolio has nine projects
- `projects/prescription-sig-translator/` and `projects/nfl-fourth-down-decisions/`: the two most recent projects, which replaced the in-progress placeholders
- `assets/img/`: figures taken directly from each project's own deliverable (the star image from the published paper, the prototype photo from the wireless power paper, and the model diagnostics chart from the insurance deck). The two interactive projects get live previews on the site instead of screenshots.

## Still to add

- [x] Analysis notebook for the medical insurance project
- [ ] Re-export the liquor slides and notebook PDF without the course code
- [ ] Re-export the fourth-down video from the updated deck (optional; the narration will still mention the course)
- [x] Generative AI project (added as the prescription sig translator)
- [x] Second applied project (added as the NFL fourth-down study)
- [ ] Résumé PDF for the Contact section
