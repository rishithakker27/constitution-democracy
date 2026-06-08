# Transcript: 16 versions ccpcnc scores fixed

## [USER]

Read the file ccpcnc_scores_fixed.ipynb. What does it do?

---

## [CLAUDE]

This notebook is a data preprocessing pipeline that converts raw constitutional data into structured scores for the QSS 45 project.

**What it does in 4 steps:**

1. **Load** — Reads the raw CCPCNC v5 dataset (Comparative Constitutions Project) and filters to country-years with valid constitution data through 2023.

2. **Recode binary variables** — Fixes a key bug: the raw data only encodes "protection present" (1.0 or 2.0) or "missing/NaN" — it never explicitly codes "absent." The fix treats all missing/NaN values as 0.0 (absence) to create variance across countries, rather than leaving them as NaN.

3. **Compute 14 weighted composite dimensions** — Groups ~70+ constitutional indicator variables into 14 thematic scores using weighted averages. Three dimensions get special treatment:
   - **Amendment rigidity** — ordinal scale (1–5) based on supermajority requirements
   - **Federalism** — count-based score from federal structure variables
   - **Transparency** — ordinal scale based on information access provisions

4. **Export** — Writes `ccpc_axis_scores.csv` with 17,390 country-years × 14 dimension scores (all normalized to 0–1), keyed by `cowcode`, `country`, `systyear`, and `year`.

**Bottom line:** It's the feature engineering step that turns raw constitutional text coding into 14 interpretable, normalized dimensions that feed into the downstream democracy score prediction model.

---

## [USER]

Base directory for this skill: /Users/rishithhakker/Library/Application Support/Claude/local-agent-mode-sessions/skills-plugin/fe88df68-62c4-4712-a335-f9a2b8c2774d/327a2b96-7838-4933-8bf6-efc39e72230d/skills/pdf

# PDF Processing Guide

## Overview

This guide covers essential PDF processing operations using Python libraries and command-line tools. For advanced features, JavaScript libraries, and detailed examples, see REFERENCE.md. If you need to fill out a PDF form, read FORMS.md and follow its instructions.

## Quick Start

```python
from pypdf import PdfReader, PdfWriter

# Read a PDF
reader = PdfReader("document.pdf")
print(f"Pages: {len(reader.pages)}")

# Extract text
text = ""
for page in reader.pages:
    text += page.extract_text()
```

## Python Libraries

### pypdf - Basic Operations

#### Merge PDFs
```python
from pypdf import PdfWriter, PdfReader

writer = PdfWriter()
for pdf_file in ["doc1.pdf", "doc2.pdf", "doc3.pdf"]:
    reader = PdfReader(pdf_file)
    for page in reader.pages:
        writer.add_page(page)

with open("merged.pdf", "wb") as output:
    writer.write(output)
```

#### Split PDF
```python
reader = PdfReader("input.pdf")
for i, page in enumerate(reader.pages):
    writer = PdfWriter()
    writer.add_page(page)
    with open(f"page_{i+1}.pdf", "wb") as output:
        writer.write(output)
```

#### Extract Metadata
```python
reader = PdfReader("document.pdf")
meta = reader.metadata
print(f"Title: {meta.title}")
print(f"Author: {meta.author}")
print(f"Subject: {meta.subject}")
print(f"Creator: {meta.creator}")
```

#### Rotate Pages
```python
reader = PdfReader("input.pdf")
writer = PdfWriter()

page = reader.pages[0]
page.rotate(90)  # Rotate 90 degrees clockwise
writer.add_page(page)

with open("rotated.pdf", "wb") as output:
    writer.write(output)
```

### pdfplumber - Text and Table Extraction

#### Extract Text with Layout
```python
import pdfplumber

with pdfplumber.open("document.pdf") as pdf:
    for page in pdf.pages:
        text = page.extract_text()
        print(text)
```

#### Extract Tables
```python
with pdfplumber.open("document.pdf") as pdf:
    for i, page in enumerate(pdf.pages):
        tables = page.extract_tables()
        for j, table in enumerate(tables):
            print(f"Table {j+1} on page {i+1}:")
            for row in table:
                print(row)
```

