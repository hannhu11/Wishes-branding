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
} from "lucide-react";
import {
  CakeShape,
  SpongeType,
  GeleeType,
  MousseType,
  FrostingFinish,
  PipingStyle,
  ToppingConfig,
  SPONGE_OPTIONS,
  GELEE_OPTIONS,
  MOUSSE_OPTIONS,
  FROSTING_PALETTE,
  PIPING_STYLES,
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
  toppings: ToppingConfig;
  customerName: string;
  wishText: string;
  handwrittenText?: string;
  aestheticScore: number;
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
  toppings,
  customerName,
  wishText,
  handwrittenText,
  aestheticScore,
}: BlueprintModalProps) {
  if (!isOpen) return null;

  const spongeObj = SPONGE_OPTIONS.find((s) => s.id === sponge);
  const geleeObj = GELEE_OPTIONS.find((g) => g.id === gelee);
  const mousseObj = MOUSSE_OPTIONS.find((m) => m.id === mousse);
  const colorObj = FROSTING_PALETTE.find((c) => c.hex === frostingColor);
  const pipingObj = PIPING_STYLES.find((p) => p.id === pipingStyle);

  const activeToppingNames: string[] = [];
  if (toppings.cherry) activeToppingNames.push("Quả Cherry bóng cuống cong");
  if (toppings.strawberry) activeToppingNames.push("Dâu tây tươi đọng sương");
  if (toppings.sprinkles) activeToppingNames.push("Kẹo cốm ngọc trai pastel");
  if (toppings.ribbonBow) activeToppingNames.push("Nơ lụa satin xanh baby (Slide 84)");
  if (toppings.spiralCandle) activeToppingNames.push("Nến xoắn ốc pastel");
  if (toppings.crown) activeToppingNames.push("Vương miện giấy sinh nhật (Slide 85)");
  if (toppings.enamelPin) activeToppingNames.push("Huy hiệu kim loại mạ vàng Enamel Pin (Slide 83)");

  const shapeTitle =
    shape === "round"
      ? "Tròn Cổ Điển (Classic Round)"
      : shape === "heart"
      ? "Trái Tim Wonky (Harajuku Heart)"
      : shape === "rectangle"
      ? "Chữ Nhật Baroque (Sheet Cake)"
      : shape === "two-tier"
      ? "Hoàng Gia 2 Tầng Lệch (Royal 2-Tier Castle)"
      : shape === "cinnamon-roll"
      ? "Quế Cuộn Kem Chảy (Signature Cinnamon Roll Glaze)"
      : shape === "croissant"
      ? "Croissant Bơ Pháp Ngàn Lớp (French Butter Croissant)"
      : shape === "egg-tart"
      ? "Tart Trứng Custard (Pastéis de Nata Egg Tart)"
      : shape === "cookie"
      ? "Bánh Quy Mềm Thủ Công (Artisanal Soft Cookie)"
      : String(shape).toUpperCase();

  const handleDownload = () => {
    alert("Đã lưu hồ sơ kỹ thuật gia công bánh ngọt (Baking Blueprint Specification) thành công!");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border-4 border-wishes-blue/50 flex flex-col max-h-[92vh] overflow-y-auto font-sans">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-wishes-chocolate/60 hover:text-wishes-chocolate text-xl font-bold"
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
          <div className="hidden sm:flex flex-col items-center bg-amber-50 p-2 rounded-2xl border border-amber-300 text-center">
            <Award className="w-5 h-5 text-amber-700 mb-0.5" />
            <span className="text-[8px] font-bold uppercase text-amber-900 tracking-wider">
              Wishes Certified
            </span>
            <span className="text-[10px] font-serif font-black text-amber-800">{aestheticScore}/100</span>
          </div>
        </div>

        {/* 4 Technical Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
          {/* 1. Geometric Specs */}
          <div className="p-4 rounded-2xl bg-wishes-cream/40 border border-wishes-chocolate/10 space-y-2 text-xs">
            <div className="font-bold text-wishes-cherry flex items-center gap-1.5">
              <Ruler className="w-4 h-4" />
              <span>1. THÔNG SỐ HÌNH HỌC & KÍCH THƯỚC</span>
            </div>
            <div className="text-wishes-chocolate/85 space-y-1">
              <div>• Hình thái: <strong>{shapeTitle}</strong></div>
              <div>• Kích thước: <strong>Ø {size * 10} mm</strong> (Dung sai cho phép ±5mm)</div>
              <div>• Chiều cao tổng thể: <strong>110 mm</strong> (Cốt bánh 90mm + Bông kem đỉnh 20mm)</div>
              {shape === "two-tier" && (
                <div className="text-amber-800 font-bold">• Trục chịu lực ngầm: 4 cọc dowel gỗ sồi thực phẩm Ø10mm</div>
              )}
              <div>• Trọng lượng dự kiến: <strong>~{size * 70} gram</strong></div>
              <div>• Đế lót bánh: <strong>Giấy bồi ép cứng 350gsm phủ màng chống trượt</strong></div>
            </div>
          </div>

          {/* 2. Color & Flavor Palette */}
          <div className="p-4 rounded-2xl bg-wishes-cream/40 border border-wishes-chocolate/10 space-y-2 text-xs">
            <div className="font-bold text-wishes-cherry flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              <span>2. MÃ MÀU THỰC PHẨM & CÔNG THỨC PHA</span>
            </div>
            <div className="text-wishes-chocolate/85 space-y-1">
              <div>
                • Kem phủ chính: <strong>{colorObj?.pantone || "Pantone 189 C"}</strong> ({frostingColor})
              </div>
              <div className="text-[11px] text-stone-600 pl-2">↳ {colorObj?.flavorExtract}</div>
              <div>• Kiểu hoàn thiện: <strong>{finish.replace("-", " ").toUpperCase()}</strong></div>
              <div>• Kem viền ren: <strong>Pantone 705 C</strong> (Trắng bơ Mascarpone)</div>
              <div>• Đui bắt kem: <strong>{pipingObj?.name}</strong></div>
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

          {/* 4. Kitchen SOP & Toppings */}
          <div className="p-4 rounded-2xl bg-wishes-cream/40 border border-wishes-chocolate/10 space-y-2 text-xs">
            <div className="font-bold text-wishes-cherry flex items-center gap-1.5">
              <Thermometer className="w-4 h-4" />
              <span>4. BẢO QUẢN & PHỤ KIỆN TRANG TRÍ</span>
            </div>
            <div className="text-wishes-chocolate/85 space-y-1">
              <div>• Nhiệt độ bảo quản lạnh: <strong>4°C – 6°C</strong> (Độ ẩm 65%)</div>
              <div>• Hạn sử dụng tốt nhất: <strong>72 giờ</strong> sau khi hoàn tất</div>
              <div>
                • Phụ kiện đính kèm:{" "}
                <strong>{activeToppingNames.length > 0 ? activeToppingNames.join(", ") : "Tối giản"}</strong>
              </div>
              <div>
                • Lời chúc bánh: <em>"{handwrittenText || wishText || "Nguyện điều ngọt ngào nhất"}"</em>
              </div>
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
