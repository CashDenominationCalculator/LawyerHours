import { NextResponse } from 'next/server';
import { validateApiKey, testApiKey } from '@/lib/google-places';

export async function GET() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const keyValidation = validateApiKey(apiKey);

  if (!keyValidation.valid) {
    return NextResponse.json({
      configured: false,
      valid: false,
      error: keyValidation.error,
    });
  }

  // Test with a live API call
  const testResult = await testApiKey(apiKey!);

  return NextResponse.json({
    configured: true,
    valid: testResult.valid,
    error: testResult.error || null,
    keyPrefix: apiKey!.substring(0, 8) + '...',
  });
}
