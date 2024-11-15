# Week 0 — Billing and Architecture

## Getting the AWS CLI Working

### Installation of AWS CLI

° I installed the AWS CLI on the Gitpod environment.
° I set the AWS CLI to use partial autoprompt mode to make it easier to debug CLI commands.
° The bash commands I am using is the same as the [AWS CLI Install Instructions](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
[](.gitpod.yml) include the following task.

```sh
tasks:
  - name: aws-cli
    env:
      AWS_CLI_AUTO_PROMPT: on-partial
    init: |
      cd /workspace
      curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
      unzip awscliv2.zip
      sudo ./aws/install
      cd $THEIA_WORKSPACE_ROOT
```
I also ran these commands indivually to perform the install manually.

### Created a new User and Generate AWS Credentials

° Created a new user from the IAM Users Console
° Enabled console access for the user
° Created a new Admin Group and applied AdministratorAccess
° Created Security Credentials and Acess Key for the new user
° Downloaded the CSV with the credentials

### Set Env Vars

I used this bash code to set the credentials for the bash terminal

```sh

export AWS_ACCESS_KEY_ID=""
export AWS_SECRET_ACCESS_KEY=""
export AWS_DEFAULT_REGION="us-east-1"
```
I told Gitpod to remember the credentials whenever relaunch my workspaces

```sh

gp env AWS_ACCESS_KEY_ID=""
gp env AWS_SECRET_ACCESS_KEY=""
gp env AWS_DEFAULT_REGION="us-east-1"

```

### Checking that the AWS CLI is working and I am the expected user

```sh

aws sts get-caller-identity

```

## Creating Billing Alarm

° I had to set an SNS topic before i created an alarm.
° The SNS topic is what will notify me if i exceed my budget.
```sh

aws sns create-topic \
    --name my-topic

```

which will return a TopicARN
I created a subscription supply with the TopicARN and my Email

```sh

aws sns subscribe \
    --topic-arn TopicARN \
    --protocol email \
    --notification-endpoint your@email.com

```

### Created an Alarm

° updated the configuration [json](aws/json/alarm-config.json)  script with the TopicARN I generated earlier
° I use a json file because --metrics is required for expressions so its easier to use a JSON file.

```sh

aws cloudwatch put-metric-alarm --cli-input-json file://aws/json/alarm_config.json

```

## Create an AWS Budget

° Updated [json](aws/json/budget.json) file with my AWS  ACCOUNT ID 

```sh

aws budgets create-budget \
    --account-id AccountID \
    --budget file://aws/json/budget.json \
    --notifications-with-subscribers file://aws/json/budget-notifications-with-subscribers.json

```

### CI/CD logical pipeline architectural diagram

![PDF](_docs/assets/CI%3ACD%20logical%20pipeline%20architectural%20diagram.pdf)
