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
  createdAt: string;
  updatedAt: string;
};

function stripMongoId<T extends { _id?: unknown }>(doc: T) {
  const { _id, ...rest } = doc;
  return rest;
}

/* ================== GET ================== */
export async function GET(request: Request) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = await getDb();

  const items = await db
    .collection<ProductDoc>('products')
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray();

  return NextResponse.json({
    data: items.map(stripMongoId),
  });
}

/* ================== POST ================== */
export async function POST(request: Request) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json()) as Partial<ProductDoc>;

  if (!body?.name?.trim()) {
    return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
  }

  if (typeof body.price !== 'number' || Number.isNaN(body.price)) {
    return NextResponse.json({ error: 'Product price must be a valid number' }, { status: 400 });
  }

  if (!body?.unit?.trim()) {
    return NextResponse.json({ error: 'Product unit is required' }, { status: 400 });
  }

  const now = new Date().toISOString();

  const doc: ProductDoc = {
    userId,
    id: body.id || crypto.randomUUID(), // safer than Date.now()
    name: body.name.trim(),
    description: body.description ? String(body.description) : '',
    price: body.price,
    unit: body.unit.trim(),
    category: body.category ? String(body.category) : undefined,
    createdAt: now,
    updatedAt: now,
  };

  const db = await getDb();
  await db.collection<ProductDoc>('products').insertOne(doc);

  return NextResponse.json({ data: doc }, { status: 201 });
}

/* ================== PUT ================== */
export async function PUT(request: Request) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json()) as Partial<ProductDoc> & { id?: string };

  if (!body?.id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const update: Partial<ProductDoc> = {
    ...(body.name !== undefined && { name: String(body.name).trim() }),
    ...(body.description !== undefined && { description: String(body.description) }),
    ...(body.price !== undefined && {
      price: Number.isNaN(Number(body.price)) ? 0 : Number(body.price),
    }),
    ...(body.unit !== undefined && { unit: String(body.unit).trim() }),
    ...(body.category !== undefined && {
      category: body.category ? String(body.category) : undefined,
    }),
    updatedAt: new Date().toISOString(),
  };

  const db = await getDb();

  const updatedDoc = await db
    .collection<ProductDoc>('products')
    .findOneAndUpdate(
      { userId, id: body.id },
      { $set: update },
      { returnDocument: 'after' }
    );

  if (!updatedDoc) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({
    data: stripMongoId(updatedDoc),
  });
}

/* ================== DELETE ================== */
export async function DELETE(request: Request) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { id?: string };

  if (!body?.id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const db = await getDb();

  const result = await db
    .collection<ProductDoc>('products')
    .deleteOne({ userId, id: body.id });

  return NextResponse.json({
    ok: result.deletedCount === 1,
  });
}
