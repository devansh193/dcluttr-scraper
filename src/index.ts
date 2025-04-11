import fetch from "node-fetch";
import { writeFileSync } from "fs";

interface VariantData {
  id: number;
  name: string;
  variant: string;
}

interface Product {
  date: string;
  id: number;
  variant_name: string;
  name: string;
  display_name: string;
  mrp: number;
  normal_price: number;
  inventory: number;
  image: string;
  product_Id: string;
  merchant_Id: string;
  group_id: number;
  product_state: string;
  brand_name: string;
  l0_category: string;
  l1_category: string;
  l2_category: string;
  variant?: {
    data: VariantData[];
  };
}

const BASE_URL = "https://blinkit.com";

const headers = {
  "Content-Type": "application/json",
  "User-Agent": "Mozilla/5.0",
  lat: "28.4552521",
  lon: "77.5046101",
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const categoryPairs: {
  label_l0: string;
  label_l1: string;
  l0: number;
  l1: number;
}[] = [
  {
    label_l0: "munchies",
    label_l1: "Bhujia & mixtures",
    l0: 1237,
    l1: 1178,
  },
  {
    label_l0: "munchies",
    label_l1: "Munchies gift pack",
    l0: 1237,
    l1: 1694,
  },
  {
    label_l0: "munchies",
    label_l1: "Namkeen and Snacks",
    l0: 1237,
    l1: 29,
  },
  { label_l0: "munchies", label_l1: "Papad & fryums", l0: 1237, l1: 80 },
  { label_l0: "munchies", label_l1: "Chips and crips", l0: 1237, l1: 940 },
  { label_l0: "Sweets", label_l1: "Indian sweets", l0: 9, l1: 943 },
];

const scrapeBlinkit = async (
  label_l0: string,
  label_l1: string,
  l0: number,
  l1: number
): Promise<void> => {
  let url = `${BASE_URL}/v1/layout/listing_widgets?l0_cat=${l0}&l1_cat=${l1}`;
  const allProducts: Product[] = [];

  while (url) {
    console.log(`🌐 Fetching: ${url}`);
    console.log("");
    try {
      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        console.error(`❌------Failed here at ${url}: ${res.statusText}`);
        break;
      }
      const data: any = await res.json();
      const snippets = data?.response?.snippets || [];
      const extracted: Product[] = snippets
        .filter((item: any) => item?.data)
        .map(
          (item: any): Product => ({
            date: new Date().toISOString(),
            id: item.data?.identity?.id,
            variant_name: item.data?.variant?.text,
            name: item.data?.name?.text,
            display_name: item.data?.display_name?.text,
            brand_name: item.data?.brand_name?.text,
            mrp: item.data?.mrp?.text,
            normal_price: item.data?.normal_price?.text,
            product_state: item.data?.product_state,
            inventory: item.data?.inventory,
            image: item.data?.image?.url,
            product_Id: item.data?.meta?.product_id,
            merchant_Id: item.data?.meta?.merchant_id,
            group_id: item.data?.group_id,
            l0_category: item.tracking?.common_attributes?.l0_category,
            l1_category: item.tracking?.common_attributes?.l1_category,
            l2_category: item.tracking?.common_attributes?.l2_category,
            variant: item.data?.variant_list
              ? {
                  data: item.data.variant_list.map((variantItem: any) => ({
                    id: variantItem.data?.identity?.id,
                    name: variantItem.data?.name?.text,
                    variant: variantItem.data?.variant?.text,
                  })),
                }
              : undefined,
          })
        );

      allProducts.push(...extracted);
      const nextUrl = data?.response?.pagination?.next_url;
      url = nextUrl ? `${BASE_URL}${nextUrl}` : "";
      const urlParams = new URLSearchParams(url.split("?")[1]);
      const totalItemsStr = urlParams.get("total_pagination_items");
      const totalItems = totalItemsStr ? parseInt(totalItemsStr, 10) : 0;

      if (totalItems > 300) {
        await delay(3000);
        console.log("------Delaying request by 3 sec.-------");
      } else {
        await delay(300);
      }
    } catch (error) {
      console.error(`Error fetching data l0:${l0}, l1:${l1}`, error);
      break;
    }
  }

  const fileName = `blinkit-data-${label_l1}.json`;
  writeFileSync(fileName, JSON.stringify(allProducts, null, 2), "utf-8");
  console.log(
    `✅ Scraped ${allProducts.length} products for l0:${l0}, l1:${l1}. Saved to ${fileName}`
  );
};

(async () => {
  for (const { label_l0, label_l1, l0, l1 } of categoryPairs) {
    await scrapeBlinkit(label_l0, label_l1, l0, l1);
    console.log("");
    console.log(`_________Scraped data for l0_${label_l0} and l1_${label_l1}`);
    console.log("");
    await delay(500);
  }
})();