#### Advanced Table Extraction
```python
import pandas as pd

with pdfplumber.open("document.pdf") as pdf:
    all_tables = []
    for page in pdf.pages:
        tables = page.extract_tables()
        for table in tables:
            if table:  # Check if table is not empty
                df = pd.DataFrame(table[1:], columns=table[0])
                all_tables.append(df)

# Combine all tables
if all_tables:
    combined_df = pd.concat(all_tables, ignore_index=True)
    combined_df.to_excel("extracted_tables.xlsx", index=False)
```

### reportlab - Create PDFs

#### Basic PDF Creation
```python
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

c = canvas.Canvas("hello.pdf", pagesize=letter)
width, height = letter

# Add text
c.drawString(100, height - 100, "Hello World!")
c.drawString(100, height - 120, "This is a PDF created with reportlab")

# Add a line
c.line(100, height - 140, 400, height - 140)

# Save
c.save()
```

#### Create PDF with Multiple Pages
```python
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet

doc = SimpleDocTemplate("report.pdf", pagesize=letter)
styles = getSampleStyleSheet()
story = []

# Add content
title = Paragraph("Report Title", styles['Title'])
story.append(title)
story.append(Spacer(1, 12))

body = Paragraph("This is the body of the report. " * 20, styles['Normal'])
story.append(body)
story.append(PageBreak())

# Page 2
story.append(Paragraph("Page 2", styles['Heading1']))
story.append(Paragraph("Content for page 2", styles['Normal']))

# Build PDF
doc.build(story)
```

#### Subscripts and Superscripts

**IMPORTANT**: Never use Unicode subscript/superscript characters (₀₁₂₃₄₅₆₇₈₉, ⁰¹²³⁴⁵⁶⁷⁸⁹) in ReportLab PDFs. The built-in fonts do not include these glyphs, causing them to render as solid black boxes.

Instead, use ReportLab's XML markup tags in Paragraph objects:
```python
from reportlab.platypus import Paragraph
from reportlab.lib.styles import getSampleStyleSheet

styles = getSampleStyleSheet()

# Subscripts: use <sub> tag
chemical = Paragraph("H<sub>2</sub>O", styles['Normal'])

# Superscripts: use <super> tag
squared = Paragraph("x<super>2</super> + y<super>2</super>", styles['Normal'])
```

For canvas-drawn text (not Paragraph objects), manually adjust font the size and position rather than using Unicode subscripts/superscripts.

## Command-Line Tools

### pdftotext (poppler-utils)
```bash
# Extract text
pdftotext input.pdf output.txt

# Extract text preserving layout
pdftotext -layout input.pdf output.txt

# Extract specific pages
pdftotext -f 1 -l 5 input.pdf output.txt  # Pages 1-5
```

### qpdf
```bash
# Merge PDFs
qpdf --empty --pages file1.pdf file2.pdf -- merged.pdf

# Split pages
qpdf input.pdf --pages . 1-5 -- pages1-5.pdf
qpdf input.pdf --pages . 6-10 -- pages6-10.pdf

# Rotate pages
qpdf input.pdf output.pdf --rotate=+90:1  # Rotate page 1 by 90 degrees

# Remove password
qpdf --password=mypassword --decrypt encrypted.pdf decrypted.pdf
```

### pdftk (if available)
```bash
# Merge
pdftk file1.pdf file2.pdf cat output merged.pdf

# Split
pdftk input.pdf burst

# Rotate
pdftk input.pdf rotate 1east output rotated.pdf
```

## Common Tasks

### Extract Text from Scanned PDFs
```python
# Requires: pip install pytesseract pdf2image
import pytesseract
from pdf2image import convert_from_path

# Convert PDF to images
images = convert_from_path('scanned.pdf')

# OCR each page
text = ""
for i, image in enumerate(images):
    text += f"Page {i+1}:\n"
    text += pytesseract.image_to_string(image)
    text += "\n\n"

print(text)
```

### Add Watermark
```python
from pypdf import PdfReader, PdfWriter

# Create watermark (or load existing)
watermark = PdfReader("watermark.pdf").pages[0]

# Apply to all pages
reader = PdfReader("document.pdf")
writer = PdfWriter()

for page in reader.pages:
    page.merge_page(watermark)
    writer.add_page(page)

with open("watermarked.pdf", "wb") as output:
    writer.write(output)
```

