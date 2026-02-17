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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _id, ...rest } = doc;
  return rest;
}

export async function GET(request: Request) {
  const userId = getUserIdFromRequest(request);
  const db = await getDb();
  const items = await db
    .collection<EmployeeDoc>('employees')
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray();

  return NextResponse.json({ data: items.map(stripMongoId) });
}

export async function POST(request: Request) {
  const userId = getUserIdFromRequest(request);
  const body = (await request.json()) as Partial<EmployeeDoc>;

  if (!body?.name || typeof body.name !== 'string' || !body.name.trim()) {
    return NextResponse.json({ error: 'Employee name is required' }, { status: 400 });
  }
  if (!body?.role) return NextResponse.json({ error: 'Role is required' }, { status: 400 });
  if (!body?.joiningDate) return NextResponse.json({ error: 'Joining date is required' }, { status: 400 });
  if (typeof body.salary !== 'number' || Number.isNaN(body.salary)) {
    return NextResponse.json({ error: 'Salary must be a number' }, { status: 400 });
  }

  const now = new Date().toISOString();
  const doc: EmployeeDoc = {
    userId,
    id: body.id || Date.now().toString(),
    name: body.name.trim(),
    contact: (body.contact || '').toString(),
    role: String(body.role),
    joiningDate: String(body.joiningDate),
    salary: body.salary,
    status: (body.status as EmployeeDoc['status']) || 'Active',
    address: body.address ? String(body.address) : undefined,
    createdAt: now,
    updatedAt: now,
  };

  const db = await getDb();
  await db.collection<EmployeeDoc>('employees').insertOne(doc);
  return NextResponse.json({ data: doc }, { status: 201 });
}

export async function PUT(request: Request) {
  const userId = getUserIdFromRequest(request);
  const body = (await request.json()) as Partial<EmployeeDoc> & { id?: string };
  const id = body?.id;
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  const update: Partial<EmployeeDoc> = {
    ...(body.name !== undefined ? { name: String(body.name) } : {}),
    ...(body.contact !== undefined ? { contact: String(body.contact) } : {}),
    ...(body.role !== undefined ? { role: String(body.role) } : {}),
    ...(body.joiningDate !== undefined ? { joiningDate: String(body.joiningDate) } : {}),
    ...(body.salary !== undefined ? { salary: Number(body.salary) } : {}),
    ...(body.status !== undefined ? { status: body.status as EmployeeDoc['status'] } : {}),
    ...(body.address !== undefined ? { address: body.address ? String(body.address) : undefined } : {}),
    updatedAt: new Date().toISOString(),
  };

  const db = await getDb();
  const result = await db
    .collection<EmployeeDoc>('employees')
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
  const result = await db.collection<EmployeeDoc>('employees').deleteOne({ userId, id: body.id });
  return NextResponse.json({ ok: result.deletedCount === 1 });
}

