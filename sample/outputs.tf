# Sample Outputs

output "flow_arn" {
  description = "ARN of the Bedrock Agent Flow"
  value       = module.bedrock_flow.flow_arn
}

output "lambda_functions" {
  description = "Lambda function ARNs"
  value = {
    FetchCodeLambda = module.lambda_functions.lambda_function_arns["FetchCodeLambda"]
    CollectDataLambda = module.lambda_functions.lambda_function_arns["CollectDataLambda"]
  }
}