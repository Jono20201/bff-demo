import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';

export const CreateBackend = () => {
    const stack = pulumi.getStack();

    const iamForLambda = new aws.iam.Role('iamForLambda', {
        assumeRolePolicy: `{
            "Version": "2012-10-17",
            "Statement": [
            {
                "Action": "sts:AssumeRole",
                "Principal": {
                "Service": "lambda.amazonaws.com"
                },
                "Effect": "Allow",
                "Sid": ""
            }
            ]
        }
      `,
    });

    const lambdaRoleAttachment = new aws.iam.RolePolicyAttachment(
        'lambdaRoleAttachment',
        {
            role: iamForLambda,
            policyArn: aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole,
        },
    );

    const lambda = new aws.lambda.Function('express', {
        code: new pulumi.asset.FileArchive('../express/dist'),
        handler: 'main.handler',
        runtime: 'nodejs18.x',
        role: iamForLambda.arn,
    });

    const apigw = new aws.apigatewayv2.Api('httpApiGateway', {
        protocolType: 'HTTP',
        corsConfiguration: {
            allowOrigins: [
                'http://localhost:5173',
                'https://bff.jono20201.com',
            ],
            allowMethods: ['*'],
            allowHeaders: ['*'],
        },
    });

    const lambdaPermission = new aws.lambda.Permission(
        'lambdaPermission',
        {
            action: 'lambda:InvokeFunction',
            principal: 'apigateway.amazonaws.com',
            function: lambda,
            sourceArn: pulumi.interpolate`${apigw.executionArn}/*/*`,
        },
        { dependsOn: [apigw, lambda] },
    );

    const integration = new aws.apigatewayv2.Integration('lambdaIntegration', {
        apiId: apigw.id,
        integrationType: 'AWS_PROXY',
        integrationUri: lambda.arn,
        integrationMethod: 'POST',
        payloadFormatVersion: '2.0',
        passthroughBehavior: 'WHEN_NO_MATCH',
        requestParameters: {
            'overwrite:path': '$request.path',
        },
    });

    const route = new aws.apigatewayv2.Route('apiRoute', {
        apiId: apigw.id,
        routeKey: '$default',
        target: pulumi.interpolate`integrations/${integration.id}`,
    });

    const stage = new aws.apigatewayv2.Stage(
        'apiStage',
        {
            apiId: apigw.id,
            name: stack,
            routeSettings: [
                {
                    routeKey: route.routeKey,
                    throttlingBurstLimit: 5000,
                    throttlingRateLimit: 10000,
                },
            ],
            autoDeploy: true,
        },
        { dependsOn: [route] },
    );
};
