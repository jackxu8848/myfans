# Deploy MyFans to Your Custom Domain (e.g., myfans.com)

This guide walks you through deploying your MyFans project to a custom domain.

## Overview of Steps

1. **Register a domain name** (e.g., myfans.com)
2. **Choose a hosting provider**
3. **Configure DNS settings**
4. **Upload your files**
5. **Set up SSL/HTTPS**

---

## Step 1: Register Your Domain

### Popular Domain Registrars:

1. **Namecheap** (Recommended) - https://www.namecheap.com
   - Easy to use, good customer support
   - Free privacy protection
   - Prices: ~$8-15/year for .com domains

2. **GoDaddy** - https://www.godaddy.com
   - Largest registrar
   - Often runs promotions
   - Prices: ~$12-20/year for .com domains

3. **Google Domains** - https://domains.google
   - Clean interface
   - Integrated with Google services
   - Prices: ~$12/year for .com domains

4. **Cloudflare** - https://www.cloudflare.com/products/registrar
   - At-cost pricing (no markup)
   - Excellent DNS services
   - Prices: ~$8-9/year for .com domains

### How to Register:

1. Go to your chosen registrar's website
2. Search for your desired domain (e.g., "myfans.com")
3. Add it to cart and complete purchase
4. Complete account setup

**Important:** Consider purchasing domain privacy protection to hide your personal information.

---

## Step 2: Choose a Hosting Provider

You have several options depending on your needs and budget:

### Option A: All-in-One Solution (Domain + Hosting)

#### 1. **Namecheap Shared Hosting** (Recommended for beginners)
- **Price:** ~$2-5/month
- **Includes:** Domain, hosting, SSL certificate, cPanel
- **Easy setup** with one-click installation
- **Website:** https://www.namecheap.com/hosting

#### 2. **GoDaddy Web Hosting**
- **Price:** ~$5-10/month
- **Includes:** Domain, hosting, SSL, website builder
- **Website:** https://www.godaddy.com/hosting

