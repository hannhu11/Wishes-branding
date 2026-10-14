export type CakeShape =
  | "round"
  | "heart"
  | "rectangle"
  | "two-tier"
  | "cat-y2k"
  | "puppy-bow"
  | "cookie-bear"
  | "croissant-bow"
  | "cinnamon-roll"
  | "egg-tart"
  | "cookie"
  | "croissant";

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
  | "velvet-spray"
  | "ombre-gradient"
  | "airbrush-stars";

export type PipingStyle =
  | "wilton-shell"
  | "st-honore"
  | "ruffle-ribbon"
  | "drop-flowers"
  | "minimal";

export type PipingPosition =
  | "top-only"
  | "dual-rim"
  | "full-lambeth-swag";

export type AccessoryType =
  | "cherry"
  | "strawberry"
  | "blueberry-cluster"
  | "satin-bow"
  | "crown"
  | "spiral-candle"
  | "number-candle"
  | "sugar-pearls"
  | "piped-flowers"
  | "chocolate-bear"
  | "cat-glasses-ears"
  | "puppy-bow-ears"
  | "macaron"
  | "chocolate-plaque"
  | "enamel-pin"
  | "wafer-butterfly";

export interface AccessoryItem {
  id: string;
  type: AccessoryType;
  count: number; // 1 to 12
  layout: "center" | "ring" | "corners" | "front-arc" | "scatter" | "custom";
  color?: string;
  scale: number; // 0.7 to 1.4
  customText?: string; // e.g. "20" for number candle or text on chocolate plaque
  unitPrice: number; // VND price per unit/set
  customPositions?: [number, number, number][]; // For click-to-place on 3D surface
}

export interface AccessoryCatalogEntry {
  type: AccessoryType;
  name: string;
  sub: string;
  icon: string;
  unitPrice: number;
  priceFormatted: string;
  allowedCounts: number[];
  defaultLayout: "center" | "ring" | "corners" | "front-arc" | "scatter" | "custom";
  description: string;
  proposalSlide?: string;
}

