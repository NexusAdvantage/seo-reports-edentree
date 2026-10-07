# Eden Tree Pros SEO reports

Report site for Eden Tree Pros. Built and maintained by Nexus.

* Live site: https://seo-reports-edentree.vercel.app
* Login is off for now. To turn it on, set REQUIRE_LOGIN=1 on the Vercel project (password is REPORT_PASSWORD, also in Bitwarden). Never commit a password.
* data/site.json holds the client name, website link, logo and brand colors.
* data/reports.json holds every month, one line per month, newest first. The page draws the report from this file.
* public/reports/YYYY-MM.html is the printable version behind the Download PDF button.
* Monthly update: add the new month line at the top of data/reports.json and add public/reports/YYYY-MM.html. Never delete older months. Pushing to main redeploys the site.
