export type CakeShape =
  | "round"
  | "heart"
  | "rectangle"
  | "two-tier"
  | "cinnamon-roll"
  | "croissant"
  | "egg-tart"
  | "cookie";

export type SpongeType =
  | "vanilla-genoise"
  | "valrhona-cacao"
  | "red-velvet"
  | "matcha-uji";

export type GeleeType =
  | "strawberry-compote"
  | "dark-cherry"
  | "mango-passion"
  | "none";

export type MousseType =
  | "mascarpone-chantilly"
  | "strawberry-velvet"
  | "blueberry-yogurt"
  | "dark-choco-ganache";

export type FrostingFinish =
  | "rustic-buttercream"
  | "mirror-glaze"
  | "velvet-spray";

export type PipingStyle =
  | "wilton-shell"
  | "st-honore"
  | "ruffle-ribbon"
  | "drop-flowers"
  | "minimal";

export interface ToppingConfig {
  cherry: boolean;
  strawberry: boolean;
  sprinkles: boolean;
  ribbonBow: boolean;
  spiralCandle: boolean;
  crown: boolean;
  enamelPin: boolean;
}

export interface DrawPoint {
  x: number;
  y: number;
}

export interface DrawStroke {
  points: DrawPoint[];
  color: string;
  gauge: number;
}

export interface SmartDrawingState {
  strokes: DrawStroke[];
  presetText: string;
  customText: string;
  textColor: string;
  tipGauge: number;
}


export interface ProposalPreset {
  id: string;
  title: string;
  subtitle: string;
  category: "celebration" | "daily";
  slide: string;
  price: string;
  shape: CakeShape;
  size: number;
  sponge: SpongeType;
  gelee: GeleeType;
  mousse: MousseType;
  finish: FrostingFinish;
  frostingColor: string;
  pipingStyle: PipingStyle;
  pipingColor: string;
  toppings: ToppingConfig;
  image: string;
  description: string;
  curatorCritique: string;
}

export interface SpongeOption {
  id: SpongeType;
  name: string;
  sub: string;
  color: string;
  roughness: number;
  bakingTemp: string;
  flavorProfile: string;
}

export interface GeleeOption {
  id: GeleeType;
  name: string;
  sub: string;
  color: string;
  viscosity: string;
  acidity: string;
}

export interface MousseOption {
  id: MousseType;
  name: string;
  sub: string;
  color: string;
  fatContent: string;
  bloomStrength: string;
}

export interface FrostingColorOption {
  name: string;
  hex: string;
  pantone: string;
  flavorExtract: string;
}

export const SPONGE_OPTIONS: SpongeOption[] = [
  {
    id: "vanilla-genoise",
    name: "Vanilla Genoise",
    sub: "Cốt bọt sữa mềm nhẹ, thơm bơ Pháp",
    color: "#F7E7B4",
    roughness: 0.75,
    bakingTemp: "165°C • 32 phút",
    flavorProfile: "Bơ béo dịu, vani Madagascar nguyên trái",
  },
  {
    id: "valrhona-cacao",
    name: "Valrhona Chiffon Cacao",
    sub: "Ẩm mượt, đắng sâu từ bột Cacao Pháp 70%",
    color: "#4A2E1B",
    roughness: 0.8,
    bakingTemp: "160°C • 38 phút",
    flavorProfile: "Socola nguyên chất sâu lắng, ít ngọt",
  },
  {
    id: "red-velvet",
    name: "Red Velvet Velvet",
    sub: "Đỏ nhung quyến rũ nướng từ củ dền & cacao",
    color: "#8B0021",
    roughness: 0.7,
    bakingTemp: "168°C • 30 phút",
    flavorProfile: "Chua nhẹ buttermilk hòa quyện cacao nhung",
  },
  {
    id: "matcha-uji",
    name: "Matcha Uji Kyoto",
    sub: "Xanh ngọc thanh tao từ trà xanh Uji ceremonial",
    color: "#587E4C",
    roughness: 0.72,
    bakingTemp: "160°C • 35 phút",
    flavorProfile: "Chát thanh tao, hậu vị ngọt umami quý tộc",
  },
];

