# Filesystem security

Paths are expanded, normalized, and classified (PUBLIC/PROJECT/SENSITIVE/SECRET/SYSTEM/CRITICAL). `.env`, `.ssh`, `.aws`, keys, and system prefixes are protected. Symlink realpath is used when the OS can resolve the path; dangling links are still evaluated on the requested path and may be denied by default-deny.
