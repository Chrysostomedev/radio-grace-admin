"use client";

import { useState, useEffect, useMemo } from "react";
import SideModal from "@/components/form/SideModal";
import FormButton from "@/components/form/FormButton";
import { FormField, Input, Select, PasswordInput, DateInput, DateTimeInput, DateRangeInput, RichTextEditor, ImageUpload, PdfUpload, PhoneInput, Checkbox, MultiUserSelect } from "@/components/form/FormInput";

export interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "password" | "date" | "datetime" | "date-range" | "select" | "email" | "number" | "rich-text" | "image-upload" | "media" | "radio" | "pdf-upload" | "textarea" | "tel" | "checkbox" | "multi-user";
  accept?: string;
  previewType?: "image" | "audio" | "video" | "auto";
  placeholder?: string;
  required?: boolean;
  gridSpan?: 1 | 2;
  options?: { label: string; value: string | number }[];
  icon?: any;
  maxImages?: number;
  maxPDFs?: number;
  maxSizeMB?: number;
  disabled?: boolean;
  defaultValue?: any;
  disablePastDates?: boolean;
}

interface ReusableFormProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  fields: FieldConfig[];
  onSubmit: (formData: Record<string, any>) => void | Promise<any>;
  submitLabel?: string;
  cancelLabel?: string;
  initialValues?: Record<string, any>;
  onFieldChange?: (name: string, value: any, setter: (name: string, value: any) => void) => void;
  isSubmitting?: boolean;
  error?: string | null;
  success?: string | null;
  children?: React.ReactNode;
}

function MediaPreview({ file, url, type = "auto" }: { file?: File; url?: string; type?: "image" | "audio" | "video" | "auto" }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      const u = URL.createObjectURL(file);
      setPreviewUrl(u);
      return () => URL.revokeObjectURL(u);
    } else if (url) {
      // Transforme /storage/... en URL complète via env
      if (url.startsWith("/storage") || url.startsWith("storage")) {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://127.0.0.1:8000';
        setPreviewUrl(`${baseUrl}/${url.replace(/^\//, "")}`);
      } else {
        setPreviewUrl(url);
      }
    }
  }, [file, url]);

  if (!previewUrl) return null;

  const isVideo = type === "video" || (type === "auto" && (previewUrl.match(/\.(mp4|webm|mov)$/i) || file?.type.startsWith("video/")));
  const isAudio = type === "audio" || (type === "auto" && (previewUrl.match(/\.(mp3|wav|m4a|aac|ogg)$/i) || file?.type.startsWith("audio/")));

  if (isVideo) {
    return <div className="mt-3 rounded-2xl overflow-hidden bg-black aspect-video"><video src={previewUrl} controls className="w-full h-full" /></div>
  }
  if (isAudio) {
    return <div className="mt-3 rounded-2xl bg-[#163A2C] p-4"><audio src={previewUrl} controls className="w-full" /></div>
  }
  return <div className="mt-3 rounded-2xl border overflow-hidden h-48 bg-[#FBF6EA]"><img src={previewUrl} alt="preview" className="w-full h-full object-cover" /></div>
}

