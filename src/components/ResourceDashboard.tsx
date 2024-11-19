import {
  Badge,
  Card,
  Collection,
  Flex,
  Heading,
  Loader,
  Text,
} from "@aws-amplify/ui-react";
import { generateClient } from "aws-amplify/data";
import { useEffect, useState } from "react";
import type { Schema } from "../../amplify/data/resource";

const client = generateClient<Schema>();

export function ResourceDashboard() {
  const [engineers, setEngineers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEngineers() {
      try {
        const { data } = await client.models.Engineer.list();
        setEngineers(data);
      } catch (err) {
        console.error("Error loading engineers:", err);
      } finally {
        setLoading(false);
      }
    }

    loadEngineers();
  }, []);

  if (loading) return <Loader />;

  return (
    <Card>
      <Heading level={2}>Team Resources</Heading>
      <Collection items={engineers} type="list" gap="1rem" padding="1rem">
        {(engineer) => (
          <Card key={engineer.id}>
            <Flex
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Flex direction="column" gap="0.5rem">
                <Text variation="primary" fontWeight="bold">
                  {engineer.name}
                </Text>
                <Flex gap="0.5rem">
                  {engineer.skills?.map((skill: string) => (
                    <Badge key={skill} variation="info">
                      {skill}
                    </Badge>
                  ))}
                </Flex>
              </Flex>
              <Badge variation={engineer.availability ? "success" : "error"}>
                {engineer.availability ? "Available" : "Assigned"}
              </Badge>
            </Flex>
            {engineer.currentProject && (
              <Text variation="secondary">
                Current Project: {engineer.currentProject.name}
              </Text>
            )}
          </Card>
        )}
      </Collection>
    </Card>
  );
}