export const GELEE_OPTIONS: GeleeOption[] = [
  {
    id: "strawberry-compote",
    name: "Mứt Dâu Tây Mọng (Strawberry Compote)",
    sub: "Dâu Đà Lạt nấu chậm với đường phèn & pectin",
    color: "#B8002E",
    viscosity: "Độ sánh 0.85 (dẻo quánh)",
    acidity: "pH 3.4 • Cân bằng vị chua",
  },
  {
    id: "dark-cherry",
    name: "Cherry Đen Cô Đặc (Dark Cherry Gelée)",
    sub: "Cherry đen Burgundy đun rượu Kirsch",
    color: "#5E091A",
    viscosity: "Độ sánh 0.90 (dày mượt)",
    acidity: "pH 3.6 • Hậu vị vang đỏ",
  },
  {
    id: "mango-passion",
    name: "Xoài Cát & Chanh Leo (Tropical Curd)",
    sub: "Vị nhiệt đới chua rực rỡ đánh thức vị giác",
    color: "#FFA000",
    viscosity: "Độ sánh 0.80 (mọng nước)",
    acidity: "pH 3.1 • Vị chua bùng nổ",
  },
  {
    id: "none",
    name: "Không dùng lớp sốt mứt",
    sub: "Chỉ tập trung vào cốt gateau và mousse béo ngậy",
    color: "transparent",
    viscosity: "0",
    acidity: "pH 7.0",
  },
];

export const MOUSSE_OPTIONS: MousseOption[] = [
  {
    id: "mascarpone-chantilly",
    name: "Mascarpone Chantilly Cream",
    sub: "Phô mai Ý đánh bông tươi với kem sữa béo 38%",
    color: "#FFFDF5",
    fatContent: "38% Động vật nguyên chất",
    bloomStrength: "180 Bloom (Tan chảy ở thân nhiệt 37°C)",
  },
  {
    id: "strawberry-velvet",
    name: "Strawberry Velvet Mousse",
    sub: "Mousse dâu tây hồng pastel mịn như lụa",
    color: "#FFAEC9",
    fatContent: "32% Nhẹ nhàng thanh thoát",
    bloomStrength: "200 Bloom (Giữ form sắc nét)",
  },
  {
    id: "blueberry-yogurt",
    name: "Việt Quất Sữa Chua Hy Lạp",
    sub: "Tím ngọc quyến rũ, chua thanh men tự nhiên",
    color: "#7C5295",
    fatContent: "28% Healthy & tươi mát",
    bloomStrength: "190 Bloom (Mềm mọng êm dịu)",
  },
  {
    id: "dark-choco-ganache",
    name: "Valrhona Guanaja 70% Ganache",
    sub: "Đậm đặc bóng mượt, vị đắng chocolate đỉnh cao",
    color: "#3E2723",
    fatContent: "42% Phú dưỡng hoàng gia",
    bloomStrength: "220 Bloom (Vững chắc chịu lực)",
  },
];

export const FROSTING_PALETTE: FrostingColorOption[] = [
  {
    name: "Cotton Candy Pink",
    hex: "#FFAEC9",
    pantone: "Pantone 189 C",
    flavorExtract: "Chiết xuất củ dền & dâu tây dại",
  },
  {
    name: "Baby Sky Blue",
    hex: "#A0C4FF",
    pantone: "Pantone 291 C",
    flavorExtract: "Tảo Spirulina xanh tự nhiên",
  },
  {
    name: "Fresh Mint Green",
    hex: "#BEE3DB",
    pantone: "Pantone 566 C",
    flavorExtract: "Lá bạc hà dại & mầm lúa mì non",
  },
  {
    name: "Butter Cream",
    hex: "#FFF9E6",
    pantone: "Pantone 705 C",
    flavorExtract: "Bơ béo mộc tự nhiên vùng Normandy",
  },
  {
    name: "Royal Lavender",
    hex: "#E2C6FF",
    pantone: "Pantone 2635 C",
    flavorExtract: "Hoa đậu biếc & mâm xôi đen",
  },
  {
    name: "Sweet Peach",
    hex: "#FFD1BA",
    pantone: "Pantone 155 C",
    flavorExtract: "Đào chuông chín mọng mỡ màng",
  },
  {
    name: "Valrhona Deep Choco",
    hex: "#3D2314",
    pantone: "Pantone 4695 C",
    flavorExtract: "Cacao nướng chậm 120 giờ",
  },
  {
    name: "Ruby Cherry Velvet",
    hex: "#C71585",
    pantone: "Pantone 226 C",
    flavorExtract: "Quả anh đào dại ngâm men tuyết",
  },
];

