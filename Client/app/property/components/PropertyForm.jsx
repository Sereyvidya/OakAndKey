"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { propertyTypes } from "../constants/propertyTypes";
import {
  User,
  Phone,
  Mail,
  Home,
  MapPin,
  BedDouble,
  Bath,
  Ruler,
  Building2,
  Image as ImageIcon,
  Images,
} from "lucide-react";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SUPPORTED_RESIDENTIAL_TYPES = new Set(["house", "condo"]);
const TITLE_MAX_CHARS = 35;

function normalizePhone(value = "") {
  return value.replace(/[^\d+]/g, "");
}

function isValidPhone(value = "") {
  const v = normalizePhone(value);
  if (!v) return false;
  const digits = v.replace(/\D/g, "");
  return digits.length >= 9; // min phone number length
}

function validateForm(formData, images = []) {
  const errors = {};

  const title = (formData.propertyTitle || "").trim();
  const address = (formData.address || "").trim();
  const type = (formData.propertyType || "").trim();
  const agentName = (formData.agentName || "").trim();
  const phone = (formData.agentPhone || "").trim();
  const email = (formData.agentEmail || "").trim();
  const description = (formData.description || "").trim();

  // Required: property basics
  if (!title) errors.propertyTitle = "Property title is required.";
  else if (title.length < 6)
    errors.propertyTitle = "Title should be at least 6 characters.";
  else if (title.length > TITLE_MAX_CHARS)
    errors.propertyTitle = `Title must be ${TITLE_MAX_CHARS} characters or less for flyers.`;

  if (!address) errors.address = "Address is required.";
  else if (address.length < 6)
    errors.address = "Address should be more specific.";

  // Price
  const priceRaw = formData.price;
  const cleanedPrice = String(priceRaw ?? "").replace(/[,\s]/g, "");
  const priceNum = Number(cleanedPrice);
  if (priceRaw === "" || priceRaw === null || priceRaw === undefined) {
    errors.price = "Price is required.";
  } else if (Number.isNaN(priceNum) || priceNum <= 0) {
    errors.price = "Price must be a number greater than 0.";
  }

  // Type
  if (!type) errors.propertyType = "Please select a residential property type.";
  else if (!SUPPORTED_RESIDENTIAL_TYPES.has(type)) {
    errors.propertyType = "Only House and Condo are supported right now.";
  }

  // Bedroom, bathroom, size
  const beds = formData.bedrooms === "" ? null : Number(formData.bedrooms);
  const baths = formData.bathrooms === "" ? null : Number(formData.bathrooms);
  const size = formData.size === "" ? null : Number(formData.size);

  if (beds === null) errors.bedrooms = "Bedrooms are required.";
  else if (Number.isNaN(beds) || beds < 0) errors.bedrooms = "Must be 0 or more.";
  if (baths === null) errors.bathrooms = "Bathrooms are required.";
  else if (Number.isNaN(baths) || baths < 0)
    errors.bathrooms = "Must be 0 or more.";
  if (size === null) errors.size = "Size is required.";
  else if (Number.isNaN(size) || size < 0) errors.size = "Must be 0 or more.";

  if (!description) errors.description = "Description is required.";
  else if (description.length < 20)
    errors.description = "Description should be at least 20 characters.";

  // Property images
  if (!images || images.length < 1) {
    errors.images = "Please upload at least 1 property photo.";
  }

  // Agent required
  if (!agentName) errors.agentName = "Agent name is required.";

  // Phone & Email are required
  if (!phone) {
    errors.agentPhone = "Phone number is required.";
  } else if (!isValidPhone(phone)) {
    errors.agentPhone = "Phone number looks too short.";
  }

  if (!email) {
    errors.agentEmail = "Email is required.";
  } else if (!emailRegex.test(email)) {
    errors.agentEmail = "Please enter a valid email address.";
  }

  if (!formData.agentPhoto?.preview) {
    errors.agentPhoto = "Agent photo is required.";
  }

  return errors;
}

function ErrorText({ children }) {
  if (!children) return null;
  return <p className="mt-1 text-sm text-red-400">{children}</p>;
}

function InputWithIcon({ icon: Icon, inputProps, hasError }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[color:var(--ink-muted)]">
        <Icon size={16} />
      </span>

      <input
        {...inputProps}
        className={[
          "form-input-focus form-field h-10 w-full rounded-md border py-2 pr-4 pl-10",
          hasError
            ? "border-red-500/80 ring-1 ring-red-500/30"
            : "border-[color:var(--field-border)]",
        ].join(" ")}
      />
    </div>
  );
}