#### 3. **Bluehost**
- **Price:** ~$3-7/month
- **WordPress optimized** (though you don't need WordPress)
- **Includes:** Domain, hosting, SSL
- **Website:** https://www.bluehost.com

### Option B: Use Existing Domain with Modern Hosting

If you already have a domain, use these modern hosting services:

#### 1. **Netlify** (Recommended)
- **Price:** Free tier available, Pro at $19/month
- **Setup:** 
  - Connect your domain in Netlify dashboard
  - Configure DNS records
  - Drag & drop files or connect Git repository
- **Benefits:** Fast CDN, automatic HTTPS, easy deployment
- **Website:** https://www.netlify.com

#### 2. **Vercel**
- **Price:** Free tier available, Pro at $20/month
- **Similar to Netlify**, excellent performance
- **Website:** https://vercel.com

#### 3. **Cloudflare Pages**
- **Price:** Free (generous limits)
- **Connect domain** through Cloudflare
- **Fast and reliable**
- **Website:** https://pages.cloudflare.com

#### 4. **GitHub Pages with Custom Domain**
- **Price:** Free
- **Configure custom domain** in repository settings
- **Website:** https://pages.github.com

### Option C: VPS/Cloud Hosting (For Advanced Users)

If you need more control or plan to add a backend:

#### 1. **DigitalOcean**
- **Price:** $4-12/month
- **Full server control**
- **Website:** https://www.digitalocean.com

#### 2. **Linode**
- **Price:** $5-12/month
- **Similar to DigitalOcean**
- **Website:** https://www.linode.com

#### 3. **AWS Lightsail**
- **Price:** $3.50-12/month
- **AWS infrastructure**
- **Website:** https://aws.amazon.com/lightsail

---

## Step 3: Deploy Using Netlify (Recommended for Static Sites)

Netlify is perfect for MyFans because it's:
- Free tier is generous
- Easy custom domain setup
- Automatic HTTPS
- Fast global CDN
- Easy file upload or Git integration

### Detailed Steps:

#### A. Set up Netlify Account

1. Go to https://www.netlify.com
2. Sign up (free account)
3. You can use GitHub, GitLab, Bitbucket, or email

#### B. Deploy Your Site

**Method 1: Drag & Drop (Easiest)**

1. Log into Netlify dashboard
2. Click "Add new site" → "Deploy manually"
3. Drag your entire `MyFans` folder onto the upload area
4. Wait for deployment (usually 30 seconds)
5. Your site is now live at: `https://random-name-123.netlify.app`

**Method 2: Git Integration (Recommended)**

1. Push your code to GitHub (see GitHub setup below)
2. In Netlify, click "Add new site" → "Import an existing project"
3. Connect to GitHub
4. Select your repository
5. Build settings:
   - Build command: (leave empty - no build needed)
   - Publish directory: `/` (root)
6. Click "Deploy site"

#### C. Connect Your Custom Domain

1. In Netlify dashboard, go to your site
2. Click "Domain settings"
3. Click "Add custom domain"
4. Enter your domain: `myfans.com`
5. Netlify will show you DNS records to configure

#### D. Configure DNS Records

Go to your domain registrar's DNS settings and add:

**For root domain (myfans.com):**
```
Type: A
Name: @
Value: 75.2.60.5

Type: A
Name: @
Value: 99.83.190.102
```

**For www subdomain (www.myfans.com):**
```
Type: CNAME
Name: www
Value: your-site-name.netlify.app
```

(Netlify will show you the exact values to use)

**Wait 5-60 minutes** for DNS to propagate.

#### E. Enable HTTPS

1. Netlify automatically provisions SSL certificate
2. In Domain settings, enable "HTTPS"
3. Optionally, force HTTPS redirect

**Done!** Your site is now live at https://myfans.com

---

## Step 4: Deploy Using Traditional Web Hosting (cPanel)

If you chose shared hosting (Namecheap, GoDaddy, etc.):

### A. Access Your Hosting

1. Log into your hosting account
2. Access cPanel (usually provided in welcome email)

### B. Upload Files via FTP

**Option 1: Using FileZilla (Free FTP Client)**

1. Download FileZilla: https://filezilla-project.org
2. Get FTP credentials from hosting provider (usually in cPanel)
3. Connect to your server:
   - Host: `ftp.yourdomain.com` or server IP
   - Username: (from hosting provider)
   - Password: (from hosting provider)
   - Port: 21
4. Navigate to `public_html` folder (or `www` or `htdocs`)
5. Upload all files from your `MyFans` folder

**Option 2: Using cPanel File Manager**

1. Log into cPanel
2. Click "File Manager"
3. Navigate to `public_html`
4. Click "Upload"
5. Select all files from your `MyFans` folder
6. Wait for upload to complete

### C. Set Default Page

1. In cPanel, go to "Indexes"
2. Set default page to `login.html` OR
3. Rename `login.html` to `index.html` (so it loads automatically)

### D. Enable SSL Certificate

1. In cPanel, find "SSL/TLS Status" or "Let's Encrypt"
2. Install SSL certificate for your domain
3. Force HTTPS redirect (optional but recommended)

---

## Step 5: Configure DNS (If Domain and Hosting are Separate)

If you bought domain from one provider and hosting from another:

### At Your Domain Registrar:

1. Log into your domain account
2. Go to "DNS Management" or "Domain Settings"
3. Update DNS records:

**For shared hosting:**
```
Type: A
Name: @
Value: [Your hosting provider's IP address - they'll provide this]

Type: CNAME
Name: www
Value: yourdomain.com
```

**For Netlify/Vercel:**
```
Type: A
Name: @
Value: 75.2.60.5
Type: A
Name: @
Value: 99.83.190.102
Type: CNAME
Name: www
Value: your-site.netlify.app
```

**Wait 5-60 minutes** for DNS changes to propagate.

---

## Step 6: Update Your Code (If Needed)

### Check File Paths

Make sure all paths in your HTML files are relative:
- ✅ `href="myfans.css"` (correct)
- ❌ `href="/Users/jackxu/MyFans/myfans.css"` (wrong)

All your current paths should be fine as they're already relative.

### Set login.html as Index (Optional)

If you want `myfans.com` to automatically show the login page:

1. Rename `login.html` to `index.html`
2. Update any references to `login.html` in your JavaScript files

OR

3. Keep `login.html` and configure your hosting to set it as the default page

---

## Recommended Setup for MyFans

### Best Option: Netlify + Custom Domain

**Why:**
- ✅ Free hosting (generous free tier)
- ✅ Automatic HTTPS
- ✅ Fast global CDN
- ✅ Easy deployment (drag & drop or Git)
- ✅ Easy custom domain setup
- ✅ No server maintenance

**Cost:**
- Domain: ~$8-15/year
- Netlify: Free (or $19/month for Pro)
- **Total: ~$8-15/year + hosting (free tier)**

### Budget Option: Namecheap Shared Hosting

**Why:**
- ✅ All-in-one (domain + hosting)
- ✅ cPanel included (familiar interface)
- ✅ Free SSL certificate
- ✅ Good for beginners

**Cost:**
- Domain + Hosting: ~$2-5/month (~$24-60/year)
- **Total: ~$24-60/year**

---

## Testing Your Deployment

After deploying:

1. ✅ Visit https://myfans.com (or http:// if SSL not set up yet)
2. ✅ Test registration/login
3. ✅ Test admin mode (adding videos)
4. ✅ Test viewer mode
5. ✅ Test on mobile device
6. ✅ Check browser console for errors (F12)

---

## Troubleshooting

### Domain Not Loading

**Problem:** Domain shows "not configured" or times out

**Solutions:**
- Wait longer (DNS can take up to 48 hours, usually 5-60 minutes)
- Check DNS records are correct
- Clear browser cache
- Try accessing via IP address to test hosting

### SSL Certificate Issues

**Problem:** Browser shows "not secure" warning

**Solutions:**
- Make sure SSL is enabled in hosting panel
- Force HTTPS redirect
- Wait for certificate to provision (can take a few minutes)
- Use Let's Encrypt (free) in cPanel

### Files Not Loading

**Problem:** CSS/JS files don't load

**Solutions:**
- Check file paths are relative (not absolute)
- Verify all files are uploaded
- Check file permissions (should be 644 for files, 755 for folders)
- Clear browser cache

### 404 Errors

**Problem:** Pages return 404

**Solutions:**
- Make sure `login.html` or `index.html` exists
- Check default page settings in hosting
- Verify file names match exactly (case-sensitive on some servers)
- Check .htaccess file if using Apache

---

## Security Considerations

### For Production Use:

1. **Enable HTTPS** (SSL certificate) - Most hosts provide this free
2. **Backup regularly** - Use hosting backup features or manual backups
3. **Keep software updated** - If using hosting panel, keep it updated
4. **Use strong passwords** - For hosting account, domain account, etc.
5. **Enable 2FA** - If available on your accounts

### Future Enhancements:

Since MyFans currently uses localStorage, for a real production site you'll want:

1. **Backend server** (Node.js, PHP, Python, etc.)
2. **Database** (MySQL, PostgreSQL, MongoDB)
3. **Server-side authentication**
4. **Payment gateway** (Stripe, PayPal)
5. **Data encryption**
6. **Regular backups**

---

## Quick Start Checklist

- [ ] Register domain (e.g., myfans.com)
- [ ] Choose hosting provider
- [ ] Set up hosting account
- [ ] Configure DNS records
- [ ] Upload files to hosting
- [ ] Set default page (if needed)
- [ ] Enable SSL/HTTPS
- [ ] Test website functionality
- [ ] Share your site URL!

---

## Need Help?

- **Domain issues:** Contact your domain registrar's support
- **Hosting issues:** Contact your hosting provider's support
- **Netlify:** Excellent documentation at https://docs.netlify.com
- **General web hosting:** Most providers have 24/7 support chat

Good luck with your deployment! 🚀

