import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/database';
import { Calculation } from '@/entity/Calculation';

export async function GET() {
  try {
    const ds = await getDataSource();
    const repo = ds.getRepository(Calculation);
    const calculations = await repo.find({
      order: { createdAt: 'DESC' },
      take: 50,
    });
    return NextResponse.json({ calculations });
  } catch (error) {
    console.error('GET /api/history error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { expression, result } = body as { expression: string; result: string };

    if (!expression || result === undefined) {
      return NextResponse.json(
        { error: 'Missing expression or result' },
        { status: 400 }
      );
    }

    const ds = await getDataSource();
    const repo = ds.getRepository(Calculation);
    const calc = repo.create({ expression, result });
    await repo.save(calc);

    return NextResponse.json({ calculation: calc }, { status: 201 });
  } catch (error) {
    console.error('POST /api/history error:', error);
    return NextResponse.json(
      { error: 'Failed to save calculation' },
      { status: 500 }
    );
  }
}
