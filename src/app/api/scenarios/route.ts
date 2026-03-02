import { NextResponse } from 'next/server';
import { getAllScenarios } from '@/lib/scenarios';

export async function GET() {
    const scenarios = getAllScenarios();
    return NextResponse.json({ scenarios });
}