export const PIPING_STYLES = [
  {
    id: "wilton-shell" as PipingStyle,
    name: "Đui Vỏ Sò Hoàng Gia (Wilton #21)",
    sub: "Chuỗi ren sò liên hoàn uốn lượn cổ điển Lambeth",
    icon: "🐚",
  },
  {
    id: "st-honore" as PipingStyle,
    name: "Đui Cánh Buồm St. Honoré (#V10)",
    sub: "Sóng kem vát nghiêng thanh lịch phong cách Pháp",
    icon: "⛵",
  },
  {
    id: "ruffle-ribbon" as PipingStyle,
    name: "Đui Bèo Nhún Ren (Ruffle Ribbon #104)",
    sub: "Nếp xếp ly nữ tính bồng bềnh tựa váy dạ hội",
    icon: "🎀",
  },
  {
    id: "drop-flowers" as PipingStyle,
    name: "Đui Nụ Hoa Kem Nổi (Rosettes)",
    sub: "Chóp búp kem tròn trịa đính ngọc trai đường",
    icon: "🌸",
  },
  {
    id: "minimal" as PipingStyle,
    name: "Thành Trơn Tối Giản (Minimalist Smooth)",
    sub: "Mặt phẳng sắc cạnh tinh tế, không bắt hoa viền",
    icon: "✨",
  },
];

