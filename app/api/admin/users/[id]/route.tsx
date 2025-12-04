import { NextResponse } from 'next/server';
import User from '@/lib/models/User';
import Hotel from '@/lib/models/Hotel';
import { connectDB } from '@/lib/db';
import bcrypt from 'bcrypt';

// --- GET: Fetch Single User ---
export async function GET(request: Request, { params }: { params: { id: string } }) {
  await connectDB();

  try {
    const { id } = params;

    // Fetch user, populate hotel name, and exclude password
    const user = await User.findById(id)
      .select('-passwordHash')
      .populate('hotelId', 'name');

    if (!user) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}

// --- DELETE: Remove User ---
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  await connectDB();

  try {
    const { id } = params;
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User deleted successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}

// --- PATCH: Update User Details ---
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  await connectDB();

  try {
    const { id } = params;
    const body = await request.json();

    // 1. Prepare Update Object
    const updateData: any = {
      username: body.username,
      name: body.name,       // Explicitly handling name
      email: body.email,
      phone: body.phone,
      role: body.role,
    };

    // 2. Handle Password Update (Hash it if provided)
    if (body.password && body.password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      updateData.passwordHash = await bcrypt.hash(body.password, salt);
    }

    // 3. Handle Hotel Assignment
    // If role is NOT hotel, ensure hotelId is removed (null)
    if (body.role !== 'hotel') {
      updateData.hotelId = null;
    } else if (body.hotelId) {
      // Validate the Hotel ID exists
      const hotelExists = await Hotel.findById(body.hotelId);
      if (!hotelExists) {
        return NextResponse.json({ message: 'Invalid Hotel ID selected.' }, { status: 400 });
      }
      updateData.hotelId = body.hotelId;
    }

    // 4. Perform Update
    const updatedUser = await User.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    ).select('-passwordHash'); // Exclude password from response

    if (!updatedUser) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'User updated successfully.', 
      user: updatedUser 
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error updating user:', error);
    
    // Handle Duplicate Key Errors (e.g., duplicate username/email)
    if (error.code === 11000) {
      return NextResponse.json({ message: 'Username or Email already exists.' }, { status: 409 });
    }

    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}