import { Card, Flex, Heading, ScrollView } from "@aws-amplify/ui-react";
import { AIConversation, createAIHooks } from "@aws-amplify/ui-react-ai";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";

const client = generateClient<Schema>();
const { useAIConversation } = createAIHooks(client);

export function AIPlanner() {
  const [
    {
      data: { messages },
    },
    sendMessage,
  ] = useAIConversation("resourceChat");

  return (
    <Card>
      <Heading level={2}>AI Resource Planner</Heading>
      <Flex direction="column" gap="1rem">
        <ScrollView height="600px">
          <AIConversation
            messages={messages}
            handleSendMessage={sendMessage}
            welcomeMessage="Ask about resource planning..."
          />
        </ScrollView>
      </Flex>
    </Card>
  );
}