export const PROPOSAL_PRESETS: ProposalPreset[] = [
  {
    id: "preset-round-lambeth",
    title: "Vintage Round Lambeth",
    subtitle: "Bánh Tròn Kỷ Niệm Cổ Điển",
    category: "celebration",
    slide: "Trang 58-59",
    price: "420.000 VNĐ",
    shape: "round",
    size: 16,
    sponge: "vanilla-genoise",
    gelee: "strawberry-compote",
    mousse: "mascarpone-chantilly",
    finish: "rustic-buttercream",
    frostingColor: "#FFAEC9",
    pipingStyle: "wilton-shell",
    pipingColor: "#FFFDF5",
    toppings: {
      cherry: true,
      strawberry: false,
      sprinkles: true,
      ribbonBow: false,
      spiralCandle: false,
      crown: false,
      enamelPin: false,
    },
    image: "/assets/extracted_images/p58_01_product_line___celebration_cak.png",
    description:
      "Tác phẩm biểu tượng của Wishes: cốt Genoise vani, mứt dâu tây mọng, ren sò Lambeth Wilton #21 và quả anh đào bóng đọng sương.",
    curatorCritique:
      "Một tác phẩm đạt chuẩn mực Bauhaus: hình trụ cân xứng hoàn hảo, độ dày lớp kem bơ mộc vừa vặn phản ánh đúng chất liệu bơ tươi nguyên bản.",
  },
  {
    id: "preset-wonky-heart",
    title: "Harajuku Wonky Heart",
    subtitle: "Trái Tim Uốn Lượn Bất Đối Xứng",
    category: "celebration",
    slide: "Trang 58",
    price: "450.000 VNĐ",
    shape: "heart",
    size: 16,
    sponge: "red-velvet",
    gelee: "dark-cherry",
    mousse: "strawberry-velvet",
    finish: "rustic-buttercream",
    frostingColor: "#FFAEC9",
    pipingStyle: "ruffle-ribbon",
    pipingColor: "#FFFDF5",
    toppings: {
      cherry: true,
      strawberry: false,
      sprinkles: true,
      ribbonBow: true,
      spiralCandle: false,
      crown: false,
      enamelPin: false,
    },
    image: "/assets/extracted_images/p58_02_product_line___celebration_cak.png",
    description:
      "Đường viền cong bất đối xứng phong cách Y2K Sweetcore, kết hợp bèo nhún ren số #104 và nơ lụa satin xanh baby chính hãng Wishes.",
    curatorCritique:
      "Chủ nghĩa siêu thực thể hiện trọn vẹn: đường cong phá vỡ sự nghiêm cẩn của khối hình học truyền thống, tựa như đồng hồ chảy của Dalí được đúc bằng kem bơ.",
  },
  {
    id: "preset-baroque-rect",
    title: "Baroque Heritage Rectangle",
    subtitle: "Bánh Chữ Nhật Hoàng Gia Tiệc Trà",
    category: "celebration",
    slide: "Trang 59",
    price: "480.000 VNĐ",
    shape: "rectangle",
    size: 20,
    sponge: "valrhona-cacao",
    gelee: "none",
    mousse: "dark-choco-ganache",
    finish: "mirror-glaze",
    frostingColor: "#3D2314",
    pipingStyle: "wilton-shell",
    pipingColor: "#FFF9E6",
    toppings: {
      cherry: true,
      strawberry: false,
      sprinkles: false,
      ribbonBow: false,
      spiralCandle: true,
      crown: false,
      enamelPin: true,
    },
    image: "/assets/extracted_images/p59_01_celebration_cakes___big_and_sm.png",
    description:
      "Tấm bạt tranh 150×200mm phủ men tráng gương socola Valrhona Guanaja, đính huy hiệu kim loại mạ vàng Enamel Pin độc bản.",
    curatorCritique:
      "Sự chính xác của kiến trúc Deconstructivism gặp gỡ Haute Pâtisserie. Lớp tráng gương phản xạ quang học tuyệt mỹ tựa thủy tinh Murano.",
  },
  {
    id: "preset-royal-2tier",
    title: "Royal 2-Tier Castle",
    subtitle: "Bánh 2 Tầng Lệch Cung Đình",
    category: "celebration",
    slide: "Trang 58",
    price: "850.000 VNĐ",
    shape: "two-tier",
    size: 24,
    sponge: "vanilla-genoise",
    gelee: "mango-passion",
    mousse: "mascarpone-chantilly",
    finish: "rustic-buttercream",
    frostingColor: "#FFF9E6",
    pipingStyle: "st-honore",
    pipingColor: "#FFAEC9",
    toppings: {
      cherry: true,
      strawberry: true,
      sprinkles: true,
      ribbonBow: true,
      spiralCandle: true,
      crown: true,
      enamelPin: true,
    },
    image: "/assets/extracted_images/p58_01_product_line___celebration_cak.png",
    description:
      "Đế bánh 20cm vững chắc nâng đỡ tầng ngọn 12cm, có trụ chịu lực cắm ngầm, vương miện giấy sinh nhật và nến xoắn ốc pastel.",
    curatorCritique:
      "Cấu trúc chịu lực phân tầng hoàn hảo! Trọng lượng tầng ngọn được triệt tiêu áp lực cơ học bằng hệ dầm chịu tải chuẩn kỹ thuật.",
  },
  {
    id: "preset-cinnamon-roll",
    title: "Warm Vanilla Cinnamon Roll",
    subtitle: "Bánh Quế Cuộn Kem Chảy",
    category: "daily",
    slide: "Trang 60-61",
    price: "45.000 VNĐ",
    shape: "cinnamon-roll",
    size: 12,
    sponge: "vanilla-genoise",
    gelee: "none",
    mousse: "mascarpone-chantilly",
    finish: "mirror-glaze",
    frostingColor: "#FFF9E6",
    pipingStyle: "minimal",
    pipingColor: "#FFF9E6",
    toppings: {
      cherry: false,
      strawberry: false,
      sprinkles: false,
      ribbonBow: false,
      spiralCandle: false,
      crown: false,
      enamelPin: false,
    },
    image: "/assets/extracted_images/p61_01_product___cinnamon_roll_pricin.png",
    description:
      "Vỏ bánh quế cuộn xoắn ốc vàng nâu caramel, phủ đẫm dòng kem vani cream cheese chảy béo ngậy thơm lừng.",
    curatorCritique:
      "Dòng kem nhỏ giọt tự do (Organic Drips) mang đậm tinh thần của chủ nghĩa biểu hiện trừu tượng. Một bữa sáng đáng kính trọng.",
  },
  {
    id: "preset-french-croissant",
    title: "French Butter Croissant",
    subtitle: "Bánh Sừng Bò Bơ Pháp Ngàn Lớp",
    category: "daily",
    slide: "Trang 60, 64",
    price: "40.000 VNĐ",
    shape: "croissant",
    size: 14,
    sponge: "vanilla-genoise",
    gelee: "none",
    mousse: "mascarpone-chantilly",
    finish: "mirror-glaze",
    frostingColor: "#D48B38",
    pipingStyle: "minimal",
    pipingColor: "#FFF9E6",
    toppings: {
      cherry: false,
      strawberry: false,
      sprinkles: false,
      ribbonBow: false,
      spiralCandle: false,
      crown: false,
      enamelPin: false,
    },
    image: "/assets/extracted_images/p64_01_product___croissant_pricing.png",
    description:
      "Vỏ xốp ngàn lớp gấp từ bơ Tourage Pháp nguyên chất, nướng vàng ươm caramel giòn tan từng kẽ vỏ rỗng.",
    curatorCritique:
      "Cấu trúc tổ ong bên trong (Alvéolage) là minh chứng thép cho tính chân thực của vật liệu: bơ, bột mì và nhiệt độ chính xác tới từng giây.",
  },
  {
    id: "preset-egg-tart",
    title: "Custard Egg Tart",
    subtitle: "Tart Trứng Vỏ Ngàn Lớp Nướng Cháy",
    category: "daily",
    slide: "Trang 60, 63",
    price: "35.000 VNĐ",
    shape: "egg-tart",
    size: 10,
    sponge: "vanilla-genoise",
    gelee: "none",
    mousse: "mascarpone-chantilly",
    finish: "mirror-glaze",
    frostingColor: "#FFA000",
    pipingStyle: "minimal",
    pipingColor: "#FFF9E6",
    toppings: {
      cherry: false,
      strawberry: false,
      sprinkles: false,
      ribbonBow: false,
      spiralCandle: false,
      crown: false,
      enamelPin: false,
    },
    image: "/assets/extracted_images/p63_01_product___egg_tart_pricing.png",
    description:
      "Vỏ tart ngàn lớp giòn rụm ôm trọn phần nhân kem trứng custard mềm mượt núng nính, bề mặt caramen đốm cháy đặc trưng.",
    curatorCritique:
      "Vệt caramen cháy nâu đốm mảng (Brûlée) tạo nhịp điệu tương phản cực kỳ cuốn hút giữa lòng vàng custard béo và thành vỏ xếp lớp.",
  },
  {
    id: "preset-soft-cookie",
    title: "Artisanal Soft Cookie",
    subtitle: "Bánh Quy Mềm Hạt Dẻ & Chocolate",
    category: "daily",
    slide: "Trang 60, 62",
    price: "35.000 VNĐ",
    shape: "cookie",
    size: 10,
    sponge: "valrhona-cacao",
    gelee: "none",
    mousse: "dark-choco-ganache",
    finish: "rustic-buttercream",
    frostingColor: "#587E4C",
    pipingStyle: "minimal",
    pipingColor: "#FFF9E6",
    toppings: {
      cherry: false,
      strawberry: false,
      sprinkles: true,
      ribbonBow: false,
      spiralCandle: false,
      crown: false,
      enamelPin: false,
    },
    image: "/assets/extracted_images/p62_01_product___cookie_pricing.png",
    description:
      "Cookie nướng mộc phong cách New York, vỏ ngoài giòn nhẹ, ruột dẻo mềm thơm mùi bơ nâu và vụn socola Valrhona nguyên khối.",
    curatorCritique:
      "Độ gồ ghề ngẫu hứng của địa hình bề mặt là đỉnh cao của điêu khắc hữu cơ (Organic Sculpture) — không chiếc nào giống chiếc nào.",
  },
];
