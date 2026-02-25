import { BetaSubmission } from '../types';
import { validateEmail } from './validation';

const submissionCache = new Map<string, BetaSubmission>();

export async function handleBetaSubmit(email: string): Promise<BetaSubmission> {
  // Check cache for duplicate submissions
  if (submissionCache.has(email)) {
    return submissionCache.get(email)!;
  }

  // Validate email
  if (!validateEmail(email)) {
    const errorResult: BetaSubmission = {
      email,
      timestamp: Date.now(),
      status: 'error',
      message: 'Invalid email format'
    };
    return errorResult;
  }

  try {
    const response = await fetch('/api/beta-signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, timestamp: Date.now() })
    });

    if (response.ok) {
      const successResult: BetaSubmission = {
        email,
        timestamp: Date.now(),
        status: 'success',
        message: 'Successfully joined beta waitlist'
      };
      submissionCache.set(email, successResult);
      return successResult;
    } else {
      throw new Error('Submission failed');
    }
  } catch (error) {
    console.error('Beta submission error:', error);
    const errorResult: BetaSubmission = {
      email,
      timestamp: Date.now(),
      status: 'error',
      message: 'Submission failed. Please try again.'
    };
    return errorResult;
  }
}
