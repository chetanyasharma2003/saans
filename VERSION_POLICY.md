# SAANS Version Policy

**Effective:** September 20, 2026

---

## Current Version

### **v2.0.0** - Genuine Mental Health Platform

**Status:** ✅ Production Ready | Current Recommended Version

This is the **ONLY** recommended version for:
- ✅ New deployments
- ✅ Feature development
- ✅ Bug fixes
- ✅ Production use
- ✅ All future work

---

## Previous Versions

### **v1.0.0** - Generic Booking Platform

**Status:** ⚠️ Deprecated | No longer maintained

- ❌ No new features
- ❌ No new deployments
- ❌ Security patches only (if critical)
- ✅ Migration path: See `DEPRECATION_NOTICE.md`

**Backward Compatibility:** Yes (v2.0.0 fully supports v1.0.0 data)

---

## Future Versions

### **v2.x.x** - Incremental Improvements

- Timeline: Monthly updates
- Strategy: Add features to v2.0.0
- Compatibility: Backward compatible
- Example: v2.1.0 (doctor dashboard), v2.2.0 (AI matching)

### **v3.0.0+** - Only if Major Redesign Needed

- Timeline: Not planned for at least 2-3 years
- Trigger: Fundamental business model change or architectural redesign
- Current Status: **v2.0.0 designed for long-term use**

---

## Version Strategy

```
DEVELOPMENT WORKFLOW:

1. Feature development → v2.0.0 (main branch)
2. Testing → Staging environment
3. Verification → QA sign-off
4. Release → Production (v2.x.x)
5. Maintenance → Security patches to v2.0.0

NEVER: Create new versions for bugfixes or minor features
       → Use v2.0.0 → v2.1.0 → v2.2.0 (incremental)
```

---

## Support Matrix

| Version | Status | Support | Updates | Migration |
|---------|--------|---------|---------|-----------|
| v2.0.0+ | ✅ Current | Full | Monthly | N/A |
| v2.0.0 | ✅ Current | Full | Monthly | Base version |
| v1.0.0 | ⚠️ Deprecated | Limited | Critical only | → v2.0.0 |
| < v1.0.0 | ❌ EOL | None | None | Not supported |

---

## Maintenance Schedule

### v2.0.0 (Current)
- **Bug fixes:** Weekly
- **Security patches:** As needed (within 48 hours)
- **Feature updates:** Monthly (v2.1.0, v2.2.0, etc)
- **Support:** Full (24/7)

### v1.0.0 (Deprecated)
- **Bug fixes:** Critical only
- **Security patches:** Within 7 days of v2.0.0 patch
- **Feature updates:** None
- **Support:** Migration assistance only

---

## Feature Development Guidelines

### When Adding a Feature:

```
1. Always target v2.0.0 (main branch)
2. Never create new major versions for features
3. Use semantic versioning:
   - v2.0.0 → v2.1.0 (new feature)
   - v2.1.0 → v2.1.1 (bugfix)
   - v2.1.x → v2.2.0 (multiple features)
4. Maintain backward compatibility
5. Update documentation
6. Add tests
7. Release to production
```

### Feature Branch Naming:
```
feature/doctor-discovery → v2.1.0
feature/ai-matching → v2.2.0
bugfix/crisis-alert → v2.0.1
chore/performance → v2.0.1
```

---

## Release Schedule

### Monthly Release Cycle

| Week | Activity |
|------|----------|
| Week 1 | Feature development |
| Week 2 | QA testing & bugfixes |
| Week 3 | Release candidate |
| Week 4 | Production release (v2.x.0) |

### Release Checklist
- ✅ All tests passing (330+ test cases)
- ✅ Security audit completed
- ✅ Performance verified
- ✅ Documentation updated
- ✅ Migration guide (if schema changes)
- ✅ Backward compatibility confirmed

---

## Versioning Scheme

**SAANS follows Semantic Versioning:**

```
v2.3.1
│ │ │
│ │ └─ Patch (bugfix, hotfix)
│ └─── Minor (new features, backward compatible)
└───── Major (breaking changes, new platform)
```