export const ACCESSORY_CATALOG: AccessoryCatalogEntry[] = [
  {
    type: "cherry",
    name: "Quả Cherry Đỏ Bóng Cuống Cong",
    sub: "Cherry ruby đọng sương, cuống uốn",
    icon: "🍒",
    unitPrice: 12000,
    priceFormatted: "12.000đ / quả",
    allowedCounts: [1, 2, 4, 6, 8, 12],
    defaultLayout: "center",
    description: "Cherry ruby tươi đọng giọt sương mai với cuống xanh uốn lượn tự nhiên.",
    proposalSlide: "Slide 59",
  },
  {
    type: "strawberry",
    name: "Dâu Tây Đà Lạt Tươi",
    sub: "Dâu tây bổ đôi hoặc nguyên quả",
    icon: "🍓",
    unitPrice: 15000,
    priceFormatted: "15.000đ / quả",
    allowedCounts: [1, 2, 4, 6, 8],
    defaultLayout: "ring",
    description: "Dâu tây tươi mọng hái từ nông trại Đà Lạt với đài hoa xanh biếc.",
    proposalSlide: "Slide 58",
  },
  {
    type: "blueberry-cluster",
    name: "Việt Quất Phủ Bụi Vàng",
    sub: "Chùm quả việt quất điểm bột vàng 24K",
    icon: "🫐",
    unitPrice: 25000,
    priceFormatted: "25.000đ / cụm",
    allowedCounts: [1, 2, 4, 6],
    defaultLayout: "ring",
    description: "Cụm việt quất nhập khẩu điểm bụi vàng thực phẩm sang trọng.",
    proposalSlide: "Slide 38",
  },
  {
    type: "satin-bow",
    name: "Nơ Lụa Satin Wishes",
    sub: "Ruy-băng lụa cao cấp thắt nơ",
    icon: "🎀",
    unitPrice: 18000,
    priceFormatted: "18.000đ / chiếc",
    allowedCounts: [1, 2, 4, 8],
    defaultLayout: "corners",
    description: "Nơ lụa satin màu Pastel Blue / Pink đính góc hoặc gắn thành bánh.",
    proposalSlide: "Slide 45, 84",
  },
  {
    type: "crown",
    name: "Vương Miện Công Chúa Mạ Vàng",
    sub: "Vương miện tiara dát ánh kim",
    icon: "👑",
    unitPrice: 45000,
    priceFormatted: "45.000đ / chiếc",
    allowedCounts: [1],
    defaultLayout: "center",
    description: "Vương miện tiara mạ vàng hoàng gia đặt chính tâm hoặc đội lệch góc Wonky.",
    proposalSlide: "Slide 85",
  },
  {
    type: "spiral-candle",
    name: "Nến Xoắn Pastel Hàn Quốc",
    sub: "Nến xoắn pastel uốn lượn phát sáng",
    icon: "🕯️",
    unitPrice: 8000,
    priceFormatted: "8.000đ / cây",
    allowedCounts: [1, 3, 5, 8],
    defaultLayout: "ring",
    description: "Nến sáp đậu nành xoắn pastel phong cách Hàn Quốc kèm ngọn lửa lung linh.",
    proposalSlide: "Slide 58",
  },
  {
    type: "number-candle",
    name: "Nến Số Sinh Nhật Phát Sáng",
    sub: "Cặp số tuổi ánh kim (00 – 99)",
    icon: "🔢",
    unitPrice: 20000,
    priceFormatted: "20.000đ / cặp",
    allowedCounts: [1],
    defaultLayout: "center",
    description: "Cặp nến số sinh nhật mạ vàng pastel đánh dấu cột mốc tuổi ý nghĩa.",
    proposalSlide: "Slide 4",
  },
  {
    type: "sugar-pearls",
    name: "Kẹo Cốm Ngôi Sao & Ngọc Trai",
    sub: "Hạt đường ngọc trai 2mm & sao pastel",
    icon: "✨",
    unitPrice: 15000,
    priceFormatted: "15.000đ / set",
    allowedCounts: [1],
    defaultLayout: "scatter",
    description: "Hạt ngọc trai đường mini 2mm, cốm que và cốm ngôi sao pastel nhập khẩu Pháp.",
    proposalSlide: "Slide 40, 44",
  },
  {
    type: "piped-flowers",
    name: "Hoa Kem Bơ Daisy 5 Cánh",
    sub: "Set 6 bông cúc kem bơ nhụy vàng",
    icon: "🌸",
    unitPrice: 20000,
    priceFormatted: "20.000đ / set 6 bông",
    allowedCounts: [1, 2, 3],
    defaultLayout: "ring",
    description: "Hoa cúc kem bơ Pháp bắt tay thủ công tinh xảo từng cánh hoa mềm mại.",
    proposalSlide: "Slide 6, 38",
  },
  {
    type: "chocolate-bear",
    name: "Gấu Socola Ngủ Đắp Chăn",
    sub: "Tượng gấu socola điêu khắc 3D",
    icon: "🧸",
    unitPrice: 30000,
    priceFormatted: "30.000đ / chú gấu",
    allowedCounts: [1, 2],
    defaultLayout: "center",
    description: "Chú gấu socola Valrhona ngủ ngoan trên gối kem bông, đắp chăn đường dập nổi.",
    proposalSlide: "Slide 42, 62",
  },
  {
    type: "cat-glasses-ears",
    name: "Tai Mèo & Kính Mát Sao Y2K",
    sub: "Bộ phụ kiện mèo cá tính Y2K",
    icon: "🐱",
    unitPrice: 35000,
    priceFormatted: "35.000đ / bộ",
    allowedCounts: [1],
    defaultLayout: "center",
    description: "Cặp tai mèo kem nhọn 3D kết hợp mắt kính ngôi sao cam neon siêu ngầu.",
    proposalSlide: "Slide 58",
  },
  {
    type: "puppy-bow-ears",
    name: "Tai Cún Xù Đính Nơ Baby",
    sub: "Bộ tai cún kem mềm thắt nơ xanh",
    icon: "🐶",
    unitPrice: 35000,
    priceFormatted: "35.000đ / bộ",
    allowedCounts: [1],
    defaultLayout: "center",
    description: "Đôi tai cún cụp bồng bềnh thắt nơ lụa satin xanh baby và mắt mũi đáng yêu.",
    proposalSlide: "Slide 59",
  },
  {
    type: "macaron",
    name: "Bánh Macaron Mini Pháp",
    sub: "Macaron chân váy viền kem pastel",
    icon: "🍪",
    unitPrice: 22000,
    priceFormatted: "22.000đ / chiếc",
    allowedCounts: [1, 3, 5],
    defaultLayout: "ring",
    description: "Bánh macaron bột hạnh nhân chân váy nở đều, nhân ganache thơm ngát.",
    proposalSlide: "Slide 60",
  },
  {
    type: "chocolate-plaque",
    name: "Bảng Socola Trắng Khắc Tên",
    sub: "Bảng socola chữ nổi thư pháp",
    icon: "🍫",
    unitPrice: 20000,
    priceFormatted: "20.000đ / bảng",
    allowedCounts: [1],
    defaultLayout: "center",
    description: "Tấm bảng socola trắng viền ren uốn lượn nâng đỡ dòng chữ kỷ niệm nổi bật.",
    proposalSlide: "Slide 38",
  },
  {
    type: "enamel-pin",
    name: "Huy Hiệu Kim Loại Enamel Pin",
    sub: "Ghim mạ vàng Wishes ở thành bánh",
    icon: "🏅",
    unitPrice: 45000,
    priceFormatted: "45.000đ / chiếc",
    allowedCounts: [1],
    defaultLayout: "front-arc",
    description: "Huy hiệu kim loại tráng men cao cấp mạ vàng đính dải ruy-băng thành bánh.",
    proposalSlide: "Slide 83",
  },
  {
    type: "wafer-butterfly",
    name: "Bướm Giấy Gạo & Lá Vàng 24K",
    sub: "Cánh bướm trong suốt dát lá vàng",
    icon: "🦋",
    unitPrice: 25000,
    priceFormatted: "25.000đ / set",
    allowedCounts: [1, 2],
    defaultLayout: "scatter",
    description: "Đôi bướm giấy gạo mỏng nhẹ ăn được đang đậu trên viền bánh phủ vàng 24K.",
    proposalSlide: "Slide 6, 58",
  },
];

export interface ToppingConfig {
  cherry: boolean;
  strawberry: boolean;
  sprinkles: boolean;
  ribbonBow: boolean;
  spiralCandle: boolean;
  crown: boolean;
  enamelPin: boolean;
}

export type TypographyFont =
  | "playfair-swash"
  | "script-calligraphy"
  | "fredoka-bubbly"
  | "serif-royal"
  | "cute-handwritten"
  | "minimal-sans";

export type TextAlignment = "left" | "center" | "right";
export type TextCurvature = "straight" | "arc-top" | "arc-bottom" | "plaque";

