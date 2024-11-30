import { createExecutableTool } from "@aws-amplify/backend-ai/conversation/runtime";
import { generateClient } from "aws-amplify/api";
import { type Schema } from "./resource";

const client = generateClient<Schema>();

// Define the input schema for the resource management tool
const resourceManagementSchema = {
    type: "object",
    properties: {
        operation: {
            type: "string",
            enum: ["assign", "unassign"],
            description: "The operation to perform (assign or unassign)",
        },
        projectId: {
            type: "string",
            description: "The ID of the project",
        },
        engineerId: {
            type: "string",
            description: "The ID of the engineer to assign or unassign",
        },
    },
    required: ["operation", "projectId", "engineerId"],
} as const;

export const resourceManagementTool = createExecutableTool(
    "manage_project_resources",
    "Manages project resource assignments and unassignments",
    { json: resourceManagementSchema },
    async (input) => {
        const { operation, projectId, engineerId } = input;

        try {
            // Verify project exists
            const project = await client.models.Project.get({ id: projectId });
            if (!project?.data) {
                return {
                    text: `Error: Project with ID ${projectId} not found.`,
                };
            }

            // Verify employee exists
            const engineer = await client.models.Engineer.get({ id: engineerId });
            if (!engineer?.data) {
                return {
                    text: `Error: Engineer with ID ${engineerId} not found.`,
                };
            }

            const engineers = await project.data.engineers();

            if (operation === "assign") {
                // Check if already assigned
                if (
                    engineers.data?.some((member) => member.id === engineerId)
                ) {
                    return {
                        text: `${engineer.data.name} is already assigned to ${project.data.name}.`,
                    };
                }

                await client.models.Engineer.update({
                    id: engineerId,
                    currentProjectId: projectId
                });

                return {
                    text: `Successfully assigned ${engineer.data.name} to ${project.data.name}.`,
                };
            } else if (operation === "unassign") {
                // Check if actually assigned
                if (!engineers.data?.some((member) => member.id === engineerId)) {
                    return {
                        text: `${engineer.data.name} is not currently assigned to ${project.data.name}.`,
                    };
                }

                await client.models.Engineer.update({
                    id: engineerId,
                    currentProjectId: undefined
                });

                return {
                    text: `Successfully unassigned ${engineer.data.name} from ${project.data.name}.`,
                };
            }
        } catch (error) {
            if (error instanceof Error) {
                return {
                    text: `Error performing ${operation} operation: ${error.message}`,
                };
            }

        }

        return {
            text: 'An unknown error occurred'
        };
    },
);