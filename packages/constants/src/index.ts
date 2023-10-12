export const VendorPrefix = "letsgo";
export const ConfigRegion = "us-west-2";
export const DefaultRegion = process.env.AWS_REGION || "us-west-2";
export const DefaultDeployment = process.env.LETSGO_DEPLOYMENT || "main";

export const TagKeys = {
  LetsGoVersion: "LetsGoVersion",
  LetsGoDeployment: "LetsGoDeployment",
  LetsGoRegion: "LetsGoRegion",
  LetsGoUpdated: "LetsGoUpdated",
  LetsGoComponent: "LetsGoComponent",
};

export const ConfigSettings = {
  ApiAppRunnerUrl: "LETSGO_API_URL",
  ApiAppRunnerMinSize: "LETSGO_API_APPRUNNER_MIN_SIZE",
  ApiAppRunnerMaxSize: "LETSGO_API_APPRUNNER_MAX_SIZE",
  ApiAppRunnerMaxConcurrency: "LETSGO_API_APPRUNNER_MAX_CONCURRENCY",
  ApiAppRunnerCpu: "LETSGO_API_APPRUNNER_CPU",
  ApiAppRunnerMemory: "LETSGO_API_APPRUNNER_MEMORY",
  ApiAppRunnerHealthPath: "LETSGO_API_APPRUNNER_HEALTH_PATH",
  ApiAppRunnerHealthTimeout: "LETSGO_API_APPRUNNER_HEALTH_TIMEOUT",
  ApiAppRunnerHealthInterval: "LETSGO_API_APPRUNNER_HEALTH_INTERVAL",
  ApiAppRunnerHealthHealthyThreshold:
    "LETSGO_API_APPRUNNER_HEALTH_HEALTHY_THRESHOLD",
  ApiAppRunnerHealthUnhealthyThreshold:
    "LETSGO_API_APPRUNNER_HEALTH_UNHEALTHY_THRESHOLD",
  WebAppRunnerUrl: "LETSGO_WEB_URL",
  WebAppRunnerMinSize: "LETSGO_WEB_APPRUNNER_MIN_SIZE",
  WebAppRunnerMaxSize: "LETSGO_WEB_APPRUNNER_MAX_SIZE",
  WebAppRunnerMaxConcurrency: "LETSGO_WEB_APPRUNNER_MAX_CONCURRENCY",
  WebAppRunnerCpu: "LETSGO_WEB_APPRUNNER_CPU",
  WebAppRunnerMemory: "LETSGO_WEB_APPRUNNER_MEMORY",
  WebAppRunnerHealthPath: "LETSGO_WEB_APPRUNNER_HEALTH_PATH",
  WebAppRunnerHealthTimeout: "LETSGO_WEB_APPRUNNER_HEALTH_TIMEOUT",
  WebAppRunnerHealthInterval: "LETSGO_WEB_APPRUNNER_HEALTH_INTERVAL",
  WebAppRunnerHealthHealthyThreshold:
    "LETSGO_WEB_APPRUNNER_HEALTH_HEALTHY_THRESHOLD",
  WebAppRunnerHealthUnhealthyThreshold:
    "LETSGO_WEB_APPRUNNER_HEALTH_UNHEALTHY_THRESHOLD",
  WorkerMessageRetentionPeriod: "LETSGO_WORKER_MESSAGE_RETENTION_PERIOD",
  WorkerVisibilityTimeout: "LETSGO_WORKER_VISIBILITY_TIMEOUT",
  WorkerReceiveMessageWaitTime: "LETSGO_WORKER_RECEIVE_MESSAGE_WAIT_TIME",
  WorkerBatchSize: "LETSGO_WORKER_BATCH_SIZE",
  WorkerBatchingWindow: "LETSGO_WORKER_BATCHING_WINDOW",
  WorkerCuncurrency: "LETSGO_WORKER_CONCURRENCY",
  WorkerFunctionTimeout: "LETSGO_WORKER_FUNCTION_TIMEOUT",
  WorkerFunctionMemory: "LETSGO_WORKER_MEMORY",
  WorkerFunctionEphemeralStorage: "LETSGO_WORKER_EPHEMERAL_STORAGE",
};

export interface DefaultConfig {
  [key: string]: string[];
}

export interface AppRunnerSettingsDefaultConfig extends DefaultConfig {
  minSize: string[];
  maxSize: string[];
  maxConcurrency: string[];
  cpu: string[];
  memory: string[];
  healthPath: string[];
  healthInterval: string[];
  healthTimeout: string[];
  healthHealthyThreshold: string[];
  healthUnhealthyThreshold: string[];
}

