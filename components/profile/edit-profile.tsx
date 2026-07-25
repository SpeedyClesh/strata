"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Pencil, Camera, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export type EditableProfile = {
  name: string;
  phone: string | null;
  country: string | null;
  city: string | null;
  dob: string | null; // ISO date string, e.g. "1990-05-14"
  avatarUrl: string | null;
};

const MAX_SOURCE_FILE_BYTES = 8_000_000; // 8MB raw upload cap, before client-side compression

// Resizes/compresses an image file in the browser so we never ship a huge
// payload to the server. Returns a JPEG data URL capped to `maxDim` on the
// longest side.
function resizeImageToDataUrl(file: File, maxDim = 320, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Couldn't read that file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("That file isn't a readable image."));
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Image processing isn't supported in this browser."));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function EditProfileButton({ profile }: { profile: EditableProfile }) {
  const { toast } = useToast();
  const router = useRouter();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [name, setName] = React.useState(profile.name);
  const [phone, setPhone] = React.useState(profile.phone ?? "");
  const [country, setCountry] = React.useState(profile.country ?? "");
  const [city, setCity] = React.useState(profile.city ?? "");
  const [dob, setDob] = React.useState(profile.dob ?? "");
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(profile.avatarUrl);
  const [avatarDirty, setAvatarDirty] = React.useState(false);
  const [processingImage, setProcessingImage] = React.useState(false);

  function resetForm() {
    setName(profile.name);
    setPhone(profile.phone ?? "");
    setCountry(profile.country ?? "");
    setCity(profile.city ?? "");
    setDob(profile.dob ?? "");
    setAvatarPreview(profile.avatarUrl);
    setAvatarDirty(false);
    setError(null);
  }

  function openModal() {
    resetForm();
    setOpen(true);
  }

  function closeModal() {
    if (submitting) return;
    setOpen(false);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_SOURCE_FILE_BYTES) {
      setError("That image is too large. Try one under 8MB.");
      return;
    }

    setError(null);
    setProcessingImage(true);
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      setAvatarPreview(dataUrl);
      setAvatarDirty(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't process that image.");
    } finally {
      setProcessingImage(false);
    }
  }

  function removePhoto() {
    setAvatarPreview(null);
    setAvatarDirty(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Full name is required.");
      return;
    }

    setSubmitting(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: trimmedName,
        phone,
        country,
        city,
        dob: dob || null,
        ...(avatarDirty ? { avatarUrl: avatarPreview } : {}),
      }),
    });
    setSubmitting(false);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setError(err.error ?? "Couldn't save your changes.");
      return;
    }

    toast({ title: "Profile updated" });
    setOpen(false);
    router.refresh();
  }

  const initials = (name || profile.name)
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      <Button variant="outline" className="gap-2" onClick={openModal}>
        <Pencil className="h-4 w-4" />
        Edit Profile
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-card shadow-soft">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="font-serif text-lg font-semibold">Edit Profile</h2>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={submit} className="flex flex-col gap-5 px-6 py-5">
              {/* Avatar uploader */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <span className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-strata-green to-strata-green-deep text-primary-foreground">
                    {avatarPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarPreview} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <span className="font-serif text-2xl">{initials}</span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Change photo"
                    className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-secondary text-foreground transition-colors hover:bg-secondary/80"
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={processingImage}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {processingImage ? "Processing…" : "Upload photo"}
                    </Button>
                    {avatarPreview && (
                      <Button type="button" size="sm" variant="ghost" className="gap-1 text-destructive" onClick={removePhoto}>
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">JPG, PNG or WEBP. Resized automatically.</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="edit-name">Full Name</Label>
                  <Input id="edit-name" required value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="edit-phone">Phone Number</Label>
                  <Input id="edit-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 123 4567" />
                </div>
                <div>
                  <Label htmlFor="edit-dob">Date of Birth</Label>
                  <Input id="edit-dob" type="date" value={dob} max={new Date().toISOString().split("T")[0]} onChange={(e) => setDob(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="edit-country">Country</Label>
                  <Input id="edit-country" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="United States" />
                </div>
                <div>
                  <Label htmlFor="edit-city">City Address</Label>
                  <Input id="edit-city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Austin, TX" />
                </div>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex justify-end gap-2 border-t border-border pt-4">
                <Button type="button" variant="ghost" onClick={closeModal} disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting || processingImage} className="bg-strata-green hover:bg-strata-green-deep">
                  {submitting ? "Saving…" : "Save changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
