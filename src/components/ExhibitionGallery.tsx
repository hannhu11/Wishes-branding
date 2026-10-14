"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Sparkles, Eye, X, Layers, ExternalLink } from "lucide-react";

interface GalleryItem {
  id: string;
  title: string;
  category: "identity" | "concept" | "packaging" | "merchandise" | "store";
  categoryLabel: string;
  image: string;
  pageRef: string;
  description: string;
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "g1",
    title: "Concept & Style — Neo-End Sweetcore",
    category: "concept",
    categoryLabel: "Concept Art",
    image: "/assets/rendered_pages/slide_p66_art_direction___concept_and_style_m.png",
    pageRef: "Slide 66",
    description: "Không gian nghệ thuật siêu thực kết hợp bàn tiệc bánh ngọt, nàng thơ tóc hồng, nĩa khổng lồ và bánh thạch cherry rực rỡ.",
  },
  {
    id: "g2",
    title: "Wordmark 'Wishz' 3D Candy Puff",
    category: "identity",
    categoryLabel: "Brand Identity",
    image: "/assets/extracted_images/p67_03_art_direction___logo_design.png",
    pageRef: "Trang 67",
    description: "Hệ thống Logo Wordmark mang hiệu ứng chữ nổi 3D ngọt ngào, viền bóng pastel và ngôi sao lấp lánh.",
  },
  {
    id: "g3",
    title: "Hộp Bánh Ngôi Nhà Cổ Tích (House Box)",
    category: "packaging",
    categoryLabel: "Bao Bì",
    image: "/assets/extracted_images/p74_01_packaging_system.png",
    pageRef: "Trang 74",
    description: "Bao bì hình ngôi nhà bánh ngọt với quai xách ruy-băng lụa và mái vòm mở cánh độc đáo.",
  },
  {
    id: "g4",
    title: "Huy Hiệu Men Kim Loại (Enamel Pins)",
    category: "merchandise",
    categoryLabel: "Merchandise",
    image: "/assets/extracted_images/p83_01_merchandise___enamel_pins_and_.png",
    pageRef: "Trang 83",
    description: "Bộ sưu tập huy hiệu men bóng tráng kim loại hình bánh kem, linh vật Wishes và trái tim cách điệu.",
  },
  {
    id: "g5",
    title: "Không Gian Tiệm Bánh Pop-up Store",
    category: "store",
    categoryLabel: "Store Design",
    image: "/assets/rendered_pages/slide_p96_wishes_project_overview___archetype.png",
    pageRef: "Slide 96",
    description: "Kiến trúc quầy bánh boutique Parisian Chic kết hợp đá mài terrazzo pastel, kệ vòm cung và lều sọc sọc vintage.",
  },
  {
    id: "g6",
    title: "Hộp Bánh Cửa Sổ Kính & Chóp Nón",
    category: "packaging",
    categoryLabel: "Bao Bì",
    image: "/assets/rendered_pages/slide_p74_packaging_system.png",
    pageRef: "Slide 74",
    description: "Bộ giải pháp bao bì hoàn chỉnh gồm hộp cửa sổ trưng bày bánh kem và hệ thống hộp chóp nón cụt quà tặng.",
  },
  {
    id: "g7",
    title: "Bộ Ruy-Băng Lụa In Hoa Văn Wishes",
    category: "merchandise",
    categoryLabel: "Merchandise",
    image: "/assets/rendered_pages/slide_p84_merchandise___ribbons_and_packaging.png",
    pageRef: "Slide 84",
    description: "Dải ruy-băng lụa pastel in họa tiết typography Wishes dùng cho đóng gói quà tặng và sự kiện sinh nhật.",
  },
  {
    id: "g8",
    title: "Hệ Thống Logo & Typography Bản Vẽ Lưới",
    category: "identity",
    categoryLabel: "Brand Identity",
    image: "/assets/rendered_pages/slide_p67_art_direction___logo_design.png",
    pageRef: "Slide 67",
    description: "Quy chuẩn tỷ lệ đồ họa, lưới phác thảo uốn lượn trái tim và các biến thể ngôi sao lấp lánh của biểu trưng Wishes.",
  },
];

