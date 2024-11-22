import {
  Card,
  Heading,
  Flex,
  ScrollView,
  Tabs,
  Text,
  Divider,
  SelectField,
  Button,
} from "@aws-amplify/ui-react";
import { AIConversation } from "@aws-amplify/ui-react-ai";
import { generateClient } from "aws-amplify/data";
import { createAIHooks } from "@aws-amplify/ui-react-ai";
import type { Schema } from "../../amplify/data/resource";
import { useEffect, useState } from "react";

const client = generateClient<Schema>();
const { useAIConversation, useAIGeneration } = createAIHooks(client);

export function AIPlanner() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState("assistant");
  const [projects, setProjects] = useState<Schema["Project"]["type"][]>([]);

  useEffect(() => {
    async function loadProjects() {
      const { data } = await client.models.Project.list();

      setProjects(data);
    }

    loadProjects();
  }, []);

  const [
    {
      data: { messages },
    },
    sendMessage,
  ] = useAIConversation("resourceChat");

  const [{ data: staffingAnalysis }, generateStaffingAnalysis] =
    useAIGeneration("analyzeStaffing");

  const suggestedQuestions = [
    "Who is available for the Website Redesign project next month?",
    "What skills are we missing for current projects?",
    "Show me potential scheduling conflicts in Q3",
    "When can we start the next project with current staffing?",
  ];

  return (
    <Card>
      <Tabs
        onValueChange={(e) => setSelectedTab(e)}
        value={selectedTab}
        items={[
          {
            label: "AI Assistant",
            value: "assistant",
            content: (
              <Flex direction="column" gap="1rem">
                <ScrollView height="500px">
                  <AIConversation
                    messages={messages}
                    handleSendMessage={sendMessage}
                    placeholder="Ask about resource planning..."
                  />
                </ScrollView>

                <Divider />

                <Text variation="secondary">Suggested Questions:</Text>
                <Flex direction="column" gap="0.5rem">
                  {suggestedQuestions.map((question) => (
                    <Text
                      key={question}
                      variation="primary"
                      fontSize="0.9rem"
                      onClick={() => sendMessage(question)}
                      style={{ textDecoration: "underline" }}
                    >
                      {question}
                    </Text>
                  ))}
                </Flex>
              </Flex>
            ),
          },
          {
            label: "Staffing Analysis",
            value: "analysis",
            content: (
              <Flex direction="column" gap="1rem">
                <SelectField
                  label="Projects"
                  onSelect={(m) => setSelectedProject(m.target.value)}
                >
                  {projects.map((m) => (
                    <option value={m.id}>{m.name}</option>
                  ))}
                </SelectField>
                <Button
                  onClick={() =>
                    generateStaffingAnalysis({
                      projectId: selectedProject,
                      targetDate: new Date().toISOString(),
                    })
                  }
                >
                  Analyze Staffing
                </Button>
                {staffingAnalysis && (
                  <Card variation="elevated">
                    <Heading level={4}>Analysis Results</Heading>
                    <Text>
                      Required Headcount: {staffingAnalysis.requiredHeadcount}
                    </Text>
                    <Text>Risk Level: {staffingAnalysis.riskLevel}</Text>

                    <Heading level={5}>Missing Skills:</Heading>
                    <Flex gap="0.5rem" wrap="wrap">
                      {staffingAnalysis?.missingSkills?.map((skill) => (
                        <Text key={skill} variation="warning">
                          {skill}
                        </Text>
                      ))}
                    </Flex>

                    <Heading level={5}>Recommendations:</Heading>
                    <ul>
                      {staffingAnalysis?.recommendations?.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </Card>
                )}
              </Flex>
            ),
          },
        ]}
      ></Tabs>
    </Card>
  );
}
