import { generateClient } from "aws-amplify/data";
import type { Schema } from "../amplify/data/resource";

const client = generateClient<Schema>();

async function createTestData() {
  // Create a project
  const project = await client.models.Project.create({
    name: "Website Redesign",
    startDate: "2024-04-01",
    endDate: "2024-06-30",
    requiredSkills: ["React", "TypeScript", "UI/UX"],
    status: "PLANNED",
  });

  // Create an engineer
  const engineer = await client.models.Engineer.create({
    name: "Jane Smith",
    skills: ["React", "TypeScript", "Node.js"],
    availability: true,
    currentProjectId: project.data?.id,
  });

  // Create time off record
  await client.models.TimeOff.create({
    engineerId: engineer.data?.id,
    startDate: "2024-05-01",
    endDate: "2024-05-07",
    type: "VACATION",
  });
}

// Run this in your browser console to create test data
declare global {
  interface Window {
    createTestData: typeof createTestData;
  }
}

window.createTestData = createTestData;