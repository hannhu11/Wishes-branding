"use client";
import React from "react";
import Image from "next/image";
import { Sparkles, Heart, Compass, CheckCircle2 } from "lucide-react";

export default function BrandStory() {
  const coreValues = [
    { title: "Freshness", desc: "Bánh nướng mới mỗi ngày giữ trọn hương vị, độ ẩm và kết cấu mềm mịn." },
    { title: "Craftsmanship", desc: "Nghệ thuật làm bánh thủ công tinh xảo, chú trọng từng đường nét và lớp kem trang trí." },
    { title: "Delight", desc: "Kiến tạo những khoảnh khắc hạnh phúc giản dị, đáng nhớ và lan tỏa niềm vui." },
    { title: "Creativity", desc: "Khám phá hương vị và hình khối bất đối xứng ngộ nghĩnh (Embracing Imperfection)." },
  ];

  return (
    <section id="story" className="relative w-full py-24 px-6 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs uppercase font-bold tracking-widest text-wishes-cherry px-3 py-1 rounded-full bg-wishes-pink/30 inline-block mb-3">
          Brand Orientation & Essence
        </span>
        <h2 className="text-4xl sm:text-5xl font-serif-swash font-bold text-wishes-chocolate">
          Khởi Nguồn Từ Một Điều Ước
        </h2>
        <p className="mt-4 text-sm sm:text-base text-wishes-chocolate/75 font-sans leading-relaxed">
          Tên gọi <strong>Wishes</strong> lấy cảm hứng từ nghi thức thổi nến sinh nhật quen thuộc: thổi nến và gửi gắm ước nguyện. Wishes biến những mong ước giản dị thành những lát bánh ngọt ngào được chăm chút tỉ mỉ.
        </p>
      </div>

      {/* Grid: Brand Positioning & Market Gap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mb-20">
        {/* Left: Positioning Map Graphic */}
        <div className="p-6 rounded-3xl glass-panel shadow-dreamy border border-white/80 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-wishes-chocolate/80 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-wishes-cherry" />
              Sơ Đồ Định Vị Thị Trường (Slide 99)
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-wishes-mint text-wishes-chocolate">
              Artisanal + Playful
            </span>
          </div>

          <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-white/50 border border-wishes-chocolate/10">
            <Image
              src="/assets/rendered_pages/slide_p99_brand_positioning_map___whimsical_p.png"
              alt="Brand Positioning Map - Wishes"
              fill
              className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
            />
          </div>

          <p className="mt-4 text-xs text-wishes-chocolate/80 leading-relaxed">
            Wishes tọa lạc tại góc phần tư trên cùng bên phải: <strong>Nghệ Thuật Thủ Công Đột Phá (Artisanal / Creative)</strong> kết hợp <strong>Nghịch Ngợm Tươi Vui (Playful)</strong> — lấp đầy khoảng trống của các chuỗi bánh công nghiệp vô hồn.
          </p>
        </div>

        {/* Right: Problem vs Solution */}
        <div className="flex flex-col gap-5">
          <div className="p-6 rounded-3xl glass-panel border border-wishes-pink/60 shadow-pastel">
            <span className="text-[11px] font-bold text-wishes-cherry uppercase tracking-wider block mb-1">
              Thực Trạng Thị Trường F&B
            </span>
            <h3 className="text-xl font-serif-swash font-bold text-wishes-chocolate mb-2">
              Tại sao bánh ngọt thường chỉ dừng lại ở tính thương mại giao dịch?
            </h3>
            <p className="text-xs sm:text-sm text-wishes-chocolate/80 leading-relaxed font-sans">
              Thị trường bánh ngọt đô thị bị phân mảnh: chuỗi công nghiệp lớn làm mất dần tính cá nhân hóa và cảm xúc thẩm mỹ, trong khi tiệm bánh nhỏ truyền thống lại thiếu hệ thống nhận diện thương hiệu bài bản và trải nghiệm tương tác số.
            </p>
          </div>

          <div className="p-6 rounded-3xl glass-panel border border-wishes-blue/60 shadow-pastel">
            <span className="text-[11px] font-bold text-wishes-blue font-bold uppercase tracking-wider block mb-1">
              Giải Pháp Từ Wishes
            </span>
            <h3 className="text-xl font-serif-swash font-bold text-wishes-chocolate mb-2">
              Boutique Pastry: Đánh Thức Cảm Xúc & Trải Nghiệm Cá Nhân Hóa
            </h3>
            <p className="text-xs sm:text-sm text-wishes-chocolate/80 leading-relaxed font-sans">
              Wishes là mô hình tiệm bánh boutique kết hợp không gian pop-up vật lý và nền tảng đặt hàng kỹ thuật số (3D customizer), nơi khách hàng được tự tay tạo tác chiếc bánh đại diện cho ước nguyện của mình.
            </p>
          </div>
        </div>
      </div>

      {/* Core Values 4-Pillars Bento Grid */}
      <div id="philosophy" className="mt-16">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-wishes-chocolate/60">
            Four Pillars
          </span>
          <h3 className="text-3xl font-serif-swash font-bold text-wishes-chocolate mt-1">
            Hệ Giá Trị Cốt Lõi Của Wishes
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {coreValues.map((val, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl glass-panel border border-white/80 shadow-pastel hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-2xl bg-wishes-pink/30 flex items-center justify-center mb-4 text-wishes-cherry">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-serif-swash font-bold text-wishes-chocolate mb-2">
                  {val.title}
                </h4>
                <p className="text-xs text-wishes-chocolate/75 leading-relaxed font-sans">
                  {val.desc}
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-wishes-chocolate/10 flex items-center gap-1.5 text-[10px] font-bold text-wishes-chocolate/60 uppercase">
                <CheckCircle2 className="w-3.5 h-3.5 text-wishes-cherry" />
                <span>Tiêu chuẩn đồ án FPT</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
