export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getDb, getUserIdFromRequest } from '@/lib/mongodb';

type ProductDoc = {
  userId: string;
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category?: string;
  created?: string;
  createdAt: string;
  updatedAt?: string;
};

function stripMongoId<T extends Record<string, any>>(doc: T) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _id, ...rest } = doc;
  return rest;
}

export async function GET(request: Request) {
  const userId = getUserIdFromRequest(request);
  const db = await getDb();
  const items = await db
    .collection<ProductDoc>('products')
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray();

  return NextResponse.json({ data: items.map(stripMongoId) });
}

export async function POST(request: Request) {
  const userId = getUserIdFromRequest(request);
  const body = (await request.json()) as Partial<ProductDoc>;

  if (!body?.name || typeof body.name !== 'string' || !body.name.trim()) {
    return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
  }
  if (typeof body.price !== 'number' || Number.isNaN(body.price)) {
    return NextResponse.json({ error: 'Product price must be a number' }, { status: 400 });
  }
  if (!body.unit || typeof body.unit !== 'string') {
    return NextResponse.json({ error: 'Product unit is required' }, { status: 400 });
  }

  const now = new Date().toISOString();
  const doc: ProductDoc = {
    userId,
    id: body.id || Date.now().toString(),
    name: body.name.trim(),
    description: (body.description || '').toString(),
    price: body.price,
    unit: body.unit,
    category: body.category ? String(body.category) : undefined,
    created: body.created ? String(body.created) : undefined,
    createdAt: now,
    updatedAt: now,
  };

  const db = await getDb();
  await db.collection<ProductDoc>('products').insertOne(doc);
  return NextResponse.json({ data: doc }, { status: 201 });
}

export async function PUT(request: Request) {
  const userId = getUserIdFromRequest(request);
  const body = (await request.json()) as Partial<ProductDoc> & { id?: string };
  const id = body?.id;
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  const update: Partial<ProductDoc> = {
    ...(body.name !== undefined ? { name: String(body.name) } : {}),
    ...(body.description !== undefined ? { description: String(body.description) } : {}),
    ...(body.price !== undefined ? { price: Number(body.price) } : {}),
    ...(body.unit !== undefined ? { unit: String(body.unit) } : {}),
    ...(body.category !== undefined ? { category: body.category ? String(body.category) : undefined } : {}),
    updatedAt: new Date().toISOString(),
  };

  const db = await getDb();
  const result = await db
    .collection<ProductDoc>('products')
    .findOneAndUpdate({ userId, id }, { $set: update }, { returnDocument: 'after' });

  if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  // @ts-expect-error mongodb types vary by version
  return NextResponse.json({ data: stripMongoId(result) });
}

export async function DELETE(request: Request) {
  const userId = getUserIdFromRequest(request);
  const body = (await request.json().catch(() => ({}))) as { id?: string };
  if (!body?.id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  const db = await getDb();
  const result = await db.collection<ProductDoc>('products').deleteOne({ userId, id: body.id });
  return NextResponse.json({ ok: result.deletedCount === 1 });
}

