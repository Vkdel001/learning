# Brevo Email Setup Guide

**Goal:** Get real OTP emails sent to users

---

## 🎯 Current Status

- ✅ Brevo API key is configured
- ✅ Email service code is working
- ❌ Sender email needs to be verified in Brevo

---

## 📧 Step-by-Step Setup

### Step 1: Login to Brevo
Go to: https://app.brevo.com/

### Step 2: Verify a Sender Email
1. Go to **Senders** page: https://app.brevo.com/senders
2. Click **"Add a sender"**
3. Enter your email address (e.g., `noreply@yourdomain.com` or your personal email)
4. Brevo will send a verification email
5. Click the verification link in that email
6. Wait for approval (usually instant)

### Step 3: Update .env File
Once your sender email is verified, update your `.env`:

```env
BREVO_SENDER_EMAIL="your-verified-email@domain.com"
BREVO_SENDER_NAME="AI Tutor Mauritius"
```

### Step 4: Restart Dev Server
```bash
# Stop the server (Ctrl+C)
# Start again
npm run dev
```

### Step 5: Test Email Sending
```bash
# Edit the test script first
# Change testEmail to YOUR email address
npx ts-node scripts/test-email-sending.ts
```

---

## 🔍 Common Issues

### Issue 1: "Sender not verified"
**Solution:** 
- Go to https://app.brevo.com/senders
- Verify your sender email
- Wait for approval

### Issue 2: "Invalid API key"
**Solution:**
- Go to https://app.brevo.com/settings/keys/api
- Generate a new API key
- Update `BREVO_API_KEY` in `.env`

### Issue 3: "Daily limit reached"
**Solution:**
- Free plan: 300 emails/day
- Wait 24 hours or upgrade plan
- Check usage: https://app.brevo.com/statistics

### Issue 4: Emails go to spam
**Solution:**
- Use a real domain email (not Gmail/Yahoo)
- Set up SPF/DKIM records
- Or use Brevo's shared domain

---

## 🚀 Quick Test

### Option 1: Use Your Personal Email
Easiest for testing:

1. Verify your Gmail/Outlook email in Brevo
2. Set as sender in `.env`
3. Send test OTP to yourself

**Pros:** Quick setup  
**Cons:** Looks unprofessional, may go to spam

### Option 2: Use a Custom Domain
Best for production:

1. Buy a domain (e.g., `aitutor.mu`)
2. Add domain to Brevo
3. Set up DNS records (SPF, DKIM)
4. Use `noreply@aitutor.mu` as sender

**Pros:** Professional, better deliverability  
**Cons:** Requires domain purchase

### Option 3: Use Brevo's Shared Domain
Middle ground:

1. Brevo provides a shared sending domain
2. No DNS setup needed
3. Decent deliverability

**Pros:** No domain needed, good deliverability  
**Cons:** Less control

---

## 📝 Recommended Setup for Testing

For now, use your personal email:

```env
BREVO_SENDER_EMAIL="your-email@gmail.com"
BREVO_SENDER_NAME="AI Tutor Test"
```

Steps:
1. Go to https://app.brevo.com/senders
2. Add your Gmail/personal email
3. Verify it (check your inbox)
4. Update `.env` with that email
5. Restart server
6. Try registering/logging in
7. Check your email for OTP

---

## 🎓 For Production

When launching to real users:

1. **Get a domain:** `aitutor.mu` or similar
2. **Set up email:** `noreply@aitutor.mu`
3. **Configure DNS:** SPF, DKIM, DMARC
4. **Verify in Brevo**
5. **Test thoroughly**
6. **Monitor deliverability**

---

## 💡 Alternative: Console-Only for Now

If you don't want to set up email right now:

The system already logs OTP to console. You can:
1. Keep using console OTPs for development
2. Set up real email later before launch
3. Users won't need it until production

**Current behavior:**
- OTP always logged to console (for debugging)
- OTP also sent via email (if Brevo configured)
- Both work simultaneously

---

## 🧪 Testing Checklist

- [ ] Brevo account created
- [ ] API key added to `.env`
- [ ] Sender email verified in Brevo
- [ ] Sender email added to `.env`
- [ ] Dev server restarted
- [ ] Test email sent successfully
- [ ] OTP received in inbox
- [ ] OTP works for login

---

## 📞 Need Help?

### Brevo Support
- Docs: https://developers.brevo.com/
- Support: https://help.brevo.com/

### Check Your Setup
```bash
# Test email sending
npx ts-node scripts/test-email-sending.ts

# Check console for OTP (always works)
npm run dev
# Then try to register/login
```

---

## ✅ Success Criteria

You'll know it's working when:
1. You register with your email
2. You receive OTP in your inbox (within 1 minute)
3. You can login using that OTP
4. No errors in console

---

**For now, console OTP works fine for development. Set up real email when you're ready to launch!** 🚀

