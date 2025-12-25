import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Test user credentials (hardcoded in code)
const TEST_USER_EMAIL = 'razorpay-test@demo.com';
const TEST_USER_PASSWORD = 'Test@1234';

export async function GET() {
  try {
    if (!supabaseServiceKey) {
      return NextResponse.json(
        { 
          error: 'Service role key not configured',
          message: 'Add SUPABASE_SERVICE_ROLE_KEY to .env.local',
          instructions: [
            '1. Go to Supabase Dashboard → Settings → API',
            '2. Find "service_role" key (NOT anon key)',
            '3. Copy it and add to .env.local:',
            '   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here',
            '4. Restart your dev server',
            '',
            '⚠️ IMPORTANT: Use SERVICE_ROLE_KEY, not the anon/publishable key!'
          ]
        },
        { status: 500 }
      );
    }

    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Check if user already exists using Admin API
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      return NextResponse.json(
        { 
          error: 'Failed to check existing users',
          message: listError.message 
        },
        { status: 500 }
      );
    }

    const existingUser = existingUsers?.users?.find((u: any) => u.email === TEST_USER_EMAIL);

    if (existingUser) {
      // User exists - update password and ensure profile exists
      try {
        // Update password using Admin API
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          existingUser.id,
          {
            password: TEST_USER_PASSWORD,
            email_confirm: true // Ensure email is confirmed
          }
        );

        if (updateError) {
          return NextResponse.json(
            { 
              error: 'Failed to update user password',
              message: updateError.message 
            },
            { status: 500 }
          );
        }

        // Ensure profile exists with 'user' role
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .upsert({
            id: existingUser.id,
            role: 'user'
          }, {
            onConflict: 'id'
          });

        if (profileError && profileError.code !== '23505') {
          // 23505 is "unique violation" - profile might already exist from trigger
          console.warn('Profile update warning:', profileError);
        }

        return NextResponse.json({
          success: true,
          message: 'Test user already exists - password updated',
          email: TEST_USER_EMAIL,
          password: TEST_USER_PASSWORD,
          userId: existingUser.id
        });
      } catch (error: any) {
        return NextResponse.json(
          { 
            error: 'Failed to update existing user',
            message: error.message 
          },
          { status: 500 }
        );
      }
    }

    // Create new user using Admin API (CORRECT METHOD)
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
      email_confirm: true, // Auto-confirm email (no email verification needed)
    });

    if (createError) {
      return NextResponse.json(
        { 
          error: 'Failed to create user',
          message: createError.message,
          details: 'Make sure SUPABASE_SERVICE_ROLE_KEY is correct and has admin permissions'
        },
        { status: 500 }
      );
    }

    // Create profile with 'user' role (not admin)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: newUser.user.id,
        role: 'user', // Regular user, not admin
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      // Profile might already exist from trigger, or there's an issue
      if (profileError.code === '23505') {
        // Unique violation - profile already exists (probably from trigger)
        // Update it to ensure role is 'user'
        await supabaseAdmin
          .from('profiles')
          .update({ role: 'user' })
          .eq('id', newUser.user.id);
      } else {
        console.error('Profile creation error:', profileError);
        // Don't fail - user is created, profile can be fixed manually
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Test user created successfully!',
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
      userId: newUser.user.id,
      note: 'User created using Supabase Admin API (correct method)'
    });

  } catch (error: any) {
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
