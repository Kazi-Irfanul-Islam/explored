import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const users = [
    ["antor", "dev", "admin"],
    ["irfan", "bigSillyBird", "admin"],
    ["payel", "dev", "user"],
    ["morsalin", "sillyBird", "user"],
  ];

  for (const [username, password, role] of users) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.users.create({
      data: {
        username,
        password: hashedPassword,
        role: role as any,
      },
    });
  }

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
    [3, "Weekend in Cox’s Bazar", "A short beach getaway with family.", "family"],
    [3, "Dhaka Food Trail", "Exploring street food and local restaurants.", "solo"],
    [4, "Business Trip to Singapore", "Meetings, hotels, and city walks.", "business"],
    [4, "Sylhet Nature Escape", "Tea gardens, hills, and waterfalls.", "leisure"],
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
