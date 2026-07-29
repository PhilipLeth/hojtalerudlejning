"use client";

import { useEffect, useState } from "react";
import type { Addon, RentalProduct, Speaker, ProductCategory } from "@/lib/products";
import { isValidProductId, slugifyProductId } from "@/lib/productId";
import ImageField from "@/components/admin/ImageField";

export type ProductType = "speaker" | "rental" | "addon";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  fontSize: "14px",
  border: "1px solid #ddd",
  borderRadius: "6px",
  boxSizing: "border-box",
  color: "#111",
  background: "#fff",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "12px",
  fontWeight: 600,
  color: "#666",
  marginBottom: "4px",
};

type Props = {
  open: boolean;
  existingIds: Set<string>;
  onClose: () => void;
  onCreate: (type: ProductType, product: Speaker | RentalProduct | Addon) => void;
};

export default function CreateProductModal({ open, existingIds, onClose, onCreate }: Props) {
  const [type, setType] = useState<ProductType>("rental");
  const [name, setName] = useState("");
  const [id, setId] = useState("");
  const [idTouched, setIdTouched] = useState(false);
  const [price, setPrice] = useState("399");
  const [image, setImage] = useState("/images/product-party.png");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState<ProductCategory>("lys");
  const [power, setPower] = useState<Speaker["power"]>("kabel");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setType("rental");
    setName("");
    setId("");
    setIdTouched(false);
    setPrice("399");
    setImage("/images/product-party.png");
    setDesc("");
    setCategory("lys");
    setPower("kabel");
    setError("");
  }, [open]);

  useEffect(() => {
    if (!idTouched && name) setId(slugifyProductId(name));
  }, [name, idTouched]);

  if (!open) return null;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const productId = id.trim();
    const priceNum = Number(price);

    if (!name.trim()) {
      setError("Angiv et navn");
      return;
    }
    if (!isValidProductId(productId)) {
      setError("ID skal starte med bogstav og kun indeholde a-z, 0-9 og _");
      return;
    }
    if (existingIds.has(productId)) {
      setError(`ID "${productId}" findes allerede`);
      return;
    }
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      setError("Angiv en gyldig pris");
      return;
    }

    if (type === "speaker") {
      const speaker: Speaker = {
        id: productId,
        price: priceNum,
        product: image || "/images/product-party.png",
        mood: "/images/mood-party.png",
        power,
        sizeClass: "lille",
        weight: "",
        hidden: false,
        da: {
          name: name.trim(),
          size: "",
          capacity: "",
          desc: desc.trim(),
          extra: "",
        },
        en: {
          name: name.trim(),
          size: "",
          capacity: "",
          desc: desc.trim(),
          extra: "",
        },
      };
      onCreate("speaker", speaker);
    } else if (type === "rental") {
      const rental: RentalProduct = {
        id: productId,
        category,
        price: priceNum,
        image: image || "/images/product-discokugle.png",
        name_da: name.trim(),
        name_en: name.trim(),
        desc_da: desc.trim(),
        desc_en: desc.trim(),
        hidden: false,
      };
      onCreate("rental", rental);
    } else {
      const addon: Addon = {
        id: productId,
        price: priceNum,
        image: image || null,
        hidden: false,
        da: { label: name.trim(), desc: desc.trim() },
        en: { label: name.trim(), desc: desc.trim() },
      };
      onCreate("addon", addon);
    }
    onClose();
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "24px",
          width: "100%",
          maxWidth: "480px",
          maxHeight: "90vh",
          overflowY: "auto",
          color: "#111",
        }}
      >
        <h2 style={{ margin: "0 0 4px", fontSize: "20px" }}>Opret produkt</h2>
        <p style={{ margin: "0 0 20px", fontSize: "14px", color: "#666" }}>
          Produktet tilføjes til listen. Husk at klikke &quot;Gem ændringer&quot; bagefter.
        </p>

        {error && (
          <div style={{ background: "#f8d7da", color: "#721c24", padding: "10px 12px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px" }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: "16px" }}>
          <label style={labelStyle}>Produkttype</label>
          <select value={type} onChange={(e) => setType(e.target.value as ProductType)} style={inputStyle}>
            <option value="rental">Lys / AV / øvrigt produkt</option>
            <option value="speaker">Højtaler</option>
            <option value="addon">Tilvalg / mersalg</option>
          </select>
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label style={labelStyle}>Navn (dansk)</label>
          <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} placeholder="Fx LED-bar" required />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label style={labelStyle}>ID (bruges i booking-URL)</label>
          <input
            value={id}
            onChange={(e) => {
              setIdTouched(true);
              setId(e.target.value);
            }}
            style={inputStyle}
            placeholder="fx led_bar"
            required
          />
          <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#888" }}>
            Booking: /?product={id || "..."}#book
          </p>
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label style={labelStyle}>Pris (kr/weekend)</label>
          <input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} style={inputStyle} required />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <ImageField label="Billede" value={image} onChange={setImage} />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label style={labelStyle}>Kort beskrivelse</label>
          <textarea rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} style={{ ...inputStyle, resize: "vertical" }} />
        </div>

        {type === "rental" && (
          <div style={{ marginBottom: "12px" }}>
            <label style={labelStyle}>Kategori</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as ProductCategory)} style={inputStyle}>
              <option value="lys">Lys</option>
              <option value="av">AV</option>
              <option value="lyd">Lyd</option>
            </select>
          </div>
        )}

        {type === "speaker" && (
          <div style={{ marginBottom: "12px" }}>
            <label style={labelStyle}>Strøm</label>
            <select value={power} onChange={(e) => setPower(e.target.value as Speaker["power"])} style={inputStyle}>
              <option value="batteri">Batteri</option>
              <option value="kabel">Kabel (230V)</option>
            </select>
          </div>
        )}

        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
          <button type="button" onClick={onClose} style={{ flex: 1, padding: "10px", border: "1px solid #ddd", borderRadius: "8px", background: "#fff", cursor: "pointer" }}>
            Annuller
          </button>
          <button type="submit" style={{ flex: 1, padding: "10px", border: "none", borderRadius: "8px", background: "#0070f3", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
            Opret produkt
          </button>
        </div>
      </form>
    </div>
  );
}
