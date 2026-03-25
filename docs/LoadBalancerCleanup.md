# How-To: Remove Cloud Load Balancer & Reduce Costs

Since you have successfully migrated the **Southampton Brochure** and **OpenMover** projects to **Google App Engine**, you can now remove the **External HTTP(S) Load Balancer**. 

App Engine provides **Managed SSL Certificates** and **Custom Domain Mappings** at no extra cost, making the standalone Load Balancer redundant for these simple web applications.

## Why Remove the Load Balancer?
- **Cost Savings**: Cloud Load Balancers have a base charge (usually around $18-$20/month) plus data processing fees. App Engine's built-in domain mapping is **free**.
- **Simplicity**: No need to manage frontend/backend configurations, URL maps, or manual SSL certificate renewals.

---

## Step-by-Step Removal Guide

### Phase 1: Verify App Engine Domain Mappings
Before deleting the Load Balancer, ensure your custom domain is pointed directly to App Engine:
1. Go to **App Engine > Settings > Custom Domains**.
2. Verify that your domain (e.g., `openmover.co.uk`) is listed and the SSL certificate status is **Active**.
3. **Crucial**: Ensure your DNS provider (registrar) is pointing to the Google App Engine A/AAAA/CNAME records, NOT the Load Balancer's static IP address.

### Phase 2: Identify and Delete the Load Balancer
1. In the Google Cloud Console, search for **"Load Balancing"** or go to **Network Services > Load Balancing**.
2. Identify the Load Balancer used for the old bucket-based site.
3. Select the Load Balancer and click **Delete**.
4. **Note**: Deleting the Load Balancer will also prompt you to delete its associated components:
   - **Backend Services** (The links to the old GCS bucket).
   - **URL Maps**.
   - **Target Proxies**.

### Phase 3: Release the Static IP Address (To Save Money!)
Deleting a Load Balancer does NOT automatically release the **Static External IP Address**. Google charges for static IPs that are "unassigned."
1. Go to **VPC Network > IP Addresses**.
2. Look for the Static IP that was assigned to your Load Balancer's frontend.
3. If it is no longer attached to anything, select it and click **Release Static IP**.

### Phase 4: Clean Up SSL Certificates (Optional)
If you uploaded manual SSL certificates for the Load Balancer:
1. Go to **Network Services > Load Balancing > Advanced Menu > Certificates**.
2. Delete any old certificates that were only used by the Load Balancer.

---

## Summary of Architecture Change
| Component | Old Architecture (GCS) | New Architecture (App Engine) |
| :--- | :--- | :--- |
| **Hosting** | Cloud Storage Bucket | App Engine (Node.js) |
| **SSL** | Manual/LB Managed | **App Engine Managed (Free)** |
| **Routing** | Global Load Balancer | **Native GAE Mapping (Free)** |
| **Monthly Cost** | ~$20.00 + Storage | **GAE Free Tier / Low Usage** |

> [!IMPORTANT]
> Do not delete the Load Balancer until you have confirmed your DNS propagation is complete for the new App Engine records (as we verified with `nslookup`).
