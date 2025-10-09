"use client";

import { Card, CardContent } from "@/components/ui/card";

type Member = {
  name: string;
  img: string;
  desc: string;
};

const members: Member[] = [
  {
    name: "Kritsada  Ruangthawe",
    img: "https://preview.redd.it/okay-but-it-would-be-so-hilarious-if-gojo-heals-himself-v0-uf8izbqtpaqb1.png?width=640&crop=smart&auto=webp&s=ceda32d3b0ea65f998649da2e8c5b2663a22ac40",
    desc: "The leader of the group and the main developer of this project. (Goat)",
  },
  {
    name: "Naphat Soontronwnalop",
    img: "https://cdn.rafled.com/anime-icons/images/820fd8f582d73d8d9ebc8fac6cf3c3c97f911aa6549828ec313df338a2d15075.jpg",
    desc: "ML Developer",
  },
  {
    name: "Lee-Anne Carlo I. Junio",
    img: "https://upload-os-bbs.hoyolab.com/upload/2024/11/11/275662336/ec5ef15109c4c5d6895f7696b13bc952_6151387479523600427.png?x-oss-process=image%2Fresize%2Cs_1000%2Fauto-orient%2C0%2Finterlace%2C1%2Fformat%2Cwebp%2Fquality%2Cq_70",
    desc: "Web developer",
  },
  {
    name: "Teetat Lertsaksereekul",
    img: "https://uploads.dailydot.com/2025/02/jarvis_memes_usable.jpg?q=65&auto=format&w=1200&ar=2:1&fit=crop",
    desc: "Pyspark Developer",
  },
  {
    name: "Kraipich Thanasitvekin",
    img: "https://preview.redd.it/i-know-hes-the-teenager-hunter-but-tojis-death-always-gets-v0-nx3lzxotr6gc1.jpg?width=1080&crop=smart&auto=webp&s=9d4f57607055574146aa28add3ee0c99b1541d62",
    desc: "Web developer",
  },
];

export default function page() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight mb-6">Our Team</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {members.map((m) => (
          <Card
            key={m.name}
            className="rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow px-5"
          >
            <CardContent className="p-0">
              <div className="aspect-square w-full overflow-hidden">
                <img
                  src={m.img}
                  alt={m.name}
                  className="h-full w-full object-cover rounded-full"
                  loading="lazy"
                />
              </div>
              <div className="p-3 text-center">
                <p className="text-sm font-medium">{m.name}</p>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                {m.desc}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="text-3xl text-center mt-25">NAH WE'D WIN</div>
    </main>
  );
}
