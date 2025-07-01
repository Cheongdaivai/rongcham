# 📸 Image Upload Feature Setup

This guide will help you set up the image upload functionality for your menu items using Supabase Storage.

## 🪣 Supabase Storage Setup

### 1. Create Storage Bucket
You mentioned you already have a `menu_images` bucket. If not, create it:

1. Go to your Supabase dashboard
2. Navigate to **Storage**
3. Click **New bucket**
4. Name it `menu_images`
5. Set it to **Public** bucket

### 2. Set Bucket Policies
**Important: Use the Supabase Dashboard (SQL method often has permission issues)**

#### Method 1: Dashboard (Recommended)
1. Go to your Supabase dashboard
2. Navigate to **Storage** → **Policies**
3. You'll see `storage.objects` table - click **New Policy**
4. Create these 4 policies:

**Policy 1: Allow Upload**
- **Policy Name**: `Allow authenticated upload to menu_images`
- **Allowed Operation**: `INSERT`
- **Target Roles**: `authenticated`
- **USING expression**: `bucket_id = 'menu_images'`

**Policy 2: Allow Public Read**
- **Policy Name**: `Allow public read from menu_images`
- **Allowed Operation**: `SELECT`
- **Target Roles**: `public`
- **USING expression**: `bucket_id = 'menu_images'`

**Policy 3: Allow Delete**
- **Policy Name**: `Allow authenticated delete from menu_images`
- **Allowed Operation**: `DELETE`
- **Target Roles**: `authenticated`
- **USING expression**: `bucket_id = 'menu_images'`

**Policy 4: Allow Update**
- **Policy Name**: `Allow authenticated update in menu_images`
- **Allowed Operation**: `UPDATE`
- **Target Roles**: `authenticated`
- **USING expression**: `bucket_id = 'menu_images'`

#### Method 2: SQL (Only if you have admin access)
If the dashboard method doesn't work, you can try these SQL commands:

```sql
-- Enable RLS (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "menu_images_upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'menu_images');
CREATE POLICY "menu_images_read" ON storage.objects FOR SELECT USING (bucket_id = 'menu_images');
CREATE POLICY "menu_images_delete" ON storage.objects FOR DELETE USING (bucket_id = 'menu_images');
CREATE POLICY "menu_images_update" ON storage.objects FOR UPDATE USING (bucket_id = 'menu_images');
```

### 3. Environment Variables
Make sure these are in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # For admin operations
```

## 🍽️ Features Included

### ✨ **Image Upload**
- **File Types**: JPEG, PNG, WebP
- **Size Limit**: 5MB maximum
- **Storage**: Supabase Storage bucket
- **Preview**: Real-time image preview before upload

### 🔒 **Security**
- User authentication required
- File type validation
- File size validation
- Unique filename generation (timestamp-based)

### 🧹 **Cleanup**
- Automatic image deletion when menu items are deleted
- Old image cleanup when replacing with new images

### 📱 **User Experience**
- Drag-and-drop style upload interface
- Loading states during upload
- Error handling with user-friendly messages
- Image preview with remove option

## 🚀 **Usage**

### For Users:
1. **Add Menu Item**: Click "Add Menu Item" → Upload image → Fill details → Save
2. **Edit Menu Item**: Click "Edit" → Change image or keep existing → Update
3. **Replace Image**: Upload new image (automatically replaces old one)
4. **Remove Image**: Click trash icon in preview

### For Developers:
- **API Endpoint**: `/api/upload-image` (POST for upload, DELETE for cleanup)
- **Image Utils**: Helper functions in `src/lib/image-utils.ts`
- **Storage Integration**: Direct Supabase storage integration

## 🔧 **File Structure**
```
src/
├── app/api/upload-image/route.ts    # Image upload API
├── components/MenuItemModal.tsx     # Updated with upload UI
├── lib/image-utils.ts              # Image utility functions
└── app/admin/dashboard/page.tsx    # Updated with cleanup logic
```

## 🎨 **UI Components**
- **Upload Button**: Styled with dashed border
- **Preview Container**: 48px height with overlay controls
- **Loading States**: Spinner animations during upload
- **Error Handling**: Alert messages for validation failures

## 📋 **Validation Rules**
- ✅ Image files only (JPEG, PNG, WebP)
- ✅ Maximum 5MB file size
- ✅ Authenticated users only
- ✅ Unique filenames to prevent conflicts

## 🍷 **Fine Dining Experience**
The upload interface maintains the elegant aesthetic of your restaurant platform:
- Sophisticated rounded corners and gradients
- Smooth transitions and hover effects
- Professional color scheme with blue accents
- Responsive design for all devices

## 🔧 **Troubleshooting**

### Common Issues:

**1. "must be owner of table objects" Error**
- This is a permission issue with SQL commands
- **Solution**: Use the Dashboard method (Method 1 above) instead of SQL
- The dashboard provides the proper interface for creating storage policies

**2. "Access denied" when uploading**
- Check if storage policies are correctly set up via dashboard
- Ensure user is authenticated
- Verify bucket permissions in Supabase dashboard

**3. Images not loading/displaying**
- Ensure bucket is set to **Public**
- Check if public read policy is active
- Verify the image URL format

**4. Upload fails silently**
- Check browser console for errors
- Verify file size (must be under 5MB)
- Ensure file type is supported (JPEG, PNG, WebP)

**5. Environment variables not working**
- Restart development server after adding `.env.local`
- Check variable names are exactly as specified
- Ensure no extra spaces in environment file

### Step-by-Step Policy Creation (Dashboard):
1. **Storage** → **Policies** → **New Policy**
2. Choose **For full customization**
3. Select `storage.objects` as target
4. Set operation (INSERT, SELECT, DELETE, UPDATE)
5. Add condition: `bucket_id = 'menu_images'`
6. Save and repeat for each operation

This feature enhances your digital menu management with modern file upload capabilities while maintaining the premium feel of your fine dining application! 🥂
