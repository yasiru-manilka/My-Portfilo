# Yasiru Manilka · Portfolio (React)

My portfolio website and private admin panel, built with **React 18 + Vite**.
Visitors see the website. Only I can sign in at `/admin` to add projects, certificates, experience, achievements, skills and education.

It works with three backends. Pick one:

- **Netlify (recommended, no database account):** Netlify hosts the site, Netlify Functions run the admin login and saving, and Netlify Blobs stores the content and photos. See "Put it online with Netlify".
- **Supabase + Vercel:** Supabase stores the content and photos, Vercel hosts the site.
- **XAMPP on my computer:** PHP + MySQL store the content and photos.

## Folder structure

```
yasiru-portfolio-react/
├── index.html                 website page (Vite entry)
├── admin/index.html           admin panel page (Vite entry, /admin/)
├── package.json               scripts and dependencies
├── package-lock.json
├── vite.config.js             build settings (two pages, relative paths, XAMPP proxy)
├── netlify.toml               Netlify settings (build, functions, backend = netlify)
├── vercel.json                Vercel settings
├── .env.example               optional settings for Supabase / backend
├── .gitignore
│
├── src/
│   ├── main.jsx               starts the website
│   ├── App.jsx                website layout: which sections show, in what order
│   ├── config.js              ← Supabase URL + key, backend choice
│   ├── data/content.js        starting content (my profile, projects, skills…)
│   ├── lib/
│   │   ├── data.js            loads content from Supabase or XAMPP
│   │   ├── apiClient.js       talks to the Netlify backend (/api) or XAMPP (server/api.php)
│   │   ├── sections.js        section titles / notes / show-hide
│   │   └── utils.js           links, lists, dates, asset paths
│   ├── components/            website pieces
│   │   ├── TopBar.jsx  Hero.jsx  About.jsx  Projects.jsx  ProjectDialog.jsx
│   │   ├── Experience.jsx  Achievements.jsx  Certificates.jsx  Skills.jsx
│   │   ├── Education.jsx  Contact.jsx  Footer.jsx  Lightbox.jsx
│   │   └── Section.jsx  Modal.jsx
│   ├── admin/                 admin panel
│   │   ├── main.jsx           starts the admin panel
│   │   ├── AdminApp.jsx       connection check + sign in
│   │   ├── Editor.jsx         menu, profile, sections, lists, add/edit dialog
│   │   ├── fields.jsx         form fields, photo uploads, gallery
│   │   ├── schema.js          which fields each section has
│   │   └── helpers.js         uploads and error messages
│   ├── styles/site.css        website design
│   ├── styles/admin.css       admin panel design
│   └── assets/fonts/          Bricolage Grotesque font
│
├── public/                    copied as-is into the build
│   ├── assets/                portrait, avatar, UCSC + CSSL logos, certificates
│   ├── favicon.svg
│   └── robots.txt
│
├── netlify/                   Netlify backend
│   ├── functions/api.mjs      login, loading, saving, uploads (/api)
│   ├── functions/media.mjs    serves uploaded photos (/media/...)
│   └── shared/portfolio.mjs   storage in Netlify Blobs, starting content
│
├── server/                    XAMPP backend (PHP + MySQL)
│   ├── setup.php              ← open once: database, admin account, starting content
│   ├── api.php                saving, loading, uploads
│   ├── db.php  config.php     database helpers + MySQL login (root, no password)
│   ├── database.sql           tables
│   ├── seed.json              starting content for XAMPP (updated by build:xampp)
│   ├── setup.css  .htaccess
│
├── uploads/                   photos uploaded on XAMPP
├── supabase/schema.sql        database for the online version
├── scripts/copy-xampp.js      adds server/ + uploads/ to the build for XAMPP
```

The download also has a separate **xampp-ready** folder: the built site with the PHP backend, ready to copy into `C:\xampp\htdocs\portfolio` (no Node.js needed).

## What you need

