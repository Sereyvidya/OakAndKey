"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LuRefreshCcw } from "react-icons/lu";
import {
  propertyTypes,
  TITLE_MAX_CHARS,
  US_STATE_CODES,
} from "@/app/lib/listing/constants";
import { getListingValidationErrors } from "@/app/lib/listing/validation";
import { composeAddress } from "@/app/lib/address";
import ErrorText from "./ErrorText";
import FileInput from "./FileInput";
import GeminiButton from "./GeminiButton";
import InputWithIcon from "./InputWithIcon";
import MultiFileInput from "./MultiFileInput";
import {
  SAMPLE_AUTOFILL,
  SAMPLE_AUTOFILL_FORM,
} from "./propertyFormSampleData";
import {
  Tag,
  User,
  Phone,
  Mail,
  Home,
  Globe,
  MapPin,
  Map,
  BedDouble,
  Bath,
  Ruler,
  Building,
  Building2,
  Image as ImageIcon,
  Images,
} from "lucide-react";
import { FiChevronDown } from "react-icons/fi";

export default function PropertyForm({
  formData,
  images,
  onInputChange,
  onImageChange,
  onAutofill,
  onClearImages,
  onAgentPhotoChange,
  onCompanyLogoChange,
  onClearAgentPhoto,
  onClearCompanyLogo,
  onQrCodeChange,
  onClearQrCode,
  onRemoveImage,
  onSubmit,
  onPropertyTypeSelect,
}) {
  const [isPropertyTypeOpen, setIsPropertyTypeOpen] = useState(false);
  const [isStateOpen, setIsStateOpen] = useState(false);
  const stateRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isRewording, setIsRewording] = useState(false);
  const [rewordError, setRewordError] = useState("");
  const [unitRotation, setUnitRotation] = useState(false);

  const propertyTypeRef = useRef(null);

  // refs to scroll to first error
  const fieldRefs = useRef({});

  const selectedPropertyType = useMemo(() => {
    const current = propertyTypes.find(
      (t) => t.value === formData.propertyType
    );
    return current || null; // don't default to first option
  }, [formData.propertyType]);
  const PropertyTypeIcon =
    formData.propertyType === "house"
      ? Home
      : formData.propertyType === "condo"
        ? Building
        : Building;
  const currentTitleLength = (formData.propertyTitle || "").length;
  const isTitleTooLong = currentTitleLength > TITLE_MAX_CHARS;
  const addressStreet = formData.addressStreet || "";
  const addressCity = formData.addressCity || "";
  const addressState = formData.addressState || "";

  const updateAddressPart = (fieldName, value) => {
    onInputChange({
      target: {
        name: fieldName,
        value,
      },
    });
  };

  const validateAndSetWith = (nextFormData, nextImages) => {
    const nextErrors = getListingValidationErrors({
      formData: nextFormData,
      images: nextImages,
    });
    setErrors(nextErrors);
    return nextErrors;
  };

  const showErrorSummary = useMemo(() => {
    return hasSubmitted && Object.keys(errors).length > 0;
  }, [errors, hasSubmitted]);

  const validateAndSet = () => {
    const nextErrors = getListingValidationErrors({ formData, images });
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
      "agentCompanyLogo",
      "agentPhoto",
      "agentName",
      "agentCompanyName",
      "agentSocialLink",
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
    setIsPropertyTypeOpen((open) => !open);
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
      if (stateRef.current && !stateRef.current.contains(event.target)) {
        setIsStateOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectType = (value) => {
    onPropertyTypeSelect(value);
    setIsPropertyTypeOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setHasSubmitted(true);

    const finalAddress = composeAddress(
      formData.addressStreet,
      formData.addressCity,
      formData.addressState
    );

    onInputChange({
      target: {
        name: "address",
        value: finalAddress,
      },
    });

    const nextErrors = getListingValidationErrors({
      formData: {
        ...formData,
        address: finalAddress,
      },
      images,
    });

    setErrors(nextErrors);

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
    setErrors(getListingValidationErrors({ formData, images }));
  }, [formData, images, hasSubmitted]);

  return (
    <div className="interactive-form rounded-2xl border border-[var(--card-border)] bg-[color:var(--surface)]/96 p-6 shadow-[0_16px_34px_-28px_rgba(15,23,42,0.8)]">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold text-[color:var(--ink-strong)]">
          General Information
        </h1>
        <button
          type="button"
          onClick={() => onAutofill?.(SAMPLE_AUTOFILL)}
          className="hover-lift rounded-xl border border-[var(--field-border)] bg-[color:var(--field-bg)] px-4 py-2 text-sm font-semibold text-[color:var(--ink-base)] hover:bg-[color:var(--surface-soft)]"
        >
          Autofill
        </button>
      </div>

      {/* Error summary */}
      {showErrorSummary && (
        <div className="form-error-summary mb-6 rounded-lg border p-4 text-sm font-medium">
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
                icon={Tag}
                hasError={
                  isTitleTooLong || (hasSubmitted && errors.propertyTitle)
                }
                inputProps={{
                  ref: (n) => (fieldRefs.current.propertyTitle = n),
                  type: "text",
                  id: "propertyTitle",
                  name: "propertyTitle",
                  value: formData.propertyTitle,
                  onChange: onInputChange,
                  placeholder: SAMPLE_AUTOFILL_FORM.propertyTitle,
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
              <label className="mb-1 block text-sm font-medium text-[color:var(--ink-base)]">
                Address
              </label>
              <div
                className={[
                  "address-composite form-field grid h-10 grid-cols-[51.2fr_28.8fr_20fr] items-center rounded-md border",
                  hasSubmitted && errors.address
                    ? "field-error"
                    : "border-[color:var(--field-border)]",
                ].join(" ")}
              >
                <div className="relative min-w-0">
                  <MapPin
                    size={16}
                    className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[color:var(--ink-muted)]"
                  />
                  <input
                    ref={(n) => (fieldRefs.current.address = n)}
                    type="text"
                    id="addressStreet"
                    name="addressStreet"
                    value={addressStreet}
                    onChange={(e) =>
                      updateAddressPart("addressStreet", e.target.value)
                    }
                    className="h-10 w-full bg-transparent pr-3 pl-10 focus:outline-none"
                    placeholder={SAMPLE_AUTOFILL_FORM.addressStreet}
                  />
                </div>

                <div className="relative min-w-0">
                  <div className="absolute top-2 bottom-2 left-0 w-px bg-[var(--field-border)]" />
                  <Building2
                    size={16}
                    className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[color:var(--ink-muted)]"
                  />
                  <input
                    type="text"
                    id="addressCity"
                    name="addressCity"
                    value={addressCity}
                    onChange={(e) =>
                      updateAddressPart("addressCity", e.target.value)
                    }
                    className="h-10 w-full bg-transparent pr-3 pl-10 focus:outline-none"
                    placeholder={SAMPLE_AUTOFILL_FORM.addressCity}
                  />
                </div>

                <div className="relative min-w-0" ref={stateRef}>
                  <div className="absolute top-2 bottom-2 left-0 w-px bg-[var(--field-border)]" />
                  <button
                    type="button"
                    onClick={() => setIsStateOpen((open) => !open)}
                    className="relative flex h-10 w-full items-center bg-transparent pr-8 pl-10 text-left focus:outline-none"
                  >
                    <Map
                      size={16}
                      className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[color:var(--ink-muted)]"
                    />
                    <span
                      className={
                        addressState
                          ? "text-[color:var(--ink-base)]"
                          : "text-[color:var(--ink-muted)]"
                      }
                    >
                      {addressState || "State"}
                    </span>
                    <FiChevronDown
                      className={[
                        "pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-[color:var(--ink-muted)] transition-transform duration-200",
                        isStateOpen ? "rotate-180" : "",
                      ].join(" ")}
                    />
                  </button>

                  {isStateOpen && (
                    <div
                      className="absolute right-0 z-20 mt-2 max-h-48 w-full overflow-y-auto rounded-md border border-[var(--card-border)] bg-[var(--surface)] shadow-lg"
                      role="listbox"
                    >
                      {US_STATE_CODES.map((code) => (
                        <button
                          key={code}
                          type="button"
                          onClick={() => {
                            updateAddressPart("addressState", code);
                            setIsStateOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-[color:var(--surface-soft)]"
                        >
                          {code}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
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
                        ? "field-error"
                        : "border-[color:var(--field-border)]",
                    ].join(" ")}
                    placeholder={SAMPLE_AUTOFILL_FORM.price}
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
                        ? "field-error"
                        : "border-[color:var(--field-border)]",
                    ].join(" ")}
                    aria-haspopup="listbox"
                    aria-expanded={isPropertyTypeOpen}
                  >
                    <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[color:var(--ink-muted)]">
                      <PropertyTypeIcon size={16} />
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

                    <FiChevronDown
                      className={[
                        "ml-2 h-4 w-4 text-[color:var(--ink-muted)] transition-transform duration-200",
                        isPropertyTypeOpen ? "rotate-180" : "",
                      ].join(" ")}
                    />
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
                    placeholder: SAMPLE_AUTOFILL_FORM.bedrooms,
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
                    placeholder: SAMPLE_AUTOFILL_FORM.bathrooms,
                    min: "0",
                    step: "1",
                  }}
                />

                <ErrorText>{hasSubmitted ? errors.bathrooms : ""}</ErrorText>
              </div>

              <div>
                <div className="mb-1 flex items-center gap-2">
                  <label
                    htmlFor="size"
                    className="block text-sm font-medium text-[color:var(--ink-base)]"
                  >
                    Size ({formData.sizeUnit === "sqft" ? "sqft" : "sqm"})
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setUnitRotation((r) => !r);

                      onInputChange({
                        target: {
                          name: "sizeUnit",
                          value: formData.sizeUnit === "sqft" ? "sqm" : "sqft",
                        },
                      });
                    }}
                    className="rounded-md p-1 text-[color:var(--ink-soft)] transition hover:bg-[color:var(--surface-soft)] hover:text-[color:var(--ink-strong)]"
                    aria-label="Toggle size unit"
                    title="Toggle sqm / sq ft"
                  >
                    <LuRefreshCcw
                      className={[
                        "h-3.5 w-3.5 transition-transform duration-300",
                        unitRotation ? "rotate-180" : "",
                      ].join(" ")}
                    />
                  </button>
                </div>

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
                    placeholder:
                      formData.sizeUnit === "sqft"
                        ? "2637"
                        : SAMPLE_AUTOFILL_FORM.size,
                    min: "0",
                    step: "1",
                  }}
                />
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
                  className={[
                    "form-input-focus form-field w-full rounded-md border px-4 py-2 pr-14 pb-12",
                    hasSubmitted && errors.description
                      ? "field-error"
                      : "border-[color:var(--field-border)]",
                  ].join(" ")}
                  rows={4}
                  placeholder={SAMPLE_AUTOFILL_FORM.description}
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
                  "mt-1 flex items-center justify-between gap-4 text-xs",
                  formData.description.length === 400
                    ? "form-error-text"
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
                <p className="form-error-text mt-1 text-xs">{rewordError}</p>
              ) : null}
            </div>

            <div
              ref={(n) => (fieldRefs.current.images = n)}
              className="rounded-lg py-3"
            >
              <MultiFileInput
                icon={Images}
                label="Property Images"
                files={images}
                hasError={Boolean(hasSubmitted && errors.images)}
                onChange={(e) => {
                  onImageChange(e);

                  const selectedCount = e.target.files?.length ?? 0;
                  const nextImages =
                    selectedCount > 0
                      ? [...images, ...new Array(selectedCount).fill({})]
                      : images;
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
                  placeholder: SAMPLE_AUTOFILL_FORM.agentName,
                  "aria-invalid": Boolean(hasSubmitted && errors.agentName),
                }}
              />

              <ErrorText>{hasSubmitted ? errors.agentName : ""}</ErrorText>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="agentCompanyName"
                  className="mb-1 block text-sm font-medium text-[color:var(--ink-base)]"
                >
                  Company Name
                </label>
                <InputWithIcon
                  icon={Building2}
                  hasError={hasSubmitted && errors.agentCompanyName}
                  inputProps={{
                    type: "text",
                    id: "agentCompanyName",
                    name: "agentCompanyName",
                    value: formData.agentCompanyName || "",
                    onChange: onInputChange,
                    placeholder: SAMPLE_AUTOFILL_FORM.agentCompanyName,
                    "aria-invalid": Boolean(
                      hasSubmitted && errors.agentCompanyName
                    ),
                  }}
                />
                <ErrorText>
                  {hasSubmitted ? errors.agentCompanyName : ""}
                </ErrorText>
              </div>

              <div>
                <label
                  htmlFor="agentSocialLink"
                  className="mb-1 block text-sm font-medium text-[color:var(--ink-base)]"
                >
                  Social / Website
                </label>
                <InputWithIcon
                  icon={Globe}
                  hasError={hasSubmitted && errors.agentSocialLink}
                  inputProps={{
                    type: "text",
                    id: "agentSocialLink",
                    name: "agentSocialLink",
                    value: formData.agentSocialLink || "",
                    onChange: onInputChange,
                    placeholder: SAMPLE_AUTOFILL_FORM.agentSocialLink,
                    "aria-invalid": Boolean(
                      hasSubmitted && errors.agentSocialLink
                    ),
                  }}
                />
                <ErrorText>
                  {hasSubmitted ? errors.agentSocialLink : ""}
                </ErrorText>
              </div>
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
                    placeholder: SAMPLE_AUTOFILL_FORM.agentPhone,
                  }}
                />

                <ErrorText>{hasSubmitted ? errors.agentPhone : ""}</ErrorText>
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
                    placeholder: SAMPLE_AUTOFILL_FORM.agentEmail,
                  }}
                />

                <ErrorText>{hasSubmitted ? errors.agentEmail : ""}</ErrorText>
              </div>
            </div>

            {/* Media: agent photo */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <FileInput
                  icon={ImageIcon}
                  label="Company Logo"
                  accept="image/*"
                  file={formData.agentCompanyLogo}
                  onChange={(e) => {
                    onCompanyLogoChange?.(e);
                    if (hasSubmitted) validateAndSet();
                  }}
                  onClear={() => {
                    onClearCompanyLogo?.();
                    if (hasSubmitted) validateAndSet();
                  }}
                />
                <ErrorText>
                  {hasSubmitted ? errors.agentCompanyLogo : ""}
                </ErrorText>
              </div>
              <div>
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
