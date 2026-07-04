import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { config } from 'dotenv';

config({ path: '.env' });
config({ path: '.env.local', override: true });

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const COLLEGES = [
  { name: 'BBDU', domainPattern: 'bbdu\\.ac\\.in' },
  { name: 'BBDNITM', domainPattern: 'bbdnitm\\.ac\\.in' },
  { name: 'BBDEC', domainPattern: 'bbdec\\.ac\\.in' },
  { name: 'BBD Group', domainPattern: 'bbd[a-z0-9]*\\.ac\\.in' },
];

async function main() {
  for (const college of COLLEGES) {
    const existing = await prisma.college.findFirst({ where: { name: college.name } });
    if (existing) {
      await prisma.college.update({
        where: { id: existing.id },
        data: { domainPattern: college.domainPattern, isActive: true },
      });
      console.log(`Updated college: ${college.name}`);
    } else {
      await prisma.college.create({ data: college });
      console.log(`Created college: ${college.name}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
