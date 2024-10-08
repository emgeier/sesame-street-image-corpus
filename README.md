## Overview

The Sesame Street Image Archive is a repository of images and CVAT annotations that are searchable by all fields and keywords. Users can view stills from video content from the popular children's television show, Sesame Street, with categories of objects and people within those images annotated for various characteristics.

## Features

- **Authentication**: Amazon Cognito for secure user authentication.
- **API**: GraphQL endpoint with AWS AppSync.
- **Database**: Real-time database powered by Amazon DynamoDB.

## Deploying to AWS

- **CI/CD Pipeline**: Commiting changes to the main branch will automatically deploy the code to the AWS-hosted app. Monitoring the deployment can be monitored in the AWS Amplify console.

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## Development Process

This repository was built on a starter template for creating applications using React+Vite and AWS Amplify, emphasizing easy setup for authentication, API, and database capabilities with pre-configured AWS services like Cognito, AppSync, and DynamoDB.
## License

This library is licensed under the MIT-0 License. See the LICENSE file.