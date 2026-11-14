#!/usr/bin/env python3
"""Create encrypted local backups and restore them into a replacement PostgreSQL DB."""

import getpass
import os
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse


BACKUP_DIRECTORY = Path.home() / "saans-db-backups"


def require_tools(*tools):
    missing = [tool for tool in tools if shutil.which(tool) is None]
    if missing:
        raise RuntimeError(
            f"Missing required tools: {', '.join(missing)}. "
            "Install PostgreSQL client tools (pg_dump, pg_restore) and GnuPG (gpg)."
        )


def prompt_database_url(prompt):
    value = getpass.getpass(prompt).strip()
    parsed = urlparse(value)
    if parsed.scheme not in ("postgres", "postgresql") or not parsed.hostname:
        raise ValueError("Enter a valid PostgreSQL connection URL from Render.")
    if not parsed.username or not parsed.password or not parsed.path.strip("/"):
        raise ValueError("The connection URL must include its database name and credentials.")
    return parsed


def postgres_environment(parsed):
    query = parse_qs(parsed.query)
    return {
        **os.environ,
        "PGHOST": parsed.hostname,
        "PGPORT": str(parsed.port or 5432),
        "PGUSER": unquote(parsed.username),
        "PGPASSWORD": unquote(parsed.password),
        "PGDATABASE": unquote(parsed.path.lstrip("/")),
        "PGSSLMODE": query.get("sslmode", ["require"])[0],
        "PGAPPNAME": "saans-encrypted-portability",
    }


def target_label(parsed):
    return f"{parsed.hostname}/{unquote(parsed.path.lstrip('/'))}"


def verify_encrypted_dump(backup_path):
    decrypt = subprocess.Popen(
        ["gpg", "--decrypt", str(backup_path)],
        stdout=subprocess.PIPE,
    )
    verify = subprocess.Popen(
        ["pg_restore", "--list", "-"],
        stdin=decrypt.stdout,
        stdout=subprocess.DEVNULL,
    )
    decrypt.stdout.close()
    verify_status = verify.wait()
    decrypt_status = decrypt.wait()
    if verify_status != 0 or decrypt_status != 0:
        raise RuntimeError("Backup verification failed; keep the file but do not rely on it.")


def backup():
    require_tools("pg_dump", "pg_restore", "gpg")
    parsed = prompt_database_url("Render external PostgreSQL URL (input hidden): ")

    BACKUP_DIRECTORY.mkdir(mode=0o700, parents=True, exist_ok=True)
    BACKUP_DIRECTORY.chmod(0o700)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    backup_path = BACKUP_DIRECTORY / f"saans-postgres-{timestamp}.dump.gpg"
    backup_path.touch(mode=0o600, exist_ok=False)

    print(f"Creating encrypted backup of {target_label(parsed)}.")
    print("GnuPG will ask for an encryption passphrase. Use a strong passphrase and keep it safe.")

    dump = None
    encrypt = None
    completed = False
    try:
        dump = subprocess.Popen(
            ["pg_dump", "--format=custom", "--no-owner", "--no-acl"],
            stdout=subprocess.PIPE,
            env=postgres_environment(parsed),
        )
        encrypt = subprocess.Popen(
            ["gpg", "--yes", "--symmetric", "--cipher-algo", "AES256", "--output", str(backup_path)],
            stdin=dump.stdout,
        )
        dump.stdout.close()
        encrypt_status = encrypt.wait()
        dump_status = dump.wait()
        if encrypt_status != 0 or dump_status != 0:
            raise RuntimeError("Backup export/encryption failed.")

        backup_path.chmod(0o600)
        verify_encrypted_dump(backup_path)
        size_mb = backup_path.stat().st_size / (1024 * 1024)
        completed = True
        print(f"Encrypted backup verified: {backup_path} ({size_mb:.2f} MiB)")
        print("Store a second copy somewhere private. Never commit or share the file or its passphrase.")
    finally:
        for process in (dump, encrypt):
            if process and process.poll() is None:
                process.terminate()
                process.wait()
        if not completed:
            backup_path.unlink(missing_ok=True)


def restore():
    require_tools("pg_restore", "gpg")
    backup_input = input("Path to encrypted SAANS backup: ").strip()
    backup_path = Path(backup_input).expanduser().resolve()
    if not backup_path.is_file() or backup_path.suffix != ".gpg":
        raise ValueError("Choose an existing encrypted .gpg backup file.")

    parsed = prompt_database_url("NEW Render PostgreSQL URL (input hidden): ")
    print(f"Restore target: {target_label(parsed)}")
    print("The target database must be a NEW, EMPTY database. Existing objects are not dropped.")
    if input("Type RESTORE to continue: ").strip() != "RESTORE":
        print("Restore cancelled.")
        return

    decrypt = None
    restore_process = None
    try:
        decrypt = subprocess.Popen(["gpg", "--decrypt", str(backup_path)], stdout=subprocess.PIPE)
        restore_process = subprocess.Popen(
            ["pg_restore", "--no-owner", "--no-acl", "--exit-on-error", "-"],
            stdin=decrypt.stdout,
            env=postgres_environment(parsed),
        )
        decrypt.stdout.close()
        restore_status = restore_process.wait()
        decrypt_status = decrypt.wait()
        if restore_status != 0 or decrypt_status != 0:
            raise RuntimeError(
                "Restore failed. The new database may be partially restored; "
                "do not point the app to it. Create a fresh empty database before retrying."
            )
        print("Restore completed. Verify the app against the new database before retiring the old one.")
    finally:
        for process in (decrypt, restore_process):
            if process and process.poll() is None:
                process.terminate()
                process.wait()


def main():
    if len(sys.argv) != 2 or sys.argv[1] not in {"backup", "restore"}:
        print(
            "Usage:\n"
            "  python3 server/scripts/render-postgres-portability.py backup\n"
            "  python3 server/scripts/render-postgres-portability.py restore",
            file=sys.stderr,
        )
        return 2

    try:
        backup() if sys.argv[1] == "backup" else restore()
    except KeyboardInterrupt:
        print("\nCancelled.", file=sys.stderr)
        return 130
    except (OSError, ValueError, RuntimeError, subprocess.SubprocessError) as error:
        print(f"Database portability operation failed: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