- **Node.js 18 or newer** (https://nodejs.org, choose LTS), only if you want to run or change the React code on your computer. Netlify builds the site for you, so you don't need Node.js just to put it online.
- For the online version: free **Supabase**, **GitHub** and **Vercel** accounts.
- For the local version: **XAMPP**.

Install the packages once, inside the project folder:

```bash
npm install
```

## Run it while editing the code

```bash
npm run dev
```

Open http://localhost:5173 and http://localhost:5173/admin/. The page reloads as you save files.

- With Supabase details in `src/config.js`, the admin panel uses your online database.
- To use your XAMPP database instead, start Apache and MySQL in XAMPP, make sure the PHP backend is at `http://localhost/portfolio/server/` (see "Run it on XAMPP"), create a file named `.env.local` containing `VITE_BACKEND=php`, and restart `npm run dev`. Vite forwards `/server` and `/uploads` to XAMPP.

## Put it online with Netlify (no Supabase)

Everything runs on Netlify's free plan. You need a GitHub account and a Netlify account. `HOSTING-GUIDE-NETLIFY.pdf` has the same steps with more detail.

1. **GitHub:** go to https://github.com/new, name the repository `portfolio-react`, click **Create repository**, then **uploading an existing file**. Drag in everything inside the `yasiru-portfolio-react` folder (not the folder itself, and not `node_modules` or `dist` if you have them). Check that `netlify.toml`, `package.json` and the `netlify`, `src` and `public` folders are at the top level. Click **Commit changes**.
2. **Netlify:** sign up at https://app.netlify.com/signup with **GitHub** (free plan).
3. Click **Add new project → Import an existing project → GitHub**, allow access, and pick `portfolio-react`.
4. The build settings fill in by themselves from `netlify.toml`. Don't change them.
5. Click **Add environment variables** and add:
   - `ADMIN_EMAIL` = `yasirumanilkaidw@gmail.com`
   - `ADMIN_PASSWORD` = a strong password you choose
6. Click **Deploy**. After about 1–2 minutes you get a link like `random-name-123.netlify.app`.
7. Open `your-link/admin`, sign in with that email and password. Your starting content is loaded automatically the first time.
8. Optional: **Project configuration → Change project name** to get `yasirumanilka.netlify.app`.

Good to know:

- Admin changes (projects, certificates, photos, text) appear straight away and don't need a new deploy.
- Every GitHub change triggers a deploy. The free plan has 300 credits a month and each deploy uses 15, so about 20 code updates a month. If credits run out, the site pauses until the next month.
- Photos must be smaller than 5 MB on Netlify.
- To change your password: **Project configuration → Environment variables**, edit `ADMIN_PASSWORD`, then **Deploys → Trigger deploy**.
- Your content lives in Netlify Blobs inside this Netlify project. Deleting the project deletes it.
- Deploy from GitHub, not by dragging a folder onto Netlify, so the functions (login and saving) are included.

## Put it online (Supabase + GitHub + Vercel)

1. **Supabase:** create a free project, open **SQL Editor → New query**, paste everything from `supabase/schema.sql` and click **Run**. Then create your login in **Authentication → Users → Add user** (`yasirumanilkaidw@gmail.com`, tick **Auto Confirm User**) and turn off "Allow new users to sign up".
2. **Connect:** in Supabase **Project Settings → API**, copy the **Project URL** and the **publishable / anon public** key. Paste them into `src/config.js`:
   ```js
   supabaseUrl: env.VITE_SUPABASE_URL || "https://yourprojectid.supabase.co",
   supabaseAnonKey: env.VITE_SUPABASE_ANON_KEY || "sb_publishable_xxxxxxxx",
   ```
   Or leave the file as it is and add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in **Vercel → Settings → Environment Variables**. Never use the secret / service_role key.
3. **GitHub:** create a repository and upload the project **without** the `node_modules` and `dist` folders (or `git push`; `.gitignore` already skips them).
4. **Vercel:** **Add New → Project → Import** your repository. Vercel detects **Vite** automatically (build `npm run build`, output `dist`). Click **Deploy**.
5. Open `https://your-site.vercel.app/admin`, sign in, and click **Load my starting content**.

Every change you push to GitHub rebuilds the site automatically. Content changes made in `/admin` show straight away, no rebuild needed.

## Run it on XAMPP

**Quick way (no Node.js needed):**

1. Copy everything **inside** the `xampp-ready` folder (from the download) into `C:\xampp\htdocs\portfolio\`. If you built it yourself, use the `dist` folder instead.
2. Start **Apache** and **MySQL** in the XAMPP Control Panel.
3. Open http://localhost/portfolio/server/setup.php once. It creates the database, your admin account and your starting content.
4. Website: http://localhost/portfolio/ · Admin: http://localhost/portfolio/admin/

**After you change the React code**, rebuild and copy again:

```bash
npm run build:xampp
```

Then copy everything inside `dist` into `C:\xampp\htdocs\portfolio\` again. Your uploaded photos and database are kept. If you changed `server/config.php` there (for example, a MySQL password), don't replace that file.

When the site is opened through XAMPP (`http://localhost/...`) it uses MySQL automatically; online it uses Supabase. Set `VITE_BACKEND` (or `backend` in `src/config.js`) to `php` or `supabase` to force one.

XAMPP tips:

- **Apache won't start:** port 80 is busy. Apache → Config → httpd.conf, change `Listen 80` to `Listen 8080`, restart, use `http://localhost:8080/portfolio/`.
- **Forgot the admin password:** phpMyAdmin → `portfolio` database → empty `admin_users` → open setup.php again.
- **Sections missing:** open setup.php again, or click **Fill empty sections** in the admin panel.
- **Big uploads fail:** raise `upload_max_filesize` and `post_max_size` in php.ini, restart Apache.

## Scripts

| Command | What it does |
|---|---|
| `npm install` | Installs React, Vite and Supabase (once) |
| `npm run dev` | Runs the site at http://localhost:5173 while you edit |
| `npm run build` | Builds the site into `dist/` (what Vercel runs) |
| `npm run build:xampp` | Builds and adds the PHP backend, ready for `htdocs` |
| `npm run preview` | Serves the built `dist/` to check it |

## Editing content

Use the admin panel for everything you add: projects with photos and links, certificates, experience with logos, achievements with photos, skills, education, section titles, the availability message and your profile.

`src/data/content.js` is only the starting content that gets copied into an empty database.

## Credits

Font: Bricolage Grotesque (SIL Open Font License, `src/assets/fonts/OFL-LICENSE.txt`).