function FileInput({ icon: Icon, label, onChange, onClear, accept, file }) {
  const inputId = `${label.replace(/\s+/g, "-").toLowerCase()}-input`;

  return (
    <div>
      <div className="mb-2 text-sm font-medium text-[color:var(--ink-base)]">
        {label}
      </div>

      <div className="flex justify-between">
        <div className="flex items-center gap-3">
          <label
            htmlFor={inputId}
            className="relative inline-flex cursor-pointer items-center rounded-md border border-[color:var(--field-border)] bg-[color:var(--field-bg)] px-4 py-2 pl-10 text-sm font-medium text-[color:var(--ink-base)] hover:bg-[color:var(--surface-soft)]"
          >
            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[color:var(--ink-muted)]">
              <Icon size={16} />
            </span>
            Choose file
          </label>

          <input
            id={inputId}
            type="file"
            accept={accept}
            onChange={onChange}
            className="hidden"
          />

          <span className="text-sm text-[color:var(--ink-muted)]">
            {file?.name || "No file chosen"}
          </span>
        </div>

        <button
          type="button"
          onClick={onClear}
          className="mt-3 text-sm text-[color:var(--ink-soft)] hover:text-[color:var(--ink-strong)]"
        >
          Clear
        </button>
      </div>
    </div>
  );
}

function MultiFileInput({ icon: Icon, label, onChange, onClear, files }) {
  const inputId = `${label.replace(/\s+/g, "-").toLowerCase()}-input`;

  return (
    <div>
      <div className="mb-2 text-sm font-medium text-[color:var(--ink-base)]">
        {label}
      </div>

      <div className="flex justify-between gap-3">
        <div className="flex items-center gap-3">
          <label
            htmlFor={inputId}
            className="relative inline-flex cursor-pointer items-center rounded-md border border-[color:var(--field-border)] bg-[color:var(--field-bg)] px-4 py-2 pl-10 text-sm font-medium text-[color:var(--ink-base)] hover:bg-[color:var(--surface-soft)]"
          >
            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[color:var(--ink-muted)]">
              <Icon size={16} />
            </span>
            Choose file
          </label>

          <input
            id={inputId}
            type="file"
            accept="image/*"
            multiple
            onChange={onChange}
            className="hidden"
          />

          <span className="text-sm text-[color:var(--ink-muted)]">
            {files?.length
              ? `${files.length} file${files.length > 1 ? "s" : ""} selected`
              : "No files chosen"}
          </span>
        </div>

        <button
          type="button"
          onClick={onClear}
          className="mt-3 text-sm text-[color:var(--ink-soft)] hover:text-[color:var(--ink-strong)] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!files?.length}
        >
          Clear
        </button>
      </div>
    </div>
  );
}

function GeminiButton({ onClick, disabled, isLoading }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label="Rewrite description with Gemini"
      title="Rewrite description with Gemini"
      className="hover-lift inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--field-border)] bg-[color:var(--field-bg)] text-[color:var(--ink-base)] hover:bg-[color:var(--surface-soft)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isLoading ? (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent" />
      ) : (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2l1.8 4.7L18.5 8.5l-4.7 1.8L12 15l-1.8-4.7L5.5 8.5l4.7-1.8L12 2z" />
          <path d="M19 14l1 2.4L22.4 17l-2.4.9L19 20.4l-.9-2.5L15.6 17l2.5-.6L19 14z" />
        </svg>
      )}
    </button>
  );
}

