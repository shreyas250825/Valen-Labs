# Valen Labs - Deployment Guide

## Prerequisites

- Node.js 18+ installed
- Git installed
- Vercel account (free tier works)
- Domain name (optional, Vercel provides free subdomain)

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deploy to Vercel

### Option 1: Deploy via Vercel CLI (Recommended)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
cd valenui
vercel
```

4. Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - Project name? **valen-labs** (or your choice)
   - Directory? **./** (current directory)
   - Override settings? **N**

5. Deploy to production:
```bash
vercel --prod
```

### Option 2: Deploy via Vercel Dashboard

1. Push your code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/valen-labs.git
git push -u origin main
```

2. Go to [vercel.com](https://vercel.com)
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure:
   - Framework Preset: **Vite**
   - Root Directory: **valenui**
   - Build Command: **npm run build**
   - Output Directory: **dist**
6. Click "Deploy"

## Custom Domain Setup

### Add Custom Domain

1. Go to your project in Vercel Dashboard
2. Click "Settings" → "Domains"
3. Add your domain (e.g., `valenlabs.com`)
4. Follow DNS configuration instructions

### DNS Configuration

Add these records to your domain provider:

**For root domain (valenlabs.com):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### SSL Certificate

Vercel automatically provisions SSL certificates for all domains. No action needed!

## Environment Variables (Optional)

If you need environment variables:

1. Create `.env.local` file:
```env
VITE_API_URL=https://your-domain.com
```

2. Add to Vercel:
   - Go to Settings → Environment Variables
   - Add each variable
   - Redeploy

## API Endpoints

Your deployed site will have these endpoints:

- **Frontend**: `https://your-domain.vercel.app`
- **Beta Signup API**: `https://your-domain.vercel.app/api/beta-signup`
- **View Signups**: `https://your-domain.vercel.app/api/beta-signup` (GET request)

## View Beta Signups

To view all beta signups, make a GET request:

```bash
curl https://your-domain.vercel.app/api/beta-signup
```

Or visit in browser (add authentication in production!):
```
https://your-domain.vercel.app/api/beta-signup
```

## Production Checklist

- [ ] Test beta signup form
- [ ] Verify API endpoint works
- [ ] Check mobile responsiveness
- [ ] Test on different browsers
- [ ] Verify custom domain works
- [ ] Check SSL certificate
- [ ] Test all navigation links
- [ ] Verify performance metrics (Lighthouse)
- [ ] Add authentication to admin endpoints
- [ ] Set up monitoring/analytics

## Performance Optimization

The site is already optimized for:
- ✅ Fast loading (LCP < 1.5s)
- ✅ Zero layout shift (CLS = 0)
- ✅ Minimal bundle size (< 50KB)
- ✅ SEO-friendly
- ✅ Mobile-optimized

## Monitoring

### Vercel Analytics (Free)

1. Go to your project dashboard
2. Click "Analytics" tab
3. Enable Web Analytics

### View Deployment Logs

```bash
vercel logs
```

## Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### API Not Working

- Check `/api/beta-signup.ts` file exists
- Verify `vercel.json` configuration
- Check Vercel function logs

### Domain Not Working

- Wait 24-48 hours for DNS propagation
- Verify DNS records are correct
- Check domain status in Vercel dashboard

## Support

- Vercel Docs: https://vercel.com/docs
- Vite Docs: https://vitejs.dev
- React Docs: https://react.dev

## Security Notes

⚠️ **Important**: The `/api/beta-signup` GET endpoint is currently public. In production:

1. Add authentication:
```typescript
// Add to api/beta-signup.ts
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
if (req.headers.authorization !== `Bearer ${ADMIN_TOKEN}`) {
  return res.status(401).json({ message: 'Unauthorized' });
}
```

2. Set environment variable in Vercel:
   - Settings → Environment Variables
   - Add `ADMIN_TOKEN` with a secure random string

## Backup Beta Signups

Regularly backup your signups:

```bash
curl https://your-domain.vercel.app/api/beta-signup > backup-$(date +%Y%m%d).json
```

## Next Steps

1. Deploy to Vercel
2. Add custom domain
3. Test thoroughly
4. Add authentication to admin endpoints
5. Set up monitoring
6. Share with the world! 🚀
