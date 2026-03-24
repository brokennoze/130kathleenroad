# How to get a Custom Domain for your Google Cloud Website

To get a professional URL like `www.130kathleenroad.co.uk` instead of the long `storage.googleapis.com` link, you have to follow a specific process. 

**Note: This cannot be fully automated by a script because it involves buying a domain and changing settings on a third-party website.**

However, once you complete the manual steps, you can use the script provided (`setup_custom_domain.ps1`) to handle the Google Cloud portion.

---

### Step 1: Buy a Domain Name
First, you need to purchase your desired domain name from a registrar (like GoDaddy, Namecheap, Google Domains, 123 Reg, etc.).

### Step 2: Verify Domain Ownership with Google
Google Cloud requires you to prove you own the domain before you can use it.
1. Go to [Google Webmaster Central](https://www.google.com/webmasters/verification/home).
2. Log in with the **exact same Google Account** you use for Google Cloud.
3. Click **Add a Property** and enter your domain (e.g., `www.130kathleenroad.co.uk`).
4. Follow the instructions to verify ownership. Usually, this involves copying a `TXT` record they provide and pasting it into the DNS settings of wherever you bought your domain.

### Step 3: Run the Cloud Script
In Google Cloud Storage, **your bucket name MUST exactly match your domain name** to work. 

Since you cannot rename an existing bucket, I have created a new script called `setup_custom_domain.ps1`. 

Run it in your terminal like this:
```powershell
.\setup_custom_domain.ps1 -DomainName "www.130kathleenroad.co.uk"
```
*(This script will create a new bucket named exactly after your domain, make it public, and upload your files to it. Note: It will fail if you haven't completed Step 2!)*

### Step 4: Run the SSL/HTTPS Setup Script
Google Cloud Storage natively only supports `http://` for custom domains. To get a secure `https://` padlock, we must put a Google Cloud Load Balancer with an SSL Certificate in front of it.

Run the new HTTPS script in your terminal:
```powershell
.\setup_https_loadbalancer.ps1 -DomainName "www.130kathleenroad.co.uk"
```
*This script will reserve a global IP address, create an SSL certificate, and link everything to your bucket. At the end, it will print out a green `Reserved IP address`.*

### Step 5: Point Your Domain to Google
Finally, you need to tell your domain to point to that new secure IP address.
1. Go back to where you bought your domain (GoDaddy, Namecheap, etc.).
2. Open the **DNS Settings / DNS Management**.
3. Create an **A record**:
   - **Name/Host:** `www`
   - **Value/Points To:** The green IP Address that the script outputted
   - **TTL:** 1 Hour (or default)
4. Save the changes.

### Step 6: Wait for SSL Provisioning
DNS changes can take up to 24 hours to propagate. Once the DNS propagates, Google Cloud will automatically provision and attach your SSL certificate. Note: It can take 30-60 minutes *after* DNS propagation for the SSL certificate to switch from `PROVISIONING` to `ACTIVE`.

After that, your site will securely load at `https://www.130kathleenroad.co.uk`!