export interface TypographyState {
  text: string;
  font: TypographyFont;
  fontSize: number; // 14 to 44
  lineHeight: number; // 1.0 to 1.8
  align: TextAlignment;
  curve: TextCurvature;
  color: string;
  offsetX: number; // -50 to 50
  offsetY: number; // -50 to 50
}

export const FONT_OPTIONS: { id: TypographyFont; name: string; styleName: string; fontFam: string }[] = [
  { id: "playfair-swash", name: "Parisian Swash Italic", styleName: "Cổ điển Paris quý tộc", fontFam: "'Playfair Display', Georgia, serif" },
  { id: "script-calligraphy", name: "Smooth Calligraphy", styleName: "Chữ viết tay kem bơ mềm mại", fontFam: "'Dancing Script', 'Brush Script MT', cursive" },
  { id: "fredoka-bubbly", name: "Fredoka Bubbly Y2K", styleName: "Tròn trịa ngọt ngào Sweetcore", fontFam: "'Fredoka', 'Quicksand', sans-serif" },
  { id: "serif-royal", name: "Royal Roman Serif", styleName: "Trang trọng chuẩn phong cách Hoàng Gia", fontFam: "'Cinzel', 'Times New Roman', serif" },
  { id: "cute-handwritten", name: "Wonky Handwritten", styleName: "Ngộ nghĩnh phóng khoáng Harajuku", fontFam: "'Caveat', cursive" },
  { id: "minimal-sans", name: "Minimal Haute Sans", styleName: "Hiện đại tinh gọn chuẩn Bauhaus", fontFam: "'Inter', -apple-system, sans-serif" },
];

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
  pipingPosition?: PipingPosition;
  toppings: ToppingConfig;
  accessories?: AccessoryItem[];
  typography?: Partial<TypographyState>;
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
  surcharge?: number;
}

export interface MousseOption {
  id: MousseType;
  name: string;
  sub: string;
  color: string;
  fatContent: string;
  bloomStrength: string;
  surcharge?: number;
}

export interface FrostingColorOption {
  name: string;
  hex: string;
  pantone: string;
  flavorExtract: string;
}

export interface ColorHarmonySuggestion {
  vibe: string;
  pipingColor: string;
  pipingName: string;
  textColor: string;
  textName: string;
}

