'use client';

import { useState, useRef } from 'react';
import { Pencil, Lock, Loader2, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { fetchJson } from '@/lib/api-client';

const BIO_MAX = 160;

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

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    name: string;
    email: string;
    bio?: string | null;
    year?: number | null;
    dept?: string | null;
    banner?: string | null;
  };
}

export default function EditProfileDialog({ open, onOpenChange, user }: EditProfileDialogProps) {
  const initialName = user.name ?? '';
  const initialBio = user.bio ?? '';
  const initialYear = user.year ?? null;
  const initialDept = user.dept ?? '';
  const initialBanner = user.banner ?? null;

  const router = useRouter();
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(initialName);
  const [bio, setBio] = useState(initialBio);
  const [year, setYear] = useState<number | null>(initialYear);
  const [dept, setDept] = useState(initialDept);
  const [banner, setBanner] = useState<string | null>(initialBanner);
  
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [saving, setSaving] = useState(false);

  function reset() {
    setName(initialName);
    setBio(initialBio);
    setYear(initialYear);
    setDept(initialDept);
    setBanner(initialBanner);
  }

  function handleClose() {
    reset();
    onOpenChange(false);
  }

  const dirty =
    name !== initialName || bio !== initialBio || year !== initialYear || dept !== initialDept || banner !== initialBanner;
  const canSave = dirty && name.trim().length > 0;

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

  async function handleSubmit() {
    if (!canSave) return;
    setSaving(true);
    try {
      await fetchJson<UpdateProfileResponse>('/api/user/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          bio: bio.trim() || null,
          year: year || null,
          dept: dept.trim() || null,
          banner: banner || null,
          // Note: name update is not supported by /api/user/profile yet.
          // image update is possible but this dialog only handles banner so far.
        }),
      });

      toast.success('Profile updated');
      handleClose();
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose();
      }}
    >
      <DialogContent
        showCloseButton
        className="max-h-[90vh] max-w-[440px] gap-0 overflow-y-auto border-[0.5px] border-[var(--border-med)] bg-[var(--bg-elevated)] p-0"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogTitle className="flex items-center gap-2 border-b-[0.5px] border-[var(--border)] px-5 py-4 text-[15px] font-medium text-[var(--text-primary)]">
          <Pencil className="h-4 w-4 text-[var(--accent)]" />
          Edit profile
        </DialogTitle>

        <div className="flex flex-col gap-4 px-5 py-4">
          {/* Banner Upload */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-[var(--text-secondary)]">Profile Banner</label>
            {banner && (
              <div className="h-[100px] w-full overflow-hidden rounded-[4px] border border-[var(--border)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={banner} alt="Banner" className="h-full w-full object-cover" />
              </div>
            )}
            <button
              type="button"
              disabled={uploadingBanner || saving}
              onClick={() => bannerInputRef.current?.click()}
              className="mt-1 flex items-center justify-center gap-2 rounded border border-[var(--border-med)] bg-[var(--bg-panel)] px-3.5 py-2 text-[12px] font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--bg-page)] disabled:opacity-45"
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
          </div>

          {/* Display name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-[var(--text-secondary)]">Display name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              maxLength={60}
              className="rounded border-[0.5px] border-[var(--border-med)] bg-[var(--bg-panel)] px-3 py-2 text-[13px] text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
            />
          </div>

          {/* Bio */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-[var(--text-secondary)]">Bio</label>
            <div className="relative">
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell other students a bit about yourself..."
                maxLength={BIO_MAX}
                className="h-[80px] w-full resize-none rounded border-[0.5px] border-[var(--border-med)] bg-[var(--bg-panel)] px-3 py-2 text-[13px] text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
              />
              <span className="pointer-events-none absolute bottom-2 right-2.5 text-[11px] text-[var(--text-muted)]">
                {bio.length}/{BIO_MAX}
              </span>
            </div>
          </div>

          {/* Year */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-[var(--text-secondary)]">Year</label>
            <select
              value={year ?? ''}
              onChange={(e) => setYear(e.target.value ? Number(e.target.value) : null)}
              className="rounded border-[0.5px] border-[var(--border-med)] bg-[var(--bg-panel)] px-3 py-2 text-[13px] text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent)]"
            >
              <option value="" disabled>
                Select your year
              </option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>

          {/* Department */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-[var(--text-secondary)]">Department</label>
            <input
              type="text"
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              placeholder="e.g. CSE, IT, ME, ECE"
              maxLength={50}
              className="rounded border-[0.5px] border-[var(--border-med)] bg-[var(--bg-panel)] px-3 py-2 text-[13px] text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
            />
          </div>

          {/* Email — read-only, linked to Google */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-[var(--text-secondary)]">Email</label>
            <div className="flex items-center justify-between gap-2 rounded border-[0.5px] border-[var(--border-med)] bg-[var(--bg-page)] px-3 py-2 opacity-50">
              <span className="truncate text-[13px] text-[var(--text-primary)]">{user.email}</span>
              <Lock className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" />
            </div>
            <span className="text-[11px] text-[var(--text-muted)]">Linked to your Google account</span>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-4">
          <button
            type="button"
            onClick={handleClose}
            className="rounded px-3.5 py-2 text-[12px] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSave || saving || uploadingBanner}
            className="flex items-center gap-1.5 rounded bg-[var(--accent-fill)] px-4 py-2 text-[12px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving && <Loader2 className="h-3 w-3 animate-spin" />}
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
