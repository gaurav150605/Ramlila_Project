export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getDb, getUserIdFromRequest } from '@/lib/mongodb';

type EmployeeDoc = {
  userId: string;
  id: string;
  name: string;
  contact: string;
  role: string;
  joiningDate: string;
  salary: number;
  status: 'Active' | 'Inactive';
  address?: string;
  createdAt: string;
  updatedAt?: string;
};

function stripMongoId<T extends Record<string, any>>(doc: T) {
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
    .collection<EmployeeDoc>('employees')
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray();

  return NextResponse.json({ data: items.map(stripMongoId) });
}

/* ================== POST ================== */
export async function POST(request: Request) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json()) as Partial<EmployeeDoc>;

  if (!body?.name?.trim()) {
    return NextResponse.json({ error: 'Employee name is required' }, { status: 400 });
  }

  if (!body?.role) {
    return NextResponse.json({ error: 'Role is required' }, { status: 400 });
  }

  if (!body?.joiningDate) {
    return NextResponse.json({ error: 'Joining date is required' }, { status: 400 });
  }

  if (typeof body.salary !== 'number' || Number.isNaN(body.salary)) {
    return NextResponse.json({ error: 'Salary must be a number' }, { status: 400 });
  }

  const now = new Date().toISOString();

  const doc: EmployeeDoc = {
    userId,
    id: body.id || crypto.randomUUID(), // better than Date.now()
    name: body.name.trim(),
    contact: body.contact?.toString() || '',
    role: body.role.toString(),
    joiningDate: body.joiningDate.toString(),
    salary: body.salary,
    status: body.status || 'Active',
    address: body.address?.toString(),
    createdAt: now,
    updatedAt: now,
  };

  const db = await getDb();
  await db.collection<EmployeeDoc>('employees').insertOne(doc);

  return NextResponse.json({ data: doc }, { status: 201 });
}

/* ================== PUT ================== */
export async function PUT(request: Request) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json()) as Partial<EmployeeDoc> & { id?: string };

  if (!body?.id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const update: Partial<EmployeeDoc> = {
    ...(body.name !== undefined && { name: String(body.name) }),
    ...(body.contact !== undefined && { contact: String(body.contact) }),
    ...(body.role !== undefined && { role: String(body.role) }),
    ...(body.joiningDate !== undefined && { joiningDate: String(body.joiningDate) }),
    ...(body.salary !== undefined && { salary: Number(body.salary) }),
    ...(body.status !== undefined && { status: body.status }),
    ...(body.address !== undefined && { address: body.address?.toString() }),
    updatedAt: new Date().toISOString(),
  };

  const db = await getDb();

  const result = await db
    .collection<EmployeeDoc>('employees')
    .findOneAndUpdate(
      { userId, id: body.id },
      { $set: update },
      { returnDocument: 'after' }
    );

  if (!result?.value) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ data: stripMongoId(result.value) });
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
    .collection<EmployeeDoc>('employees')
    .deleteOne({ userId, id: body.id });

  return NextResponse.json({ ok: result.deletedCount === 1 });
}