export const COLOR_HARMONY_SUGGESTIONS: Record<string, ColorHarmonySuggestion[]> = {
  "#FFAEC9": [
    { vibe: "💖 Sweet Coquette (Ngọt Ngào)", pipingColor: "#FFFDF5", pipingName: "Trắng Mascarpone", textColor: "#4A2E1B", textName: "Cacao Đậm" },
    { vibe: "🌸 Pastel Dream (Mộng Mơ)", pipingColor: "#A0C4FF", pipingName: "Xanh Baby Sky", textColor: "#C71585", textName: "Ruby Cherry" },
    { vibe: "✨ Golden Princess (Hoàng Gia)", pipingColor: "#FFF9E6", pipingName: "Kem Bơ Vani", textColor: "#DAA520", textName: "Vàng Gold" },
  ],
  "#A0C4FF": [
    { vibe: "🌊 Sky Cloud (Mây Trời)", pipingColor: "#FFFDF5", pipingName: "Trắng Tuyết", textColor: "#203A63", textName: "Xanh Navy Sâu" },
    { vibe: "🎀 Baby Love (Y2K Pastel)", pipingColor: "#FFAEC9", pipingName: "Hồng Baby", textColor: "#4A2E1B", textName: "Socola Nâu" },
    { vibe: "⭐ Starry Night (Bắc Âu)", pipingColor: "#FFF9E6", pipingName: "Kem Bơ Vani", textColor: "#DAA520", textName: "Vàng Ánh Kim" },
  ],
  "#BEE3DB": [
    { vibe: "🌿 Fresh Garden (Thảo Mộc)", pipingColor: "#FFFDF5", pipingName: "Trắng Tinh Khôi", textColor: "#2D5A43", textName: "Xanh Rừng Sâu" },
    { vibe: "🧁 Macaron Pistachio", pipingColor: "#FFD1BA", pipingName: "Cam Đào Nhạt", textColor: "#4A2E1B", textName: "Cacao Đậm" },
    { vibe: "✨ Mint Velvet (Thanh Lịch)", pipingColor: "#FFAEC9", pipingName: "Hồng Phấn", textColor: "#233D35", textName: "Xanh Bạc Hà Sâu" },
  ],
  "#FFF9E6": [
    { vibe: "👑 Royal Lambeth (Cổ Điển)", pipingColor: "#FFAEC9", pipingName: "Hồng Phấn", textColor: "#4A2E1B", textName: "Cacao Đậm" },
    { vibe: "🍒 Parisian Bistro (Đỏ Anh Đào)", pipingColor: "#FFFDF5", pipingName: "Trắng Sữa", textColor: "#C71585", textName: "Ruby Cherry" },
    { vibe: "🍫 Normandy Butter (Mộc Mạc)", pipingColor: "#FFF9E6", pipingName: "Kem Bơ Tươi", textColor: "#3D2314", textName: "Valrhona 70%" },
  ],
  "#E2C6FF": [
    { vibe: "💜 Lavender Fairy (Tiên Hoa)", pipingColor: "#FFFDF5", pipingName: "Trắng Tinh Khôi", textColor: "#4B286D", textName: "Tím Thẫm Hoàng Gia" },
    { vibe: "🎀 Sweet K-Pop (Ngọt Kẹo)", pipingColor: "#FFAEC9", pipingName: "Hồng Baby", textColor: "#4A2E1B", textName: "Cacao Đậm" },
    { vibe: "🌌 Cosmic Star (Ngân Hà)", pipingColor: "#A0C4FF", pipingName: "Xanh Băng Giá", textColor: "#FFFFFF", textName: "Trắng Ánh Kim" },
  ],
  "#FFD1BA": [
    { vibe: "🍑 Juicy Peach (Đào Mọng)", pipingColor: "#FFFDF5", pipingName: "Trắng Mascarpone", textColor: "#8A3324", textName: "Đỏ Nâu Đào" },
    { vibe: "🌸 Spring Blossom (Xuân Về)", pipingColor: "#FFAEC9", pipingName: "Hồng Phấn", textColor: "#4A2E1B", textName: "Cacao Đậm" },
    { vibe: "🍯 Golden Honey (Mật Ong)", pipingColor: "#FFF9E6", pipingName: "Kem Vani", textColor: "#7A4419", textName: "Caramel Đậm" },
  ],
  "#3D2314": [
    { vibe: "🍫 Haute Dark Choco (Đẳng Cấp)", pipingColor: "#FFF9E6", pipingName: "Kem Vani Pháp", textColor: "#DAA520", textName: "Vàng Gold 24K" },
    { vibe: "🍓 Forest Cherry (Rừng Đen)", pipingColor: "#FFAEC9", pipingName: "Hồng Dâu", textColor: "#FFFDF5", textName: "Trắng Bột Đường" },
    { vibe: "✨ Mirror Luxury (Tráng Gương)", pipingColor: "#FFFDF5", pipingName: "Trắng Tuyết", textColor: "#FFFFFF", textName: "Trắng Sáng Nổi" },
  ],
  "#C71585": [
    { vibe: "🌹 Crimson Romance (Tình Ca)", pipingColor: "#FFFDF5", pipingName: "Trắng Sữa", textColor: "#4A0028", textName: "Đỏ Rượu Vang" },
    { vibe: "💖 Glamour Y2K (Quyến Rũ)", pipingColor: "#FFAEC9", pipingName: "Hồng Pastel", textColor: "#FFFFFF", textName: "Trắng Nổi Bật" },
    { vibe: "👑 Baroque Empress (Nữ Hoàng)", pipingColor: "#FFF9E6", pipingName: "Kem Bơ Vani", textColor: "#DAA520", textName: "Vàng Gold 24K" },
  ],
};

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
    surcharge: 0,
  },
  {
    id: "dark-cherry",
    name: "Cherry Đen Cô Đặc (Dark Cherry Gelée)",
    sub: "Cherry đen Burgundy đun rượu Kirsch Pháp",
    color: "#5E091A",
    viscosity: "Độ sánh 0.90 (dày mượt)",
    acidity: "pH 3.6 • Hậu vị vang đỏ",
    surcharge: 15000,
  },
  {
    id: "mango-passion",
    name: "Xoài Cát & Chanh Leo (Tropical Curd)",
    sub: "Vị nhiệt đới chua rực rỡ đánh thức vị giác",
    color: "#FFA000",
    viscosity: "Độ sánh 0.80 (mọng nước)",
    acidity: "pH 3.1 • Vị chua bùng nổ",
    surcharge: 20000,
  },
  {
    id: "none",
    name: "Không dùng lớp sốt mứt",
    sub: "Chỉ tập trung vào cốt gateau và mousse béo ngậy",
    color: "transparent",
    viscosity: "0",
    acidity: "pH 7.0",
    surcharge: 0,
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
    surcharge: 0,
  },
  {
    id: "strawberry-velvet",
    name: "Strawberry Velvet Mousse",
    sub: "Mousse dâu tây hồng pastel mịn như lụa",
    color: "#FFAEC9",
    fatContent: "32% Nhẹ nhàng thanh thoát",
    bloomStrength: "200 Bloom (Giữ form sắc nét)",
    surcharge: 15000,
  },
  {
    id: "blueberry-yogurt",
    name: "Việt Quất Sữa Chua Hy Lạp",
    sub: "Tím ngọc quyến rũ, chua thanh men tự nhiên",
    color: "#7C5295",
    fatContent: "28% Healthy & tươi mát",
    bloomStrength: "190 Bloom (Mềm mọng êm dịu)",
    surcharge: 20000,
  },
  {
    id: "dark-choco-ganache",
    name: "Valrhona Guanaja 70% Ganache",
    sub: "Đậm đặc bóng mượt, vị đắng chocolate đỉnh cao",
    color: "#3E2723",
    fatContent: "42% Phú dưỡng hoàng gia",
    bloomStrength: "220 Bloom (Vững chắc chịu lực)",
    surcharge: 35000,
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
    sub: "Chuỗi ren sò tiếp tuyến uốn lượn liên hoàn Lambeth",
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

export const PIPING_POSITIONS = [
  {
    id: "top-only" as PipingPosition,
    name: "Chỉ Viền Đỉnh Mặt Bánh",
    sub: "Dải hoa kem viền quanh mép trên",
    surcharge: 0,
  },
  {
    id: "dual-rim" as PipingPosition,
    name: "Đúp Viền Đỉnh & Chân Đế",
    sub: "Hoa kem trang nhã cả 2 viền trên dưới",
    surcharge: 15000,
  },
  {
    id: "full-lambeth-swag" as PipingPosition,
    name: "Full Rèm Ren Lambeth Thành Bánh",
    sub: "Rèm kem rủ võng cung uốn lượn như Slide 6 & 38",
    surcharge: 30000,
  },
];

export const PROPOSAL_PRESETS: ProposalPreset[] = [
  {
    id: "preset-round-lambeth",
    title: "01. Parisian Lambeth Cherry",
    subtitle: "Bánh Tròn Kỷ Niệm Cổ Điển",
    category: "celebration",
    slide: "Slide 58-59",
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
    pipingPosition: "dual-rim",
    toppings: {
      cherry: true,
      strawberry: false,
      sprinkles: true,
      ribbonBow: false,
      spiralCandle: false,
      crown: false,
      enamelPin: false,
    },
    accessories: [
      { id: "acc-1", type: "cherry", count: 6, layout: "ring", scale: 1.0, unitPrice: 12000 },
      { id: "acc-2", type: "sugar-pearls", count: 1, layout: "scatter", scale: 1.0, unitPrice: 15000 },
    ],
    typography: {
      text: "Make a Wish",
      font: "playfair-swash",
      fontSize: 28,
      align: "center",
      curve: "straight",
      color: "#4A2E1B",
    },
    image: "/assets/extracted_images/p58_01_product_line___celebration_cak.png",
    description:
      "Tác phẩm biểu tượng của Wishes: cốt Genoise vani, mứt dâu tây mọng, ren sò Lambeth Wilton #21 tiếp tuyến và vòng cherry ruby cuống cong đọng sương.",
    curatorCritique:
      "Một tác phẩm đạt chuẩn mực Bauhaus: hình trụ cân xứng hoàn hảo, độ dày lớp kem bơ mộc vừa vặn phản ánh đúng chất liệu bơ tươi nguyên bản.",
  },
  {
    id: "preset-cat-y2k",
    title: "02. Y2K Cool Cat Star",
    subtitle: "Mèo Ngầu Y2K Tai Nhọn Kính Cam",
    category: "celebration",
    slide: "Slide 58 FU CAKE",
    price: "485.000 VNĐ",
    shape: "cat-y2k",
    size: 16,
    sponge: "vanilla-genoise",
    gelee: "strawberry-compote",
    mousse: "strawberry-velvet",
    finish: "airbrush-stars",
    frostingColor: "#FFAEC9",
    pipingStyle: "drop-flowers",
    pipingColor: "#A0C4FF",
    pipingPosition: "dual-rim",
    toppings: {
      cherry: false,
      strawberry: false,
      sprinkles: true,
      ribbonBow: true,
      spiralCandle: false,
      crown: false,
      enamelPin: false,
    },
    accessories: [
      { id: "acc-cat-1", type: "cat-glasses-ears", count: 1, layout: "center", scale: 1.0, unitPrice: 35000 },
      { id: "acc-cat-2", type: "sugar-pearls", count: 1, layout: "scatter", scale: 1.0, unitPrice: 15000 },
    ],
    typography: {
      text: "Stay Cool Cat",
      font: "fredoka-bubbly",
      fontSize: 26,
      align: "center",
      curve: "arc-bottom",
      color: "#FF3366",
    },
    image: "/assets/extracted_images/p58_02_product_line___celebration_cak.png",
    description:
      "Bánh tạo hình chú mèo tròn trịa với tai nhọn 3D, mắt kính ngôi sao Y2K cam rực rỡ, họa tiết ngôi sao phun màu airbrush và chân viền hoa kem xanh baby.",
    curatorCritique:
      "Nguồn năng lượng Harajuku bùng nổ: sự kết hợp tinh nghịch giữa điêu khắc kem bơ 3D và đồ họa thị giác Gen Z Y2K.",
  },
  {
    id: "preset-wonky-heart",
    title: "03. Coquette Ribbon Heart",
    subtitle: "Trái Tim Uốn Lượn Bất Đối Xứng",
    category: "celebration",
    slide: "Slide 58",
    price: "468.000 VNĐ",
    shape: "heart",
    size: 16,
    sponge: "red-velvet",
    gelee: "dark-cherry",
    mousse: "strawberry-velvet",
    finish: "rustic-buttercream",
    frostingColor: "#FFAEC9",
    pipingStyle: "ruffle-ribbon",
    pipingColor: "#FFFDF5",
    pipingPosition: "dual-rim",
    toppings: {
      cherry: true,
      strawberry: false,
      sprinkles: true,
      ribbonBow: true,
      spiralCandle: false,
      crown: false,
      enamelPin: false,
    },
    accessories: [
      { id: "acc-heart-1", type: "satin-bow", count: 2, layout: "corners", scale: 1.0, unitPrice: 18000 },
      { id: "acc-heart-2", type: "cherry", count: 4, layout: "front-arc", scale: 0.9, unitPrice: 12000 },
      { id: "acc-heart-3", type: "sugar-pearls", count: 1, layout: "scatter", scale: 1.0, unitPrice: 15000 },
    ],
    typography: {
      text: "Je t'aime",
      font: "script-calligraphy",
      fontSize: 30,
      align: "center",
      curve: "arc-top",
      color: "#C71585",
    },
    image: "/assets/extracted_images/p58_02_product_line___celebration_cak.png",
    description:
      "Đường viền cong bất đối xứng phong cách Y2K Sweetcore, kết hợp bèo nhún ren số #104 và 2 nơ lụa satin xanh baby chính hãng Wishes.",
    curatorCritique:
      "Chủ nghĩa siêu thực thể hiện trọn vẹn: đường cong phá vỡ sự nghiêm cẩn của khối hình học truyền thống, tựa như đồng hồ chảy của Dalí được đúc bằng kem bơ.",
  },
  {
    id: "preset-puppy-bow",
    title: "04. Puppy Love Birthday",
    subtitle: "Cún Tai Dài Đính Nơ Satin",
    category: "celebration",
    slide: "Slide 59 FU CAKE",
    price: "495.000 VNĐ",
    shape: "puppy-bow",
    size: 16,
    sponge: "vanilla-genoise",
    gelee: "strawberry-compote",
    mousse: "mascarpone-chantilly",
    finish: "airbrush-stars",
    frostingColor: "#FFF9E6",
    pipingStyle: "drop-flowers",
    pipingColor: "#FFAEC9",
    pipingPosition: "dual-rim",
    toppings: {
      cherry: true,
      strawberry: false,
      sprinkles: true,
      ribbonBow: true,
      spiralCandle: false,
      crown: false,
      enamelPin: false,
    },
    accessories: [
      { id: "acc-pup-1", type: "puppy-bow-ears", count: 1, layout: "center", scale: 1.0, unitPrice: 35000 },
      { id: "acc-pup-2", type: "satin-bow", count: 2, layout: "corners", scale: 0.9, unitPrice: 18000 },
      { id: "acc-pup-3", type: "cherry", count: 1, layout: "front-arc", scale: 1.0, unitPrice: 12000 },
    ],
    typography: {
      text: "Happy Birthday",
      font: "fredoka-bubbly",
      fontSize: 26,
      align: "center",
      curve: "straight",
      color: "#4A2E1B",
    },
    image: "/assets/extracted_images/p59_01_celebration_cakes___big_and_sm.png",
    description:
      "Mô hình chú cún kem xù đáng yêu với 2 tai cụp thắt nơ xanh baby, quả cherry bóng trước bàn chân và họa tiết ngôi sao airbrush.",
    curatorCritique:
      "Sự kết hợp ngọt ngào giữa thủ công bơ kem Pháp và văn hóa Kawaii Á Đông, mang lại xúc cảm ấm áp cho mọi bữa tiệc.",
  },
  {
    id: "preset-cookie-bear",
    title: "05. Sleepy Bear Blanket Cookie",
    subtitle: "Bánh Quy Bơ Gấu Đắp Chăn Kem",
    category: "daily",
    slide: "Slide 42 & 62",
    price: "65.000 VNĐ",
    shape: "cookie-bear",
    size: 10,
    sponge: "valrhona-cacao",
    gelee: "none",
    mousse: "dark-choco-ganache",
    finish: "rustic-buttercream",
    frostingColor: "#FFAEC9",
    pipingStyle: "ruffle-ribbon",
    pipingColor: "#FFFDF5",
    pipingPosition: "top-only",
    toppings: {
      cherry: false,
      strawberry: false,
      sprinkles: true,
      ribbonBow: false,
      spiralCandle: false,
      crown: false,
      enamelPin: false,
    },
    accessories: [
      { id: "acc-bear-1", type: "chocolate-bear", count: 1, layout: "center", scale: 1.0, unitPrice: 30000 },
      { id: "acc-bear-2", type: "sugar-pearls", count: 1, layout: "scatter", scale: 0.8, unitPrice: 15000 },
    ],
    typography: {
      text: "Sweet Dreams",
      font: "cute-handwritten",
      fontSize: 20,
      align: "center",
      curve: "straight",
      color: "#4A2E1B",
    },
    image: "/assets/extracted_images/p62_01_product___cookie_pricing.png",
    description:
      "Đế bánh quy Petit Beurre giòn rụm với chú gấu socola ngủ ngoan đắp tấm chăn kem hồng dập vân bèo nhún và kẹo cốm sao.",
    curatorCritique:
      "Kể chuyện qua ẩm thực (Narrative Pastry): một tác phẩm mang đến sự vỗ về tinh thần sau những giờ học tập làm việc căng thẳng.",
  },
  {
    id: "preset-baroque-rect",
    title: "06. Baroque Heritage Rectangle",
    subtitle: "Bánh Chữ Nhật Hoàng Gia Tiệc Trà",
    category: "celebration",
    slide: "Slide 59",
    price: "545.000 VNĐ",
    shape: "rectangle",
    size: 20,
    sponge: "valrhona-cacao",
    gelee: "none",
    mousse: "dark-choco-ganache",
    finish: "mirror-glaze",
    frostingColor: "#3D2314",
    pipingStyle: "wilton-shell",
    pipingColor: "#FFF9E6",
    pipingPosition: "full-lambeth-swag",
    toppings: {
      cherry: true,
      strawberry: false,
      sprinkles: false,
      ribbonBow: false,
      spiralCandle: true,
      crown: false,
      enamelPin: true,
    },
    accessories: [
      { id: "acc-rect-1", type: "cherry", count: 4, layout: "corners", scale: 1.0, unitPrice: 12000 },
      { id: "acc-rect-2", type: "enamel-pin", count: 1, layout: "front-arc", scale: 1.0, unitPrice: 45000 },
      { id: "acc-rect-3", type: "chocolate-plaque", count: 1, layout: "center", scale: 1.0, unitPrice: 20000 },
    ],
    typography: {
      text: "Grand Celebration\nThu Phuong",
      font: "serif-royal",
      fontSize: 24,
      align: "center",
      curve: "plaque",
      color: "#DAA520",
    },
    image: "/assets/extracted_images/p59_01_celebration_cakes___big_and_sm.png",
    description:
      "Tấm bạt tranh 150×200mm phủ men tráng gương socola Valrhona Guanaja, rèm ren kem Lambeth thành bánh và huy hiệu Enamel Pin độc bản trên ribbon thành trước.",
    curatorCritique:
      "Sự chính xác của kiến trúc Deconstructivism gặp gỡ Haute Pâtisserie. Lớp tráng gương phản xạ quang học tuyệt mỹ tựa thủy tinh Murano.",
  },
  {
    id: "preset-croissant-bow",
    title: "07. Blue Bow Butter Croissant",
    subtitle: "Croissant Bơ Pháp Thắt Nơ Lụa",
    category: "daily",
    slide: "Slide 45 & 64",
    price: "58.000 VNĐ",
    shape: "croissant-bow",
    size: 14,
    sponge: "vanilla-genoise",
    gelee: "none",
    mousse: "mascarpone-chantilly",
    finish: "mirror-glaze",
    frostingColor: "#D48B38",
    pipingStyle: "minimal",
    pipingColor: "#FFF9E6",
    pipingPosition: "top-only",
    toppings: {
      cherry: false,
      strawberry: false,
      sprinkles: false,
      ribbonBow: true,
      spiralCandle: false,
      crown: false,
      enamelPin: false,
    },
    accessories: [
      { id: "acc-crois-1", type: "satin-bow", count: 1, layout: "center", scale: 1.1, unitPrice: 18000 },
    ],
    typography: {
      text: "Wishes Paris",
      font: "playfair-swash",
      fontSize: 18,
      align: "center",
      curve: "straight",
      color: "#FFFDF5",
    },
    image: "/assets/extracted_images/p64_01_product___croissant_pricing.png",
    description:
      "Vỏ xốp ngàn lớp gấp từ bơ Tourage Pháp nguyên chất, thắt chiếc nơ lụa satin xanh baby coquette quanh eo bánh quyến rũ.",
    curatorCritique:
      "Cấu trúc tổ ong bên trong (Alvéolage) là minh chứng thép cho tính chân thực của vật liệu: bơ, bột mì và nhiệt độ chính xác tới từng giây.",
  },
  {
    id: "preset-royal-2tier",
    title: "08. Royal 2-Tier Swan Princess",
    subtitle: "Bánh 2 Tầng Lệch Cung Đình",
    category: "celebration",
    slide: "Slide 58",
    price: "1.095.000 VNĐ",
    shape: "two-tier",
    size: 24,
    sponge: "vanilla-genoise",
    gelee: "mango-passion",
    mousse: "mascarpone-chantilly",
    finish: "rustic-buttercream",
    frostingColor: "#FFF9E6",
    pipingStyle: "wilton-shell",
    pipingColor: "#FFAEC9",
    pipingPosition: "full-lambeth-swag",
    toppings: {
      cherry: true,
      strawberry: true,
      sprinkles: true,
      ribbonBow: true,
      spiralCandle: true,
      crown: true,
      enamelPin: true,
    },
    accessories: [
      { id: "acc-tier-1", type: "crown", count: 1, layout: "center", scale: 1.1, unitPrice: 45000 },
      { id: "acc-tier-2", type: "cherry", count: 8, layout: "ring", scale: 0.9, unitPrice: 12000 },
      { id: "acc-tier-3", type: "satin-bow", count: 4, layout: "corners", scale: 0.9, unitPrice: 18000 },
      { id: "acc-tier-4", type: "spiral-candle", count: 5, layout: "ring", scale: 0.9, unitPrice: 8000 },
    ],
    typography: {
      text: "Royal Princess\nWishes 100",
      font: "serif-royal",
      fontSize: 24,
      align: "center",
      curve: "straight",
      color: "#4A2E1B",
    },
    image: "/assets/extracted_images/p58_01_product_line___celebration_cak.png",
    description:
      "Đế bánh 20cm vững chắc nâng đỡ tầng ngọn 12cm bằng hệ 4 cọc dowel gỗ chịu lực, rèm kem Lambeth uốn lượn và vương miện mạ vàng lộng lẫy.",
    curatorCritique:
      "Cấu trúc chịu lực phân tầng hoàn hảo! Trọng lượng tầng ngọn được triệt tiêu áp lực cơ học bằng hệ dầm chịu tải chuẩn kỹ thuật xưởng bánh.",
  },
  {
    id: "preset-cinnamon-roll",
    title: "09. Cinnamon Roll Cốm Sao",
    subtitle: "Bánh Quế Cuộn Kem Chảy & Sao Pastel",
    category: "daily",
    slide: "Slide 40 & 61",
    price: "60.000 VNĐ",
    shape: "cinnamon-roll",
    size: 12,
    sponge: "vanilla-genoise",
    gelee: "none",
    mousse: "mascarpone-chantilly",
    finish: "mirror-glaze",
    frostingColor: "#FFF9E6",
    pipingStyle: "minimal",
    pipingColor: "#FFF9E6",
    pipingPosition: "top-only",
    toppings: {
      cherry: false,
      strawberry: false,
      sprinkles: true,
      ribbonBow: false,
      spiralCandle: false,
      crown: false,
      enamelPin: false,
    },
    accessories: [
      { id: "acc-cinna-1", type: "sugar-pearls", count: 1, layout: "scatter", scale: 1.0, unitPrice: 15000 },
    ],
    typography: {
      text: "Warm Wishes",
      font: "cute-handwritten",
      fontSize: 18,
      align: "center",
      curve: "straight",
      color: "#4A2E1B",
    },
    image: "/assets/extracted_images/p61_01_product___cinnamon_roll_pricin.png",
    description:
      "Vỏ bánh quế cuộn xoắn ốc vàng nâu caramel, phủ đẫm dòng kem vani cream cheese chảy béo ngậy và rắc kẹo cốm ngôi sao lấp lánh.",
    curatorCritique:
      "Dòng kem nhỏ giọt tự do (Organic Drips) mang đậm tinh thần của chủ nghĩa biểu hiện trừu tượng. Một bữa sáng giàu cảm xúc.",
  },
  {
    id: "preset-egg-tart",
    title: "10. Custard Egg Tart Hoàng Kim",
    subtitle: "Tart Trứng Vỏ Ngàn Lớp Nướng Cháy",
    category: "daily",
    slide: "Slide 43 & 63",
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
    pipingPosition: "top-only",
    toppings: {
      cherry: false,
      strawberry: false,
      sprinkles: false,
      ribbonBow: false,
      spiralCandle: false,
      crown: false,
      enamelPin: false,
    },
    accessories: [],
    typography: {
      text: "",
      font: "minimal-sans",
      fontSize: 16,
      align: "center",
      curve: "straight",
      color: "#4A2E1B",
    },
    image: "/assets/extracted_images/p63_01_product___egg_tart_pricing.png",
    description:
      "Vỏ tart ngàn lớp giòn rụm ôm trọn phần nhân kem trứng custard mềm mượt núng nính, bề mặt caramen đốm cháy đặc trưng phong cách Bồ Đào Nha.",
    curatorCritique:
      "Vệt caramen cháy nâu đốm mảng (Brûlée) tạo nhịp điệu tương phản cực kỳ cuốn hút giữa lòng vàng custard béo và thành vỏ xếp lớp.",
  },
  {
    id: "preset-sweet-strawberry",
    title: "11. Sweet Harajuku Strawberry",
    subtitle: "Bánh Dâu Tây Charlotte Mọng Nước",
    category: "celebration",
    slide: "Slide 58",
    price: "435.000 VNĐ",
    shape: "round",
    size: 16,
    sponge: "vanilla-genoise",
    gelee: "strawberry-compote",
    mousse: "strawberry-velvet",
    finish: "rustic-buttercream",
    frostingColor: "#FFF9E6",
    pipingStyle: "wilton-shell",
    pipingColor: "#FFAEC9",
    pipingPosition: "dual-rim",
    toppings: {
      cherry: false,
      strawberry: true,
      sprinkles: true,
      ribbonBow: false,
      spiralCandle: false,
      crown: false,
      enamelPin: false,
    },
    accessories: [
      { id: "acc-straw-1", type: "strawberry", count: 6, layout: "ring", scale: 1.0, unitPrice: 15000 },
      { id: "acc-straw-2", type: "sugar-pearls", count: 1, layout: "scatter", scale: 1.0, unitPrice: 15000 },
    ],
    typography: {
      text: "Sweet 18",
      font: "script-calligraphy",
      fontSize: 28,
      align: "center",
      curve: "straight",
      color: "#C71585",
    },
    image: "/assets/extracted_images/p58_01_product_line___celebration_cak.png",
    description:
      "Vòng dâu tây tươi mọng hái sớm từ Đà Lạt xếp thành vòng nguyệt quế trên nền kem bơ Mascarpone và hoa kem bơ hồng phấn.",
    curatorCritique:
      "Màu đỏ tươi của dâu đối xứng hoàn hảo trên nền kem trắng ngà, tạo cảm giác tươi mới như vừa thu hoạch trong sớm mai.",
  },
  {
    id: "preset-valrhona-heritage",
    title: "12. Valrhona Dark Choco Heritage",
    subtitle: "Bánh Socola Đắng Hoàng Gia Pháp",
    category: "celebration",
    slide: "Slide 38",
    price: "520.000 VNĐ",
    shape: "round",
    size: 16,
    sponge: "valrhona-cacao",
    gelee: "dark-cherry",
    mousse: "dark-choco-ganache",
    finish: "mirror-glaze",
    frostingColor: "#3D2314",
    pipingStyle: "st-honore",
    pipingColor: "#FFFDF5",
    pipingPosition: "full-lambeth-swag",
    toppings: {
      cherry: true,
      strawberry: false,
      sprinkles: false,
      ribbonBow: false,
      spiralCandle: true,
      crown: false,
      enamelPin: false,
    },
    accessories: [
      { id: "acc-choco-1", type: "cherry", count: 6, layout: "ring", scale: 0.95, unitPrice: 12000 },
      { id: "acc-choco-2", type: "wafer-butterfly", count: 1, layout: "scatter", scale: 1.0, unitPrice: 25000 },
    ],
    typography: {
      text: "Joyeux Anniversaire",
      font: "serif-royal",
      fontSize: 26,
      align: "center",
      curve: "arc-top",
      color: "#DAA520",
    },
    image: "/assets/extracted_images/p59_01_celebration_cakes___big_and_sm.png",
    description:
      "Tuyệt phẩm socola đen Valrhona Guanaja 70%, kết hợp mứt anh đào đen đun rượu vang Burgundy và bướm giấy gạo dát vàng 24K.",
    curatorCritique:
      "Độ sâu quang học của lớp tráng gương bóng bẩy tựa sơn mài truyền thống, tôn vinh kỹ thuật Pâtisserie Pháp đỉnh cao.",
  },
];
