"use client";

import { StarRating } from "@/components/ui/StarRating";

export interface NewArrivalItem {
  id: number;
  rating: number;
  writer: string;
  date: string;
  title: string;
  artist: string;
  comment: string;
  image: string;
}

export const DEFAULT_NEW_ARRIVALS: NewArrivalItem[] = [
  {
    id: 1,
    rating: 3.5,
    writer: "문교수",
    date: "2023-01-28",
    title: "BROWNEYED SOUL",
    artist: "브라운 아이드 소울",
    comment: "브라운 아이드 소울의 홀로서기",
    image: "/mock/review1.jpg",
  },
  {
    id: 2,
    rating: 2.0,
    writer: "나무트리",
    date: "2023-02-21",
    title: "NOIR",
    artist: "유노윤호",
    comment: "열정만으로는 해결할 수 없는",
    image: "/mock/review2.jpg",
  },
  {
    id: 3,
    rating: 4.0,
    writer: "후이자",
    date: "2023-03-01",
    title: "Fleet Foxes",
    artist: "Fleet Foxes",
    comment: "100년 전 시골 농가의 삶을 담은",
    image: "/mock/review3.jpg",
  },
  {
    id: 4,
    rating: 4.0,
    writer: "선유랑",
    date: "2023-04-01",
    title: "2 4 : 2 6",
    artist: "빈지노",
    comment: "될성 부른 나무는 떡잎부터 다르다",
    image: "/mock/review4.jpg",
  },
  {
    id: 5,
    rating: 3.5,
    writer: "설향박스팜",
    date: "2023-04-04",
    title: "파리의 숨결",
    artist: "살롱 드 오수경",
    comment: "파리의 낭만과 유년의 향수를 담아",
    image: "/mock/review5.jpg",
  },
  {
    id: 6,
    rating: 3.5,
    writer: "문교수",
    date: "2023-04-06",
    title: "Sensational",
    artist: "Erika de Casier",
    comment: "Erika de Casier의 두 번째",
    image: "/mock/review6.jpg",
  },
];

interface NewArrivalsSectionProps {
  items?: NewArrivalItem[];
}

export function NewArrivalsSection({
  items = DEFAULT_NEW_ARRIVALS,
}: NewArrivalsSectionProps) {
  return (
    <section className="py-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-[#242d3c]">New Arrivals</h2>
        <p className="text-base text-[#808080]">오늘의 새로운 발견</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
        {items.map((item) => (
          <div
            key={item.id}
            className="group snap-start shrink-0 w-[260px] sm:w-[300px] rounded-sm overflow-hidden border border-[#bdc0c4] bg-white flex flex-col justify-between"
          >
            <div>
              <div className="relative">
                <div
                  className="w-full pt-[60%] bg-center bg-cover bg-no-repeat transition-all duration-300 [clip-path:polygon(100%_0,100%_80%,0%_98%,0_0%)] group-hover:[clip-path:polygon(100%_0,100%_77%,0%_95%,0_0%)]"
                  style={{ backgroundImage: `url(${item.image})` }}
                />
                <span className="absolute bottom-0 right-3 text-xs font-bold text-[#171717]">
                  {item.date}
                </span>
              </div>

              <div className="px-4 pt-2">
                <div className="text-lg font-bold text-[#171717] leading-snug">
                  {item.title}
                </div>
                <div className="my-1">
                  <StarRating value={item.rating} size={20} />
                </div>
                <p className="text-base text-[#171717] leading-normal break-keep pb-2">
                  {item.comment}
                </p>
              </div>
            </div>

            <div className="px-4 pb-3 text-sm text-[#808080]">
              by {item.writer}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
