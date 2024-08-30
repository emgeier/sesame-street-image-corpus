import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  Image: a.model({
    episode_id: a.string().required(),
    image_id: a.string().required(),
    isRestricted: a.boolean(),
    source: a.string(),
    height: a.integer(),
    width: a.integer(),
    season: a.integer(),
    air_year: a.integer(),
    episode_title: a.string()
    })
    .identifier(['episode_id','image_id'])
    .authorization(allow => [allow.publicApiKey()]),

Annotation: a
  .model({
    image_id: a.string().required(),
    annotation_id: a.integer().required(),
    deleted: a.boolean(),
    occluded: a.boolean(),
    restricted: a.boolean(),
    verified: a.boolean(),
    category: a.string(),
    polygon: a.json(),
    attributes: a.json(),
    species: a.string(),
    representation: a.string(),
    race: a.string(),
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
    keywords: a.string(),
    x: a.float(),
    y: a.float(),
    height: a.float(),
    width: a.float()
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
      expiresInDays: 365,
    },
  },
});

