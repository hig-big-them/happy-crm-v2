/**
 * Text-based save endpoint to bypass JSON issues
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Just return plain text to test if the issue is with JSON
    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    return new NextResponse('ERROR', { status: 500 });
  }
}