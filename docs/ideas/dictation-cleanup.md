# Dictation Cleanup Idea

Date captured: 2026-06-21

## Core Idea

Create a tool that turns rough dictated text into usable written text. The user can dictate naturally, including false starts, filler words, self-corrections, and conversational phrasing, then ask the tool to rewrite it into a clean paragraph, email, message, note, or other useful format.

This is different from plain browser dictation. The speech-to-text layer only captures what was said. The useful part here is the cleanup layer: an AI-assisted pass that understands the intended meaning and rewrites the result so it makes sense without manual editing.

## Example Input

> Okay, I've been thinking about this. The original dictation box wasn't very useful because Firefox was the one browser it did not work in, and then Windows dictation with Win+H turned out to solve the basic speech-to-text part. But there might still be a real use for a box where I can dictate messy thoughts and have AI turn them into something coherent that I can paste somewhere else.

## Example Output

> I have been thinking about the dictation feature for Text Utilities. The original browser-based dictation idea was less useful because Firefox did not support it well, and Windows dictation with Win+H already handles the speech-to-text part. What may still be valuable is an AI-powered cleanup tool: a place to paste or dictate rough thoughts and turn them into clear, coherent text that can be copied elsewhere.

## Possible Product Shapes

- **Text Utilities page:** A new tool inside the existing site, focused on pasting rough text and getting cleaned text back.
- **Standalone web app:** A separate, more serious page or app if the workflow grows beyond a simple utility.
- **Desktop software:** Potentially more useful if direct OS-level dictation, clipboard handling, hotkeys, privacy, or local models become important.

## Architecture Notes

The existing Text Utilities site is static and hosted on GitHub Pages. A simple frontend-only page cannot safely call a paid AI API directly because the API key would be exposed.

Practical options:

- Use a backend endpoint such as `/api/clean-dictation` that receives text, calls an LLM, and returns the cleaned result.
- Use a separate hosted service for the AI cleanup while keeping the Text Utilities page static.
- Use a local model or desktop wrapper if privacy, offline use, or avoiding hosted API keys matters.

## Useful Controls

- Clean up
- Make concise
- Keep my voice
- Format as email
- Format as message
- Format as paragraph
- Copy result

## Open Questions

- Should this live inside Text Utilities, or become its own app?
- Is the main input pasted text from Windows dictation, browser-native dictation, uploaded audio, or all of the above?
- Should the tool preserve the speaker's style closely, or produce polished neutral prose?
- Should it support local/private AI models?
- Is this a quick cleanup utility, or a larger writing workflow?

## Current Decision

Shelve the idea for now, but preserve it so it can be revisited later as either a Text Utilities feature, a standalone web page, or separate software.

This is now also captured as part of a possible downloadable desktop suite in [Desktop Text Utilities Idea](desktop-text-utilities.md).
