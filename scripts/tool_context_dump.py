#!/usr/bin/env python3
"""Generate LLM-friendly context packs for standalone tool pages."""

from __future__ import annotations

import argparse
import datetime as dt
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, List, Optional, Sequence, Set, Tuple


IGNORE_DIRS = {
    ".git",
    "__pycache__",
    ".pytest_cache",
    "node_modules",
    ".venv",
    "venv",
    ".idea",
    ".vscode",
}

CODE_EXTENSIONS = {
    ".html",
    ".js",
    ".css",
    ".xml",
    ".py",
    ".ps1",
    ".json",
    ".ts",
    ".tsx",
    ".jsx",
}

DOC_EXTENSIONS = {".md", ".txt", ".rst"}
TEXT_EXTENSIONS = CODE_EXTENSIONS | DOC_EXTENSIONS | {
    ".yml",
    ".yaml",
    ".toml",
    ".ini",
    ".csv",
    ".tsv",
    ".svg",
}

ASSET_REFERENCE_PATTERN = re.compile(
    r'(?:href|src)\s*=\s*["\']([^"\']+)["\']', re.IGNORECASE
)
MARKDOWN_HEADING_PATTERN = re.compile(r"^\s{0,3}#{1,6}\s+(.*\S)\s*$")


@dataclass(frozen=True)
class Excerpt:
    rel_path: str
    label: str
    start_line: int
    end_line: int
    content: str


