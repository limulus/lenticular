# lenticular

A particular CloudFormation deployer.

## What is this thing?

I wrote this because I needed something that deploys serverless resources to
AWS via CloudFormation in a way that does not make a mess of S3 buckets, and
maybe has a nicer experience than `aws-cli cloudformation deploy`. I make
no claims that this module is useful for anyone else other than myself and
my projects. It’s almost certainly not the solution for existing CF
deployments.

## Configuration

The very first thing you need is a **product name** for your product or project.
This should be a relatively unique identifier to avoid S3 bucket name
collisions (keeping in mind that S3 buckets are a global, publicly-shared
namespace). It should be an all lowercase word, with no dashes or dots.

Now you can add a `.lenticularrc` file to the root of your project directory.
It should look like this:

```json
{
  "productName": "projectx",
  "stages": {
    "prod": {
      "regions": ["us-east-1", "eu-central-1"]
    },
    "devel": {
      "regions": ["us-west-2"]
    }
  }
}
```

Now you can run `lenticular init`, and this will create a new CloudFormation
stack in every region in the config file. This stack will have an S3 bucket
for artifacts like ZIP files for Lambda function code, in each region. Rerun
this command if you add more regions to the config file.

## Writing CloudFormation Templates

I like to put my main CloudFormation template in `/infra/index.yaml`. You can
override this with the `indexTemplate` configuration property.

By default CloudFormation gives your resources random names that are useless.
Lenticular gives you two functions to help with giving your resources
meaningful, short-as-possible, and non-colliding names. For example,
in the following template, your lambda function would get a `FunctionName`
value of `projectx-ProcessUpload`:

```yaml
Resources:
  ProcessUploadFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: !Lenticular::ResourceName 'ProcessUpload'
```

Or the following for an S3 bucket or other resources in a global namespace,
to generate a value of `projectx-UserData-us-west-2`:

```yaml
Resources:
  UserDataBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Lenticular::ResourceNameWithRegion 'UserData'
```
