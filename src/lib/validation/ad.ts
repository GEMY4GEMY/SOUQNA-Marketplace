export type AdInput = {
  title?: unknown;
  description?: unknown;
  price?: unknown;
  categoryId?: unknown;
  governorateId?: unknown;
  areaId?: unknown;
};

export function validateAdInput(input: AdInput) {
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const description = typeof input.description === "string" ? input.description.trim() : "";
  const categoryId = typeof input.categoryId === "string" ? input.categoryId : "";
  const governorateId = typeof input.governorateId === "string" ? input.governorateId : "";
  const areaId = typeof input.areaId === "string" && input.areaId ? input.areaId : undefined;
  const numericPrice = input.price === "" || input.price == null ? undefined : Number(input.price);

  const errors: string[] = [];
  if (title.length < 5 || title.length > 90) errors.push("العنوان يجب أن يكون بين 5 و90 حرفًا.");
  if (description.length < 20 || description.length > 5000) errors.push("الوصف يجب أن يكون بين 20 و5000 حرف.");
  if (!categoryId) errors.push("القسم مطلوب.");
  if (!governorateId) errors.push("المحافظة مطلوبة.");
  if (numericPrice !== undefined && (!Number.isFinite(numericPrice) || numericPrice < 0)) errors.push("السعر غير صحيح.");

  return {
    ok: errors.length === 0,
    errors,
    data: { title, description, categoryId, governorateId, areaId, price: numericPrice },
  };
}
