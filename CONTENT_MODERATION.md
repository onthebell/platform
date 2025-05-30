# Content Moderation Configuration

## Overview

OnTheBell uses OpenAI's Moderation API to automatically check user-generated
content (posts and comments) for inappropriate material before it's published to
the platform. This helps maintain a safe and welcoming community environment.

## Environment Variables

To enable content moderation, you need to set up the following environment
variable:

### Required

```env
OPENAI_API_KEY=your_openai_api_key_here
```

**How to get an OpenAI API key:**

1. Visit [OpenAI's platform](https://platform.openai.com/)
2. Sign up for an account or log in
3. Navigate to the API keys section
4. Create a new API key
5. Copy the key and add it to your `.env.local` file

### Optional

```env
# Content Moderation Settings (optional - will use defaults if not set)
MODERATION_ENABLED=true  # Set to false to disable moderation entirely
```

## Configuration Files

Add these variables to your local environment file:

**`.env.local`** (for local development):

```env
OPENAI_API_KEY=sk-your-actual-key-here
MODERATION_ENABLED=true
```

**Production Environment:**

- Set the `OPENAI_API_KEY` in your hosting platform's environment variables
- Ensure the key has appropriate usage limits and billing set up

## How It Works

### Content Checking Process

1. **User submits content**: When a user creates a post or comment
2. **Automatic moderation**: Content is sent to OpenAI's Moderation API
3. **Safety check**: API analyzes content for:
   - Harassment
   - Hate speech
   - Violence
   - Sexual content
   - Self-harm
   - Illegal activities
4. **Result handling**:
   - ✅ **Safe content**: Published immediately
   - ❌ **Inappropriate content**: Rejected with explanation
   - ⚠️ **API unavailable**: Content allowed through (graceful degradation)

### API Endpoints

- **POST `/api/moderate`**: Internal endpoint for content moderation
  - Input: `{ content: string }`
  - Output: `{ isAppropriate: boolean, reason?: string }`

### Components Using Moderation

- **Post Creation** (`/community/create`): Validates title + description
- **Post Editing** (`/community/edit/[postId]`): Re-validates on updates
- **Comments** (`CommentForm`): Validates comment text

## Error Handling

The moderation system includes robust error handling:

### User-Facing Errors

- **Inappropriate Content**: Clear message explaining why content was rejected
- **Network Issues**: Temporary error message with retry option
- **Rate Limiting**: Friendly message asking user to wait

### Graceful Degradation

If the OpenAI API is unavailable:

- Content is allowed through to avoid blocking users
- Errors are logged for monitoring
- No user-facing error is shown

### Example Error Messages

```
❌ "Your content was flagged for inappropriate language. Please revise and try again."
❌ "Your post contains content that violates our community guidelines."
⚠️ "Unable to check content right now. Please try again in a moment."
```

## Development

### Testing

The moderation system includes comprehensive tests:

```bash
# Run moderation-specific tests
pnpm test moderation

# Run all tests
pnpm test
```

### Mocking for Development

When `OPENAI_API_KEY` is not set:

- Tests use mocked responses
- Development mode allows all content through
- Console warnings indicate moderation is disabled

### Rate Limits

OpenAI's Moderation API has generous rate limits:

- **Free tier**: 1,000 requests per day
- **Paid tier**: Higher limits based on usage plan

Monitor usage in your OpenAI dashboard to avoid hitting limits.

## Security Considerations

### API Key Security

- ✅ **DO**: Store API key in environment variables only
- ✅ **DO**: Use separate keys for development and production
- ❌ **DON'T**: Commit API keys to version control
- ❌ **DON'T**: Expose keys in client-side code

### Content Privacy

- Content is sent to OpenAI for moderation
- OpenAI's data usage policy applies
- Consider privacy implications for sensitive communities

### Backup Moderation

While automated moderation catches most issues:

- Implement user reporting system for edge cases
- Have community moderators for manual review
- Monitor for false positives/negatives

## Troubleshooting

### Common Issues

**"Moderation service unavailable"**

- Check your OpenAI API key is correct
- Verify you have credits/quota remaining
- Check OpenAI status page for outages

**High latency**

- Normal response time is 200-500ms
- Network issues may cause delays
- Users see loading states during checks

**False positives**

- Some legitimate content may be flagged
- Implement appeal/review process
- Consider adjusting sensitivity if needed

### Monitoring

Track these metrics in production:

- Moderation API response times
- Success/failure rates
- Content flagging rates
- User experience impact

## Cost Considerations

OpenAI Moderation API pricing (as of 2024):

- Very affordable for most use cases
- Typically $0.002 per 1K tokens
- Monitor usage in OpenAI dashboard

Estimate costs based on:

- Number of posts/comments per day
- Average content length
- User activity patterns
