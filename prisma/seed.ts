import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const fayoumAreas = [
  ["مدينة الفيوم", "Fayoum City", "fayoum-city"],
  ["سنورس", "Sinnuris", "sinnuris"],
  ["إطسا", "Itsa", "itsa"],
  ["طامية", "Tamiya", "tamiya"],
  ["أبشواي", "Abshaway", "abshaway"],
  ["يوسف الصديق", "Youssef El Seddik", "youssef-el-seddik"],
] as const;

const categories = [
  ["سيارات ومركبات", "Vehicles", "vehicles"],
  ["عقارات", "Properties", "properties"],
  ["موبايلات وإلكترونيات", "Mobiles & Electronics", "electronics"],
  ["أثاث وأجهزة", "Furniture & Appliances", "furniture-appliances"],
  ["وظائف", "Jobs", "jobs"],
  ["خدمات", "Services", "services"],
  ["أزياء", "Fashion", "fashion"],
  ["حيوانات", "Animals", "animals"],
  ["معدات", "Equipment", "equipment"],
  ["متفرقات", "Other", "other"],
] as const;

async function main() {
  const fayoum = await prisma.governorate.upsert({
    where: { slug: "fayoum" },
    update: {},
    create: { nameAr: "الفيوم", nameEn: "Fayoum", slug: "fayoum" },
  });

  for (const [nameAr, nameEn, slug] of fayoumAreas) {
    await prisma.area.upsert({
      where: { governorateId_slug: { governorateId: fayoum.id, slug } },
      update: { nameAr, nameEn, active: true },
      create: { governorateId: fayoum.id, nameAr, nameEn, slug },
    });
  }

  for (const [nameAr, nameEn, slug] of categories) {
    await prisma.category.upsert({
      where: { slug },
      update: { nameAr, nameEn, active: true },
      create: { nameAr, nameEn, slug },
    });
  }
}

main().finally(() => prisma.$disconnect());
