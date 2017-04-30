# lenticular

Opinionated CloudFormation deployer

# What is this thing?

I wrote this because I needed something that deploys serverless resources to
AWS via CloudFormation in a way that does not make a mess of S3 buckets, and
maybe has a nicer experience than `aws-cli cloudformation deploy`. I make
no claims that this module is useful for anyone else other than myself and
my projects. It’s almost certainly not the solution for existing CF
deployments.

# Configuration

The very first thing you need is a **product name** for your product or project.
This should be a relatively unique identifier to avoid S3 bucket name
collisions (S3 buckets are a global, publicly-shared namespace).

…
