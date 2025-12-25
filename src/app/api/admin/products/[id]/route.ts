import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!

// ============================
// PATCH - Update product (admin only)
// ============================
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || id === 'undefined') {
      return NextResponse.json(
        { error: 'Bad Request', details: 'Product ID is required' },
        { status: 400 }
      );
    }

    // 1. Read Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'No access token provided' },
        { status: 401 }
      )
    }

    const accessToken = authHeader.replace('Bearer ', '')

    // 2. Create Supabase client with user token
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    })

    // 3. Validate user session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Invalid user session' },
        { status: 401 }
      )
    }

    // 4. Check admin role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden', details: 'Admin access required' },
        { status: 403 }
      )
    }

    // 5. Read request body
    const productData = await req.json()
    const updateData: any = {}

    // 6. Build update object (partial update)
    if (productData.name !== undefined) {
      updateData.name = productData.name
      updateData.slug = productData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    }
    if (productData.description !== undefined)
      updateData.description = productData.description
    if (productData.price !== undefined)
      updateData.price = productData.price
    if (productData.weight !== undefined)
      updateData.weight = productData.weight
    if (productData.image_url !== undefined)
      updateData.image_url = productData.image_url
    if (productData.images !== undefined)
      updateData.images = productData.images
    // If images array is provided but image_url is not, set image_url to first image
    if (productData.images && productData.images.length > 0 && productData.image_url === undefined)
      updateData.image_url = productData.images[0]
    if (productData.stock_quantity !== undefined)
      updateData.stock_quantity = productData.stock_quantity
    if (productData.is_active !== undefined)
      updateData.is_active = productData.is_active
    if (productData.ingredients !== undefined)
      updateData.ingredients = productData.ingredients
    if (productData.health_benefits !== undefined)
      updateData.health_benefits = productData.health_benefits
    if (productData.how_to_use !== undefined)
      updateData.how_to_use = productData.how_to_use
    if (productData.nutrition_facts !== undefined)
      updateData.nutrition_facts = productData.nutrition_facts

    // 7. Update product
    const { data: product, error: updateError } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update product', details: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, product })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// ============================
// DELETE - Delete product (admin only)
// ============================
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || id === 'undefined') {
      return NextResponse.json(
        { error: 'Bad Request', details: 'Product ID is required' },
        { status: 400 }
      );
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'No access token provided' },
        { status: 401 }
      )
    }

    const accessToken = authHeader.replace('Bearer ', '')

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    })

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Invalid user session' },
        { status: 401 }
      )
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden', details: 'Admin access required' },
        { status: 403 }
      )
    }

    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete product', details: deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
