# Bedrock Agent Flow Sample Implementation

This is a **sample implementation** demonstrating how to use the `cloudops-ref-repo-aws-bedrock-flow-terraform` module to create a GenAI-powered code validation workflow.

## What This Sample Does

Creates an automated code review system that:
1. Fetches repository content from GitHub
2. Runs parallel AI validations on the code
3. Aggregates results into a comprehensive report
4. Sends feedback via webhook

## Architecture Overview

```
Input (Repo URL) → Fetch Code → [4 Parallel AI Validators] → Aggregate Results → Output
                                ├─ Human Usability
                                ├─ Test Coverage  
                                ├─ Architecture
                                └─ Domain Design
```

## Components

### Lambda Functions
- **FetchCodeLambda** - Downloads repository content using GitHub API
- **CollectDataLambda** - Combines validation results and sends webhook notification

### AI Prompt Nodes
- **HUValidatorPrompt** - Evaluates code usability and readability
- **CoverageValidatorPrompt** - Analyzes test coverage and quality
- **ArchitectureValidatorPrompt** - Reviews architectural patterns
- **DDDValidatorPrompt** - Validates domain-driven design principles

### Infrastructure
- **IAM Roles** - Bedrock execution and Lambda permissions
- **Flow Definition** - Node connections and data flow configuration

## Key Features Demonstrated

- **Parallel Processing** - Multiple AI validators run simultaneously
- **Template Files** - External prompt templates for maintainability
- **Multi-Input Nodes** - Collector node receives multiple validation inputs
- **Dynamic Lambda ARNs** - Automatic Lambda function integration
- **Custom Connections** - Explicit flow routing configuration

## Usage

```bash
# Copy and customize configuration
cp terraform.auto.tfvars terraform.auto.tfvars.local

# Deploy the sample
terraform init
terraform apply
```

## Configuration Files

- `main.tf` - Infrastructure and module integration
- `terraform.auto.tfvars` - Sample flow configuration
- `lambda/` - Function implementations
- `prompts/` - AI validation templates

This sample serves as a reference for building complex Bedrock Agent Flows with parallel processing and custom business logic.