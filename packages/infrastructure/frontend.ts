import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';
import * as synced_folder from '@pulumi/synced-folder';

export const CreateFrontend = () => {
    const awsUsEast1 = new aws.Provider('usEast1', { region: 'us-east-1' });

    const siteDir = '../frontend/dist';
    const hostedZone = aws.route53.Zone.get('jono20201.com', 'Z1467B26BAWAHS');

    const cert = new aws.acm.Certificate(
        'cert',
        {
            domainName: 'bff.jono20201.com',
            validationMethod: 'DNS',
        },
        { provider: awsUsEast1 },
    );

    new aws.route53.Record('cert_validation', {
        name: cert.domainValidationOptions[0].resourceRecordName,
        type: cert.domainValidationOptions[0].resourceRecordType,
        zoneId: hostedZone.zoneId,
        records: [cert.domainValidationOptions[0].resourceRecordValue],
        ttl: 60,
    });

    const siteBucket = new aws.s3.Bucket('bff-react', {
        website: {
            indexDocument: 'index.html',
        },
    });

    var originAccessControl = new aws.cloudfront.OriginAccessControl(
        'bff-react',
        {
            name: siteBucket.bucketDomainName,
            description: 'Access to the BFF React site',
            originAccessControlOriginType: 's3',
            signingBehavior: 'always',
            signingProtocol: 'sigv4',
        },
    );

    const cloudfrontDistribution = new aws.cloudfront.Distribution(
        'bff-react',
        {
            enabled: true,
            origins: [
                {
                    originId: siteBucket.arn,
                    domainName: siteBucket.bucketDomainName,
                    originAccessControlId: originAccessControl.id,
                },
            ],
            aliases: ['bff.jono20201.com'],
            defaultRootObject: 'index.html',
            defaultCacheBehavior: {
                targetOriginId: siteBucket.arn,
                viewerProtocolPolicy: 'redirect-to-https',
                allowedMethods: ['GET', 'HEAD', 'OPTIONS'],
                cachedMethods: ['GET', 'HEAD', 'OPTIONS'],
                forwardedValues: {
                    cookies: { forward: 'none' },
                    queryString: false,
                },
                minTtl: 0,
                defaultTtl: 3600,
                maxTtl: 86400,
            },
            restrictions: {
                geoRestriction: {
                    restrictionType: 'none',
                },
            },
            viewerCertificate: {
                acmCertificateArn: cert.arn,
                sslSupportMethod: 'sni-only',
            },
        },
        { dependsOn: [originAccessControl] },
    );

    const bucketArnIncludingWildcard = pulumi.interpolate`${siteBucket.arn}/*`;

    new aws.s3.BucketPolicy('bff-react', {
        bucket: siteBucket.bucket,
        policy: pulumi
            .all([bucketArnIncludingWildcard, cloudfrontDistribution.arn])
            .apply(([bucketArn, cloudfrontArn]) => {
                return {
                    Version: '2012-10-17',
                    Statement: {
                        Sid: 'AllowCloudFrontServicePrincipalReadOnly',
                        Effect: 'Allow',
                        Principal: {
                            Service: 'cloudfront.amazonaws.com',
                        },
                        Action: 's3:GetObject',
                        Resource: bucketArn,
                        Condition: {
                            StringEquals: {
                                'AWS:SourceArn': cloudfrontArn,
                            },
                        },
                    },
                };
            })
            .apply(JSON.stringify),
    });

    new synced_folder.S3BucketFolder('bucket-folder', {
        path: siteDir,
        bucketName: siteBucket.bucket,
        acl: aws.s3.PublicReadAcl,
    });

    const record = new aws.route53.Record('bff.jono20201.com', {
        name: 'bff.jono20201.com',
        type: 'A',
        zoneId: hostedZone.zoneId,
        aliases: [
            {
                name: cloudfrontDistribution.domainName,
                zoneId: cloudfrontDistribution.hostedZoneId,
                evaluateTargetHealth: true,
            },
        ],
    });
};
