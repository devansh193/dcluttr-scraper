import data from "./data.json";

const list = data.response.snippets.map((item) => {
  const dat = {
    product_id: item.data?.product_id,
    variant_name: item.data?.variant?.text,
    stock: item.data?.product_state,
    normal_price: item.data?.normal_price?.text,
    offer_tag: item.data?.offer_tag?.title.text,
    offer: item.data?.offer,
    l2_category: item.tracking?.common_attributes.l2_category,
    l1_category: item.tracking?.common_attributes.l1_category,
    l0_category: item.tracking?.common_attributes.l0_category,
    brand_name: item.data?.brand_name?.text,
    rating: item.tracking?.common_attributes.rating,
    group_id: item.data?.group_id,
    image_url: item.data?.image?.url,
    merchant_id: item.data?.meta?.merchant_id,
  };
});