export interface AppRunnerSettings {
  Name: string;
  getRoleName: (region: string, deployment: string) => string;
  getPolicyName: (region: string, deployment: string) => string;
  getInlineRolePolicy: (
    accountId: string,
    region: string,
    deployment: string
  ) => object;
  getEcrRepositoryName: (deployment: string) => string;
  getLocalRepositoryName: (deployment: string) => string;
  getAppRunnerServiceName: (deployment: string) => string;
  getAppRunnerAutoScalingConfigurationName: (deployment: string) => string;
  serviceUrlConfigKey: string;
  defaultConfig: AppRunnerSettingsDefaultConfig;
}

const createAppRunnerConfiguration = (componentName: string) => ({
  Name: componentName,
  getRoleName: (region: string, deployment: string) =>
    `${VendorPrefix}-${region}-${deployment}-${componentName}`,
  getPolicyName: (region: string, deployment: string) =>
    `${VendorPrefix}-${region}-${deployment}-${componentName}`,
  getInlineRolePolicy: (
    accountId: string,
    region: string,
    deployment: string
  ) => ({
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Action: ["ssm:GetParameters"],
        Resource: [
          `arn:aws:ssm:${ConfigRegion}:${accountId}:parameter/${VendorPrefix}/${region}/${deployment}/*`,
        ],
      },
      {
        Effect: "Allow",
        Action: [
          "ecr:BatchGetImage",
          "ecr:DescribeImages",
          "ecr:GetDownloadUrlForLayer",
        ],
        Resource: [
          `arn:aws:ecr:${region}:${accountId}:repository/${VendorPrefix}-${deployment}-${componentName}`,
        ],
      },
      {
        Effect: "Allow",
        Action: ["ecr:GetAuthorizationToken"],
        Resource: "*",
      },
      {
        Effect: "Allow",
        Action: [
          "dynamodb:List*",
          "dynamodb:DescribeReservedCapacity*",
          "dynamodb:DescribeLimits",
          "dynamodb:DescribeTimeToLive",
        ],
        Resource: "*",
      },
      {
        Effect: "Allow",
        Action: [
          "dynamodb:BatchGet*",
          "dynamodb:DescribeStream",
          "dynamodb:DescribeTable",
          "dynamodb:Get*",
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:BatchWrite*",
          "dynamodb:CreateTable",
          "dynamodb:Delete*",
          "dynamodb:Update*",
          "dynamodb:PutItem",
        ],
        Resource: `arn:aws:dynamodb:${region}:${accountId}:table/${DBConfiguration.getTableName(
          deployment
        )}`,
      },
    ],
  }),
  getEcrRepositoryName: (deployment: string) =>
    `${VendorPrefix}-${deployment}-${componentName}`,
  getLocalRepositoryName: (deployment: string) =>
    `${VendorPrefix}-${componentName}`,
  getAppRunnerServiceName: (deployment: string) =>
    `${VendorPrefix}-${deployment}-${componentName}`,
  getAppRunnerAutoScalingConfigurationName: (deployment: string) =>
    `${VendorPrefix}-${deployment}-${componentName}`,
});

export const ApiConfiguration: AppRunnerSettings = {
  ...createAppRunnerConfiguration("api"),
  serviceUrlConfigKey: ConfigSettings.ApiAppRunnerUrl,
  defaultConfig: {
    minSize: [ConfigSettings.ApiAppRunnerMinSize, "1"],
    maxSize: [ConfigSettings.ApiAppRunnerMaxSize, "10"],
    maxConcurrency: [ConfigSettings.ApiAppRunnerMaxConcurrency, "100"],
    cpu: [ConfigSettings.ApiAppRunnerCpu, "1024"],
    memory: [ConfigSettings.ApiAppRunnerMemory, "2048"],
    healthPath: [ConfigSettings.ApiAppRunnerHealthPath, "/v1/health"],
    healthInterval: [ConfigSettings.ApiAppRunnerHealthInterval, "5"],
    healthTimeout: [ConfigSettings.ApiAppRunnerHealthTimeout, "2"],
    healthHealthyThreshold: [
      ConfigSettings.ApiAppRunnerHealthHealthyThreshold,
      "1",
    ],
    healthUnhealthyThreshold: [
      ConfigSettings.ApiAppRunnerHealthUnhealthyThreshold,
      "5",
    ],
  },
};

