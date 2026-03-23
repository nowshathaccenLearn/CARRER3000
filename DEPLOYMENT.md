# Vercel + GitHub Actions Deployment Guide

## 🚀 Deployment Steps

### **Step 1: Create Vercel Account & Project**

1. Go to **https://vercel.com**
2. Click **Sign Up** → Choose **GitHub** authentication
3. Authorize Vercel to access your GitHub account
4. Click **Create** → **New Project**
5. Import your GitHub repository: `nowshathaccenLearn/CARRER3000`
6. Click **Import**

---

### **Step 2: Configure Vercel Project Settings**

1. After import, you'll see the **Configure Project** screen
2. **ROOT DIRECTORY**: Leave empty (or set to `.`)
3. **Build Command**: Leave empty (or set to `npm run build || echo 'No build'`)
4. **Output Directory**: `public`
5. Click **Deploy** (first deployment will be a preview)

---

### **Step 3: Set Environment Variables in Vercel**

1. Go to your Vercel dashboard → **Your Project** → **Settings** → **Environment Variables**
2. Add the following variables (copy from your `.env` file):

   | Name | Value |
   |------|-------|
   | `RAZORPAY_KEY_ID` | `rzp_live_SUaPd5cacW7ANb` |
   | `RAZORPAY_KEY_SECRET` | `9sby3khEse8QOsaKRJB8L1Qt` |
   | `RAZORPAY_WEBHOOK_SECRET` | (your webhook secret) |
   | `GMAIL_USER` | `accenlearn@gmail.com` |
   | `GMAIL_PASS` | `lokesh@637` |
   | `ADMIN_EMAILS` | `accenlearn@gmail.com,lokesh@accenlearn.com` |

3. Select **Environments**: Check **Production, Preview, Development**
4. Click **Save**

---

### **Step 4: Get Vercel Secrets for GitHub Actions**

1. Go to **Settings** → **Tokens**
2. Click **Create Token**
3. Name: `VERCEL_TOKEN`
4. Copy the token

---

### **Step 5: Set GitHub Secrets**

1. Go to your GitHub repo: https://github.com/nowshathaccenLearn/CARRER3000
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add:

   | Secret Name | Value |
   |------------|-------|
   | `VERCEL_TOKEN` | (from Step 4) |
   | `VERCEL_ORG_ID` | (find in Vercel Settings → General) |
   | `VERCEL_PROJECT_ID` | (find in Vercel Settings → General) |

---

### **Step 6: Deploy!**

**Automatic Deployment:**
- Push code to `main` branch
- GitHub Actions automatically runs
- Vercel deploys to production

**Manual Deployment:**
```bash
# From your project directory
npm install -g vercel
vercel --prod --token YOUR_VERCEL_TOKEN
```

---

## 📋 Deployment Checklist

- [ ] Vercel account created
- [ ] GitHub repo imported to Vercel
- [ ] Environment variables set in Vercel
- [ ] GitHub Secrets added (VERCEL_TOKEN, ORG_ID, PROJECT_ID)
- [ ] Test deployment triggered
- [ ] Production URL working

---

## ✅ Verify Deployment

After deployment, test your site:

1. Visit your **Vercel URL** (found in Vercel Dashboard)
2. Test Page 1: Enter details
3. Test Page 2: Try payment flow
4. Check logs: **Vercel Dashboard** → **Deployments** → **Logs**

---

## 📞 Troubleshooting

| Issue | Solution |
|-------|----------|
| **Deployment fails** | Check GitHub Actions logs: Repo → Actions tab |
| **Functions not working** | Verify env vars in Vercel Settings |
| **Payment gateway error** | Check RAZORPAY keys are correct |
| **Email not sending** | Verify GMAIL_USER and GMAIL_PASS |

---

## 🔗 Useful Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub Actions Log**: Your repo → Actions tab
- **Vercel Docs**: https://vercel.com/docs
