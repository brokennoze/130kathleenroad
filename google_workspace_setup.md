# Setting Up Custom Domain Email with Google

To get professional email addresses (e.g., `info@130kathleenroad.co.uk`) using the Google ecosystem, you need **Google Workspace** (formerly G Suite), rather than just a Google Cloud Platform (GCP) account.

> [!NOTE]
> **Google Cloud (GCP)** is for hosting applications and data.
> **Google Workspace** is for business tools like Gmail, Driver, and Meet on your own domain.

## Step-by-Step Setup Guide

### 1. Sign Up for Google Workspace
1. Go to [workspace.google.com](https://workspace.google.com/) and click "Get Started".
2. Follow the prompts to enter your business name and select "I have a domain name" when asked.
3. Enter your existing domain name.

### 2. Verify Domain Ownership
Google needs to confirm you own the domain.
1. Google will provide a **TXT record** (a string starting with `google-site-verification=...`).
2. Log in to your external domain registrar (e.g., GoDaddy, Namecheap, 123-Reg).
3. Go to the **DNS Management** section.
4. Add a new **TXT** record:
   - **Host/Name**: `@` (or leave blank)
   - **Value**: The verification string from Google.
5. Back in the Google Workspace setup, click "Verify".

### 3. Configure MX Records (Crucial for receiving email)
This tells the internet to send your domain's mail to Google's servers.
1. In your registrar's DNS settings, delete any existing MX records.
2. Add the following Google MX records:

| Priority | Host | Points To |
|----------|------|-----------|
| 1        | @    | ASPMX.L.GOOGLE.COM. |
| 5        | @    | ALT1.ASPMX.L.GOOGLE.COM. |
| 5        | @    | ALT2.ASPMX.L.GOOGLE.COM. |
| 10       | @    | ALT3.ASPMX.L.GOOGLE.COM. |
| 10       | @    | ALT4.ASPMX.L.GOOGLE.COM. |

### 4. Improve Deliverability (SPF & DKIM)
To ensure your emails don't go to spam, add these records:

- **SPF Record**: Add/Update a TXT record for `@`:
  - **Value**: `v=spf1 include:_spf.google.com ~all`
- **DKIM Record**: 
  1. In Google Admin Console, go to **Apps > Google Workspace > Gmail > Authenticate email**.
  2. Generate a new record and add it to your registrar's DNS.

### 5. Create Email Addresses
1. Go to the [Google Admin Console](https://admin.google.com/).
2. Navigate to **Users > Add new user**.
3. Create your desired addresses (e.g., `simon@yourdomain.com`).

---

## Integration with your Website Backend

Once your Google Workspace is set up:
1. You can use your new email as the `EMAIL_USER` in your `server.js`.
2. Create an **App Password** in your Google Account security settings to allow the Node.js app to send emails securely without sharing your main password.

> [!TIP]
> **Cloud DNS Benefit**: If you prefer managing all DNS records within Google, you can migrate your domain's Name Servers to **Google Cloud DNS**. This keeps everything in one dashboard (GCP), but your email hosting will still be handled by Workspace.
