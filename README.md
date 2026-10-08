# Eden Tree Pros SEO reports

Report site for Eden Tree Pros. Built and maintained by Nexus.

* Live site: https://seo-reports-edentree.vercel.app
* Login is off for now. To turn it on, set REQUIRE_LOGIN=1 on the Vercel project (password is REPORT_PASSWORD, also in Bitwarden). Never commit a password.
* data/site.json: client name, website link, logo and brand colors.
* data/report.json: every month of numbers (one object per month in "months"), the services list, and Google post and listing data. The page draws everything from this file, lets the client pick any month and compare it to any other month, and prints to PDF.
* Monthly update: add the new month object to the end of "months" in data/report.json. Never delete older months. Pushing to main redeploys the site.
* Months with no data for a number use null, and the page shows "No data" for that month instead of a zero.
