# ⚠️ DEPRECATION NOTICE

## SAANS v1.0.0 - DEPRECATED

**Status:** Deprecated - Use v2.0.0 only

v1.0.0 was a generic mental health booking platform.
It has been superseded by v2.0.0 - the genuine healing platform.

**Do not use v1.0.0 for new features or deployments.**

---

## Migration from v1.0.0 → v2.0.0

If you're running v1.0.0:

1. **Backup your database**
   ```bash
   pg_dump saans_db > backup.sql
   ```

2. **Update to v2.0.0** (backward compatible)
   ```bash
   git pull origin main
   npm install
   ```

3. **Run migrations**
   ```bash
   npx prisma migrate deploy
   ```

4. **All v1.0.0 features work in v2.0.0**
   - Appointments ✅
   - Mood tracking ✅
   - Video consultations ✅
   - Crisis alerts ✅
   - Payments ✅
   - Prescriptions ✅

5. **Access new v2.0.0 features immediately**
   - Real verified doctors (geolocation)
   - Recovery stories
   - HIPAA medical records
   - Crisis safety planning
   - Community support
   - Wellness resources
   - Progress tracking

---

## Why v2.0.0 Only?

**v2.0.0 is:**
- ✅ Genuine mental health focused
- ✅ Real verified doctors with geolocation
- ✅ Real survivor recovery stories
- ✅ HIPAA-compliant medical records
- ✅ Crisis safety planning tools
- ✅ Community support groups
- ✅ Complete healing journey features
- ✅ Production-ready & fully tested
- ✅ Backward compatible (no data loss)

**v1.0.0 was:**
- ❌ Generic mental health booking
- ❌ Limited doctor information
- ❌ No recovery stories
- ❌ No medical history tracking
- ❌ No community features
- ❌ No safety planning

---

## Support

For questions about migration, see:
- `/docs/MIGRATION_V1_TO_V2.md` - Detailed migration guide
- `VERSION_POLICY.md` - Version strategy
- `README.md` - Complete feature list

---

**Questions?** Contact: chetanyaprakashsharma2003@gmail.com

**Last Updated:** September 20, 2026
