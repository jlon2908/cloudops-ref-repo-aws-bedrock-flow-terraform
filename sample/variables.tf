# Bedrock Agent Flow Sample - Variables

variable "deploy_role_arn" {
  type        = string
  description = "IaC deployment role"
}

variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "us-east-1"
}

variable "client" {
  description = "Client name"
  type        = string
}

variable "project" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "flow_description" {
  description = "Description of the Bedrock Agent Flow"
  type        = string
  default     = "Sample Bedrock Agent Flow"
}

variable "kms_key_arn" {
  description = "KMS key ARN for encryption"
  type        = string
  default     = null
}

variable "flow_nodes" {
  description = "Dynamic flow nodes configuration"
  type = map(object({
    type = string # "Input", "Output", "Prompt", "LambdaFunction"

    # For Prompt nodes
    template      = optional(string)
    template_file = optional(string)
    model_id      = optional(string)
    max_tokens    = optional(number, 1000)
    temperature   = optional(number, 0.7)
    top_p         = optional(number, 0.9)

    # For Lambda nodes
    lambda_arn = optional(string)

    # Common properties
    output_name = optional(string, "output")
    output_type = optional(string, "String")

    # Multiple inputs support
    inputs = optional(list(object({
      name       = string
      type       = string
      expression = string
    })), [])
  }))

  validation {
    condition = alltrue([
      for k, v in var.flow_nodes : contains(["Input", "Output", "Prompt", "LambdaFunction", "Collector"], v.type)
    ])
    error_message = "Node type must be one of: Input, Output, Prompt, LambdaFunction, Collector"
  }
}

variable "flow_connections" {
  description = "Flow connections between nodes (required)"
  type = list(object({
    name          = string
    source        = string
    target        = string
    source_output = string
    target_input  = string
  }))
}

variable "create_flow_version" {
  description = "Whether to create a flow version"
  type        = bool
  default     = false
}

variable "flow_version_description" {
  description = "Description for the flow version"
  type        = string
  default     = "Flow version"
}

variable "create_flow_alias" {
  description = "Whether to create a flow alias"
  type        = bool
  default     = false
}

variable "flow_alias_name" {
  description = "Name for the flow alias"
  type        = string
  default     = "live"
}

variable "flow_alias_description" {
  description = "Description for the flow alias"
  type        = string
  default     = "Flow alias"
}

variable "prepare_flow" {
  description = "Whether to prepare the flow using AWS CLI"
  type        = bool
  default     = false
}

variable "profile" {
  description = "AWS profile to use"
  type        = string
  default     = "default"
}

variable "common_tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default     = {}
}

variable "additional_tags" {
  description = "Additional tags"
  type        = map(string)
  default     = {}
}
