#!/usr/bin/env python3
"""Convenience wrapper for generating the JSON Tool context dump."""

from __future__ import annotations

from pathlib import Path

from tool_context_dump import run


if __name__ == "__main__":
    raise SystemExit(
        run(
            default_tool="json-tool",
            default_output=Path("context/code-dump-json-tool.txt"),
        )
    )
