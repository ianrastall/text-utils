import os
import re

def renumber_markdown_file(filepath):
    """
    Reads a Markdown file, re-numbers its headings, and overwrites the file.

    The numbering scheme is hierarchical:
    - # -> 1
    - ## -> 1.1
    - ### -> 1.1.1
    - #### -> 1.1.1.1
    """
    print(f"Processing file: {filepath}...")
    
    # Counters for heading levels 1 through 4.
    counters = [0, 0, 0, 0]
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    except IOError as e:
        print(f"  -> Error reading file: {e}")
        return

    updated_lines = []
    for line in lines:
        # Regex to find lines that start with 1 to 4 '#' characters
        match = re.match(r'^(#{1,4})\s+(.*)', line)
        
        if match:
            hashes = match.group(1)
            level = len(hashes)
            heading_text = match.group(2).strip()
            
            # --- Update Counters ---
            # Increment the counter for the current level
            counters[level - 1] += 1
            
            # Reset all counters for deeper levels to zero
            for i in range(level, 4):
                counters[i] = 0
            
            # --- Clean Existing Text ---
            # Regex to find and remove any old numbering (e.g., "1.", "2.3.1")
            clean_text = re.sub(r'^\d+(\.\d+)*\s*', '', heading_text)
            
            # --- Create New Heading ---
            # Build the new number prefix (e.g., "1", "1.1", "1.1.1")
            new_prefix = '.'.join(str(c) for c in counters[:level])
            
            # Construct the new, re-numbered heading line
            new_line = f"{hashes} {new_prefix} {clean_text}\n"
            updated_lines.append(new_line)
        else:
            # If the line is not a heading, add it as is
            updated_lines.append(line)

    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.writelines(updated_lines)
        print(f"  -> Successfully re-numbered headings in {os.path.basename(filepath)}.")
    except IOError as e:
        print(f"  -> Error writing to file: {e}")


def main():
    """
    Finds and processes all Markdown files in the current directory.
    """
    current_directory = os.getcwd()
    print(f"Scanning for Markdown files in: {current_directory}\n")
    
    file_found = False
    for filename in os.listdir(current_directory):
        if filename.lower().endswith('.md'):
            file_found = True
            filepath = os.path.join(current_directory, filename)
            renumber_markdown_file(filepath)
            
    if not file_found:
        print("No Markdown (.md) files found in this directory.")


if __name__ == "__main__":
    main()