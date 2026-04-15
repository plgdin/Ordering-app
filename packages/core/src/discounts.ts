export type StoreDiscountKey = "combo30" | "save10" | "flat75";

export type DiscountTemplate = {
  key: StoreDiscountKey;
  code: string;
  title: string;
  description: string;
  minSubtotal: number;
  type: "flat" | "percent";
  value: number;
  maxDiscount?: number;
};

export type CartDiscountOption = {
  id: string;
  storeId: string;
  storeName: string;
  discountKey: StoreDiscountKey;
  code: string;
  title: string;
  description: string;
  savingsAmount: number;
};

export const storeDiscountTemplates: DiscountTemplate[] = [
  {
    key: "combo30",
    code: "COMBO30",
    title: "Rs 30 off",
    description: "Valid on store carts above Rs 199.",
    minSubtotal: 199,
    type: "flat",
    value: 30
  },
  {
    key: "save10",
    code: "SAVE10",
    title: "10% off",
    description: "Valid above Rs 399, up to Rs 120 off.",
    minSubtotal: 399,
    type: "percent",
    value: 10,
    maxDiscount: 120
  },
  {
    key: "flat75",
    code: "FLAT75",
    title: "Rs 75 off",
    description: "Valid on store carts above Rs 699.",
    minSubtotal: 699,
    type: "flat",
    value: 75
  }
];

export function getDiscountTemplate(
  key: StoreDiscountKey
): DiscountTemplate | undefined {
  return storeDiscountTemplates.find((template) => template.key === key);
}

export function calculateDiscountAmount(
  template: DiscountTemplate,
  subtotal: number
) {
  if (subtotal < template.minSubtotal) {
    return 0;
  }

  if (template.type === "flat") {
    return Math.min(template.value, subtotal);
  }

  const percentAmount = Math.round((subtotal * template.value) / 100);
  return Math.min(percentAmount, template.maxDiscount ?? percentAmount);
}
