'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { fetchJson } from '@/lib/api-client';
import Avatar from '@/components/shared/Avatar';
import { getInitials, getAvatarColor, slugify } from '@/lib/utils';

interface SignatureResponse {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
}

interface UpdateProfileResponse {
  user: {
    id: string;
    bio: string | null;
    year: number | null;
    dept: string | null;
    image: string | null;
    banner: string | null;
  };
}

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [bio, setBio] = useState('');
  const [year, setYear] = useState<number | null>(null);
  const [dept, setDept] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [saving, setSaving] = useState(false);

  // Sync state with session values
  useEffect(() => {
    if (session?.user) {
      setBio(session.user.bio ?? '');
      setYear(session.user.year ?? null);
      setDept(session.user.dept ?? '');
      setImage(session.user.image ?? null);
      setBanner(session.user.banner ?? null);
    }
  }, [session]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploading(true);
    try {
      // Get signed signature
      const sig = await fetchJson<SignatureResponse>('/api/upload/signature', {
        method: 'POST',
      });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', sig.apiKey);
      formData.append('timestamp', String(sig.timestamp));
      formData.append('signature', sig.signature);
      formData.append('folder', sig.folder);

      // Upload directly to Cloudinary
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!res.ok) throw new Error('Cloudinary upload failed');
      const data = (await res.json()) as { secure_url: string };

      setImage(data.secure_url);
      toast.success('Avatar uploaded successfully!');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploadingBanner(true);
    try {
      const sig = await fetchJson<SignatureResponse>('/api/upload/signature', { method: 'POST' });
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', sig.apiKey);
      formData.append('timestamp', String(sig.timestamp));
      formData.append('signature', sig.signature);
      formData.append('folder', sig.folder);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Cloudinary upload failed');
      const data = (await res.json()) as { secure_url: string };

      setBanner(data.secure_url);
      toast.success('Banner uploaded successfully!');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload banner');
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetchJson<UpdateProfileResponse>('/api/user/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          bio: bio.trim() || null,
          year: year || null,
          dept: dept.trim() || null,
          image: image || null,
          banner: banner || null,
        }),
      });

      // Update next-auth session state
      await update({
        ...session,
        user: {
          ...session?.user,
          bio: response.user.bio,
          year: response.user.year,
          dept: response.user.dept,
          image: response.user.image,
          banner: response.user.banner,
        },
      });

      toast.success('Profile settings updated successfully!');
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const initials = getInitials(session?.user?.name ?? 'Student');
  const avatarColor = getAvatarColor(session?.user?.id ?? 'default');

  return (
    <div className="mx-auto max-w-[560px] px-4 py-8 sm:px-6">
      <h1 className="text-[20px] font-medium text-[var(--text-primary)]">
        Account Settings
      </h1>
      <p className="mt-1.5 text-[12px] text-[var(--text-secondary)]">
        Update your campus profile information and avatar
      </p>

      <form onSubmit={handleSave} className="mt-6 flex flex-col gap-5">
        {/* Avatar Card */}
        <div className="rounded-card border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] p-5">
          <h2 className="text-[14px] font-medium text-[var(--text-primary)]">
            Profile Picture
          </h2>
          <div className="mt-4 flex items-center gap-4">
            <Avatar initials={initials} color={avatarColor} size={64} src={image} />
            <div className="flex flex-col gap-2">
              <button
                type="button"
                disabled={uploading || saving}
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 rounded bg-[var(--accent-fill)] px-3.5 py-1.5 text-[12px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-45"
              >
                {uploading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Upload className="h-3.5 w-3.5" />
                )}
                Upload Avatar
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
              <p className="text-[11px] text-[var(--text-muted)]">
                Recommended: Square image, PNG or JPG. Max 5MB.
              </p>
            </div>
          </div>
          
          <h2 className="mt-8 text-[14px] font-medium text-[var(--text-primary)]">
            Banner Image
          </h2>
          <div className="mt-4 flex flex-col gap-4">
            {banner && (
              <div className="h-[120px] w-full overflow-hidden rounded-[8px] border border-[var(--border)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={banner} alt="Banner" className="h-full w-full object-cover" />
              </div>
            )}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                disabled={uploadingBanner || saving}
                onClick={() => bannerInputRef.current?.click()}
                className="flex items-center justify-center gap-2 rounded bg-[var(--bg-panel)] border border-[var(--border-med)] px-3.5 py-2 text-[12px] font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--bg-page)] disabled:opacity-45"
              >
                {uploadingBanner ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Upload className="h-3.5 w-3.5" />
                )}
                {banner ? 'Change Banner' : 'Upload Banner'}
              </button>
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleBannerUpload}
              />
              <p className="text-[11px] text-[var(--text-muted)] text-center">
                Recommended: Wide image (e.g., 1440x240). It will be auto-adjusted to fit.
              </p>
            </div>
          </div>
        </div>

        {/* Profile Info Card */}
        <div className="flex flex-col gap-4 rounded-card border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] p-5">
          <h2 className="text-[14px] font-medium text-[var(--text-primary)]">
            Profile Details
          </h2>

          {/* Department */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-[var(--text-secondary)]">
              Department
            </label>
            <input
              type="text"
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              placeholder="e.g. CSE, IT, ME, ECE"
              maxLength={50}
              className="rounded border-[0.5px] border-[var(--border-med)] bg-[var(--bg-panel)] px-3 py-2 text-[13px] text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent)]"
            />
          </div>

          {/* Year */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-[var(--text-secondary)]">
              College Year
            </label>
            <select
              value={year ?? ''}
              onChange={(e) =>
                setYear(e.target.value ? Number(e.target.value) : null)
              }
              className="rounded border-[0.5px] border-[var(--border-med)] bg-[var(--bg-panel)] px-3 py-2 text-[13px] text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent)]"
            >
              <option value="" disabled>
                Select your academic year
              </option>
              <option value="1">Year 1 (Freshman)</option>
              <option value="2">Year 2 (Sophomore)</option>
              <option value="3">Year 3 (Junior)</option>
              <option value="4">Year 4 (Senior)</option>
            </select>
          </div>

          {/* Bio */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[12px] font-medium text-[var(--text-secondary)]">
                About Bio
              </label>
              <span className="text-[11px] text-[var(--text-muted)]">
                {bio.length}/500
              </span>
            </div>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={500}
              placeholder="Tell other students a bit about yourself..."
              rows={4}
              className="resize-none rounded border-[0.5px] border-[var(--border-med)] bg-[var(--bg-panel)] px-3 py-2 text-[13px] text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent)]"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            disabled={saving || uploading}
            onClick={() => router.push(`/profile/${slugify(session?.user?.name ?? '')}`)}
            className="rounded px-4 py-2 text-[12px] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || uploading || uploadingBanner}
            className="flex items-center gap-1.5 rounded bg-[var(--accent-fill)] px-5 py-2 text-[12px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
