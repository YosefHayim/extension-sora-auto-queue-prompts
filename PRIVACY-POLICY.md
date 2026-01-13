# Privacy Policy for Sora Auto Queue Prompts

**Last Updated**: January 2026

## Overview

Sora Auto Queue Prompts ("the Extension") is a browser extension that automates prompt generation and queue management for Sora AI. This privacy policy explains how we handle your data.

## Data Collection

### What We Collect

The extension stores the following data **locally on your device**:

| Data Type         | Purpose                         | Storage Location                 |
| ----------------- | ------------------------------- | -------------------------------- |
| OpenAI API Key    | Required to generate AI prompts | Chrome local storage (encrypted) |
| Generated Prompts | Your prompt queue               | Chrome local storage             |
| Queue State       | Track processing status         | Chrome local storage             |
| User Preferences  | Theme, batch size, delays       | Chrome local storage             |

### What We DO NOT Collect

- ❌ Personal information (name, email, address)
- ❌ Browsing history
- ❌ Data from other websites
- ❌ Analytics or tracking data
- ❌ Advertising identifiers
- ❌ Location data

## Data Storage

**All data is stored locally on your device** using Chrome's built-in storage APIs. We do not operate any servers or databases. Your data never leaves your device except when:

1. **Sending prompts to OpenAI** (when you generate prompts)
2. **Interacting with Sora** (when you process the queue)

## Data Transmission

### OpenAI API

When you use the "Generate Prompts" feature:

- Your context text and settings are sent to OpenAI's API
- This uses **your own API key** that you provide
- This transmission is governed by [OpenAI's Privacy Policy](https://openai.com/privacy/)
- We do not see, store, or log your API requests

### Sora Website

When you process your prompt queue:

- Prompts are submitted to sora.com via browser automation
- This happens in your browser, as if you typed the prompts yourself
- No data is sent to our servers

## Permissions Explained

| Permission         | Why We Need It                                            |
| ------------------ | --------------------------------------------------------- |
| `activeTab`        | Access the current Sora tab to inject prompts             |
| `storage`          | Save your settings and prompt queue locally               |
| `scripting`        | Interact with Sora's webpage (fill forms, click buttons)  |
| `tabs`             | Find and communicate with the Sora tab                    |
| `downloads`        | Auto-download generated images/videos and export prompts  |
| `webRequest`       | Monitor Sora API responses for completion detection       |
| `notifications`    | Alert you when rate limits are reached or queue completes |
| `host_permissions` | Access sora.com and sora.chatgpt.com for automation       |

## Data Security

- Your OpenAI API key is stored in Chrome's secure local storage
- The key is never transmitted to our servers
- The key is never logged or exposed in the extension
- You can delete all stored data by removing the extension

## Third-Party Services

### OpenAI

This extension integrates with OpenAI's API for prompt generation:

- **Service**: OpenAI API (GPT models)
- **Data Sent**: Your context text, prompt count, generation settings
- **Their Policy**: [OpenAI Privacy Policy](https://openai.com/privacy/)

### Sora (OpenAI)

This extension automates interactions with Sora:

- **Service**: Sora (sora.com)
- **Data Sent**: Your prompts (via browser automation)
- **Their Policy**: [OpenAI Privacy Policy](https://openai.com/privacy/)

## Your Rights

### Access Your Data

- All your data is visible in the extension popup
- Queue, settings, and prompts are all displayed in the UI

### Delete Your Data

- Click "Delete All" in the extension to clear all prompts
- Remove the extension to delete all stored data
- Use Chrome's "Clear browsing data" to clear extension storage

### Export Your Data

- Use the "Export" button to download your prompts as CSV or JSON

## Children's Privacy

This extension is not intended for children under 13. We do not knowingly collect data from children.

## Changes to This Policy

We may update this privacy policy from time to time. Changes will be:

- Posted on this page with an updated date
- Noted in the extension's changelog for significant changes

## Contact Us

If you have questions about this privacy policy:

- **GitHub Issues**: [Open an Issue](https://github.com/YosefHayim/extension-sora-auto-queue-prompts/issues)
- **Repository**: [GitHub Repository](https://github.com/YosefHayim/extension-sora-auto-queue-prompts)

## Summary

| Question                      | Answer                    |
| ----------------------------- | ------------------------- |
| Do you collect personal data? | No                        |
| Do you sell data?             | No                        |
| Do you track users?           | No                        |
| Where is data stored?         | Locally on your device    |
| Can I delete my data?         | Yes, remove the extension |
| Do you operate servers?       | No                        |

---

**Effective Date**: December 2024  
**Version**: 1.0
