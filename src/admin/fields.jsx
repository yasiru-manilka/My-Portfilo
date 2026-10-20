import { useEffect, useState } from "react";
import { assetUrl } from "../lib/utils";
import { uploadFile } from "./helpers";

export function initialValues(fields, source = {}) {
  const v = {};
  fields.forEach((f) => {
    const val = source ? source[f.k] : undefined;
    if (f.type === "checkbox") v[f.k] = Boolean(val);
    else if (f.type === "list") v[f.k] = Array.isArray(val) ? val.join("\n") : val || "";
    else if (f.type === "images") v[f.k] = Array.isArray(val) ? val : [];
    else v[f.k] = val ?? "";
  });
  return v;
}

export function useFieldsForm(fields, source) {
  const [values, setValues] = useState(() => initialValues(fields, source));
  const [files, setFiles] = useState({});
  return {
    values,
    files,
    set: (k, v) => setValues((p) => ({ ...p, [k]: v })),
    setFile: (k, f) => setFiles((p) => ({ ...p, [k]: f }))
  };
}

export async function collectValues(db, fields, values, files) {
  const out = {};
  for (const f of fields) {
    const v = values[f.k];
    if (f.type === "checkbox") out[f.k] = Boolean(v);
    else if (f.type === "list") out[f.k] = String(v || "").split(/\n/).map((x) => x.trim()).filter(Boolean);
    else if (f.type === "images") {
      const urls = [...(v || [])];
      for (const file of files[f.k] || []) urls.push(await uploadFile(db, file, f.folder));
      out[f.k] = urls;
    } else if (f.type === "image" || f.type === "file") {
      out[f.k] = files[f.k] ? await uploadFile(db, files[f.k], f.folder) : String(v || "").trim();
    } else out[f.k] = String(v ?? "").trim();
  }
  return out;
}

function LocalPreview({ file }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  return url ? <img src={url} alt="" /> : null;
}

function Gallery({ f, value, onChange, pending, onPending, help }) {
  const urls = value || [];
  const waiting = pending || [];
  const makeCover = (i) => onChange([urls[i], ...urls.filter((_, k) => k !== i)]);
  const remove = (i) => onChange(urls.filter((_, k) => k !== i));

  return (
    <div className="field wide gallery-field">
      <span>{f.label}{help}</span>
      <ol className="gallery">
        {urls.map((u, i) => (
          <li className="gallery-item" key={u + i}>
            <img src={assetUrl(u)} alt="" />
            {i === 0 ? (
              <span className="cover-tag">Cover</span>
            ) : (
              <button type="button" className="mini" data-gal="cover" onClick={() => makeCover(i)}>Make cover</button>
            )}
            <button type="button" className="mini danger" data-gal="remove" aria-label="Remove this photo" onClick={() => remove(i)}>Remove</button>
          </li>
        ))}
        {waiting.map((file, i) => (
          <li className="gallery-item" key={file.name + i}>
            <LocalPreview file={file} />
            <span className="cover-tag">New</span>
            <button type="button" className="mini danger" data-gal="remove" onClick={() => onPending(waiting.filter((_, k) => k !== i))}>Remove</button>
          </li>
        ))}
      </ol>
      <label className="btn btn-quiet file-btn">
        Add photos
        <input
          type="file"
          name={`${f.k}__files`}
          accept="image/*"
          multiple
          onChange={(e) => {
            onPending([...waiting, ...e.target.files]);
            e.target.value = "";
          }}
        />
      </label>
      {waiting.length > 0 && (
        <span className="help file-name">
          {waiting.length} photo{waiting.length > 1 ? "s" : ""} will upload when you save
        </span>
      )}
    </div>
  );
}

export function Field({ f, value, onChange, file, onFile, datalistId }) {
  const id = `f_${f.k}`;
  const help = f.help ? <span className="help">{f.help}</span> : null;

  if (f.type === "checkbox") {
    return (
      <label className="check">
        <input type="checkbox" name={f.k} checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} /> {f.label}
      </label>
    );
  }

  if (f.type === "textarea" || f.type === "list") {
    return (
      <label className="field wide" htmlFor={id}>
        {f.label}
        {help}
        <textarea id={id} name={f.k} rows={f.rows || 4} required={f.required} value={value} onChange={(e) => onChange(e.target.value)} />
      </label>
    );
  }

  if (f.type === "images") {
    return <Gallery f={f} value={value} onChange={onChange} pending={file} onPending={onFile} help={help} />;
  }

  if (f.type === "image" || f.type === "file") {
    const isImg = f.type === "image";
    return (
      <div className="field wide upload">
        <span>{f.label}</span>
        {help}
        <div className="upload-row">
          {isImg && (
            <span className="upload-preview">
              {file ? <LocalPreview file={file} /> : value ? <img src={assetUrl(value)} alt="" /> : "No image"}
            </span>
          )}
          <div className="upload-controls">
            <label className="btn btn-quiet file-btn">
              Choose {isImg ? "image" : "file"}
              <input type="file" name={`${f.k}__file`} accept={f.accept || "image/*"} onChange={(e) => onFile(e.target.files[0] || null)} />
            </label>
            <input type="text" name={f.k} value={value} placeholder="or paste a link" aria-label={`${f.label} link`} onChange={(e) => onChange(e.target.value)} />
            {!isImg && value && !file && (
              <a className="link small" href={assetUrl(value)} target="_blank" rel="noopener">Open current file</a>
            )}
            {file && <span className="help file-name">{file.name} will upload when you save</span>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <label className="field" htmlFor={id}>
      {f.label}
      {help}
      <input
        id={id}
        type={f.type || "text"}
        name={f.k}
        value={value}
        required={f.required}
        list={f.datalist ? datalistId : undefined}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

export function Fields({ fields, form, datalistId }) {
  return fields.map((f) => (
    <Field
      key={f.k}
      f={f}
      value={form.values[f.k]}
      onChange={(v) => form.set(f.k, v)}
      file={form.files[f.k]}
      onFile={(file) => form.setFile(f.k, file)}
      datalistId={datalistId}
    />
  ));
}
