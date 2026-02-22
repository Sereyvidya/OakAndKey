"use client";

import { useRouter } from "next/navigation";
import PropertyForm from "../components/PropertyForm";
import { usePropertyStore } from "@/app/lib/propertyStore";

export default function GeneralInfoPage() {
  const router = useRouter();

  const formData = usePropertyStore((s) => s.formData);
  const setFormData = usePropertyStore((s) => s.setFormData);

  const images = usePropertyStore((s) => s.images);
  const addImages = usePropertyStore((s) => s.addImages);
  const setImages = usePropertyStore((s) => s.setImages);
  const removeImage = usePropertyStore((s) => s.removeImage);

  const handleSubmit = (e) => {
    e.preventDefault();
    router.push("/property/flyer");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ [name]: value });
  };

  const handlePropertyTypeSelect = (value) => {
    setFormData({ propertyType: value });
  };

  const fileToBase64 = (file) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) =>
        resolve({ preview: event.target.result, name: file.name });
      reader.readAsDataURL(file);
    });

  const handleAgentPhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = await fileToBase64(file);
    setFormData({ agentPhoto: img });
  };

  const clearAgentPhoto = () => setFormData({ agentPhoto: null });
  const clearImages = () => setImages([]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    Promise.all(
      files.map(
        (file) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) =>
              resolve({ preview: event.target.result, name: file.name });
            reader.readAsDataURL(file);
          })
      )
    ).then(addImages);
  };

  return (
    <PropertyForm
      formData={formData}
      images={images}
      onInputChange={handleInputChange}
      onPropertyTypeSelect={handlePropertyTypeSelect}
      onAgentPhotoChange={handleAgentPhotoChange}
      onClearAgentPhoto={clearAgentPhoto}
      onImageChange={handleImageChange}
      onClearImages={clearImages}
      onRemoveImage={removeImage}
      onSubmit={handleSubmit}
    />
  );
}
