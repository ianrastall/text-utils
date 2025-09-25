#!/usr/bin/env python3

from pathlib import Path
import sys, textwrap, re

WIDTH = 78                      # leave 2 chars of margin

# Regexes that must *not* be re-wrapped
CODE_FENCE = re.compile(r'^\s*```')
LIST_ITEM  = re.compile(r'^\s*([-*+]|\d+\.)\s+')
TABLE_ROW  = re.compile(r'^\s*\|.*\|\s*$')
SETEXT_HDR = re.compile(r'^[-=]{3,}\s*$')

def wrap_paragraph(lines):
    """Return the same paragraph wrapped to WIDTH."""
    text = ' '.join(line.strip() for line in lines)
    indent = re.match(r'^\s*', lines[0]).group(0)
    wrapped = textwrap.fill(text,
                            width=WIDTH,
                            initial_indent=indent,
                            subsequent_indent=indent,
                            break_long_words=False)
    return wrapped.splitlines()

def process_file(path: Path):
    out, buf, in_code = [], [], False
    
    for line in path.read_text(encoding='utf-8').splitlines():
        if CODE_FENCE.match(line):
            # flush buffered prose before toggling code block state
            if buf: 
                out.extend(wrap_paragraph(buf))
                buf.clear()
            in_code = not in_code
            out.append(line)
            continue
            
        if in_code or LIST_ITEM.match(line) or TABLE_ROW.match(line) \
           or SETEXT_HDR.match(line) or not line.strip():
            # flush any buffered prose, then keep line as-is
            if buf: 
                out.extend(wrap_paragraph(buf))
                buf.clear()
            out.append(line)
        else:
            buf.append(line)
            
    if buf: 
        out.extend(wrap_paragraph(buf))
        
    path.write_text('\n'.join(out) + '\n', encoding='utf-8')

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print(__doc__)
        sys.exit(1)
    process_file(Path(sys.argv[1]))