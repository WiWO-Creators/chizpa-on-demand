"use client";

import { FileCheck2, FolderOpen, Trash2, UploadCloud } from "lucide-react";
import { DragEvent, KeyboardEvent, useRef, useState } from "react";

const MAX_FILES = 5;
const MAX_FILE_BYTES = 15 * 1024 * 1024;
const MAX_TOTAL_BYTES = 40 * 1024 * 1024;
const allowedExtensions = new Set(["ppt", "pptx", "doc", "docx", "xls", "xlsx", "pdf", "png", "jpg", "jpeg", "webp", "mp3", "wav", "mp4", "mov", "zip"]);

function readableBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function extensionOf(name: string) {
  return name.split(".").pop()?.toLocaleLowerCase("es") ?? "";
}

export function ProjectFilesDropzone({ files, onChange }: { files: File[]; onChange: (files: File[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [message, setMessage] = useState("");

  function addFiles(incoming: File[]) {
    const next = [...files];
    const errors: string[] = [];
    for (const file of incoming) {
      if (next.length >= MAX_FILES) { errors.push(`Máximo ${MAX_FILES} archivos.`); break; }
      if (!allowedExtensions.has(extensionOf(file.name))) { errors.push(`${file.name}: formato no compatible.`); continue; }
      if (file.size > MAX_FILE_BYTES) { errors.push(`${file.name}: supera 15 MB.`); continue; }
      if (next.some((item) => item.name === file.name && item.size === file.size)) continue;
      if (next.reduce((sum, item) => sum + item.size, 0) + file.size > MAX_TOTAL_BYTES) { errors.push("El total no puede superar 40 MB."); break; }
      next.push(file);
    }
    onChange(next);
    setMessage(errors[0] ?? (next.length ? `${next.length} ${next.length === 1 ? "archivo listo" : "archivos listos"} para adjuntar.` : ""));
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    addFiles(Array.from(event.dataTransfer.files));
  }

  function openPicker(event?: KeyboardEvent<HTMLDivElement>) {
    if (event && event.key !== "Enter" && event.key !== " ") return;
    event?.preventDefault();
    inputRef.current?.click();
  }

  return <div className="project-files">
    <div
      className={`project-files__drop${dragging ? " is-dragging" : ""}${files.length ? " has-files" : ""}`}
      role="button"
      tabIndex={0}
      aria-label="Adjuntar materiales del proyecto"
      aria-describedby="project-files-help"
      onKeyDown={openPicker}
      onClick={() => inputRef.current?.click()}
      onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false); }}
      onDrop={handleDrop}
    >
      <input ref={inputRef} type="file" multiple accept=".ppt,.pptx,.doc,.docx,.xls,.xlsx,.pdf,.png,.jpg,.jpeg,.webp,.mp3,.wav,.mp4,.mov,.zip" onChange={(event) => { addFiles(Array.from(event.target.files ?? [])); event.currentTarget.value = ""; }} />
      <span className="project-files__icon" aria-hidden="true"><UploadCloud size={28} /></span>
      <div><strong>{dragging ? "Suéltalos aquí" : files.length ? "Puedes sumar más materiales" : "Arrastra aquí lo que tengas"}</strong><p id="project-files-help">PPT, Word, Excel, PDF, imágenes, audio, video o ZIP.</p></div>
      <span className="project-files__browse"><FolderOpen size={16} /> Buscar archivos</span>
    </div>

    <p className="project-files__limits"><span>Hasta 5 archivos</span><span>15 MB por archivo</span><span>40 MB en total</span></p>
    <p className="sr-only" aria-live="polite">{message}</p>

    {files.length > 0 && <ul className="project-files__list" aria-label="Materiales seleccionados">{files.map((file) => <li key={`${file.name}-${file.size}`}><span><FileCheck2 size={18} /></span><div><strong>{file.name}</strong><small>{readableBytes(file.size)} · listo para adjuntar</small></div><button type="button" aria-label={`Quitar ${file.name}`} onClick={(event) => { event.stopPropagation(); const next = files.filter((item) => item !== file); onChange(next); setMessage(`${file.name} fue quitado.`); }}><Trash2 size={16} /></button></li>)}</ul>}
  </div>;
}
