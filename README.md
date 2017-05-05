# lenticular

A particular CloudFormation helper.

## What is this thing?

This is my attempt at making CloudFormation sane. I want nice and
short-as-possible names for my AWS resources. I want semantic names for
artifacts in my S3 buckets, instead of hex strings. And I want continuous
deployment of my product’s infrastructure side-by-side with my product’s
code.

So what **lenticular** does is provide a little command line utility
that helps with these goals and writes some boilerplate for you, hopefully
putting you on a good path.

I’m learning infrastructure-as-code as I go along, so if you see something
that might be done better another way, please open an issue!

## Setup

The very first thing you need is a **product name** for your product. This
should be a relatively unique identifier to avoid S3 bucket name collisions
(keeping in mind that S3 buckets are a global, publicly-shared namespace).
It should be all lowercase, with dashes (`-`) separating words.

Now, assuming you’ve got a git repo and an npm `package.json` all set up in
a directory with the same name as your product, run the following in that
directory:

```sh
npm install --save-dev lenticular      # Local CLI install.
sudo npm install --global lenticular   # Global CLI always falls back to local.
lenticular init                        # Creates .lenticularrc and ./infra/
```

Now, take a look at the newly created `.lenticularrc`, and
`infra/build-pipeline.yaml`.

…

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
