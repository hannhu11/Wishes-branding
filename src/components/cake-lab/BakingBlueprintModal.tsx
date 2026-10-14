import React from "react";
import {
  FileText,
  Ruler,
  Layers,
  Thermometer,
  Scissors,
  CheckCircle,
  Download,
  Printer,
  ShieldCheck,
  Compass,
  Award,
  Sparkles,
  Type,
  Package,
  Heart,
} from "lucide-react";
import {
  CakeShape,
  SpongeType,
  GeleeType,
  MousseType,
  FrostingFinish,
  PipingStyle,
  PipingPosition,
  ToppingConfig,
  AccessoryItem,
  TypographyState,
  SPONGE_OPTIONS,
  GELEE_OPTIONS,
  MOUSSE_OPTIONS,
  FROSTING_PALETTE,
  PIPING_STYLES,
  ACCESSORY_CATALOG,
  FONT_OPTIONS,
} from "./types";

interface BlueprintModalProps {
  isOpen: boolean;
  onClose: () => void;
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
  toppings?: ToppingConfig;
  accessories?: AccessoryItem[];
  typography?: TypographyState;
  customerName: string;
  wishText: string;
  handwrittenText?: string;
  aestheticScore: number;
  estimatedPrice?: string;
}

export default function BakingBlueprintModal({
  isOpen,
  onClose,
  shape,
  size,
  sponge,
  gelee,
  mousse,
  finish,
  frostingColor,
  pipingStyle,
  pipingColor,
  pipingPosition = "dual-rim",
  toppings,
  accessories,
  typography,
  customerName,
  wishText,
  handwrittenText,
  aestheticScore,
  estimatedPrice,
}: BlueprintModalProps) {
  if (!isOpen) return null;

  const spongeObj = SPONGE_OPTIONS.find((s) => s.id === sponge);
  const geleeObj = GELEE_OPTIONS.find((g) => g.id === gelee);
  const mousseObj = MOUSSE_OPTIONS.find((m) => m.id === mousse);
  const colorObj = FROSTING_PALETTE.find((c) => c.hex === frostingColor);
  const pipingObj = PIPING_STYLES.find((p) => p.id === pipingStyle);

  // Parse accessories
  const accessoryLines: string[] = [];
  if (accessories && accessories.length > 0) {
    accessories.forEach((item) => {
      const entry = ACCESSORY_CATALOG.find((cat) => cat.type === item.type);
      const name = entry?.name || item.type;
      const layoutLabel =
        item.layout === "center"
          ? "Tâm bánh"
          : item.layout === "ring"
          ? "Vòng tròn rim"
          : item.layout === "corners"
          ? "4 góc"
          : item.layout === "front-arc"
          ? "Vòng cung mặt trước"
          : item.layout === "scatter"
          ? "Rải ngẫu hứng"
          : "Tùy biến";
      accessoryLines.push(`${item.count}× ${name} (${layoutLabel})`);
    });
  } else if (toppings) {
    if (toppings.cherry) accessoryLines.push("1× Quả Cherry đỏ bóng cuống cong");
    if (toppings.strawberry) accessoryLines.push("4× Dâu tây tươi đọng sương");
    if (toppings.sprinkles) accessoryLines.push("Kẹo cốm ngọc trai pastel rải đều");
    if (toppings.ribbonBow) accessoryLines.push("1× Nơ lụa satin xanh baby (Slide 84)");
    if (toppings.spiralCandle) accessoryLines.push("1× Nến xoắn ốc pastel");
    if (toppings.crown) accessoryLines.push("1× Vương miện giấy sinh nhật hoàng gia (Slide 85)");
    if (toppings.enamelPin) accessoryLines.push("1× Huy hiệu kim loại mạ vàng Enamel Pin (Slide 83)");
  }

  const pipingPositionLabel =
    pipingPosition === "dual-rim"
      ? "Cả viền đỉnh & chân đế (Dual-Rim Lambeth)"
      : pipingPosition === "top-only"
      ? "Chỉ viền đỉnh bánh (Top Rim Only)"
      : pipingPosition === "full-lambeth-swag"
      ? "Full Lambeth Swag (Ren đỉnh, chân đế & rèm võng quý tộc)"
      : "Tiêu chuẩn";

  const fontObj = FONT_OPTIONS.find((f) => f.id === typography?.font);
  const finalWishMessage = typography?.text || handwrittenText || wishText || "Nguyện điều ngọt ngào nhất";

  const shapeTitle =
    shape === "round"
      ? "Tròn Cổ Điển (Classic Round)"
      : shape === "heart"
      ? "Trái Tim Wonky (Harajuku Heart)"
      : shape === "rectangle"
      ? "Chữ Nhật Baroque (Sheet Cake)"
      : shape === "two-tier"
      ? "Hoàng Gia 2 Tầng Lệch (Royal 2-Tier Castle)"
      : shape === "cat-y2k"
      ? "Mèo Y2K Đeo Kính (Y2K Kitty Glasses Cake - Slide 58)"
      : shape === "puppy-bow"
      ? "Cún Puppy Nơ Xanh (Harajuku Ribbon Puppy - Slide 59)"
      : shape === "cookie"
      ? "Bánh Quy Gấu Mềm (Artisanal Cookie Bear - Slide 42/62)"
      : shape === "croissant"
      ? "Croissant Bơ Pháp Cột Nơ (French Butter Croissant - Slide 45/64)"
      : shape === "cinnamon-roll"
      ? "Cinnamon Roll Quế Chảy (Signature Cinnamon Glaze - Slide 40/61)"
      : shape === "egg-tart"
      ? "Tart Trứng Custard Bồ Đào Nha (Pastéis de Nata - Slide 43/63)"
      : String(shape).toUpperCase();

  const handleDownload = () => {
    alert("Đã lưu hồ sơ kỹ thuật gia công bánh ngọt (Baking Blueprint Specification) thành công!");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border-4 border-wishes-blue/50 flex flex-col max-h-[92vh] overflow-y-auto font-sans">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-wishes-chocolate font-bold transition-colors"
        >
          ✕
        </button>

        {/* Blueprint Title Header */}
        <div className="flex items-start sm:items-center justify-between gap-4 pb-5 border-b border-wishes-chocolate/15">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-wishes-blue/30 flex items-center justify-center text-wishes-chocolate flex-shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-wishes-cherry bg-wishes-pink/30 px-2 py-0.5 rounded-full">
                  Baking Production Blueprint 1:1
                </span>
                <span className="text-[10px] text-stone-500 font-mono">SPEC-WISHES-{Date.now().toString().slice(-6)}</span>
                {estimatedPrice && (
                  <span className="text-[10px] font-serif font-black text-white bg-wishes-cherry px-2.5 py-0.5 rounded-full shadow-2xs">
                    {estimatedPrice}
                  </span>
                )}
              </div>
              <h3 className="text-xl sm:text-2xl font-serif-swash font-bold text-wishes-chocolate mt-0.5">
                Hồ Sơ Kỹ Thuật Gia Công Bánh Thủ Công
              </h3>
              <p className="text-xs text-wishes-chocolate/70">
                Tiêu chuẩn thi công xưởng bánh Wishes • Liên thông Khách hàng ⇄ Thợ làm bánh
              </p>
            </div>
          </div>

          {/* Wishes Quality Seal */}
          <div className="hidden sm:flex flex-col items-center bg-amber-50 p-2.5 rounded-2xl border border-amber-300 text-center">
            <Award className="w-5 h-5 text-amber-700 mb-0.5" />
            <span className="text-[8px] font-bold uppercase text-amber-900 tracking-wider">
              Wishes Certified
            </span>
            <span className="text-[11px] font-serif font-black text-amber-800">{aestheticScore}/100</span>
          </div>
        </div>

        {/* 4 Technical Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
          {/* 1. Geometric Specs */}
          <div className="p-4 rounded-2xl bg-wishes-cream/40 border border-wishes-chocolate/10 space-y-2 text-xs">
            <div className="font-bold text-wishes-cherry flex items-center gap-1.5">
              <Ruler className="w-4 h-4" />
              <span>1. THÔNG SỐ HÌNH HỌC & CỐT BÁNH</span>
            </div>
            <div className="text-wishes-chocolate/85 space-y-1">
              <div>• Hình thái bánh: <strong>{shapeTitle}</strong></div>
              <div>• Kích thước: <strong>Ø {size * 10} mm</strong> (Dung sai cho phép ±5mm)</div>
              <div>• Chiều cao tổng thể: <strong>110 mm</strong> (Cốt bánh 90mm + Bông kem đỉnh 20mm)</div>
              <div>• Trọng lượng dự kiến: <strong>~{size * 70} gram</strong></div>
              <div>• Đế lót bánh: <strong>Giấy bồi ép cứng 350gsm phủ màng chống trượt</strong></div>

              {(shape === "two-tier" || size >= 20 || shape === "rectangle") && (
                <div className="mt-2 p-2 rounded-xl bg-amber-100/80 border border-amber-300 text-[10.5px] text-amber-950 font-medium space-y-0.5">
                  <div className="font-bold text-amber-900 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                    <span>Smart Pâtissier Guardrail (Gia Cố Kết Cấu):</span>
                  </div>
                  <div>• 4 cọc dowel gỗ sồi thực phẩm Ø6mm trung tâm + Đế lót tầng cứng</div>
                  <div>• Khóa cốt bánh tầng đáy vững chắc chống sụt lún khi giao nhận qua shipper</div>
                </div>
              )}
            </div>
          </div>

          {/* 2. Color & Flavor Palette */}
          <div className="p-4 rounded-2xl bg-wishes-cream/40 border border-wishes-chocolate/10 space-y-2 text-xs">
            <div className="font-bold text-wishes-cherry flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              <span>2. MÃ MÀU THỰC PHẨM & KỸ THUẬT PHỦ KEM</span>
            </div>
            <div className="text-wishes-chocolate/85 space-y-1">
              <div>
                • Kem phủ chính: <strong>{colorObj?.pantone || "Pantone 189 C"}</strong> ({frostingColor})
              </div>
              <div className="text-[11px] text-stone-600 pl-2">↳ Hương vị: {colorObj?.flavorExtract || "Vani Bourbon"}</div>
              <div>• Kiểu hoàn thiện: <strong>{finish.replace("-", " ").toUpperCase()}</strong></div>
              <div>• Kem viền ren: <strong>Pantone 705 C</strong> (Trắng bơ Mascarpone)</div>
              <div>• Đui bắt kem: <strong>{pipingObj?.name}</strong></div>
              <div>• Vị trí bắt kem: <strong>{pipingPositionLabel}</strong></div>
            </div>
          </div>

          {/* 3. Layer Anatomy Cutaway Spec */}
          <div className="p-4 rounded-2xl bg-wishes-cream/40 border border-wishes-chocolate/10 space-y-2 text-xs">
            <div className="font-bold text-wishes-cherry flex items-center gap-1.5">
              <Scissors className="w-4 h-4" />
              <span>3. KẾT CẤU BÓC TÁCH 5 LỚP (INTERNAL LAYERING)</span>
            </div>
            <div className="text-wishes-chocolate/85 space-y-1">
              <div>• L5 (Đỉnh): <strong>15mm</strong> Kem phủ hoàn thiện ({finish})</div>
              <div>• L4: <strong>25mm</strong> {mousseObj?.name} ({mousseObj?.bloomStrength})</div>
              {gelee !== "none" ? (
                <div>• L3: <strong>12mm</strong> {geleeObj?.name} ({geleeObj?.viscosity})</div>
              ) : (
                <div>• L3: Bỏ qua tầng gelée sốt trái cây</div>
              )}
              <div>• L2: <strong>35mm</strong> {spongeObj?.name} (Nướng {spongeObj?.bakingTemp})</div>
              <div>• L1 (Đế): <strong>10mm</strong> Feuilletine Crunch hạnh nhân giòn rụm</div>
            </div>
          </div>

          {/* 4. Kitchen SOP, Typography & Accessories */}
          <div className="p-4 rounded-2xl bg-wishes-cream/40 border border-wishes-chocolate/10 space-y-2 text-xs">
            <div className="font-bold text-wishes-cherry flex items-center gap-1.5">
              <Thermometer className="w-4 h-4" />
              <span>4. BẢO QUẢN & QUY CÁCH TRANG TRÍ</span>
            </div>
            <div className="text-wishes-chocolate/85 space-y-1">
              <div>• Nhiệt độ bảo quản lạnh tiêu chuẩn: <strong>2°C – 5°C</strong> (Độ ẩm 65%)</div>
              <div>• Vận chuyển: <strong>Hộp House Box 3D + Thùng giữ nhiệt kèm đá gel khô</strong></div>
              <div>• Hạn sử dụng tốt nhất: <strong>72 giờ</strong> sau khi hoàn tất</div>
              <div>
                • Phụ kiện 3D đính kèm:{" "}
                <strong>{accessoryLines.length > 0 ? accessoryLines.join(", ") : "Tối giản"}</strong>
              </div>
              <div>
                • Thông điệp chữ: <em>"{finalWishMessage}"</em>
              </div>
              {typography && typography.text && (
                <div className="text-[11px] text-stone-600 pl-2">
                  ↳ Font: {fontObj?.name || typography.font} • Dạng:{" "}
                  {typography.curve === "plaque"
                    ? "Biển Socola Trắng Viền Vàng Hoàng Gia"
                    : typography.curve === "arc-top" || typography.curve === "arc-bottom"
                    ? "Bắt Kem Nổi 3D Uốn Vòng Cung"
                    : "Bắt Kem Nổi 3D Trực Tiếp"}
                </div>
              )}
              <div>• Khách hàng đặt: <strong>{customerName || "Bồ Công Anh"}</strong></div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-wishes-chocolate/15">
          <button
            onClick={handleDownload}
            className="flex-1 py-3 px-4 rounded-2xl candy-btn text-xs font-bold flex items-center justify-center gap-2 shadow-pastel"
          >
            <Download className="w-4 h-4" />
            <span>Tải Hồ Sơ Blueprint PDF (Bản Vẽ Cho Thợ Bánh)</span>
          </button>
          <button
            onClick={() => window.print()}
            className="py-3 px-5 rounded-2xl bg-white border border-wishes-chocolate/20 hover:bg-stone-50 text-xs font-bold text-wishes-chocolate flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>In Bản Vẽ</span>
          </button>
        </div>
      </div>
    </div>
  );
}
