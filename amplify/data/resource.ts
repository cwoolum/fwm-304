import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Engineer: a.model({
    name: a.string().required(),
    skills: a.string().array(),
    availability: a.boolean(),
    currentProject: a.belongsTo("Project", "currentProjectId"),
    currentProjectId: a.id(),
    timeOff: a.hasMany("TimeOff", "engineerId"),
  })
    .authorization((allow) => allow.authenticated()),

  Project: a.model({
    name: a.string().required(),
    startDate: a.date().required(),
    endDate: a.date().required(),
    requiredSkills: a.string().array(),
    engineers: a.hasMany("Engineer", "currentProjectId"),
    status: a.enum(["PLANNED", "IN_PROGRESS", "COMPLETED"]),
  })
    .authorization((allow) => allow.authenticated()),

  TimeOff: a.model({
    engineerId: a.id(),
    engineer: a.belongsTo("Engineer", "engineerId"),
    startDate: a.date().required(),
    endDate: a.date().required(),
    type: a.enum(["VACATION", "SICK", "HOLIDAY"]),
  })
    .authorization((allow) => allow.authenticated()),

  resourceChat: a.conversation({
    aiModel: a.ai.model('Claude 3 Sonnet'),
    systemPrompt: `You are a resource planning assistant. Help analyze project staffing,
    timeline impacts, and resource allocation. Provide concise and helpful responses.`,
    tools: [
      a.ai.dataTool({
        name: "list_engineers",
        description: "Provides data about available engineers and their skills",
        model: a.ref("Engineer"),
        modelOperation: 'list',
      }),
      a.ai.dataTool({
        name: "list_projects",
        description: "Provides data about current and planned projects",
        model: a.ref("Project"),
        modelOperation: 'list',
      }),
      a.ai.dataTool({
        name: "list_time_off",
        description: "Provides data about time off for engineers",
        model: a.ref("TimeOff"),
        modelOperation: 'list',
      }),
    ],
  })
    .authorization((allow) => allow.owner()),
  analyzeStaffing: a
    .generation({
      aiModel: a.ai.model('Claude 3 Sonnet'),
      systemPrompt:
        "You analyze project staffing requirements and generate structured recommendations.",
    })
    .arguments({
      projectId: a.string(),
      targetDate: a.string(),
    })
    .returns(
      a.customType({
        requiredHeadcount: a.integer(),
        missingSkills: a.string().array(),
        riskLevel: a.enum(["LOW", "MEDIUM", "HIGH"]),
        recommendations: a.string().array(),
      })
    ),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