### Examples:
- v2.0.0 → v2.0.1 (crisis alert bugfix)
- v2.0.0 → v2.1.0 (doctor discovery added)
- v2.0.0 → v2.2.0 (safety planning added)
- v2.0.0 → v2.3.0 (AI matching added)

### Never:
- Skip versions (no v2.0.0 → v2.5.0 jump)
- Create v3.0.0 for minor changes
- Merge v1.0.0 changes to v2.0.0

---

## Git Tags & Releases

### Tag Naming:
```bash
git tag -a v2.0.0 -m "SAANS v2.0.0 - Genuine Healing Platform"
git tag -a v2.1.0 -m "SAANS v2.1.0 - Doctor Discovery Feature"
git tag -a v2.0.1 -m "SAANS v2.0.1 - Crisis Alert Bugfix"
```

### View All Tags:
```bash
git tag -l
# Output:
# v1.0.0  (deprecated)
# v2.0.0  (current)
# v2.1.0  (planned)
```

---

## Backward Compatibility Guarantee

### v2.0.0+ Commitment:

```
✅ All v2.0.0 features work in v2.1.0
✅ All v2.1.0 features work in v2.2.0
✅ All user data preserved across versions
✅ All APIs remain stable (additions only)
✅ All database migrations automatic
✅ Zero downtime required
✅ No data loss
```

### v1.0.0 → v2.0.0:

```
✅ All v1.0.0 data preserved
✅ All v1.0.0 features work in v2.0.0
✅ No v1.0.0 migrations required (they happen automatically)
✅ Can revert if needed (backups available)
✅ Performance improves after migration
```

---

## Communication

### Version Changes Announced In:
1. **Git tags:** `git tag -l`
2. **README.md:** Version section
3. **CHANGELOG.md:** Detailed changes
4. **Documentation:** All feature docs updated
5. **Email:** Notification to users
6. **GitHub Releases:** Official announcement

### Deprecation Notice:
- When: Feature marked deprecated in code
- How: Comment + documentation
- Warning: 1 major version in advance
- Removal: After 2 versions (e.g., removed in v4.0.0)

---

## Decision: v2.0.0 Forever

### Why We Won't Jump to v3.0.0:

```
❌ Breaking changes require v3.0.0
✅ Backward compatible changes in v2.x.x

v2.0.0 is designed for:
├─ 5-10 years of development
├─ Continuous feature additions
├─ Incremental improvements (v2.1.0, v2.2.0...)
├─ Architectural improvements (transparent to users)
└─ Zero breaking changes (guaranteed)

v3.0.0 would only happen if:
- Complete redesign needed
- Database schema completely rebuilt
- Business model fundamentally changes
- Technology stack completely changes

CURRENT STATUS: None of these apply.
v2.0.0 is our platform for the foreseeable future.
```

---

## FAQ

**Q: Can I use v1.0.0 in production?**
A: No. Use v2.0.0 only. Migration is automatic.

**Q: Will v2.0.0 work with my v1.0.0 data?**
A: Yes, 100% backward compatible.

**Q: When will v3.0.0 come out?**
A: Not planned. We'll use v2.x.x for years.

**Q: Can I skip versions (v2.1.0 → v2.3.0)?**
A: Yes, backward compatible. Safe to skip.

**Q: Will there be breaking changes in v2.x.x?**
A: No. Semantic versioning guarantees backward compatibility.

**Q: How long is v2.0.0 supported?**
A: Indefinitely. It's our long-term platform.

---

## Contact

Questions about versioning policy?

- **Email:** chetanyaprakashsharma2003@gmail.com
- **Docs:** See `README.md` for features
- **Migration:** See `DEPRECATION_NOTICE.md`

---

**SAANS Version Policy - v1.0**
**Effective: September 20, 2026**
**Last Updated: September 20, 2026**

**TL;DR: SAANS v2.0.0 only. Everything works. No migrations needed. That's it.** ✅
