"use client";

import { useState, useRef } from "react";
import { Upload, FileText, FileSpreadsheet, Image as ImageIcon, X, Loader2 } from "lucide-react";

interface FileUploadZoneProps {
    /** Called when files are uploaded */
    onUpload: (files: File[]) => Promise<void>;
    /** Allow multiple files */
    multiple?: boolean;
    /** Accept filter */
    accept?: string;
    /** Is uploading */
    uploading?: boolean;
    /** Label */
    label?: string;
}

const FILE_ICON_MAP: Record<string, { icon: typeof FileText; color: string }> = {
    pdf:  { icon: FileText,        color: "text-red-500" },
    doc:  { icon: FileText,        color: "text-blue-600" },
    docx: { icon: FileText,        color: "text-blue-600" },
    xls:  { icon: FileSpreadsheet, color: "text-green-600" },
    xlsx: { icon: FileSpreadsheet, color: "text-green-600" },
    png:  { icon: ImageIcon,       color: "text-purple-500" },
    jpg:  { icon: ImageIcon,       color: "text-purple-500" },
    jpeg: { icon: ImageIcon,       color: "text-purple-500" },
};

function getFileIcon(name: string) {
    const ext = name.split(".").pop()?.toLowerCase() ?? "";
    return FILE_ICON_MAP[ext] ?? { icon: FileText, color: "text-slate-500" };
}

export default function FileUploadZone({
    onUpload,
    multiple = true,
    accept = ".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg",
    uploading = false,
    label = "Glissez vos fichiers ici ou",
}: FileUploadZoneProps) {
    const [files, setFiles]     = useState<File[]>([]);
    const [dragOver, setDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const addFiles = (newFiles: FileList | File[]) => {
        const arr = Array.from(newFiles);
        setFiles(prev => multiple ? [...prev, ...arr] : arr.slice(0, 1));
    };

    const removeFile = (idx: number) => {
        setFiles(prev => prev.filter((_, i) => i !== idx));
    };

    const handleSubmit = async () => {
        if (files.length === 0) return;
        await onUpload(files);
        setFiles([]);
    };

    return (
        <div className="space-y-3">
            <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
                }}
                className={`relative border-2 border-dashed rounded-xl py-6 flex flex-col items-center gap-2 transition-colors ${
                    dragOver ? "border-[#f97316] bg-orange-50" : "border-slate-200 hover:border-slate-300"
                }`}
            >
                <Upload size={20} className="text-[#f97316]" />
                <p className="text-[12px] text-slate-500 font-medium text-center">
                    {label} <span className="text-[#f97316] font-bold cursor-pointer">parcourir</span>
                </p>
                <p className="text-[11px] text-slate-300">PDF, Excel, Word, Image</p>
                <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept={accept}
                    multiple={multiple}
                    onChange={(e) => { if (e.target.files?.length) addFiles(e.target.files); e.target.value = ""; }}
                />
            </div>

            {/* Selected files list */}
            {files.length > 0 && (
                <div className="space-y-2">
                    {files.map((f, i) => {
                        const { icon: Icon, color } = getFileIcon(f.name);
                        return (
                            <div key={`${f.name}-${i}`} className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                <Icon size={22} className={color} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[12px] font-bold text-slate-800 truncate">{f.name}</p>
                                    <p className="text-[10px] text-slate-400">{(f.size / 1024).toFixed(0)} KB</p>
                                </div>
                                <button
                                    onClick={() => removeFile(i)}
                                    className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 transition"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        );
                    })}
                    <button
                        onClick={handleSubmit}
                        disabled={uploading}
                        className="w-full py-2.5 rounded-xl bg-[#f97316] text-white font-bold text-[13px] hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {uploading && <Loader2 size={14} className="animate-spin" />}
                        Envoyer {files.length > 1 ? `${files.length} fichiers` : "le fichier"}
                    </button>
                </div>
            )}
        </div>
    );
}