def parse_args(argv: Optional[Sequence[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Generate an LLM context pack for a tool page by collecting related code "
            "files and relevant text excerpts."
        )
    )
    parser.add_argument(
        "-t",
        "--tool",
        help="Tool id or page name (for example: json-tool or json-tool.html).",
    )
    parser.add_argument(
        "--target",
        help="Explicit path to the tool page. Relative paths are resolved from repo root.",
    )
    parser.add_argument(
        "-o",
        "--output",
        help=(
            "Output file path. Defaults to context/code-dump-<tool>.txt "
            "(relative to repo root)."
        ),
    )
    parser.add_argument(
        "--repo-root",
        help="Repository root path. Defaults to the parent of this script's directory.",
    )
    parser.add_argument(
        "--max-sections-per-file",
        type=int,
        default=3,
        help="Maximum number of extracted sections per reference text file. Default: 3.",
    )
    parser.add_argument(
        "--context-lines",
        type=int,
        default=10,
        help="Line context radius for non-heading excerpts. Default: 10.",
    )

    return parser.parse_args(argv)


def normalize_key(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", value.lower())


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or "tool"


def to_repo_relative(path: Path, repo_root: Path) -> str:
    try:
        return path.resolve().relative_to(repo_root.resolve()).as_posix()
    except ValueError:
        return path.resolve().as_posix()


def is_external_reference(reference: str) -> bool:
    lowered = reference.lower()
    return lowered.startswith("http://") or lowered.startswith("https://") or lowered.startswith("//")


def is_non_file_reference(reference: str) -> bool:
    lowered = reference.lower()
    return (
        lowered.startswith("data:")
        or lowered.startswith("mailto:")
        or lowered.startswith("javascript:")
        or lowered.startswith("tel:")
        or lowered.startswith("#")
    )


def should_skip_path(path: Path, repo_root: Path) -> bool:
    try:
        relative = path.resolve().relative_to(repo_root.resolve())
    except ValueError:
        return True
    return any(part in IGNORE_DIRS or part == "context" for part in relative.parts)


def read_text(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return path.read_text(encoding="utf-8", errors="ignore")


def iter_repo_files(repo_root: Path) -> Iterable[Path]:
    for file_path in repo_root.rglob("*"):
        if not file_path.is_file():
            continue
        if should_skip_path(file_path, repo_root):
            continue
        yield file_path


def get_language_tag(path: Path) -> str:
    language_map = {
        ".html": "html",
        ".css": "css",
        ".js": "javascript",
        ".xml": "xml",
        ".ps1": "powershell",
        ".py": "python",
        ".md": "markdown",
        ".json": "json",
        ".yml": "yaml",
        ".yaml": "yaml",
        ".ts": "typescript",
        ".tsx": "tsx",
        ".jsx": "jsx",
        ".txt": "text",
    }
    return language_map.get(path.suffix.lower(), "text")


def get_numbered_content(text: str, start_line: int = 1) -> str:
    lines = text.splitlines()
    return "\n".join(
        f"{start_line + idx:4}: {line}" for idx, line in enumerate(lines)
    )


def merge_ranges(ranges: Iterable[Tuple[int, int]]) -> List[Tuple[int, int]]:
    sorted_ranges = sorted(ranges, key=lambda pair: (pair[0], pair[1]))
    if not sorted_ranges:
        return []

    merged: List[Tuple[int, int]] = [sorted_ranges[0]]
    for start, end in sorted_ranges[1:]:
        last_start, last_end = merged[-1]
        if start <= last_end:
            merged[-1] = (last_start, max(last_end, end))
        else:
            merged.append((start, end))
    return merged


def extract_windows(
    lines: Sequence[str],
    patterns: Sequence[re.Pattern[str]],
    context_lines: int,
    max_sections: int,
    label_prefix: str,
) -> List[Tuple[str, int, int, str]]:
    hit_lines: List[int] = []
    for idx, line in enumerate(lines):
        if any(pattern.search(line) for pattern in patterns):
            hit_lines.append(idx)

    if not hit_lines:
        return []

    ranges = [
        (max(0, idx - context_lines), min(len(lines), idx + context_lines + 1))
        for idx in hit_lines
    ]
    merged = merge_ranges(ranges)[:max_sections]

    excerpts: List[Tuple[str, int, int, str]] = []
    for start, end in merged:
        label = f"{label_prefix} lines {start + 1}-{end}"
        content = "\n".join(lines[start:end])
        excerpts.append((label, start + 1, end, content))
    return excerpts


def extract_markdown_sections(
    text: str,
    patterns: Sequence[re.Pattern[str]],
    max_sections: int,
    context_lines: int,
) -> List[Tuple[str, int, int, str]]:
    lines = text.splitlines()
    heading_indices = [
        idx for idx, line in enumerate(lines) if MARKDOWN_HEADING_PATTERN.match(line)
    ]

    section_results: List[Tuple[str, int, int, str]] = []
    for idx, start in enumerate(heading_indices):
        end = heading_indices[idx + 1] if idx + 1 < len(heading_indices) else len(lines)
        section_text = "\n".join(lines[start:end])
        if not any(pattern.search(section_text) for pattern in patterns):
            continue

        heading_match = MARKDOWN_HEADING_PATTERN.match(lines[start])
        heading = heading_match.group(1).strip() if heading_match else "Untitled section"
        label = f"Section: {heading}"
        section_results.append((label, start + 1, end, section_text))
        if len(section_results) >= max_sections:
            break

    if section_results:
        return section_results

    return extract_windows(
        lines=lines,
        patterns=patterns,
        context_lines=context_lines,
        max_sections=max_sections,
        label_prefix="Reference",
    )


def extract_text_sections(
    path: Path,
    text: str,
    patterns: Sequence[re.Pattern[str]],
    max_sections: int,
    context_lines: int,
) -> List[Tuple[str, int, int, str]]:
    if path.suffix.lower() == ".md":
        return extract_markdown_sections(
            text=text,
            patterns=patterns,
            max_sections=max_sections,
            context_lines=context_lines,
        )

    lines = text.splitlines()
    return extract_windows(
        lines=lines,
        patterns=patterns,
        context_lines=context_lines,
        max_sections=max_sections,
        label_prefix="Reference",
    )


def resolve_target_reference(reference: str, target_file: Path, repo_root: Path) -> Optional[Path]:
    reference_path = reference.split("#", 1)[0].split("?", 1)[0].strip()
    if not reference_path:
        return None
    if is_external_reference(reference_path) or is_non_file_reference(reference_path):
        return None

    if reference_path.startswith("/"):
        candidate = (repo_root / reference_path.lstrip("/")).resolve()
        return candidate if candidate.exists() else None

    rel_parts = [part for part in reference_path.split("/") if part not in ("", ".")]
    candidate_rel = Path(*rel_parts)
    candidate_from_target = (target_file.parent / candidate_rel).resolve()
    if candidate_from_target.exists():
        return candidate_from_target

    candidate_from_root = (repo_root / candidate_rel).resolve()
    return candidate_from_root if candidate_from_root.exists() else None


def collect_local_dependencies(target_text: str, target_file: Path, repo_root: Path) -> Tuple[List[str], List[str]]:
    local: Set[str] = set()
    external: Set[str] = set()

    for match in ASSET_REFERENCE_PATTERN.finditer(target_text):
        raw_reference = match.group(1).strip()
        if not raw_reference:
            continue

        if is_external_reference(raw_reference):
            external.add(raw_reference)
            continue
        if is_non_file_reference(raw_reference):
            continue

        resolved = resolve_target_reference(raw_reference, target_file, repo_root)
        if resolved is None:
            continue
        if should_skip_path(resolved, repo_root):
            continue
        if resolved.suffix.lower() not in TEXT_EXTENSIONS:
            continue
        local.add(to_repo_relative(resolved, repo_root))

    return sorted(local), sorted(external)


def extract_tool_title(target_text: str, target_file: Path) -> str:
    h2_match = re.search(r"<h2[^>]*>\s*([^<]+?)\s*</h2>", target_text, flags=re.IGNORECASE)
    if h2_match:
        return re.sub(r"\s+", " ", h2_match.group(1)).strip()

    title_match = re.search(
        r"<title[^>]*>\s*(.*?)\s*</title>", target_text, flags=re.IGNORECASE | re.DOTALL
    )
    if title_match:
        title = re.sub(r"\s+", " ", title_match.group(1)).strip()
        title = re.sub(r"\s*-\s*Text Utilities\s*$", "", title, flags=re.IGNORECASE)
        if title:
            return title

    return target_file.stem.replace("-", " ").replace("_", " ").title()


def build_reference_patterns(
    target_rel: str,
    tool_slug: str,
    tool_title: str,
    tool_stem: str,
) -> List[re.Pattern[str]]:
    target_rel_pattern = re.escape(target_rel).replace(r"\/", r"[\\/]")
    target_name_pattern = re.escape(Path(target_rel).name)
    id_pattern = rf"id\s*:\s*['\"]{re.escape(tool_slug)}['\"]"
    stem_pattern = re.escape(tool_stem)
    title_pattern = re.escape(tool_title)

    return [
        re.compile(target_rel_pattern, re.IGNORECASE),
        re.compile(target_name_pattern, re.IGNORECASE),
        re.compile(id_pattern, re.IGNORECASE),
        re.compile(stem_pattern, re.IGNORECASE),
        re.compile(title_pattern, re.IGNORECASE),
    ]


def collect_incoming_code_refs(
    repo_root: Path,
    target_file: Path,
    patterns: Sequence[re.Pattern[str]],
) -> List[str]:
    incoming: Set[str] = set()
    for file_path in iter_repo_files(repo_root):
        if file_path.resolve() == target_file.resolve():
            continue
        if file_path.suffix.lower() not in CODE_EXTENSIONS:
            continue

        content = read_text(file_path)
        if any(pattern.search(content) for pattern in patterns):
            incoming.add(to_repo_relative(file_path, repo_root))
    return sorted(incoming)


def collect_direct_docs(
    repo_root: Path,
    target_file: Path,
    tool_slug: str,
    tool_stem: str,
) -> List[str]:
    slug_key = normalize_key(tool_slug)
    stem_key = normalize_key(tool_stem)
    docs: Set[str] = set()

    for file_path in iter_repo_files(repo_root):
        if file_path.suffix.lower() not in DOC_EXTENSIONS:
            continue
        if file_path.resolve() == target_file.resolve():
            continue

        stem_key_candidate = normalize_key(file_path.stem)
        name_key_candidate = normalize_key(file_path.name)
        if slug_key and slug_key in name_key_candidate:
            docs.add(to_repo_relative(file_path, repo_root))
            continue
        if stem_key and stem_key in stem_key_candidate:
            docs.add(to_repo_relative(file_path, repo_root))

    return sorted(docs)


def collect_reference_excerpts(
    repo_root: Path,
    patterns: Sequence[re.Pattern[str]],
    excluded_rel_paths: Set[str],
    max_sections_per_file: int,
    context_lines: int,
) -> List[Excerpt]:
    excerpts: List[Excerpt] = []

    for file_path in iter_repo_files(repo_root):
        rel_path = to_repo_relative(file_path, repo_root)
        if rel_path in excluded_rel_paths:
            continue
        if file_path.suffix.lower() not in DOC_EXTENSIONS:
            continue

        content = read_text(file_path)
        if not any(pattern.search(content) for pattern in patterns):
            continue

        sections = extract_text_sections(
            path=file_path,
            text=content,
            patterns=patterns,
            max_sections=max_sections_per_file,
            context_lines=context_lines,
        )
        for label, start_line, end_line, section_content in sections:
            excerpts.append(
                Excerpt(
                    rel_path=rel_path,
                    label=label,
                    start_line=start_line,
                    end_line=end_line,
                    content=section_content,
                )
            )

    return sorted(excerpts, key=lambda item: (item.rel_path.lower(), item.start_line))


def add_unique(ordered: List[str], seen: Set[str], rel_path: str) -> None:
    key = rel_path.lower()
    if key in seen:
        return
    seen.add(key)
    ordered.append(rel_path)


def build_context_output(
    *,
    repo_root: Path,
    output_path: Path,
    tool_slug: str,
    tool_title: str,
    target_rel: str,
    full_files: Sequence[str],
    local_dependencies: Sequence[str],
    incoming_refs: Sequence[str],
    direct_docs: Sequence[str],
    external_dependencies: Sequence[str],
    excerpts: Sequence[Excerpt],
) -> str:
    generated_utc = dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    output_rel = to_repo_relative(output_path, repo_root)

    lines: List[str] = []
    lines.append(f"# LLM Context Pack: {tool_title}")
    lines.append("")
    lines.append(
        "This generated file is designed as a context bundle for LLM prompts."
    )
    lines.append(
        "It contains full source text for files directly associated with the tool, "
        "plus extracted sections from broader docs that reference the tool."
    )
    lines.append(
        "Every included block is wrapped with explicit BEGIN/END markers for "
        "reliable chunking."
    )
    lines.append("")
    lines.append(f"Generated: {generated_utc}")
    lines.append(f"Repository: `{repo_root}`")
    lines.append(f"Tool slug: `{tool_slug}`")
    lines.append(f"Tool page: `{target_rel}`")
    lines.append(f"Output file: `{output_rel}`")
    lines.append("")

    lines.append("## Discovery Summary")
    lines.append(f"- Full files included: {len(full_files)}")
    lines.append(f"- Direct local dependencies: {len(local_dependencies)}")
    lines.append(f"- Incoming code references: {len(incoming_refs)}")
    lines.append(f"- Direct tool docs (full): {len(direct_docs)}")
    lines.append(f"- Cross-file text excerpts: {len(excerpts)}")
    lines.append(f"- External dependencies in tool page: {len(external_dependencies)}")
    lines.append("")

    lines.append("## Included Full Files")
    for rel_path in full_files:
        lines.append(f"- `{rel_path}`")
    lines.append("")

    lines.append("## External Dependencies")
    if external_dependencies:
        for dependency in external_dependencies:
            lines.append(f"- `{dependency}`")
    else:
        lines.append("- None detected")
    lines.append("")

    lines.append("## Full File Dumps")
    lines.append("")

    for rel_path in full_files:
        full_path = (repo_root / Path(rel_path)).resolve()
        lines.append(f"----- BEGIN FILE: {rel_path} -----")
        if not full_path.exists():
            lines.append("Missing at dump time.")
            lines.append(f"----- END FILE: {rel_path} -----")
            lines.append("")
            continue

        file_text = read_text(full_path)
        numbered_content = get_numbered_content(file_text)
        language = get_language_tag(full_path)
        lines.append(f"```{language}")
        lines.append(numbered_content)
        lines.append("```")
        lines.append(f"----- END FILE: {rel_path} -----")
        lines.append("")

    lines.append("## Referenced Text Excerpts")
    lines.append("")

    if not excerpts:
        lines.append("No additional text excerpts were needed.")
        lines.append("")
    else:
        for excerpt in excerpts:
            marker = (
                f"{excerpt.rel_path} | {excerpt.label} "
                f"(lines {excerpt.start_line}-{excerpt.end_line})"
            )
            lines.append(f"----- BEGIN EXCERPT: {marker} -----")
            numbered_excerpt = get_numbered_content(
                excerpt.content, start_line=excerpt.start_line
            )
            lines.append("```text")
            lines.append(numbered_excerpt)
            lines.append("```")
            lines.append(f"----- END EXCERPT: {marker} -----")
            lines.append("")

    return "\n".join(lines).rstrip() + "\n"


def generate_context_pack(
    *,
    repo_root: Path,
    target_relative: Path,
    tool_slug: str,
    output_path: Path,
    max_sections_per_file: int,
    context_lines: int,
) -> Tuple[str, int]:
    target_file = (repo_root / target_relative).resolve()
    if not target_file.exists():
        raise FileNotFoundError(f"Unable to find target tool page: {target_file}")

    target_text = read_text(target_file)
    target_rel = to_repo_relative(target_file, repo_root)
    tool_title = extract_tool_title(target_text, target_file)

    local_dependencies, external_dependencies = collect_local_dependencies(
        target_text=target_text,
        target_file=target_file,
        repo_root=repo_root,
    )
    patterns = build_reference_patterns(
        target_rel=target_rel,
        tool_slug=tool_slug,
        tool_title=tool_title,
        tool_stem=target_file.stem,
    )
    incoming_refs = collect_incoming_code_refs(
        repo_root=repo_root,
        target_file=target_file,
        patterns=patterns,
    )
    direct_docs = collect_direct_docs(
        repo_root=repo_root,
        target_file=target_file,
        tool_slug=tool_slug,
        tool_stem=target_file.stem,
    )

    ordered_files: List[str] = []
    seen: Set[str] = set()
    add_unique(ordered_files, seen, target_rel)
    for rel in local_dependencies:
        add_unique(ordered_files, seen, rel)
    for rel in incoming_refs:
        add_unique(ordered_files, seen, rel)
    for rel in direct_docs:
        add_unique(ordered_files, seen, rel)

    excerpts = collect_reference_excerpts(
        repo_root=repo_root,
        patterns=patterns,
        excluded_rel_paths=set(ordered_files),
        max_sections_per_file=max_sections_per_file,
        context_lines=context_lines,
    )

    output_text = build_context_output(
        repo_root=repo_root,
        output_path=output_path,
        tool_slug=tool_slug,
        tool_title=tool_title,
        target_rel=target_rel,
        full_files=ordered_files,
        local_dependencies=local_dependencies,
        incoming_refs=incoming_refs,
        direct_docs=direct_docs,
        external_dependencies=external_dependencies,
        excerpts=excerpts,
    )

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(output_text, encoding="utf-8", newline="\n")
    return target_rel, len(ordered_files)


def run(
    *,
    default_tool: Optional[str] = None,
    default_output: Optional[Path] = None,
    argv: Optional[Sequence[str]] = None,
) -> int:
    args = parse_args(argv=argv)

    script_dir = Path(__file__).resolve().parent
    repo_root = (
        Path(args.repo_root).expanduser().resolve()
        if args.repo_root
        else script_dir.parent.resolve()
    )

    if args.target:
        target_relative = Path(args.target).expanduser()
        if target_relative.is_absolute():
            try:
                target_relative = target_relative.resolve().relative_to(repo_root)
            except ValueError:
                raise ValueError(
                    f"Target must be inside repository root ({repo_root}): {args.target}"
                )
    else:
        tool_value = args.tool or default_tool
        if not tool_value:
            raise ValueError("Missing tool id. Provide --tool or configure a default tool.")
        if tool_value.lower().endswith(".html"):
            target_relative = Path(tool_value)
        else:
            target_relative = Path(f"{tool_value}.html")

    target_name_for_slug = args.tool or default_tool or target_relative.stem
    if str(target_name_for_slug).lower().endswith(".html"):
        tool_slug = slugify(Path(str(target_name_for_slug)).stem)
    else:
        tool_slug = slugify(str(target_name_for_slug))

    if args.output:
        output_path = Path(args.output).expanduser()
    elif default_output is not None:
        output_path = default_output
    else:
        output_path = Path(f"context/code-dump-{tool_slug}.txt")

    if not output_path.is_absolute():
        output_path = (repo_root / output_path).resolve()

    target_rel, included_count = generate_context_pack(
        repo_root=repo_root,
        target_relative=target_relative,
        tool_slug=tool_slug,
        output_path=output_path,
        max_sections_per_file=max(1, args.max_sections_per_file),
        context_lines=max(1, args.context_lines),
    )

    print(f"Tool context dump complete: {output_path}")
    print(f"Target page: {target_rel}")
    print(f"Files included (full): {included_count}")
    return 0


def main(argv: Optional[Sequence[str]] = None) -> int:
    try:
        return run(argv=argv)
    except Exception as exc:
        print(f"Error: {exc}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
