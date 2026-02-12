#!/usr/bin/env python3
"""Build a targeted code dump for the Color Chooser tool."""

from __future__ import annotations

import argparse
import datetime as dt
import re
from pathlib import Path


TARGET_REL_PATH = Path("color-chooser.html")
DEFAULT_OUTPUT_REL_PATH = Path("context/code-dump-color-chooser.txt")
CODE_EXTENSIONS = {".html", ".js", ".css", ".xml"}

ASSET_PATTERNS = (
    re.compile(r'<link[^>]+href\s*=\s*["\']([^"\']+)["\']', re.IGNORECASE),
    re.compile(r'<script[^>]+src\s*=\s*["\']([^"\']+)["\']', re.IGNORECASE),
)

INCOMING_REFERENCE_PATTERN = re.compile(
    r'color-chooser\.html|id\s*:\s*[\'"]color-chooser[\'"]', re.IGNORECASE
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Build a targeted context dump for color-chooser.html."
    )
    parser.add_argument(
        "-o",
        "--output",
        help=(
            "Output file path. Relative paths are resolved from the repository root. "
            f"Default: {DEFAULT_OUTPUT_REL_PATH.as_posix()}"
        ),
    )
    return parser.parse_args()


def to_repo_relative(path: Path, repo_root: Path) -> str:
    try:
        return path.resolve().relative_to(repo_root.resolve()).as_posix()
    except ValueError:
        return path.resolve().as_posix()


def get_language_tag(path: Path) -> str:
    language_map = {
        ".html": "html",
        ".css": "css",
        ".js": "javascript",
        ".xml": "xml",
        ".ps1": "powershell",
        ".py": "python",
        ".md": "markdown",
    }
    return language_map.get(path.suffix.lower(), "text")


def get_numbered_file_content(path: Path) -> str:
    lines = path.read_text(encoding="utf-8").splitlines()
    return "\n".join(f"{idx + 1:4}: {line}" for idx, line in enumerate(lines))


def is_external_reference(reference: str) -> bool:
    lowered = reference.lower()
    return lowered.startswith("http://") or lowered.startswith("https://") or lowered.startswith("//")


def is_non_file_reference(reference: str) -> bool:
    lowered = reference.lower()
    return (
        lowered.startswith("data:")
        or lowered.startswith("mailto:")
        or lowered.startswith("javascript:")
    )


def collect_dependencies(target_html: str, repo_root: Path) -> tuple[list[str], list[str]]:
    local_dependencies: set[str] = set()
    external_dependencies: set[str] = set()

    for pattern in ASSET_PATTERNS:
        for match in pattern.finditer(target_html):
            reference = match.group(1).strip()
            if not reference:
                continue

            reference_path = reference.split("#", 1)[0].split("?", 1)[0]
            if is_external_reference(reference_path):
                external_dependencies.add(reference)
                continue
            if is_non_file_reference(reference_path):
                continue

            candidate = reference_path.lstrip("/")
            if not candidate:
                continue

            candidate_path = Path(*candidate.split("/"))
            resolved = (repo_root / candidate_path).resolve()
            if resolved.exists():
                local_dependencies.add(to_repo_relative(resolved, repo_root))

    return sorted(local_dependencies), sorted(external_dependencies)


def collect_incoming_references(repo_root: Path, target_full_path: Path) -> list[str]:
    incoming_refs: set[str] = set()

    for file_path in repo_root.rglob("*"):
        if not file_path.is_file():
            continue
        if file_path.suffix.lower() not in CODE_EXTENSIONS:
            continue
        if ".git" in file_path.parts:
            continue
        if file_path.resolve() == target_full_path.resolve():
            continue

        try:
            content = file_path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            content = file_path.read_text(encoding="utf-8", errors="ignore")

        if INCOMING_REFERENCE_PATTERN.search(content):
            incoming_refs.add(to_repo_relative(file_path, repo_root))

    return sorted(incoming_refs)


