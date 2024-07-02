import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  Image: a.model({
    image_id: a.string().required(),
    isRestricted: a.boolean(),
    source: a.string(),
    height: a.integer(),
    width: a.integer()
    })
    .identifier(['image_id'])
    .authorization(allow => [allow.publicApiKey()]),

Annotation: a
  .model({
    image_id: a.string().required(),
    deleted: a.boolean(),
    occluded: a.boolean(),
    restricted: a.boolean(),
    verified: a.boolean(),
    category: a.string(),
    polygon: a.json(),
    type: a.string(),
    annotation_id: a.integer().required(),
    attributes: a.json(),
    species: a.string(),
    representation: a.string(),
    ethnicity: a.string(),
    age: a.string(),
    orientation: a.string(),
    angle: a.string(),
    visibility: a.string(),
    rotation: a.float(),
    multiletter: a.string(),
    singleletter: a.string(),
    case: a.string(),
    noun: a.boolean(),
    content: a.string(),
    multidigit: a.boolean(),
  })
  .identifier(['image_id','annotation_id'] as const)
  .authorization((allow) => [allow.publicApiKey()]),
});


export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    // API Key is used for a.allow.public() rules
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});