export default function PropertyForm({
  formData,
  images,
  onInputChange,
  onImageChange,
  onClearImages,
  onAgentPhotoChange,
  onClearAgentPhoto,
  onRemoveImage,
  onSubmit,
  onPropertyTypeSelect,
}) {
  const [isPropertyTypeOpen, setIsPropertyTypeOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isRewording, setIsRewording] = useState(false);
  const [rewordError, setRewordError] = useState("");

  const propertyTypeRef = useRef(null);
  const didSelectRef = useRef(false);

  // refs to scroll to first error
  const fieldRefs = useRef({});

  const selectedPropertyType = useMemo(() => {
    const current = propertyTypes.find(
      (t) => t.value === formData.propertyType
    );
    return current || null; // don't default to first option
  }, [formData.propertyType]);
  const currentTitleLength = (formData.propertyTitle || "").length;
  const isTitleTooLong = currentTitleLength > TITLE_MAX_CHARS;

  const validateAndSetWith = (nextFormData, nextImages) => {
    const nextErrors = validateForm(nextFormData, nextImages);
    setErrors(nextErrors);
    return nextErrors;
  };

  const showErrorSummary = useMemo(() => {
    return hasSubmitted && Object.keys(errors).length > 0;
  }, [errors, hasSubmitted]);

  const validateAndSet = () => {
    const nextErrors = validateForm(formData, images);
    setErrors(nextErrors);
    return nextErrors;
  };

  const scrollToFirstError = (nextErrors) => {
    const order = [
      "propertyTitle",
      "address",
      "price",
      "propertyType",
      "bedrooms",
      "bathrooms",
      "size",
      "description",
      "images",
      "agentPhoto",
      "agentName",
      "agentPhone",
      "agentEmail",
    ];

    const firstKey = order.find((k) => nextErrors[k]);
    if (!firstKey) return;

    const node = fieldRefs.current[firstKey];
    if (node?.scrollIntoView) {
      node.scrollIntoView({ behavior: "smooth", block: "center" });
      node.focus?.();
    }
  };

  const handlePropertyTypeToggle = () => {
    setIsPropertyTypeOpen((open) => {
      const next = !open;
      if (next) {
        didSelectRef.current = false; // new open session
      }
      return next;
    });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        propertyTypeRef.current &&
        !propertyTypeRef.current.contains(event.target)
      ) {
        // only care if dropdown was open
        setIsPropertyTypeOpen((wasOpen) => {
          if (!wasOpen) return false;

          return false;
        });
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [formData, images]);

  const handleSelectType = (value) => {
    didSelectRef.current = true;

    onPropertyTypeSelect(value);
    setIsPropertyTypeOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setHasSubmitted(true);
    const nextErrors = validateAndSet();
    if (Object.keys(nextErrors).length > 0) {
      scrollToFirstError(nextErrors);
      return;
    }

    onSubmit?.(e);
  };

  const handleRewordDescription = async () => {
    try {
      setIsRewording(true);
      setRewordError("");

      const resp = await fetch("/api/descriptions/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formData,
          description: formData.description || "",
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data?.error || "Failed to reword description.");
      }
      const rewritten = (data?.description || "").trim();
      if (!rewritten) {
        throw new Error("No rewritten description returned.");
      }

      onInputChange({
        target: { name: "description", value: rewritten.slice(0, 400) },
      });
    } catch (err) {
      setRewordError(err?.message || "Failed to reword description.");
    } finally {
      setIsRewording(false);
    }
  };

  useEffect(() => {
    if (!hasSubmitted) return;
    setErrors(validateForm(formData, images));
  }, [formData, images, hasSubmitted]);

  return (
    <div className="interactive-form rounded-2xl border border-[var(--card-border)] bg-[color:var(--surface)]/96 p-6 shadow-[0_16px_34px_-28px_rgba(15,23,42,0.8)]">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-[color:var(--ink-strong)]">
          General Information
        </h1>
      </div>

      {/* Error summary */}
      {showErrorSummary && (
        <div className="mb-6 rounded-lg border border-red-500/40 bg-red-950/35 p-4 text-sm text-red-300">
          Please fix the highlighted fields below.
        </div>
      )}

      <form className="space-y-7" onSubmit={handleSubmit} noValidate>
        {/* Listing Details Section */}
        <section className="form-section">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-xl font-medium text-[color:var(--ink-strong)]">
              Listing Details
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="propertyTitle"
                className="mb-1 block text-sm font-medium text-[color:var(--ink-base)]"
              >
                Title
              </label>
              <InputWithIcon
                icon={Home}
                hasError={isTitleTooLong || (hasSubmitted && errors.propertyTitle)}
                inputProps={{
                  ref: (n) => (fieldRefs.current.propertyTitle = n),
                  type: "text",
                  id: "propertyTitle",
                  name: "propertyTitle",
                  value: formData.propertyTitle,
                  onChange: onInputChange,
                  placeholder: "Modern 4-Bedroom Family Home",
                  "aria-invalid": Boolean(
                    isTitleTooLong || (hasSubmitted && errors.propertyTitle)
                  ),
                }}
              />

              <ErrorText>
                {isTitleTooLong
                  ? `Title must be ${TITLE_MAX_CHARS} characters or less for flyers.`
                  : hasSubmitted
                    ? errors.propertyTitle
                    : ""}
              </ErrorText>
            </div>

            <div>
              <label
                htmlFor="address"
                className="mb-1 block text-sm font-medium text-[color:var(--ink-base)]"
              >
                Address
              </label>
              <InputWithIcon
                icon={MapPin}
                hasError={hasSubmitted && errors.address}
                inputProps={{
                  ref: (n) => (fieldRefs.current.address = n),
                  type: "text",
                  id: "address",
                  name: "address",
                  value: formData.address,
                  onChange: onInputChange,
                  placeholder: "2716 Maple Grove Dr, Austin, TX",
                  "aria-invalid": Boolean(hasSubmitted && errors.address),
                }}
              />

              <ErrorText>{hasSubmitted ? errors.address : ""}</ErrorText>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Price */}
              <div>
                <label
                  htmlFor="price"
                  className="mb-1 block text-sm font-medium text-[color:var(--ink-base)]"
                >
                  Price (USD)
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[color:var(--ink-muted)]">
                    $
                  </span>

                  <input
                    ref={(n) => (fieldRefs.current.price = n)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={onInputChange}
                    className={[
                      "form-input-focus form-field h-10 w-full rounded-md border py-2 pr-4 pl-10 text-left tabular-nums",
                      hasSubmitted && errors.price
                        ? "border-red-500/80 ring-1 ring-red-500/30"
                        : "border-[color:var(--field-border)]",
                    ].join(" ")}
                    placeholder="485000"
                    aria-invalid={Boolean(hasSubmitted && errors.price)}
                  />
                </div>

                <ErrorText>{hasSubmitted ? errors.price : ""}</ErrorText>
              </div>

              {/* Property Type */}
              <div>
                <label
                  htmlFor="propertyType"
                  className="mb-1 block text-sm font-medium text-[color:var(--ink-base)]"
                >
                  Property Type
                </label>

                <div className="relative" ref={propertyTypeRef}>
                  <button
                    ref={(n) => {
                      fieldRefs.current.propertyType = n;
                    }}
                    type="button"
                    id="propertyType"
                    onClick={handlePropertyTypeToggle}
                    className={[
                      "form-input-focus form-field relative flex h-10 w-full items-center justify-between rounded-md border py-2 pr-4 pl-10 text-left",
                      hasSubmitted && errors.propertyType
                        ? "border-red-500/80 ring-1 ring-red-500/30"
                        : "border-[color:var(--field-border)]",
                    ].join(" ")}
                    aria-haspopup="listbox"
                    aria-expanded={isPropertyTypeOpen}
                  >
                    <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[color:var(--ink-muted)]">
                      <Building2 size={16} />
                    </span>

                    <span
                      className={
                        selectedPropertyType
                          ? ""
                          : "text-[color:var(--ink-muted)]"
                      }
                    >
                      {selectedPropertyType
                        ? selectedPropertyType.label
                        : "Select"}
                    </span>

                    <span className="ml-2 text-[color:var(--ink-muted)]">
                      ▾
                    </span>
                  </button>

                  {isPropertyTypeOpen && (
                    <div
                      className="absolute z-10 mt-2 w-full rounded-md border border-[var(--card-border)] bg-[var(--surface)] shadow-lg"
                      role="listbox"
                      aria-label="Property type"
                    >
                      {propertyTypes.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => handleSelectType(type.value)}
                          className={[
                            "w-full px-4 py-2 text-left text-sm hover:bg-[color:var(--surface-soft)]",
                            formData.propertyType === type.value
                              ? "bg-[var(--brand-soft)] text-[var(--brand-strong)]"
                              : "text-[color:var(--ink-strong)]",
                          ].join(" ")}
                          role="option"
                          aria-selected={formData.propertyType === type.value}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  )}

                  <ErrorText>
                    {hasSubmitted ? errors.propertyType : ""}
                  </ErrorText>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="bedrooms"
                  className="mb-1 block text-sm font-medium text-[color:var(--ink-base)]"
                >
                  Bedrooms
                </label>
                <InputWithIcon
                  icon={BedDouble}
                  hasError={hasSubmitted && errors.bedrooms}
                  inputProps={{
                    ref: (n) => (fieldRefs.current.bedrooms = n),
                    type: "number",
                    id: "bedrooms",
                    name: "bedrooms",
                    value: formData.bedrooms,
                    onChange: onInputChange,
                    onWheel: (e) => e.currentTarget.blur(),
                    placeholder: "4",
                    min: "0",
                    step: "1",
                  }}
                />

                <ErrorText>{hasSubmitted ? errors.bedrooms : ""}</ErrorText>
              </div>

              <div>
                <label
                  htmlFor="bathrooms"
                  className="mb-1 block text-sm font-medium text-[color:var(--ink-base)]"
                >
                  Bathrooms
                </label>
                <InputWithIcon
                  icon={Bath}
                  hasError={hasSubmitted && errors.bathrooms}
                  inputProps={{
                    ref: (n) => (fieldRefs.current.bathrooms = n),
                    type: "number",
                    id: "bathrooms",
                    name: "bathrooms",
                    value: formData.bathrooms,
                    onChange: onInputChange,
                    onWheel: (e) => e.currentTarget.blur(),
                    placeholder: "3",
                    min: "0",
                    step: "1",
                  }}
                />

                <ErrorText>
                  {hasSubmitted ? errors.bathrooms : ""}
                </ErrorText>
              </div>

              <div>
                <label
                  htmlFor="size"
                  className="mb-1 block text-sm font-medium text-[color:var(--ink-base)]"
                >
                  Size (sqm)
                </label>
                <InputWithIcon
                  icon={Ruler}
                  hasError={hasSubmitted && errors.size}
                  inputProps={{
                    ref: (n) => (fieldRefs.current.size = n),
                    type: "number",
                    id: "size",
                    name: "size",
                    value: formData.size,
                    onChange: onInputChange,
                    onWheel: (e) => e.currentTarget.blur(),
                    placeholder: "245",
                    min: "0",
                    step: "1",
                  }}
                />

                <ErrorText>{hasSubmitted ? errors.size : ""}</ErrorText>
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-1 block text-sm font-medium text-[color:var(--ink-base)]"
              >
                Description
              </label>
              <div className="relative">
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={onInputChange}
                  onBlur={(e) => {
                    const trimmed = e.target.value.trim();
                    if (trimmed !== e.target.value) {
                      onInputChange({
                        target: {
                          name: "description",
                          value: trimmed,
                        },
                      });
                    }
                  }}
                  maxLength={400}
                  className="form-input-focus form-field w-full rounded-md border border-[color:var(--field-border)] px-4 py-2 pr-14 pb-12"
                  rows={4}
                  placeholder="Beautifully updated 4-bedroom, 3-bath home in North Austin with an open-concept living area, a large island kitchen, and abundant natural light. The primary suite includes a walk-in closet and spa-style bath, while the fenced backyard and covered patio are perfect for entertaining. Minutes from top schools, parks, and major commuter routes."
                />
                <div className="absolute right-2 bottom-4">
                  <GeminiButton
                    onClick={handleRewordDescription}
                    disabled={isRewording}
                    isLoading={isRewording}
                  />
                </div>
              </div>
              <p
                className={[
                  "mt-1 flex items-center justify-between text-xs gap-4",
                  formData.description.length === 400
                    ? "text-red-600"
                    : formData.description.length >= 350
                      ? "text-amber-600"
                      : "text-[color:var(--ink-muted)]",
                ].join(" ")}
              >
                <span className="text-[color:var(--ink-muted)]">
                  We recommend at least 300 characters.
                </span>
                <span className="ml-auto">
                  {formData.description.length}/400 characters
                  {formData.description.length === 400
                    ? " — limit reached"
                    : formData.description.length >= 350
                      ? " — almost at limit"
                      : ""}
                </span>
              </p>
              <ErrorText>{hasSubmitted ? errors.description : ""}</ErrorText>
              {rewordError ? (
                <p className="mt-1 text-xs text-red-400">{rewordError}</p>
              ) : null}
            </div>

            <div
              ref={(n) => (fieldRefs.current.images = n)}
              className={[
                "rounded-lg py-3",
                hasSubmitted && errors.images
                  ? "border border-red-500/60 bg-red-950/20"
                  : "border border-transparent",
              ].join(" ")}
            >
              <MultiFileInput
                icon={Images}
                label="Property Images"
                files={images}
                onChange={(e) => {
                  onImageChange(e);

                  const selectedCount = e.target.files?.length ?? 0;
                  const nextImages =
                    selectedCount > 0 ? new Array(selectedCount).fill({}) : [];
                  if (hasSubmitted) validateAndSetWith(formData, nextImages);
                }}
                onClear={() => {
                  onClearImages();
                  if (hasSubmitted) validateAndSetWith(formData, []);
                }}
              />

              <ErrorText>{hasSubmitted ? errors.images : ""}</ErrorText>

              {images?.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative overflow-hidden rounded-lg border border-gray-200"
                    >
                      <img
                        src={img.preview}
                        alt={`Uploaded ${idx + 1}`}
                        className="h-28 w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => onRemoveImage(idx)}
                        aria-label={`Remove image ${idx + 1}`}
                        className="absolute top-2 right-2 rounded-md border border-white/35 bg-black/72 px-2.5 py-1 text-xs font-semibold tracking-wide text-white shadow-[0_8px_18px_-10px_rgba(0,0,0,0.8)] backdrop-blur-sm transition hover:border-red-300/80 hover:bg-red-600/85 focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none"
                      >
                        ×
                      </button>
                      {idx === 0 && (
                        <div className="absolute top-2 left-2 rounded-md bg-[var(--brand)] px-2 py-1 text-xs text-[#0b0f14] shadow">
                          Featured
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Agent Details Section */}
        <section className="form-section">
          <h2 className="mb-4 text-xl font-medium text-[color:var(--ink-strong)]">
            Agent Details
          </h2>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="agentName"
                className="mb-1 block text-sm font-medium text-[color:var(--ink-base)]"
              >
                Name
              </label>
              <InputWithIcon
                icon={User}
                hasError={hasSubmitted && errors.agentName}
                inputProps={{
                  ref: (n) => (fieldRefs.current.agentName = n),
                  type: "text",
                  id: "agentName",
                  name: "agentName",
                  value: formData.agentName,
                  onChange: onInputChange,
                  placeholder: "John Carter",
                  "aria-invalid": Boolean(hasSubmitted && errors.agentName),
                }}
              />

              <ErrorText>{hasSubmitted ? errors.agentName : ""}</ErrorText>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="agentPhone"
                  className="mb-1 block text-sm font-medium text-[color:var(--ink-base)]"
                >
                  Phone
                </label>

                <InputWithIcon
                  icon={Phone}
                  hasError={hasSubmitted && errors.agentPhone}
                  inputProps={{
                    ref: (n) => (fieldRefs.current.agentPhone = n),
                    type: "tel",
                    id: "agentPhone",
                    name: "agentPhone",
                    value: formData.agentPhone,
                    onChange: onInputChange,
                    placeholder: "(512) 555-0147",
                  }}
                />

                <ErrorText>
                  {hasSubmitted ? errors.agentPhone : ""}
                </ErrorText>
              </div>

              <div>
                <label
                  htmlFor="agentEmail"
                  className="mb-1 block text-sm font-medium text-[color:var(--ink-base)]"
                >
                  Email
                </label>

                <InputWithIcon
                  icon={Mail}
                  hasError={hasSubmitted && errors.agentEmail}
                  inputProps={{
                    ref: (n) => (fieldRefs.current.agentEmail = n),
                    type: "email",
                    id: "agentEmail",
                    name: "agentEmail",
                    value: formData.agentEmail,
                    onChange: onInputChange,
                    placeholder: "john.carter@gmail.com",
                  }}
                />

                <ErrorText>
                  {hasSubmitted ? errors.agentEmail : ""}
                </ErrorText>
              </div>

            </div>

            {/* Media: agent photo */}
            <div className="grid grid-cols-1">
              <FileInput
                icon={ImageIcon}
                label="Agent Photo"
                accept="image/*"
                file={formData.agentPhoto}
                onChange={(e) => {
                  onAgentPhotoChange(e);
                  if (hasSubmitted) validateAndSet();
                }}
                onClear={() => {
                  onClearAgentPhoto();
                  if (hasSubmitted) validateAndSet();
                }}
              />
              <ErrorText>{hasSubmitted ? errors.agentPhoto : ""}</ErrorText>
            </div>
          </div>
        </section>

        <div className="flex items-center justify-end border-t border-[var(--card-border)] pt-6">
          <button
            type="submit"
            className="hover-lift rounded-xl bg-[var(--brand)] px-5 py-2.5 text-sm font-bold text-[#0b0f14] hover:bg-[var(--brand-strong)]"
          >
            Save & Continue
          </button>
        </div>
      </form>
    </div>
  );
}