export default function ReusableForm({
  isOpen, onClose, title, subtitle, fields, onSubmit,
  submitLabel = "Enregistrer", cancelLabel = "Annuler",
  initialValues = {}, onFieldChange, isSubmitting = false,
  error = null, success = null, children,
}: ReusableFormProps) {
  const [localSubmitting, setLocalSubmitting] = useState(false);
  const [customValues, setCustomValues] = useState<Record<string, any>>({});

  const busy = isSubmitting || localSubmitting;
  const stripHtml = (html: string) => html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
  const getDefault = (field: FieldConfig): any => {
    const raw = initialValues[field.name]?? field.defaultValue?? "";
    if (field.type === "textarea" && typeof raw === "string") return stripHtml(raw);
    return raw;
  };

  const handleCustomChange = (name: string, value: any) => {
    setCustomValues((prev) => ({...prev, [name]: value }));
    onFieldChange?.(name, value, (n, v) => setCustomValues(prev => ({...prev, [n]: v })));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    const data = new FormData(e.currentTarget);
    const formDataObj = {...initialValues,...Object.fromEntries(data.entries()) };
    Object.keys(customValues).forEach((key) => { (formDataObj as any)[key] = customValues[key]; });
    setLocalSubmitting(true);
    try { await onSubmit(formDataObj); } finally { setLocalSubmitting(false); }
  };

  return (
    <SideModal isOpen={isOpen} onClose={onClose} title={title} subtitle={subtitle}>
      <form onSubmit={handleSubmit} className="flex flex-col h-[calc(100vh-180px)]">
        <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
          {children}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6 pb-8">
            {fields.map((field) => (
              <div key={field.name} className={field.gridSpan === 2? "col-span-1 md:col-span-2" : "col-span-1 md:col-span-1"}>
                <FormField label={field.label} required={field.required}>
                  {field.type === "image-upload"? (
                    <ImageUpload name={field.name} maxImages={field.maxImages?? 3} maxSizeMB={field.maxSizeMB} defaultValue={getDefault(field)} onChange={(data: any) => handleCustomChange(field.name, data)} isLoading={busy} />
                  ) : field.type === "pdf-upload"? (
                    <PdfUpload name={field.name} maxPDFs={field.maxPDFs?? 1} maxSizeMB={field.maxSizeMB} defaultValue={getDefault(field)} onChange={(data: any) => handleCustomChange(field.name, data)} accept={field.accept} placeholder={field.placeholder} isLoading={busy} />
                  ) : field.type === "media"? (
                    <div>
                      <div className="relative rounded-xl border-2 border-dashed border-[#163A2C]/10 bg-[#FBF6EA]/50 p-4 hover:border-[#F0A93E]/40 transition">
                        <input type="file" accept={field.accept || "image/*,audio/*,video/*"} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCustomChange(field.name, f); }} className="absolute inset-0 opacity-0 cursor-pointer" />
                        <p className="text-center text-sm text-[#163A2C]/50">Glisser ou cliquer — Image, Audio ou Vidéo</p>
                      </div>
                      <MediaPreview file={customValues[field.name] as File} url={getDefault(field)} type={field.previewType || "auto"} />
                    </div>
                  ) : field.type === "select"? (
                    <Select name={field.name} required={field.required} disabled={field.disabled} icon={field.icon} defaultValue={String(getDefault(field) ?? "")} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleCustomChange(field.name, e.target.value)}>
                      <option value="">Cliquez pour sélectionner</option>
                      {field.options?.map((opt, index) => (<option key={`opt-${index}-${opt.value}`} value={opt.value}>{opt.label}</option>))}
                    </Select>
                  ) : field.type === "multi-user"? (
                    <MultiUserSelect users={field.options?.map(o => ({ id: o.value, name: o.label }))?? []} selected={customValues[field.name]?? getDefault(field)?? []} onChange={(ids) => handleCustomChange(field.name, ids)} placeholder={field.placeholder} />
                  ) : field.type === "rich-text"? (
                    <RichTextEditor name={field.name} placeholder={field.placeholder} defaultValue={getDefault(field)} />
                  ) : field.type === "password"? (
                    <PasswordInput name={field.name} placeholder={field.placeholder} required={field.required} defaultValue={getDefault(field)} />
                  ) : field.type === "date"? (
                    <DateInput name={field.name} required={field.required} disabled={field.disabled} disablePastDates={field.disablePastDates} icon={field.icon} defaultValue={getDefault(field)} />
                  ) : field.type === "datetime"? (
                    <DateTimeInput name={field.name} required={field.required} disabled={field.disabled} defaultValue={getDefault(field)} disablePastDates={field.disablePastDates} icon={field.icon} />
                  ) : field.type === "date-range"? (
                    <DateRangeInput name={field.name} required={field.required} disabled={field.disabled} disablePastDates={field.disablePastDates} defaultValue={getDefault(field)} />
                  ) : field.type === "textarea"? (
                    <textarea name={field.name} placeholder={field.placeholder} required={field.required} disabled={field.disabled} defaultValue={getDefault(field)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all min-h- resize-y text-sm font-medium" onChange={(e) => onFieldChange?.(field.name, e.target.value, (n, v) => setCustomValues(prev => ({...prev, [n]: v })))} />
                  ) : field.type === "tel"? (
                    <PhoneInput name={field.name} required={field.required} disabled={field.disabled} defaultValue={getDefault(field)} onChange={(val) => { onFieldChange?.(field.name, val, (n, v) => setCustomValues((prev) => ({...prev, [n]: v }))); }} />
                  ) : field.type === "checkbox"? (
                    <Checkbox name={field.name} label={field.label} required={field.required} disabled={field.disabled} defaultChecked={!!getDefault(field)} onChange={(checked) => handleCustomChange(field.name, checked)} />
                  ) : (
                    <>
                      <Input name={field.name} type={field.type as any} placeholder={field.placeholder} required={field.required} disabled={field.disabled} value={String(customValues[field.name] ?? getDefault(field) ?? "")} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCustomChange(field.name, e.target.value)} />
                      {field.disabled && (<input type="hidden" name={field.name} value={String(customValues[field.name] ?? getDefault(field) ?? "")} />)}
                    </>
                  )}
                </FormField>
              </div>
            ))}
          </div>
        </div>
        <div className="sticky bottom-0 bg-white pt-6 pb-2 border-t border-slate-100 flex gap-4 mt-auto">
          <FormButton type="button" variant="secondary" onClick={onClose} className="flex-1" disabled={busy}>{cancelLabel}</FormButton>
          <FormButton type="submit" variant="primary" className="flex-1" isLoading={busy}>{busy &&!isSubmitting? "En cours..." : submitLabel}</FormButton>
        </div>
      </form>
    </SideModal>
  );
}