### Extract Images
```bash
# Using pdfimages (poppler-utils)
pdfimages -j input.pdf output_prefix

# This extracts all images as output_prefix-000.jpg, output_prefix-001.jpg, etc.
```

### Password Protection
```python
from pypdf import PdfReader, PdfWriter

reader = PdfReader("input.pdf")
writer = PdfWriter()

for page in reader.pages:
    writer.add_page(page)

# Add password
writer.encrypt("userpassword", "ownerpassword")

with open("encrypted.pdf", "wb") as output:
    writer.write(output)
```

## Quick Reference

| Task | Best Tool | Command/Code |
|------|-----------|--------------|
| Merge PDFs | pypdf | `writer.add_page(page)` |
| Split PDFs | pypdf | One page per file |
| Extract text | pdfplumber | `page.extract_text()` |
| Extract tables | pdfplumber | `page.extract_tables()` |
| Create PDFs | reportlab | Canvas or Platypus |
| Command line merge | qpdf | `qpdf --empty --pages ...` |
| OCR scanned PDFs | pytesseract | Convert to image first |
| Fill PDF forms | pdf-lib or pypdf (see FORMS.md) | See FORMS.md |

## Next Steps

- For advanced pypdfium2 usage, see REFERENCE.md
- For JavaScript libraries (pdf-lib), see REFERENCE.md
- If you need to fill out a PDF form, follow the instructions in FORMS.md
- For troubleshooting guides, see REFERENCE.md


ARGUMENTS: Read the codebook at /Users/rishithhakker/Downloads/Academic Work/QSS & Data Science/QSS_45_Project/clean_versions/ccpcnc/codebook_v5.pdf — I need to understand: (1) the overall structure of the codebook, (2) how variables are coded (what values mean what), (3) the list of variable names and what constitutional features they capture, (4) any scoring or weighting guidance. Please extract as much detail as possible about variable names, their scales, and their meanings.

---

## [CLAUDE]

The notebook is valid. Here's a summary of what was built:

---

**[`ccpcnc_llm_scores.ipynb`](ccpcnc_llm_scores.ipynb)** — 16 cells, 3 steps:

**Step 1** — Extracts the full codebook PDF (~59K tokens) into a text string, and collects the dataset's column names.

**Step 2** — Calls `claude-opus-4-7` once with:
- System prompt: full codebook text (prompt-cached, so subsequent runs are cheap)
- User prompt: the 14 dimension names + all dataset column names, asking for a JSON typology

The returned JSON (`ccpc_typology.json`) has this structure per variable:
```json
"torture": {
  "dimensions": {"civil_liberties": 2.0, "rule_of_law_due_process": 1.5},
  "value_map": {"1": 1.0, "2": 0.67, "3": 0.33, "4": 0.0}
}
```
This handles ordinal scales properly — e.g. TORTURE gets 4 gradations rather than being binary-collapsed. Once the JSON is saved, re-running Step 2 is a no-op.

**Step 3** — Applies the typology deterministically: for each variable, maps raw codes → [0,1] using the LLM-specified value_map, then computes each dimension as a weighted average. Outputs `ccpc_axis_scores_llm.csv`. A final cell computes Pearson correlation with the original hardcoded scores as a sanity check.

**To run:** You need an `ANTHROPIC_API_KEY` environment variable set. The API call uses ~65K input tokens (cached after first call) and ~10K output tokens.

---

## [USER]

how / where do I run this?

---

## [CLAUDE]

You have Jupyter installed via Anaconda. Two things to do first:

---

