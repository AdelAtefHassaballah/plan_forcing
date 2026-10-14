# Let's Make a Decision! 🎯

An interactive, CSV-driven multiple-choice quiz web application with **escaping options**. Built with React, TypeScript, Vite, Tailwind CSS v4, and Papa Parse, designed specifically for zero-config hosting on **GitHub Pages**.

Whenever a user moves their mouse cursor (on desktop) or approaches with their finger (on mobile) toward an incorrect answer, that button dynamically flees across the screen while displaying funny reaction messages! Only the intended correct answer remains stationary and selectable.

---

## 🌟 Key Features

1. **Two Distinct Views**:
   - **Public Questionnaire**: A clean, distraction-free questionnaire for recipients. Does **not** show administrative controls, correct-answer columns, or answer keys.
   - **Admin Dashboard**: A browser-based administrative center with CSV drag-and-drop upload, validation reporting, interactive question table editor, and sample template downloading.
2. **Escaping Answer Mechanic**:
   - **Desktop Proximity Engine**: Detects the mouse pointer approaching an incorrect button within a safety radius and smoothly glides it away before it can be clicked.
   - **Mobile Touch Interception**: Uses Pointer Events (`pointerdown`, `pointermove`, `touchstart`) to detect fingers approaching or touching wrong options, immediately dodging before any tap can register.
   - **Anti-Collision Guard**: Positions are strictly clamped inside the container boundaries and maintain a safety clearance away from the correct button so choices never overlap or clip.
3. **CSV-Driven Architecture**:
   - Parse and validate CSV files directly in the browser via **Papa Parse**.
   - Fully supports **UTF-8 text, including Arabic**, accents, and commas inside quoted text.
4. **Static Hosting & GitHub Pages Ready**:
   - Configured with relative base asset paths (`base: './'`).
   - Hash-based navigation (`#admin`, `#preview`, `#quiz`) for 100% compatibility with GitHub Pages without server rewrite requirements.
   - Ready-to-use GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically builds and deploys on push to `main`.

---

## 📋 CSV Format Specification

The application uses standard CSV formatting:

```csv
question_id,question,option_a,option_b,option_c,option_d,correct_option
1,What should we do?,Go for coffee,Go for a walk,Watch a movie,Stay home,A
2,When should we do it?,Tomorrow,This weekend,Next month,Whenever,B
3,What time works best?,Morning,Afternoon,Evening,Night,C
4,Are you ready to decide?,Yes,No,Maybe,Ask me later,A
5,أين نلتقي اليوم؟,في المقهى,في الحديقة,في المركز التجاري,,A
```

### Formatting Rules:
- **`question_id`**: Unique identifier for the question (e.g. `1`, `2`, `q3`).
- **`question`**: The question text (UTF-8, Arabic, and international text supported).
- **`option_a` through `option_d`** (or more): The choice texts. Fewer than 4 choices are allowed by leaving trailing option columns empty.
- **`correct_option`**: The target letter (`A`, `B`, `C`, etc.) indicating which option cannot run away.
- **Validation**:
  - The correct option letter must point to a non-empty choice.
  - Each question must contain at least 2 non-empty options.
  - The dashboard provides line-by-line validation reports before applying any import.

---

## 📊 Google Sheets Live Auto-Sync (Real-Time Updates)

Want to update questions anytime from your phone or laptop in Google Sheets without touching GitHub, terminal, or uploading files?

1. **Create a Google Sheet**:
   In Row 1, set the exact column headers:
   `question_id, question, option_a, option_b, option_c, option_d, correct_option`
2. **Make it viewable**:
   Click **Share** in the top right of your Google Sheet, and set General Access to **"Anyone with the link can view"** (or click **File > Share > Publish to web** and choose **CSV**).
3. **Connect in Admin Dashboard**:
   Open your website's **[Admin Dashboard](https://adelatefhassaballah.github.io/plan_forcing/#admin)**, paste your Google Sheet URL into the **Google Sheets Live Auto-Sync** card, and click **Connect & Sync Live**.
4. **Done!**
   Every time you edit or add questions in Google Sheets, your website automatically fetches and displays the updated questions in real-time!

---


## 🚀 How to Run Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173/](http://localhost:5173/) in your browser.

3. **Build the production bundle**:
   ```bash
   npm run build
   ```

4. **Run code quality linting**:
   ```bash
   npm run lint
   ```

---

## 🌐 Deploying to GitHub Pages

### Initial Setup (One-time)

1. Create a new repository on GitHub.
2. Initialize and push your project code:
   ```bash
   git add .
   git commit -m "Deploy decision quiz"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```
3. In your GitHub repository:
   - Go to **Settings** > **Pages**.
   - Under **Build and deployment** > **Source**, select **GitHub Actions**.
4. The workflow in [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml) will trigger automatically, build the project, and publish your site at:
   ```
   https://<your-username>.github.io/<your-repo-name>/
   ```

---

## 🔄 How to Update the Questionnaire After Deployment

Because GitHub Pages is a static host without a central server database:

1. Open your hosted website's Admin Dashboard by clicking **Dashboard** in the header or appending `#admin` to the URL.
2. Upload your new CSV file or edit questions directly in the table.
3. Click **"Export questions.csv"** to download the finalized CSV file.
4. Replace [`public/questions.csv`](./public/questions.csv) in your repository with this downloaded file.
5. Commit and push the updated file:
   ```bash
   git add public/questions.csv
   git commit -m "Update questionnaire questions"
   git push origin main
   ```
6. GitHub Actions will rebuild and deploy the new questionnaire within 60 seconds. All visitors accessing the public link will now see your updated questions!

---

## 🔒 Security & Client-Side Answer Handling

- The public view **never displays** the correct-answer field, administrative controls, or answer keys in rendered cards or page elements.
- **Important Technical Reality**: Because this application runs entirely client-side on static hosting without a server authentication layer, visitors with technical knowledge can inspect the downloaded CSV file or browser network traffic to identify correct options. Static client-side quiz implementations cannot guarantee cryptographic secrecy of answer keys against source inspection.

---

## 📱 Navigation Links

- **Public Questionnaire**: `https://<your-username>.github.io/<your-repo-name>/#quiz` (or root URL)
- **Admin Dashboard**: `https://<your-username>.github.io/<your-repo-name>/#admin`
- **Draft Preview**: `https://<your-username>.github.io/<your-repo-name>/#preview`
