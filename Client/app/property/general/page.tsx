"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { avatarFromFile, logoFromFile, photoFromFile } from "@/app/lib/files";
import { MAX_LISTING_PHOTOS } from "@/app/lib/listing/constants";
import type { ListingForm } from "@/app/lib/types";
import PropertyForm, {
  type FieldChange,
} from "../components/form/PropertyForm";
import { usePropertyStore } from "@/app/lib/propertyStore";
import type { SampleAutofill } from "../components/form/propertyFormSampleData";

export default function GeneralInfoPage() {
  const router = useRouter();

  const formData = usePropertyStore((s) => s.formData);
  const setFormData = usePropertyStore((s) => s.setFormData);

  const images = usePropertyStore((s) => s.images);
  const addImages = usePropertyStore((s) => s.addImages);
  const setImages = usePropertyStore((s) => s.setImages);
  const removeImage = usePropertyStore((s) => s.removeImage);

  const [photoNotice, setPhotoNotice] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push("/property/flyer");
  };

  const handleInputChange = (e: FieldChange) => {
    const { name, value } = e.target;
    // Field names come from the form's own inputs, so they are ListingForm keys.
    setFormData({ [name]: value } as Partial<ListingForm>);
  };

  const handlePropertyTypeSelect = (value: string) => {
    setFormData({ propertyType: value });
  };

  const handleAutofill = (payload: SampleAutofill) => {
    setFormData(payload.formData);
    setImages(payload.images);
  };

  const handleAgentPhotoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = await avatarFromFile(file);
    setFormData({ agentPhoto: img });
  };

  const handleCompanyLogoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = await logoFromFile(file);
    setFormData({ agentCompanyLogo: img });
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const room = Math.max(0, MAX_LISTING_PHOTOS - images.length);
    setPhotoNotice(
      files.length > room
        ? `Up to ${MAX_LISTING_PHOTOS} photos per listing. Added ${room} of ${files.length}.`
        : ""
    );
    Promise.all(files.slice(0, room).map(photoFromFile)).then(addImages);
  };

  return (
    <PropertyForm
      formData={formData}
      images={images}
      onInputChange={handleInputChange}
      onPropertyTypeSelect={handlePropertyTypeSelect}
      onAutofill={handleAutofill}
      onAgentPhotoChange={handleAgentPhotoChange}
      onCompanyLogoChange={handleCompanyLogoChange}
      onClearAgentPhoto={() => setFormData({ agentPhoto: null })}
      onClearCompanyLogo={() => setFormData({ agentCompanyLogo: null })}
      onImageChange={handleImageChange}
      photoNotice={photoNotice}
      onClearImages={() => {
        setImages([]);
        setPhotoNotice("");
      }}
      onRemoveImage={removeImage}
      onSubmit={handleSubmit}
    />
  );
}