def add_ordered_file(
    ordered_files: list[str], seen_files: set[str], relative_path: str
) -> None:
    if not relative_path:
        return
    key = relative_path.lower()
    if key in seen_files:
        return
    seen_files.add(key)
    ordered_files.append(relative_path)


def build_dump_content(
    repo_root: Path,
    output_path: Path,
    local_dependencies: list[str],
    incoming_references: list[str],
    external_dependencies: list[str],
) -> str:
    ordered_files: list[str] = []
    seen_files: set[str] = set()

    add_ordered_file(ordered_files, seen_files, TARGET_REL_PATH.as_posix())
    for rel_path in local_dependencies:
        add_ordered_file(ordered_files, seen_files, rel_path)
    for rel_path in incoming_references:
        add_ordered_file(ordered_files, seen_files, rel_path)

    generated_utc = dt.datetime.now(dt.UTC).strftime("%Y-%m-%d %H:%M:%S UTC")
    output_relative_path = to_repo_relative(output_path, repo_root)

    lines: list[str] = []
    lines.append("# Color Chooser Targeted Code Dump")
    lines.append("")
    lines.append(f"Generated: {generated_utc}")
    lines.append(f"Repository: `{repo_root}`")
    lines.append(f"Target tool: `{TARGET_REL_PATH.as_posix()}`")
    lines.append(f"Output file: `{output_relative_path}`")
    lines.append("")

    lines.append("## Included Files")
    for rel_path in ordered_files:
        lines.append(f"- `{rel_path}`")
    lines.append("")

    lines.append("## Direct Local Dependencies (from target HTML)")
    if local_dependencies:
        for rel_path in local_dependencies:
            lines.append(f"- `{rel_path}`")
    else:
        lines.append("- None detected")
    lines.append("")

    lines.append("## Incoming References (files that point to the tool)")
    if incoming_references:
        for rel_path in incoming_references:
            lines.append(f"- `{rel_path}`")
    else:
        lines.append("- None detected")
    lines.append("")

    lines.append("## External Dependencies (from target HTML)")
    if external_dependencies:
        for dependency in external_dependencies:
            lines.append(f"- `{dependency}`")
    else:
        lines.append("- None detected")
    lines.append("")

    lines.append("## File Dumps")
    lines.append("")

    for rel_path in ordered_files:
        full_path = (repo_root / Path(rel_path)).resolve()
        lines.append(f"### `{rel_path}`")
        lines.append("")
        if not full_path.exists():
            lines.append("Missing at dump time.")
            lines.append("")
            continue

        language = get_language_tag(full_path)
        content = get_numbered_file_content(full_path)
        lines.append(f"```{language}")
        lines.append(content)
        lines.append("```")
        lines.append("")

    return "\n".join(lines).rstrip() + "\n"


def main() -> None:
    args = parse_args()

    script_dir = Path(__file__).resolve().parent
    repo_root = script_dir.parent.resolve()

    output_path = Path(args.output).expanduser() if args.output else DEFAULT_OUTPUT_REL_PATH
    if not output_path.is_absolute():
        output_path = (repo_root / output_path).resolve()

    target_full_path = (repo_root / TARGET_REL_PATH).resolve()
    if not target_full_path.exists():
        raise FileNotFoundError(f"Unable to find target tool page: {target_full_path}")

    target_html = target_full_path.read_text(encoding="utf-8")
    local_dependencies, external_dependencies = collect_dependencies(target_html, repo_root)
    incoming_references = collect_incoming_references(repo_root, target_full_path)

    dump_content = build_dump_content(
        repo_root=repo_root,
        output_path=output_path,
        local_dependencies=local_dependencies,
        incoming_references=incoming_references,
        external_dependencies=external_dependencies,
    )

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(dump_content, encoding="utf-8", newline="\n")

    ordered_count = len(
        {
            TARGET_REL_PATH.as_posix().lower(),
            *[p.lower() for p in local_dependencies],
            *[p.lower() for p in incoming_references],
        }
    )
    print(f"Color Chooser dump complete: {output_path}")
    print(f"Files included: {ordered_count}")


if __name__ == "__main__":
    main()