export default function ExhibitionGallery() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  const categories = [
    { key: "all", label: "Tất cả" },
    { key: "identity", label: "Brand Identity" },
    { key: "concept", label: "Concept Art" },
    { key: "packaging", label: "Bao bì (Packaging)" },
    { key: "merchandise", label: "Merchandise" },
    { key: "store", label: "Không gian Store" },
  ];

  const filteredItems =
    activeCategory === "all"
      ? GALLERY_ITEMS
      : GALLERY_ITEMS.filter((item) => item.category === activeCategory);

  return (
    <section id="gallery" className="relative w-full py-24 px-6 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="text-xs uppercase font-bold tracking-widest text-wishes-cherry px-3 py-1 rounded-full bg-wishes-pink/30 inline-block mb-3">
          Capstone Graduation Exhibition
        </span>
        <h2 className="text-4xl sm:text-5xl font-serif-swash font-bold text-wishes-chocolate">
          Triển Lãm Đồ Án Tốt Nghiệp
        </h2>
        <p className="mt-3 text-xs sm:text-sm text-wishes-chocolate/75 font-sans">
          Toàn bộ các phân hệ thiết kế thuộc đồ án tốt nghiệp ngành Thiết kế Mỹ thuật Số (Digital Art & Design) được sắp đặt theo cấu trúc Bento Grid tương tác 60fps.
        </p>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setActiveCategory(c.key)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                activeCategory === c.key
                  ? "candy-btn scale-105 shadow-pastel"
                  : "glass-panel text-wishes-chocolate/70 hover:text-wishes-chocolate hover:bg-white/90"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bento Grid Gallery */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="group relative p-4 rounded-3xl glass-panel border border-white/80 shadow-pastel hover:shadow-dreamy hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            {/* Image Preview with Hover Zoom */}
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-white/40 mb-3 border border-wishes-chocolate/10">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-contain p-2 group-hover:scale-108 transition-transform duration-500 ease-out"
              />
              <div className="absolute inset-0 bg-wishes-pink/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-xs font-bold text-wishes-chocolate flex items-center gap-1.5 shadow-md">
                  <Eye className="w-3.5 h-3.5 text-wishes-cherry" />
                  Xem Chi Tiết
                </span>
              </div>
            </div>

            {/* Info details */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-wishes-cherry">
                  {item.categoryLabel}
                </span>
                <span className="text-[10px] font-mono text-wishes-chocolate/60">
                  {item.pageRef}
                </span>
              </div>
              <h3 className="text-sm font-serif-swash font-bold text-wishes-chocolate line-clamp-1 group-hover:text-wishes-cherry transition-colors">
                {item.title}
              </h3>
              <p className="text-[11px] text-wishes-chocolate/70 font-sans line-clamp-2 mt-1 leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* FULLSCREEN DETAIL MODAL (GSAP FLIP INSPIRATION) */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 sm:p-6 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative flex flex-col max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-5 right-5 text-wishes-chocolate/60 hover:text-wishes-chocolate font-bold p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-xs font-bold uppercase tracking-wider text-wishes-cherry bg-wishes-pink/30 px-3 py-1 rounded-full self-start mb-3">
              {selectedItem.categoryLabel} • {selectedItem.pageRef}
            </span>

            <h3 className="text-2xl font-serif-swash font-bold text-wishes-chocolate mb-2">
              {selectedItem.title}
            </h3>

            {/* Large High-Res Image Display */}
            <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-wishes-cream/40 border border-wishes-chocolate/10 my-4 shadow-inner">
              <Image
                src={selectedItem.image}
                alt={selectedItem.title}
                fill
                className="object-contain p-2"
              />
            </div>

            <p className="text-sm text-wishes-chocolate/85 leading-relaxed font-sans mb-4">
              {selectedItem.description}
            </p>

            <div className="p-4 rounded-2xl bg-wishes-cream/60 border border-wishes-chocolate/10 text-xs text-wishes-chocolate/70 flex items-center justify-between">
              <span>Nguồn: Hồ sơ Proposal Đồ án Tốt nghiệp Wishes (Fall 2026)</span>
              <a
                href={selectedItem.image}
                target="_blank"
                rel="noreferrer"
                className="font-bold text-wishes-cherry flex items-center gap-1 hover:underline"
              >
                <span>Ảnh Gốc</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
