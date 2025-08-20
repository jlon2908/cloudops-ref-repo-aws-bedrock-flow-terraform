# Bedrock Agent Flow Sample Implementation
# IAM Role for Bedrock Flow
resource "aws_iam_role" "bedrock_flow_role" {
  name = "${var.client}-${var.project}-${var.environment}-bedrock-flow-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "bedrock.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "bedrock_flow_policy" {
  name = "${var.client}-${var.project}-${var.environment}-bedrock-flow-policy"
  role = aws_iam_role.bedrock_flow_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "bedrock:InvokeModel",
          "lambda:InvokeFunction"
        ]
        Resource = "*"
      }
    ]
  })
}

# Lambda IAM Role
resource "aws_iam_role" "lambda_role" {
  name = "${var.client}-${var.project}-${var.environment}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  role       = aws_iam_role.lambda_role.name
}

# Lambda Functions using cloudops-ref-repo-aws-lambda-terraform module
module "lambda_functions" {
  source = "../../cloudops-ref-repo-aws-lambda-terraform"
  providers = {
    aws.project = aws.project
  }
  client      = var.client
  project     = var.project
  environment = var.environment

  lambda_functions = {
    FetchCodeLambda = {
      type                = "directory"
      lambda_iam_role_arn = aws_iam_role.lambda_role.arn
      description         = "Processor Lambda for Bedrock Flow"
      runtime             = "nodejs22.x"
      handler             = "readrepo.readRepo"
      timeout             = 30
      memory_size         = 256
      source_path         = "${path.module}/lambda/readrepo"
      environment_variables = {
        GITHUB_TOKEN = ""
      }
    }
    CollectDataLambda = {
      type                = "directory"
      lambda_iam_role_arn = aws_iam_role.lambda_role.arn
      description         = "Validator Lambda for Bedrock Flow"
      runtime             = "nodejs22.x"
      handler             = "aggregate.aggregate"
      timeout             = 30
      memory_size         = 256
      source_path         = "${path.module}/lambda/aggregate"
    }
  }
}

# Bedrock Flow Module
module "bedrock_flow" {
  providers = {
    aws.project = aws.project
  }
  source = "../"

  client      = var.client
  project     = var.project
  environment = var.environment

  aws_region   = var.aws_region
  aws_role_arn = var.deploy_role_arn

  flow_description   = var.flow_description
  execution_role_arn = aws_iam_role.bedrock_flow_role.arn
  kms_key_arn        = var.kms_key_arn

  flow_nodes = {
    for k, v in var.flow_nodes : k => merge(v, {
      lambda_arn = v.type == "LambdaFunction" ? (
        k == "FetchCodeLambda" ? module.lambda_functions.lambda_function_arns["FetchCodeLambda"] :
        k == "CollectDataLambda" ? module.lambda_functions.lambda_function_arns["CollectDataLambda"] :
        v.lambda_arn
      ) : v.lambda_arn
    })
  }
  flow_connections = var.flow_connections

  additional_tags = var.additional_tags
  profile         = var.profile
}