export const WebConfiguration: AppRunnerSettings = {
  ...createAppRunnerConfiguration("web"),
  serviceUrlConfigKey: ConfigSettings.WebAppRunnerUrl,
  defaultConfig: {
    minSize: [ConfigSettings.WebAppRunnerMinSize, "1"],
    maxSize: [ConfigSettings.WebAppRunnerMaxSize, "10"],
    maxConcurrency: [ConfigSettings.WebAppRunnerMaxConcurrency, "100"],
    cpu: [ConfigSettings.WebAppRunnerCpu, "1024"],
    memory: [ConfigSettings.WebAppRunnerMemory, "2048"],
    healthPath: [ConfigSettings.WebAppRunnerHealthPath, "/"],
    healthInterval: [ConfigSettings.WebAppRunnerHealthInterval, "5"],
    healthTimeout: [ConfigSettings.WebAppRunnerHealthTimeout, "2"],
    healthHealthyThreshold: [
      ConfigSettings.WebAppRunnerHealthHealthyThreshold,
      "1",
    ],
    healthUnhealthyThreshold: [
      ConfigSettings.WebAppRunnerHealthUnhealthyThreshold,
      "5",
    ],
  },
};

export interface DBSettings {
  getTableName: (deployment: string) => string;
}

export const DBConfiguration: DBSettings = {
  getTableName: (deployment: string) => `${VendorPrefix}-${deployment}`,
};

export interface WorkerSettingsDefaultConfig extends DefaultConfig {
  messageRetentionPeriod: string[];
  visibilityTimeout: string[];
  receiveMessageWaitTime: string[];
  functionTimeout: string[];
  functionMemory: string[];
  functionEphemeralStorage: string[];
  batchSize: string[];
  batchingWindow: string[];
  concurrency: string[];
}

export interface WorkerSettings {
  getQueueNamePrefix: (deployment: string) => string;
  getRoleName: (region: string, deployment: string) => string;
  getPolicyName: (region: string, deployment: string) => string;
  getInlineRolePolicy: (
    accountId: string,
    region: string,
    deployment: string
  ) => object;
  getEcrRepositoryName: (deployment: string) => string;
  getLocalRepositoryName: (deployment: string) => string;
  getLambdaFunctionName: (deployment: string) => string;
  defaultConfig: WorkerSettingsDefaultConfig;
}

const WorkerName = "worker";
export const WorkerConfiguration: WorkerSettings = {
  getQueueNamePrefix: (deployment: string) => `${VendorPrefix}-${deployment}`,
  getRoleName: (region: string, deployment: string) =>
    `${VendorPrefix}-${region}-${deployment}-${WorkerName}`,
  getPolicyName: (region: string, deployment: string) =>
    `${VendorPrefix}-${region}-${deployment}-${WorkerName}`,
  getInlineRolePolicy: (
    accountId: string,
    region: string,
    deployment: string
  ) => ({
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Action: [
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes",
        ],
        Resource: `arn:aws:sqs:${region}:${accountId}:${VendorPrefix}-${deployment}*`,
      },
      {
        Effect: "Allow",
        Action: [
          "dynamodb:List*",
          "dynamodb:DescribeReservedCapacity*",
          "dynamodb:DescribeLimits",
          "dynamodb:DescribeTimeToLive",
        ],
        Resource: "*",
      },
      {
        Effect: "Allow",
        Action: [
          "dynamodb:BatchGet*",
          "dynamodb:DescribeStream",
          "dynamodb:DescribeTable",
          "dynamodb:Get*",
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:BatchWrite*",
          "dynamodb:CreateTable",
          "dynamodb:Delete*",
          "dynamodb:Update*",
          "dynamodb:PutItem",
        ],
        Resource: `arn:aws:dynamodb:${region}:${accountId}:table/${DBConfiguration.getTableName(
          deployment
        )}`,
      },
    ],
  }),
  getEcrRepositoryName: (deployment: string) =>
    `${VendorPrefix}-${deployment}-${WorkerName}`,
  getLocalRepositoryName: (deployment: string) =>
    `${VendorPrefix}-${WorkerName}`,
  getLambdaFunctionName: (deployment: string) =>
    `${VendorPrefix}-${deployment}-${WorkerName}`,
  defaultConfig: {
    messageRetentionPeriod: [
      ConfigSettings.WorkerMessageRetentionPeriod,
      "345600", // 4 days in seconds
    ],
    // AWS recommends batching window + 6 x function timeout:
    visibilityTimeout: [ConfigSettings.WorkerVisibilityTimeout, "360"],
    receiveMessageWaitTime: [ConfigSettings.WorkerReceiveMessageWaitTime, "2"],
    batchSize: [ConfigSettings.WorkerBatchSize, "10"],
    batchingWindow: [ConfigSettings.WorkerBatchingWindow, "2"],
    concurrency: [ConfigSettings.WorkerCuncurrency, "5"],
    functionTimeout: [ConfigSettings.WorkerFunctionTimeout, "60"],
    functionMemory: [ConfigSettings.WorkerFunctionMemory, "128"],
    functionEphemeralStorage: [
      ConfigSettings.WorkerFunctionEphemeralStorage,
      "512",
    ],
  },
};