# AWS Bedrock Agent Flow Module - Outputs

output "flow_arn" {
  description = "ARN of the Bedrock Agent Flow"
  value       = aws_bedrockagent_flow.main.arn
}

output "flow_id" {
  description = "ID of the Bedrock Agent Flow"
  value       = aws_bedrockagent_flow.main.id
}

output "flow_name" {
  description = "Name of the Bedrock Agent Flow"
  value       = aws_bedrockagent_flow.main.name
}

# Note: Flow versioning and aliases are not yet supported in Terraform AWS provider