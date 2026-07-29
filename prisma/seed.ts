import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const users = [
    ["antor", "dev", "admin"],
    ["irfan", "bigSillyBird", "user"],
    ["payel", "dev", "user"],
    ["morsalin", "sillyBird", "user"],
  ];

  const userRecords = [];

  for (const [username, password, role] of users) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.users.upsert({
      where: { username },
      update: {
        password: hashedPassword,
        role: role as any,
      },
      create: {
        username,
        password: hashedPassword,
        role: role as any,
      },
    });
    userRecords.push(user);
  }

  // Clear existing messages and logs to prevent duplicates on re-run
  await prisma.contact_messages.deleteMany();
  await prisma.travel_logs.deleteMany();

  const contact_messages = [
    ["Samania Jannat", "samania@example.com", "General Inquiry", "I really love the new design of Explored! Great job."],
    ["Md All Shahriar", "shahriar@test.com", "Bug Report", "I found a small bug on the login page when using mobile."],
    ["Nadia Sultana", "sultana@agency.com", "Feature Request", "Can you add a dark mode option in the next update?"],
  ];

  for (const [name, email, subject, message] of contact_messages) {
    await prisma.contact_messages.create({
      data: { name, email, subject, message },
    });
  }

  const travel_logs = [
    [userRecords[2].id, "Weekend in Cox’s Bazar", "A short beach getaway with family.", "family"],
    [userRecords[2].id, "Dhaka Food Trail", "Exploring street food and local restaurants.", "solo"],
    [userRecords[3].id, "Business Trip to Singapore", "Meetings, hotels, and city walks.", "business"],
    [userRecords[3].id, "Sylhet Nature Escape", "Tea gardens, hills, and waterfalls.", "leisure"],
  ];

  for (const [owner_id, title, description, journey_type] of travel_logs) {
    await prisma.travel_logs.create({
      data: {
        owner_id: owner_id as number,
        title: title as string,
        description: description as string,
        journey_type: journey_type as string,
        published: 1, // Let's make them published so they appear on the explore page
      },
    });
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