**1. Get an Anthropic API key** (if you don't have one)

Go to [console.anthropic.com](https://console.anthropic.com) → API Keys → Create Key. Copy it.

---

**2. Set the API key, then open the notebook**

Open Terminal and run these two commands:

```bash
export ANTHROPIC_API_KEY="sk-ant-..."   # paste your actual key here

jupyter lab "/Users/rishithhakker/Downloads/Academic Work/QSS & Data Science/QSS_45_Project/clean_versions/ccpcnc_llm_scores.ipynb"
```

JupyterLab will open in your browser with the notebook already loaded.

---

**3. Run the notebook**

- **Run All**: `Kernel` menu → `Restart Kernel and Run All Cells`
- Or run cells one at a time with **Shift+Enter**

The API call in Step 2 (Cell 6) takes ~30–60 seconds. After it finishes, `ccpc_typology.json` is saved — future runs skip the API call entirely.

---

**Note on the API key persistence:** The `export` command only lasts for that Terminal session. If you want it permanently, add the line to your `~/.zshrc`:

```bash
echo 'export ANTHROPIC_API_KEY="sk-ant-..."' >> ~/.zshrc
```

---

## [USER]

wait, do I not have a notebook for this?

---

## [USER]

[Request interrupted by user]

---

## [USER]

create a notebook where I can use the API to create a typology

---

## [CLAUDE]

[`generate_typology.ipynb`](generate_typology.ipynb) — 8 cells, does one thing:

1. Reads the codebook PDF
2. Calls Claude API
3. Saves `ccpc_typology.json`

To run it, open Terminal and:

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
jupyter lab "/Users/rishithhakker/Downloads/Academic Work/QSS & Data Science/QSS_45_Project/clean_versions/generate_typology.ipynb"
```

Then **Shift+Enter** through each cell, or **Kernel → Restart and Run All**. The API call (Cell 5) takes ~30–60 seconds and produces the typology JSON. After that, the separate scoring notebook (`ccpcnc_llm_scores.ipynb`) can load that JSON and compute scores across all country-years.

---

## [USER]

wait this is great, but, read archive GPT_Final_Try.ipynb. That's the API and LLM method I want to use; modify the code to use that API and LLM

---

## [CLAUDE]

Got it. They're using **Dartmouth Cloud** (`langchain_dartmouth`, model `openai.gpt-oss-120b`) — not Anthropic. Let me update `generate_typology.ipynb` to use that exact setup.

---

## [CLAUDE]

Done. The changes from the archive notebook:

| | Archive (`GPT_Final_Try.ipynb`) | Updated (`generate_typology.ipynb`) |
|---|---|---|
| **Client** | `ChatDartmouthCloud` | Same |
| **Model** | `openai.gpt-oss-120b` | Same |
| **API key** | `sk-090de58...` | Same |
| **Invoke style** | `llm.invoke(prompt, max_tokens=...)` | Same |
| **Task** | Score full constitution text | Generate typology from codebook |

To run it, just open Terminal and:
```bash
jupyter lab "/Users/rishithhakker/Downloads/Academic Work/QSS & Data Science/QSS_45_Project/clean_versions/generate_typology.ipynb"
```
No API key export needed — it's hardcoded in Cell 2 just like the archive notebook. Run all cells top to bottom; the LLM call is Cell 6.

---

## [USER]

give me this as a new file GPT_typeology notebook

---

## [CLAUDE]

`GPT_typology.ipynb` is now in your `clean_versions` folder — identical content to `generate_typology.ipynb`, just under the new name.

---

## [USER]

Great, I have the typology, what file do I run next to generate the scores?

---

## [CLAUDE]

**`ccpcnc_llm_scores.ipynb`** — it picks up right where `GPT_typology.ipynb` left off. It loads `ccpc_typology.json` and applies it to all 17K country-years, then exports `ccpc_axis_scores_llm.csv`.

You can skip straight to **Step 3** (Cell 9 onwards) since the typology JSON already exists — it won't make any API calls. Just run from Cell 9 to the end.

---

## [USER]

ran it, what do I run next?

---

## [CLAUDE]

**`vdem_ccpc_clean_run.ipynb`** is next — it merges your CCPC scores with V-Dem data and runs the prediction model.

One heads-up: it reads `../ccpc_axis_scores.csv` (the original hardcoded scores). If you want it to use your new LLM-generated scores instead, swap the path in the first `read_csv` cell from:

```python
pd.read_csv('../ccpc_axis_scores.csv')
```
to:
```python
pd.read_csv('../ccpc_axis_scores_llm.csv')
```

Then run all cells.

---

## [USER]

I can't find ccpc_axis_scores_llm.csv

---

## [CLAUDE]

It exists — it's one folder up from `clean_versions`, at:

```
QSS_45_Project/ccpc_axis_scores_llm.csv
```

You were probably looking inside `clean_versions`. Go up one level to the `QSS_45_Project` folder and you'll find it there alongside `ccpc_axis_scores.csv`.

---

## [USER]

how does this merge work? If a country does not have a constitution / has all 0s at a particular time, does it also merge?
# Merge on COWcode × year
merged = vdem.merge(
    ccpc[['cowcode', 'year'] + FEATURES],
    left_on=['COWcode', 'year'],
    right_on=['cowcode', 'year'],
    how='inner'
).drop(columns=['cowcode'])

print(f'Merged: {len(merged):,} observations, {merged["country_name"].nunique()} countries')
print(f'Years: {merged["year"].min():.0f} – {merged["year"].max():.0f}')

---

## [CLAUDE]

It's an **inner join on `COWcode × year`**, so the behavior depends on what's in each dataset:

**A country-year is kept only if it appears in BOTH V-Dem and CCPC.**

Here's what that means for each case:

**No constitution / not in CCPC at all** → **dropped.**
The CCPC scores file was already filtered to rows where `systyear` is non-null (active constitutional system). If a country had no constitution in force for a given year, it has no row in the CCPC file, so the inner join silently drops it from the merged dataset.

**Constitution exists but scores are all zeros** → **kept.**
The join only looks at whether the key (`COWcode × year`) matches — not at the values. A country with a very sparse constitution that scores 0 on everything will still appear in the merged data and be passed to the model.

**Practical implication for your model:**
The inner join means you're implicitly training and evaluating only on country-years that have *both* V-Dem coverage and an active constitutional system. That's probably what you want — but it's worth knowing the sample is not the full V-Dem universe. You can check the dropout like this:

```python
print(f'V-Dem rows:  {len(vdem):,}')
print(f'CCPC rows:   {len(ccpc):,}')
print(f'Merged rows: {len(merged):,}')
print(f'Dropped from V-Dem: {len(vdem) - len(merged):,}')
```

If you wanted to keep V-Dem rows that have no CCPC match (filling constitutional features with 0 or NaN), you'd switch to `how='left'` — but that would feed the model zero-vectors for countries with no constitution, which could distort predictions.

---

## [USER]

why do so many countries have a 0 for every score?

---

## [CLAUDE]

Clean diagnosis. Every single all-zero row has `coding_available=0` — the CCP team has identified the constitution exists but **hasn't coded it yet**. All variables are NaN, which the scoring code converts to 0.0. There's no real data there.

The fix is a one-line filter in `ccpcnc_llm_scores.ipynb` Cell 10. Change:

```python
d = ccpc_raw[
    (ccpc_raw['year'] <= 2023) &
    ccpc_raw['systyear'].notna()
].sort_values(['cowcode', 'year']).copy()
```

to:

```python
d = ccpc_raw[
    (ccpc_raw['year'] <= 2023) &
    ccpc_raw['systyear'].notna() &
    (ccpc_raw['coding_available'] == 1)   # ← drop uncoded constitutions
].sort_values(['cowcode', 'year']).copy()
```

That removes all 2,633 ghost rows (15.1% of the dataset) and re-running from Cell 10 onward will give you clean scores. The merged dataset downstream will also shrink by that amount, but every remaining row has real data behind it.

---

## [USER]

why do the ghost rows exist in the first place?

---

## [USER]

wait, so in my code that generates the 10 dimensions, first can we check if the constitution exists and then create the score?

---

## [CLAUDE]

Let me look at the structure of `constitutions_full.json` first to see what fields are available.

---

## [USER]

[Request interrupted by user]

---

## [USER]

no no no

---

## [CLAUDE]

Sorry! You just want a simple check added to `process_item` in `GPT_Final_Try.ipynb`. Here's the modification:

```python
def process_item(item):
    cid = item["id"]
    text = item.get("text_clean", "")

    # Skip if no constitution text
    if not text or not str(text).strip():
        print(f"⚠ Skipped (no text): {cid}")
        return None

    print(f"Processing: {cid}")

    raw = None

    try:
        raw = label_text_json(text)
        parsed = json.loads(raw)
        parsed["constitution_id"] = cid
        print(f"✔ Added: {cid}")
        return parsed

    except Exception as e:
        print(f"Failed on {cid}: {e}")
        print(raw)
        return None
```

The only addition is the 3-line check before the LLM call — if `text_clean` is missing or blank, it prints a warning and returns `None` (which the existing code already handles by skipping `None` results). Everything else stays the same.

---

