import os
import re
from pathlib import Path

# Configuration
HEADING_PUNCTUATION = r'[\.:;!?。！？、，；：]$'
MAX_LINE_LENGTH = 80

# Regex patterns
ATX_HEADING = re.compile(r'^(#{1,6})\s+(.*)$')
LIST_MARKER = re.compile(r'^([*+-]|\d+\.)\s{2,}(.*)$')
EMPHASIS_HEADING = re.compile(r'^(\*\*|__)(.+?)(\*\*|__)$')
TRAILING_SPACES = re.compile(r'[ \t]+$')
MULTIPLE_BLANKS = re.compile(r'\n{3,}')

# Functions
def fix_headings(lines):
    fixed = []
    prev_level = 0
    for i, line in enumerate(lines):
        m = ATX_HEADING.match(line)
        if m:
            hashes, text = m.groups()
            # Remove trailing punctuation
            text = re.sub(HEADING_PUNCTUATION, '', text.strip())
            level = len(hashes)
            # Convert to setext for h1/h2, else atx with correct spacing
            if level == 1:
                fixed.append(text)
                fixed.append('=' * len(text))
            elif level == 2:
                fixed.append(text)
                fixed.append('-' * len(text))
            else:
                fixed.append(f'{"#"*level} {text}')
        else:
            fixed.append(line)
    return fixed

def fix_list_spacing(lines):
    return [LIST_MARKER.sub(r'\1 \2', l) for l in lines]

def fix_emphasis_headings(lines):
    fixed = []
    for line in lines:
        m = EMPHASIS_HEADING.match(line.strip())
        if m:
            text = m.group(2).strip()
            fixed.append(f'# {text}')
        else:
            fixed.append(line)
    return fixed

def fix_trailing_spaces(lines):
    return [TRAILING_SPACES.sub('', l) for l in lines]

def fix_multiple_blanks(text):
    return MULTIPLE_BLANKS.sub('\n\n', text)

def fix_line_length(lines, max_len=MAX_LINE_LENGTH):
    # Only wrap non-code, non-list, non-heading lines
    wrapped = []
    for line in lines:
        if (line.startswith('    ') or line.startswith('```') or
            ATX_HEADING.match(line) or re.match(r'^\s*([-*+] |\d+\.)', line)):
            wrapped.append(line)
            continue
        while len(line) > max_len:
            # Find last space before max_len
            split = line.rfind(' ', 0, max_len)
            if split == -1:
                break
            wrapped.append(line[:split])
            line = line[split+1:]
        wrapped.append(line)
    return wrapped

def process_file(path):
    with open(path, encoding='utf-8') as f:
        lines = f.read().splitlines()
    lines = fix_headings(lines)
    lines = fix_list_spacing(lines)
    lines = fix_emphasis_headings(lines)
    lines = fix_trailing_spaces(lines)
    lines = fix_line_length(lines)
    text = '\n'.join(lines)
    text = fix_multiple_blanks(text)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(text + '\n')
    print(f'Processed: {path}')

def batch_process(root_dirs):
    for root in root_dirs:
        for dirpath, _, filenames in os.walk(root):
            for fn in filenames:
                if fn.lower().endswith('.md'):
                    process_file(os.path.join(dirpath, fn))

if __name__ == '__main__':
    batch_process(['tutorials/ada', 'tutorials/asm'])
