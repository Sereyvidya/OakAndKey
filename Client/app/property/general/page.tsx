"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { fileToImage } from "@/app/lib/files";
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

    const img = await fileToImage(file);
    setFormData({ agentPhoto: img });
  };

  const handleCompanyLogoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = await fileToImage(file);
    setFormData({ agentCompanyLogo: img });
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    Promise.all(files.map(fileToImage)).then(addImages);
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
      onClearImages={() => setImages([])}
      onRemoveImage={removeImage}
      onSubmit={handleSubmit}
    />
  );
}
